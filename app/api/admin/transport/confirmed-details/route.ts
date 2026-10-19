import {NextRequest,NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
import {canManageTransport} from "@/lib/transport-permissions";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const CONFIRMATION_EVENT="BOOKING_CONFIRMATION_DETAILS_SAVED";
const fail=(message:string,status=400)=>NextResponse.json({success:false,message},{status,headers:{"Cache-Control":"private, no-store"}});
export type ConfirmationDetails={
  bookingReference:string;flightNumber:string;departureTime:string;arrivalTime:string;
  returnFlightNumber:string;returnDepartureTime:string;returnArrivalTime:string;
  departureTerminal:string;arrivalTerminal:string;
  adultBaggage:string;childBaggage:string;infantBaggage:string;
  hotelName:string;hotelCheckIn:string;hotelCheckOut:string;hotelAddress:string;roomType:string;
  travelNotes:string;hotelNotes:string;
};
const textKeys=[
  "bookingReference","flightNumber","departureTime","arrivalTime",
  "returnFlightNumber","returnDepartureTime","returnArrivalTime",
  "departureTerminal","arrivalTerminal",
  "adultBaggage","childBaggage","infantBaggage",
  "hotelName","hotelCheckIn","hotelCheckOut","hotelAddress","roomType",
  "travelNotes","hotelNotes",
] as const;
const maxLengths:Record<keyof ConfirmationDetails,number>={
 bookingReference:70,flightNumber:80,departureTime:80,arrivalTime:80,
 returnFlightNumber:80,returnDepartureTime:80,returnArrivalTime:80,
 departureTerminal:80,arrivalTerminal:80,
 adultBaggage:100,childBaggage:100,infantBaggage:100,
 hotelName:180,hotelCheckIn:70,hotelCheckOut:70,hotelAddress:250,roomType:120,
 travelNotes:2000,hotelNotes:2000,
};
async function requestAccess(id:string){
 const session=await getCurrentSession();
 if(!session||!["SUPER_ADMIN","ADMIN"].includes(session.user.role))return null;
 const request=await prisma.transportRequest.findFirst({
  where:{id,kind:"FLIGHT",...(session.user.role==="SUPER_ADMIN"?{}:{assignedToId:session.user.id})},
  select:{
   id:true,reference:true,kind:true,status:true,customerName:true,
   adults:true,children:true,infants:true,
   origin:true,destination:true,travelDate:true,returnDate:true,
   tripType:true,itinerary:true,carrierName:true,quoteAmountSar:true,
   assignedToId:true,
  },
 });
 if(!request||!canManageTransport(session.user,"FLIGHT"))return null;
 return {session,request};
}
export async function GET(req:NextRequest){
 const id=req.nextUrl.searchParams.get("id")||"";
 if(!id||id.length>180)return fail("معرف الطلب غير صالح.");
 const auth=await requestAccess(id);
 if(!auth)return fail("غير مصرح بعرض تفاصيل الحجز.",403);
 const event=await prisma.transportRequestEvent.findFirst({
  where:{requestId:id,action:CONFIRMATION_EVENT},
  orderBy:[{createdAt:"desc"},{id:"desc"}],
  select:{id:true,createdAt:true,details:true}
 });
 const hasPayment=!!await prisma.transportRequestEvent.findFirst({
  where:{requestId:id,action:"ADMIN_PAYMENT_VERIFIED"},select:{id:true}
 });
 return NextResponse.json({
  success:true,request:{
   ...auth.request,quoteAmountSar:auth.request.quoteAmountSar===null?null:Number(auth.request.quoteAmountSar)
  },
  details:event?.details||null,updatedAt:event?.createdAt||null,
  canConfirm:hasPayment&&["PAID","EXECUTING","DONE"].includes(auth.request.status),
 },{headers:{"Cache-Control":"private, no-store"}});
}
export async function POST(req:NextRequest){
 const body=await req.json().catch(()=>null);
 const id=typeof body?.id==="string"?body.id:"";
 if(!id||id.length>180)return fail("معرف الطلب غير صالح.");
 const auth=await requestAccess(id);
 if(!auth)return fail("غير مصرح بتعديل تفاصيل الحجز.",403);
 if(!["PAID","EXECUTING","DONE"].includes(auth.request.status))
  return fail("لا يمكن إصدار تفاصيل حجز مؤكد قبل اعتماد السداد.",409);
 const confirmed=await prisma.transportRequestEvent.findFirst({
  where:{requestId:id,action:"ADMIN_PAYMENT_VERIFIED"},select:{id:true},
 });
 if(!confirmed)return fail("يجب تأكيد استلام السداد في قسم مراجعة الإيصالات أولاً.",409);
 if(body.confirmed!==true)return fail("يرجى تأكيد أن الحجز صدر فعلياً لدى الناقل وأن بياناته صحيحة.");
 const input=(body.details&&typeof body.details==="object"&&!Array.isArray(body.details))?body.details:null;
 if(!input)return fail("بيانات تأكيد الحجز غير صحيحة.");
 const details={} as ConfirmationDetails;
 for(const key of textKeys){
  const value=input[key];
  if(typeof value!=="string"||value.length>maxLengths[key])return fail("تحقق من حقل "+key+".");
  details[key]=value.trim();
 }
 if(!details.bookingReference||details.bookingReference.length<3)
  return fail("أدخل رقم الحجز المؤكد لدى شركة الطيران (PNR/Booking reference).");
 if(!details.flightNumber||!details.departureTime||!details.arrivalTime)
  return fail("أدخل رقم الرحلة وموعد المغادرة والوصول المؤكدين.");
 try{
  const event=await prisma.$transaction(async tx=>{
   await tx.$queryRaw`SELECT id FROM "TransportRequest" WHERE id = ${id} FOR UPDATE`;
   const fresh=await tx.transportRequest.findUniqueOrThrow({where:{id},select:{status:true}});
   if(!["PAID","EXECUTING","DONE"].includes(fresh.status))throw new Error("STALE_BOOKING");
   const payment=await tx.transportRequestEvent.findFirst({where:{requestId:id,action:"ADMIN_PAYMENT_VERIFIED"},select:{id:true}});
   if(!payment)throw new Error("STALE_BOOKING");
   return tx.transportRequestEvent.create({
    data:{
     requestId:id,actorId:auth.session.user.id,
     actorName:"إدارة أريس",action:CONFIRMATION_EVENT,
     fromStatus:fresh.status,toStatus:fresh.status,
     details:{...details,verifiedBy:auth.session.user.id,confirmedSource:"airline_booking"},
    },select:{id:true,createdAt:true}
   });
  });
  return NextResponse.json({success:true,eventId:event.id,message:"تم حفظ تفاصيل الحجز المؤكد. أصبح مستند تفاصيل الحجز جاهزاً للطباعة PDF."},{headers:{"Cache-Control":"private, no-store"}});
 }catch(error){
  if(error instanceof Error&&error.message==="STALE_BOOKING")return fail("تغيرت حالة الطلب؛ حدّث الصفحة وأعد المحاولة.",409);
  console.error("Confirmed booking details write failed",error);
  return fail("تعذر حفظ تفاصيل الحجز المؤكد. لم تتغير حالة الطلب.",503);
 }
}
