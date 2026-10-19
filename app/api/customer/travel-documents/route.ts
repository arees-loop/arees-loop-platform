import {NextRequest,NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
import {customerTransportOwnership} from "@/lib/customer-transport-claim";
import {TRAVEL_REFERENCE_PATTERN} from "@/lib/request-reference";
import {isQuoteVatTreatment} from "@/lib/quotation-format";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const cacheHeaders={"Cache-Control":"private, no-store"};
const fail=(message:string,status=400)=>NextResponse.json({success:false,message},{status,headers:cacheHeaders});
const detailsKeys=[
 "bookingReference","flightNumber","departureTime","arrivalTime","returnFlightNumber","returnDepartureTime",
 "returnArrivalTime","departureTerminal","arrivalTerminal","adultBaggage","childBaggage","infantBaggage",
 "hotelName","hotelCheckIn","hotelCheckOut","hotelAddress","roomType","travelNotes","hotelNotes"
];

export async function GET(req:NextRequest){
 const reference=req.nextUrl.searchParams.get("reference")||"";
 if(!TRAVEL_REFERENCE_PATTERN.test(reference))return fail("مرجع الطلب غير صالح.");
 const session=await getCurrentSession();
 const ownership=customerTransportOwnership(req,session?.user.id);
 if(!ownership)return fail("الرجاء فتح الطلب من حسابك أو باستخدام رمز المتابعة الخاص.",403);
 try{
  const item=await prisma.transportRequest.findFirst({
   where:{reference,...ownership,kind:{in:["FLIGHT","FERRY"]}},
   select:{
    id:true,reference:true,kind:true,status:true,customerName:true,countryCode:true,phone:true,
    origin:true,destination:true,travelDate:true,returnDate:true,tripType:true,
    adults:true,children:true,infants:true,carrierName:true,quoteAmountSar:true,quoteNotes:true,
    quoteValidUntil:true,quoteUpdatedAt:true,createdAt:true,
   },
  });
  if(!item)return fail("لا تملك صلاحية عرض مستندات هذا الطلب.",403);
  const [publishedEvent,paymentVerified,bookingEvent,ticketEvent,vatEvent]=await Promise.all([
   prisma.transportRequestEvent.findFirst({
    where:{requestId:item.id,action:"SERVICE_OFFER_PUBLISHED"},select:{id:true},
   }),
   prisma.transportRequestEvent.findFirst({
    where:{requestId:item.id,action:"ADMIN_PAYMENT_VERIFIED"},select:{id:true},
   }),
   prisma.transportRequestEvent.findFirst({
    where:{requestId:item.id,action:"BOOKING_CONFIRMATION_DETAILS_SAVED"},
    orderBy:[{createdAt:"desc"},{id:"desc"}],select:{details:true,createdAt:true},
   }),
   prisma.transportRequestEvent.findFirst({
    where:{requestId:item.id,action:"TICKET_PDF_DELIVERED"},
    orderBy:[{createdAt:"desc"},{id:"desc"}],select:{id:true},
   }),
   prisma.transportRequestEvent.findFirst({
    where:{requestId:item.id,action:"QUOTE_VAT_CLASSIFIED"},
    orderBy:[{createdAt:"desc"},{id:"desc"}],select:{details:true},
   })
  ]);
  const quoteReady=item.quoteAmountSar!==null&&(
   ["QUOTE_SENT","PAID","EXECUTING","DONE"].includes(item.status)||
   item.status==="PROCESSING"&&!!publishedEvent
  );
  const vatDetails=vatEvent?.details&&typeof vatEvent.details==="object"&&!Array.isArray(vatEvent.details)?vatEvent.details as Record<string,unknown>:null;
  const quoteVersion=item.quoteUpdatedAt?.toISOString()||null;
  const vatTreatment=quoteReady&&vatDetails?.quoteUpdatedAt===quoteVersion&&isQuoteVatTreatment(vatDetails?.treatment)?vatDetails.treatment:"UNDETERMINED";
  const paid=!!paymentVerified&&["PAID","EXECUTING","DONE"].includes(item.status);
  const input=bookingEvent?.details&&typeof bookingEvent.details==="object"&&!Array.isArray(bookingEvent.details)
   ?bookingEvent.details as Record<string,unknown>:null;
  const confirmation=paid&&input?
   Object.fromEntries(detailsKeys.map(k=>[k,typeof input[k]==="string"?input[k]:""])):null;
  return NextResponse.json({
   success:true,
   request:{
    reference:item.reference,kind:item.kind,status:item.status,customerName:item.customerName,
    contactNumber:item.countryCode+item.phone,
    origin:item.origin,destination:item.destination,travelDate:item.travelDate,returnDate:item.returnDate,
    tripType:item.tripType,adults:item.adults,children:item.children,infants:item.infants,
    carrierName:item.carrierName,createdAt:item.createdAt,
    quoteUpdatedAt:quoteReady?item.quoteUpdatedAt:null,
    quoteVatTreatment:vatTreatment,
    quoteAmountSar:quoteReady&&item.quoteAmountSar!==null?Number(item.quoteAmountSar):null,
    quoteNotes:quoteReady?item.quoteNotes:null,
    quoteValidUntil:quoteReady?item.quoteValidUntil:null,
   },
   available:{quote:quoteReady,originalTicket:paid&&!!ticketEvent,confirmedBooking:!!confirmation},
   confirmation,
   confirmedAt:paid?bookingEvent?.createdAt||null:null,
  },{headers:cacheHeaders});
 }catch(error){
  console.error("Customer travel document retrieval failed",error);
  return fail("تعذر تحميل مستندات الرحلة. يرجى إعادة المحاولة.",503);
 }
}
