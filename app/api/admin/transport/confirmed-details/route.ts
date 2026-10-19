import {NextRequest,NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
import {canManageTransport} from "@/lib/transport-permissions";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const CONFIRMATION_EVENT="BOOKING_CONFIRMATION_DETAILS_SAVED";
const DRAFT_EVENT="BOOKING_DETAILS_DRAFT_SAVED";
const QUOTE_REVISIONS=["QUOTE_SAVED","SERVICE_OFFER_PUBLISHED","CUSTOMER_OFFER_ACCEPTED"] as const;
async function acceptedLatest(requestId:string,db:typeof prisma=prisma){
 const action=await db.transportRequestEvent.findFirst({where:{requestId,action:{in:[...QUOTE_REVISIONS]}},orderBy:[{createdAt:"desc"},{id:"desc"}],select:{action:true}});
 return action?.action==="CUSTOMER_OFFER_ACCEPTED";
}
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
  where:{id,kind:{in:["FLIGHT","FERRY"]},...(session.user.role==="SUPER_ADMIN"?{}:{assignedToId:session.user.id})},
  select:{
   id:true,reference:true,kind:true,status:true,customerName:true,
   adults:true,children:true,infants:true,
   origin:true,destination:true,travelDate:true,returnDate:true,
   tripType:true,itinerary:true,carrierName:true,quoteAmountSar:true,
   assignedToId:true,
  },
 });
 if(!request||!canManageTransport(session.user,request.kind==="FERRY"?"FERRY":"FLIGHT"))return null;
 return {session,request};
}
export async function GET(req:NextRequest){
 const id=req.nextUrl.searchParams.get("id")||"";
 if(!id||id.length>180)return fail("معرف الطلب غير صالح.");
 const auth=await requestAccess(id);
 if(!auth)return fail("غير مصرح بعرض تفاصيل الحجز.",403);
 const [confirmedEvent,draftEvent,paymentEvent,accepted]=await Promise.all([
  prisma.transportRequestEvent.findFirst({
   where:{requestId:id,action:CONFIRMATION_EVENT},
   orderBy:[{createdAt:"desc"},{id:"desc"}],
   select:{id:true,createdAt:true,details:true}
  }),
  prisma.transportRequestEvent.findFirst({
   where:{requestId:id,action:DRAFT_EVENT},
   orderBy:[{createdAt:"desc"},{id:"desc"}],
   select:{id:true,createdAt:true,details:true}
  }),
  prisma.transportRequestEvent.findFirst({
   where:{requestId:id,action:"ADMIN_PAYMENT_VERIFIED"},select:{id:true}
  }),
  acceptedLatest(id)
 ]);
 const canConfirm=!!paymentEvent&&["PAID","EXECUTING","DONE"].includes(auth.request.status);
 const canPrepare=canConfirm||accepted&&!["CANCELED","DONE"].includes(auth.request.status);
 const latestDraft=draftEvent&&(!confirmedEvent||draftEvent.createdAt>confirmedEvent.createdAt)?draftEvent:null;
 const visibleDetails=latestDraft||confirmedEvent;
 return NextResponse.json({
  success:true,request:{
   ...auth.request,quoteAmountSar:auth.request.quoteAmountSar===null?null:Number(auth.request.quoteAmountSar)
  },
  details:visibleDetails?.details||null,updatedAt:visibleDetails?.createdAt||null,
  draftSaved:!!latestDraft,confirmedDetails:!!confirmedEvent&&!latestDraft,
  canPrepare,canConfirm,
 },{headers:{"Cache-Control":"private, no-store"}});
}
export async function POST(req:NextRequest){
 const body=await req.json().catch(()=>null);
 const id=typeof body?.id==="string"?body.id:"";
 if(!id||id.length>180)return fail("معرف الطلب غير صالح.");
 const auth=await requestAccess(id);
 if(!auth)return fail("غير مصرح بتعديل تفاصيل الحجز.",403);
 const isDraft=body.draft===true;
 if(!isDraft&&body.confirmed!==true)return fail("يجب تأكيد إصدار الحجز فعلياً قبل إصدار مستند للعميل.");
 if(!isDraft&& !["PAID","EXECUTING","DONE"].includes(auth.request.status))
  return fail("لا يمكن إصدار مستند حجز مؤكد قبل اعتماد السداد.",409);
 const alreadyPaid=await prisma.transportRequestEvent.findFirst({
  where:{requestId:id,action:"ADMIN_PAYMENT_VERIFIED"},select:{id:true}
 });
 if(!isDraft&&!alreadyPaid)return fail("اعتمد وصول السداد أولاً من مراجعة الإيصالات.",409);
 if(isDraft&&!alreadyPaid&&!await acceptedLatest(id))
  return fail("يجب أن يقبل العميل عرض السعر الحالي حتى تتمكن من تجهيز تفاصيل الحجز.",409);
 const input=(body.details&&typeof body.details==="object"&&!Array.isArray(body.details))?body.details:null;
 if(!input)return fail("بيانات تأكيد الحجز غير صحيحة.");
 const details={} as ConfirmationDetails;
 for(const key of textKeys){
  const value=input[key];
  if(typeof value!=="string"||value.length>maxLengths[key])return fail("تحقق من حقل "+key+".");
  details[key]=value.trim();
 }
 if(!isDraft){
  if(!details.bookingReference||details.bookingReference.length<3)
   return fail("أدخل رقم الحجز الصادر لدى الناقل أو مشغل الباخرة.");
  if(!details.departureTime||(auth.request.kind==="FLIGHT"&&(!details.flightNumber||!details.arrivalTime)))
   return fail(auth.request.kind==="FERRY"?"أدخل موعد إبحار الباخرة المؤكد.":"أدخل رقم الرحلة وموعد الإقلاع والوصول.");
 }
 try{
  const event=await prisma.$transaction(async tx=>{
   await tx.$queryRaw`SELECT id FROM "TransportRequest" WHERE id = ${id} FOR UPDATE`;
   const fresh=await tx.transportRequest.findUniqueOrThrow({where:{id},select:{status:true}});
   if(["CANCELED","DONE"].includes(fresh.status)&&isDraft)throw new Error("STALE_BOOKING");
   const payment=await tx.transportRequestEvent.findFirst({where:{requestId:id,action:"ADMIN_PAYMENT_VERIFIED"},select:{id:true}});
   if(isDraft){
    const event=await tx.transportRequestEvent.findFirst({where:{requestId:id,action:{in:[...QUOTE_REVISIONS]}},orderBy:[{createdAt:"desc"},{id:"desc"}],select:{action:true}});
    if(!payment&&event?.action!=="CUSTOMER_OFFER_ACCEPTED")throw new Error("STALE_BOOKING");
   }else if(!payment||!["PAID","EXECUTING","DONE"].includes(fresh.status))throw new Error("STALE_BOOKING");
   return tx.transportRequestEvent.create({
    data:{
     requestId:id,actorId:auth.session.user.id,
     actorName:"إدارة أريس",action:isDraft?DRAFT_EVENT:CONFIRMATION_EVENT,
     fromStatus:fresh.status,toStatus:fresh.status,
     details:isDraft?{...details,draftBy:auth.session.user.id}:{
      ...details,verifiedBy:auth.session.user.id,
      confirmedSource:auth.request.kind==="FERRY"?"ferry_operator_booking":"airline_booking"
     },
    },select:{id:true,createdAt:true}
   });
  });
  return NextResponse.json({
   success:true,eventId:event.id,confirmed:!isDraft,
   message:isDraft?"تم حفظ مسودة تفاصيل الرحلة. لم تُصدر للعميل ولن تظهر كمستند مؤكد قبل اعتماد السداد والحجز.":"تم اعتماد تفاصيل الحجز المؤكد وإتاحة المستند للعميل للطباعة PDF."
  },{headers:{"Cache-Control":"private, no-store"}});
 }catch(error){
  if(error instanceof Error&&error.message==="STALE_BOOKING")return fail("تغيرت حالة الطلب؛ حدّث الصفحة وأعد المحاولة.",409);
  console.error("Confirmed booking details write failed",error);
  return fail("تعذر حفظ تفاصيل الحجز المؤكد. لم تتغير حالة الطلب.",503);
 }
}
