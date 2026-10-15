import { notifyAdminsOfNewRequest } from "@/lib/request-notification";
import { randomBytes,createHash } from "node:crypto";
import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { sendHotelInquiryNotification } from "@/lib/hotel-email";

export const runtime="nodejs";
const fail=(message:string,status=400)=>NextResponse.json({success:false,message},{status,headers:{"Cache-Control":"no-store"}});
const day=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(new Date(s+"T12:00:00Z").getTime())&&new Date(s+"T12:00:00Z").toISOString().slice(0,10)===s;

export async function POST(request:NextRequest){
  try{
    const raw:unknown=await request.json();
    if(!raw||typeof raw!=="object"||Array.isArray(raw))return fail("بيانات الطلب غير صحيحة.");
    const input=raw as Record<string,unknown>;
    if(input.website)return fail("بيانات الطلب غير صحيحة.");
    const name=String(input.customerName??"").trim();
    const email=String(input.customerEmail??"").trim().toLowerCase()||null;
    const countryCode=String(input.countryCode??"").replace(/\D/g,"");
    const phone=String(input.phone??"").replace(/\D/g,"");
    const whatsappCountryCode=String(input.whatsappCountryCode??"").replace(/\D/g,"");
    const whatsappPhone=String(input.whatsappPhone??"").replace(/\D/g,"");
    const destination=String(input.destination??"").trim();
    const hotelName=String(input.hotelName??"").trim()||null;
    const checkInDate=String(input.checkInDate??""),checkOutDate=String(input.checkOutDate??"");
    const rooms=Number(input.rooms),adults=Number(input.adults),children=Number(input.children);
    const notes=String(input.notes??"").trim()||null;
    if(name.length<2||name.length>120)return fail("اسم مقدم الطلب مطلوب.");
    if(email&&(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>180))return fail("البريد غير صحيح.");
    if(!/^\d{1,4}$/.test(countryCode)||!/^\d{6,15}$/.test(phone))return fail("رقم جوال فعال مع مفتاح الدولة إلزامي.");
    if((whatsappPhone&&!/^\d{6,15}$/.test(whatsappPhone))||(whatsappPhone&&!/^\d{1,4}$/.test(whatsappCountryCode))||(whatsappCountryCode&&!whatsappPhone))return fail("تحقق من رقم واتساب البديل.");
    if(destination.length<2||destination.length>100||hotelName&&hotelName.length>160)return fail("حدد الوجهة والفندق المطلوب إن وجد.");
    if(!day(checkInDate)||!day(checkOutDate)||checkInDate<new Date().toISOString().slice(0,10)||checkOutDate<=checkInDate)return fail("تاريخ الخروج يجب أن يكون بعد الدخول، ولا يقبل تاريخ ماضٍ.");
    if(![rooms,adults,children].every(x=>Number.isInteger(x)&&x>=0&&x<=30)||rooms<1||adults<1)return fail("أعداد الغرف والنزلاء غير صحيحة.");
    if(notes&&notes.length>1500)return fail("الملاحظات طويلة جداً.");
    const latest=await prisma.hotelInquiry.count({where:{countryCode,phone,createdAt:{gte:new Date(Date.now()-86400000)}}});
    if(latest>=5)return fail("تم استلام عدة طلبات من هذا الرقم اليوم، تواصل مع أريس مباشرة.",429);
    const session=await getCurrentSession();
    const token=randomBytes(32).toString("base64url");
    const trackingTokenHash=createHash("sha256").update(token).digest("hex");
    const reference="AR-HOT-"+randomBytes(5).toString("hex").toUpperCase();
    const created=await prisma.hotelInquiry.create({data:{
      reference,userId:session?.user.id||null,trackingTokenHash,customerName:name,customerEmail:email,
      countryCode,phone,whatsappCountryCode:whatsappPhone?whatsappCountryCode:null,
      whatsappPhone:whatsappPhone||null,destination,hotelName,
      checkInDate:new Date(checkInDate+"T12:00:00.000Z"),
      checkOutDate:new Date(checkOutDate+"T12:00:00.000Z"),
      rooms,adults,children,notes,
    }});
    await prisma.hotelInquiryEvent.create({data:{
      requestId:created.id,actorName:"العميل",action:"REQUEST_CREATED",toStatus:"NEW",
      details:{rooms,adults,children},
    }}).catch(error=>console.error("Hotel creation event insert failed",error));
    await notifyAdminsOfNewRequest({kind:"HOTEL",requestId:created.id,reference:created.reference}).catch(error=>console.error("New hotel request notification failed",error));
    let sent=false;
    try{
      await sendHotelInquiryNotification({
        reference,customerName:name,customerEmail:email,countryCode,phone,destination,hotelName,
        checkInDate,checkOutDate,rooms,adults,children,notes,
      });
      sent=true;
    }catch(error){console.error("Hotel request saved but staff email failed",error);}
    await prisma.hotelInquiry.update({where:{id:created.id},data:{
      notificationStatus:sent?"SENT":"FAILED",emailedAt:sent?new Date():null,
    }}).catch(error=>console.error("Hotel notification flag update failed",error));
    return NextResponse.json({success:true,data:{reference,trackingToken:token,customerName:name,destination,hotelName,checkInDate,checkOutDate,rooms,adults,children}},
      {status:201,headers:{"Cache-Control":"no-store"}});
  }catch(error){console.error("POST hotel inquiry failed",error);return fail("تعذر حفظ الطلب حالياً؛ حاول مرة أخرى.",503);}
}
