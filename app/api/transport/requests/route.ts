import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTransportInquiryNotification } from "@/lib/transport-email";

export const runtime = "nodejs";

const msg = (message:string, status:number) => NextResponse.json({ success:false, message }, { status, headers:{"Cache-Control":"no-store"} });
const PHONE = /^\d{6,15}$/;
const CODE = /^\d{1,4}$/;

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") return msg("الطلب غير صالح.",400);
    const data = body as Record<string, unknown>;
    if (data.website) return msg("الطلب غير صالح.",400); // Honeypot
    const kind = data.kind;
    if (kind !== "FLIGHT" && kind !== "FERRY") return msg("اختر الطيران أو البواخر.",400);
    const name = String(data.customerName??"").trim();
    const email = String(data.customerEmail??"").trim().toLowerCase() || null;
    const countryCode = String(data.countryCode??"").replace(/\D/g,"");
    const phone = String(data.phone??"").replace(/\D/g,"");
    const waCountryCode = String(data.whatsappCountryCode??"").replace(/\D/g,"");
    const waPhone = String(data.whatsappPhone??"").replace(/\D/g,"");
    const origin = String(data.origin??"").trim();
    const destination = String(data.destination??"").trim();
    const day = String(data.travelDate??"");
    const tripType=kind==="FERRY"?"ONE_WAY":String(data.tripType??"ONE_WAY");
    if(!["ONE_WAY","ROUND_TRIP","MULTI_CITY"].includes(tripType))return msg("نوع الرحلة غير صحيح.",400);
    const returnDay=String(data.returnDate??"");
    const rawLegs=data.itinerary;
    const notes = String(data.notes??"").trim() || null;
    const adults = Number(data.adults);
    const children = Number(data.children);
    const infants = Number(data.infants);
    if (name.length<2 || name.length>100) return msg("يرجى كتابة اسم العميل الصحيح.",400);
    if (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length>180)) return msg("البريد الإلكتروني غير صحيح.",400);
    if (!CODE.test(countryCode) || !PHONE.test(phone)) return msg("رقم الجوال مع مفتاح الدولة إلزامي ويجب أن يكون فعالاً.",400);
    if ((waPhone && (!PHONE.test(waPhone) || !CODE.test(waCountryCode))) || (waCountryCode && !waPhone)) return msg("راجع رقم واتساب البديل ومفتاح الدولة.",400);
    if (!origin || !destination || origin.length>100 || destination.length>100 || origin === destination) return msg("حدد مدينتي المغادرة والوصول.",400);
    if (kind === "FERRY" && !((origin==="سواكن"&&destination==="جدة")||(origin==="جدة"&&destination==="سواكن"))) return msg("مسار البواخر الحالي هو سواكن–جدة أو جدة–سواكن فقط.",400);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return msg("تاريخ السفر غير صالح.",400);
    const travelDate = new Date(day+"T12:00:00.000Z");
    if (Number.isNaN(travelDate.getTime()) || travelDate.toISOString().slice(0,10)!==day || day < new Date().toISOString().slice(0,10)) return msg("اختر تاريخ سفر صحيحاً غير ماضٍ.",400);
    let returnDate:Date|null=null;
    if(tripType==="ROUND_TRIP"){
      if(!/^\d{4}-\d{2}-\d{2}$/.test(returnDay)||returnDay<day)return msg("تاريخ العودة يجب ألا يسبق المغادرة.",400);
      returnDate=new Date(returnDay+"T12:00:00.000Z");
      if(Number.isNaN(returnDate.getTime())||returnDate.toISOString().slice(0,10)!==returnDay)return msg("تاريخ العودة غير صالح.",400);
    }
    const itinerary:Array<{origin:string;destination:string;travelDate:string}>=[];
    if(tripType==="MULTI_CITY"){
      if(!Array.isArray(rawLegs)||rawLegs.length<2||rawLegs.length>6)return msg("حدد من رحلتين إلى 6 رحلات.",400);
      for(const item of rawLegs){
        if(!item||typeof item!=="object"||Array.isArray(item))return msg("بيانات مسار الرحلة غير صحيحة.",400);
        const leg=item as Record<string,unknown>;
        const from=String(leg.origin??"").trim(),to=String(leg.destination??"").trim(),dt=String(leg.travelDate??"");
        if(!from||!to||from===to||from.length>100||to.length>100)return msg("حدد مطارين مختلفين لكل مرحلة.",400);
        if(!/^\d{4}-\d{2}-\d{2}$/.test(dt)||dt<new Date().toISOString().slice(0,10)||(itinerary.length>0&&dt<itinerary[itinerary.length-1].travelDate))return msg("تواريخ الرحلات المتعددة غير صالحة أو غير مرتبة.",400);
        const d=new Date(dt+"T12:00:00.000Z");
        if(Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==dt)return msg("تاريخ غير صالح.",400);
        itinerary.push({origin:from,destination:to,travelDate:dt});
      }
      if(itinerary[0].origin!==origin||itinerary[0].destination!==destination||itinerary[0].travelDate!==day)return msg("بيانات المرحلة الأولى غير متطابقة.",400);
    }
    if (![adults,children,infants].every(n=>Number.isInteger(n) && n>=0 && n<=30) || adults<1 || children+infants>60) return msg("أعداد المسافرين غير صحيحة.",400);
    if (notes && notes.length>1200) return msg("الملاحظات طويلة جداً.",400);
    // Low-volume per phone safeguard for an anonymous public form.
    const recent = await prisma.transportRequest.count({where:{countryCode,phone,createdAt:{gte:new Date(Date.now()-24*60*60*1000)}}});
    if (recent>=5) return msg("تم استقبال طلبات متعددة لهذا الرقم اليوم؛ تواصل مع خدمة العملاء.",429);
    const reference="AR-"+(kind==="FERRY"?"SEA":"AIR")+"-"+crypto.randomUUID().replaceAll("-","").slice(0,10).toUpperCase();
    const created = await prisma.transportRequest.create({data:{
      reference,kind,customerName:name,customerEmail:email,countryCode,phone,
      whatsappCountryCode:waPhone?waCountryCode:null,whatsappPhone:waPhone||null,
      origin,destination,travelDate,tripType,returnDate,itinerary,adults,children,infants,notes,
    }});
    await prisma.transportRequestEvent.create({data:{
      requestId:created.id,actorName:"العميل",action:"REQUEST_CREATED",toStatus:"NEW",
      details:{tripType,returnDate:returnDay||null,legs:itinerary.length||1},
    }}).catch(err=>console.error("Travel request event insert failed",err));
    let mailed = false;
    try {
      await sendTransportInquiryNotification({
        reference,kind,customerName:name,customerEmail:email,countryCode,phone,
        whatsappCountryCode:waPhone?waCountryCode:null,whatsappPhone:waPhone||null,
        origin,destination,travelDate,adults,children,infants,notes,
      });
      mailed=true;
    } catch(error) {
      console.error("Transport request recorded, staff email failed",error);
    }
    await prisma.transportRequest.update({where:{id:created.id},data:{notificationStatus:mailed?"SENT":"FAILED",emailedAt:mailed?new Date():null}})
      .catch(error=>console.error("Transport notification status update failed",error));
    return NextResponse.json({success:true,data:{
      reference,kind,customerName:name,origin,destination,travelDate:day,adults,children,infants,
      phone:"+"+countryCode+phone,tripType,returnDate:returnDay||null,itinerary,notice:"تم تسجيل طلبك بنجاح. الطلب ليس حجزاً مؤكداً ولا يتضمن سداداً، وسيتواصل معك فريق أريس.",
    }},{status:201,headers:{"Cache-Control":"no-store"}});
  } catch(error) {
    console.error("Transport request failed",error);
    return msg("تعذر حفظ الطلب حالياً. يرجى المحاولة مرة أخرى.",503);
  }
}
