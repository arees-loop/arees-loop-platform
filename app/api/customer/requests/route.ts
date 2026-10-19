import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Claim = {reference:string;token:string};
function claimsFrom(body: unknown): {reference:string;trackingTokenHash:string}[] {
  if(!body || typeof body!=="object")return [];
  const raw=(body as {claims?:unknown}).claims;
  if(!Array.isArray(raw))return [];
  const normalized:Claim[]=raw.filter((x):x is Claim=>
    !!x && typeof x==="object" && typeof x.reference==="string" && typeof x.token==="string" &&
    /^AR-(AIR|SEA|HOT|VISA|LIC)-[A-F0-9]{10}$/.test(x.reference) &&
    /^[A-Za-z0-9_-]{43}$/.test(x.token)).slice(0,40);
  return normalized.map(x=>({
    reference:x.reference,
    trackingTokenHash:createHash("sha256").update(x.token).digest("hex"),
  }));
}
function customerStatus(status:string){
  if(status==="DONE"||status==="COMPLETED")return "COMPLETED";
  if(status==="CANCELED"||status==="CANCELLED")return "CANCELED";
  if(status==="NEW")return "NEW";
  return "PROCESSING";
}

export async function POST(request:NextRequest){
  try{
    const body:unknown=await request.json();
    const claims=claimsFrom(body);
    const session=await getCurrentSession();
    if(!session && !claims.length)
      return NextResponse.json({success:true,data:[]},{headers:{"Cache-Control":"no-store"}});
    // Reference alone never grants access. A login session or 256-bit private claim is required.
    const auth=[
      ...(session?[{userId:session.user.id}]:[]),
      ...claims.map(x=>({reference:x.reference,trackingTokenHash:x.trackingTokenHash})),
    ];
    const [travel,hotels]=await Promise.all([
      prisma.transportRequest.findMany({
        where:{OR:auth},
        select:{
          reference:true,kind:true,customerName:true,origin:true,destination:true,
          travelDate:true,returnDate:true,tripType:true,itinerary:true,
          adults:true,children:true,infants:true,status:true,
          customerReply:true,quoteAmountSar:true,quoteNotes:true,carrierName:true,
          quoteValidUntil:true,cancellationReason:true,createdAt:true,updatedAt:true,
        },orderBy:{createdAt:"desc"},take:100,
      }),
      prisma.hotelInquiry.findMany({
        where:{OR:auth},
        select:{
          reference:true,customerName:true,destination:true,hotelName:true,
          checkInDate:true,checkOutDate:true,rooms:true,adults:true,children:true,
          status:true,customerReply:true,quoteAmountSar:true,quoteNotes:true,
          createdAt:true,updatedAt:true,
        },orderBy:{createdAt:"desc"},take:100,
      }),
    ]);
    const data=[
      ...travel.map(x=>({
        reference:x.reference,kind:x.kind,title:x.kind==="FERRY"?"طلب حجز باخرة":x.kind==="VISA"?"طلب تأشيرة":x.kind==="DRIVING_LICENSE"?"طلب رخصة قيادة دولية":"طلب حجز طيران",
        route:x.origin+" ← "+x.destination,
        travelDate:x.travelDate,returnDate:x.returnDate,tripType:x.tripType,itinerary:x.itinerary,
        guests:x.adults+x.children+x.infants,status:x.status,group:customerStatus(x.status),
        customerReply:x.customerReply,
        quoteAmountSar:["QUOTE_SENT","PROCESSING","PAID","EXECUTING","DONE"].includes(x.status)&&x.quoteAmountSar!==null?Number(x.quoteAmountSar):null,
        quoteNotes:["QUOTE_SENT","PROCESSING","PAID","EXECUTING","DONE"].includes(x.status)?x.quoteNotes:null,
        carrierName:["QUOTE_SENT","PROCESSING","PAID","EXECUTING","DONE"].includes(x.status)?x.carrierName:null,
        quoteValidUntil:["QUOTE_SENT","PROCESSING","PAID","EXECUTING","DONE"].includes(x.status)?x.quoteValidUntil:null,
        cancellationReason:x.cancellationReason,createdAt:x.createdAt,updatedAt:x.updatedAt,
      })),
      ...hotels.map(x=>({
        reference:x.reference,kind:"HOTEL",title:"طلب حجز فندق",
        route:x.hotelName?x.destination+" · "+x.hotelName:x.destination,
        travelDate:x.checkInDate,returnDate:x.checkOutDate,rooms:x.rooms,
        guests:x.adults+x.children,status:x.status,group:customerStatus(x.status),
        customerReply:x.customerReply,quoteAmountSar:x.quoteAmountSar===null?null:Number(x.quoteAmountSar),
        quoteNotes:x.quoteNotes,carrierName:null,quoteValidUntil:null,
        cancellationReason:null,createdAt:x.createdAt,updatedAt:x.updatedAt,
      })),
    ].sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
    return NextResponse.json({success:true,data},{headers:{"Cache-Control":"private, no-store"}});
  }catch(error){
    console.error("Customer request tracking unavailable",error);
    return NextResponse.json({success:false,message:"تعذر تحميل طلباتك حالياً."},{status:503,headers:{"Cache-Control":"no-store"}});
  }
}
