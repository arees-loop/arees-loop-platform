import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

export const runtime = "nodejs";

async function adminAccess(superOnly=false) {
  const session=await getCurrentSession();
  if(!session) return {error:NextResponse.json({success:false,message:"يرجى تسجيل الدخول."},{status:401})};
  if(!["SUPER_ADMIN","ADMIN"].includes(session.user.role) || (superOnly && session.user.role!=="SUPER_ADMIN")){
    return {error:NextResponse.json({success:false,message:"غير مصرح بهذا الإجراء."},{status:403})};
  }
  return {id:session.user.id,role:session.user.role};
}
const fail=(message:string,status=400)=>NextResponse.json({success:false,message},{status});
const num=(value:unknown)=>value===null||value===undefined||value===""?null:Number(value);
function cleanText(input:unknown,max:number){return String(input??"").trim().slice(0,max);}
function parseDay(value:unknown){
  const s=String(value??"");
  if(!s)return null;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(s))throw new Error("تاريخ غير صالح.");
  const d=new Date(s+"T12:00:00.000Z");
  if(Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==s)throw new Error("التاريخ غير صالح.");
  return d;
}
function parseAmount(value:unknown){
  const n=num(value);
  if(n===null)return null;
  if(!Number.isFinite(n)||n<0||n>1000000||Math.round(n*100)!==n*100)throw new Error("السعر يجب أن يكون بالريال ورقمين عشريين كحد أقصى.");
  return n;
}
export async function GET(request:NextRequest) {
  const access=await adminAccess();if(access.error)return access.error;
  const mode=request.nextUrl.searchParams.get("mode")||"requests";
  try{
    if(mode==="offers"){
      const offers=await prisma.transportOffer.findMany({orderBy:[{kind:"asc"},{sortOrder:"asc"},{createdAt:"desc"}],take:200});
      return NextResponse.json({success:true,data:offers.map(o=>({...o,amountSar:o.amountSar===null?null:Number(o.amountSar)}))},{headers:{"Cache-Control":"no-store"}});
    }
    const requests=await prisma.transportRequest.findMany({orderBy:{createdAt:"desc"},take:250});
    return NextResponse.json({success:true,data:requests.map(r=>({...r,quoteAmountSar:r.quoteAmountSar===null?null:Number(r.quoteAmountSar)}))},{headers:{"Cache-Control":"no-store"}});
  }catch(err){console.error("admin transport GET failed",err);return fail("تعذر تحميل الطلبات أو العروض. تحقق من اتصال قاعدة البيانات.",503);}
}
export async function PATCH(request:NextRequest) {
  const access=await adminAccess();if(access.error)return access.error;
  try{
    const body=await request.json();
    const id=cleanText(body.id,100);
    const current=await prisma.transportRequest.findUnique({where:{id}});
    if(!current)return fail("الطلب غير موجود.",404);
    const action=cleanText(body.action,30);
    if(action==="MARK_MANUAL_WHATSAPP"){
      const requestRecord=await prisma.transportRequest.update({where:{id},data:{whatsappStatus:"MANUALLY_MARKED_SENT"}});
      await prisma.auditLog.create({data:{userId:access.id,action:"TRANSPORT_QUOTE_MARKED_SENT_MANUALLY",entityType:"TransportRequest",entityId:id}}).catch(()=>{});
      return NextResponse.json({success:true,data:requestRecord});
    }
    if(action!=="SAVE_QUOTE")return fail("الإجراء غير معروف.");
    const status=cleanText(body.status,30)||"QUOTED";
    if(!["NEW","CONTACTED","QUOTED","CLOSED"].includes(status))return fail("حالة الطلب غير صحيحة.");
    const carrier=cleanText(body.carrierName,100);
    const quoteNotes=cleanText(body.quoteNotes,2500);
    const internal=cleanText(body.adminNotes,2500);
    const amount=parseAmount(body.quoteAmountSar);
    if(status==="QUOTED"&&(!carrier||amount===null))return fail("حدد اسم شركة الطيران أو الباخرة والسعر قبل تجهيز العرض.");
    const validUntil=parseDay(body.quoteValidUntil);
    const updated=await prisma.transportRequest.update({where:{id},data:{
      status,carrierName:carrier||null,quoteAmountSar:amount,quoteNotes:quoteNotes||null,adminNotes:internal||null,
      quoteValidUntil:validUntil,quoteUpdatedAt:new Date(),whatsappStatus:"NOT_SENT",
    }});
    await prisma.auditLog.create({data:{
      userId:access.id,action:"TRANSPORT_QUOTE_UPDATED",entityType:"TransportRequest",entityId:id,
      afterData:{status,carrier,quoteAmountSar:amount,quoteValidUntil:body.quoteValidUntil??null},
    }}).catch(()=>{});
    return NextResponse.json({success:true,data:{...updated,quoteAmountSar:updated.quoteAmountSar===null?null:Number(updated.quoteAmountSar)}});
  }catch(err){console.error("admin transport quote PATCH failed",err);return fail(err instanceof Error && /السعر|التاريخ/.test(err.message)?err.message:"تعذر حفظ عرض السعر.",400);}
}
export async function POST(request:NextRequest) {
  const access=await adminAccess(true);if(access.error)return access.error;
  try{
    const data=await request.json();
    if(!["FLIGHT","FERRY"].includes(data.kind))return fail("نوع العرض غير صحيح.");
    const title=cleanText(data.title,160);
    if(!title)return fail("عنوان العرض مطلوب.");
    const travelDate=parseDay(data.travelDate);
    const amount=parseAmount(data.amountSar);
    const status=cleanText(data.operationStatus,30)||"AVAILABLE";
    if(!["AVAILABLE","SUSPENDED","UNKNOWN"].includes(status))return fail("حالة تشغيل غير صحيحة.");
    const url=cleanText(data.bannerUrl,500);
    if(url&&!url.startsWith("/Image/")&&!url.startsWith("/api/media?pathname="))return fail("أضف رابطاً لصورة موجودة في مكتبة المشروع.");
    const offer=await prisma.transportOffer.create({data:{
      kind:data.kind,title,description:cleanText(data.description,2500)||null,
      carrierName:cleanText(data.carrierName,100)||null,
      origin:cleanText(data.origin,80)||null,destination:cleanText(data.destination,80)||null,
      travelDate,amountSar:amount,priceUnit:cleanText(data.priceUnit,50)||null,
      bannerUrl:url||null,operationStatus:status,operationNote:cleanText(data.operationNote,1000)||null,
      isVisible: Boolean(data.isVisible),sortOrder:Number.isInteger(data.sortOrder)?Math.max(0,Math.min(9999,data.sortOrder)):0,
    }});
    await prisma.auditLog.create({data:{userId:access.id,action:"TRANSPORT_OFFER_CREATED",entityType:"TransportOffer",entityId:offer.id}}).catch(()=>{});
    return NextResponse.json({success:true,data:offer},{status:201});
  }catch(err){console.error("Transport offer POST failed",err);return fail(err instanceof Error&&/السعر|التاريخ/.test(err.message)?err.message:"تعذر حفظ العرض.",400);}
}
export async function PUT(request:NextRequest) {
  const access=await adminAccess(true);if(access.error)return access.error;
  try{
    const data=await request.json();
    const id=cleanText(data.id,100);
    const current=await prisma.transportOffer.findUnique({where:{id}});
    if(!current)return fail("العرض غير موجود.",404);
    const title=cleanText(data.title,160);
    if(!title)return fail("العنوان مطلوب.");
    const status=cleanText(data.operationStatus,30)||"AVAILABLE";
    if(!["AVAILABLE","SUSPENDED","UNKNOWN"].includes(status))return fail("حالة التشغيل غير صحيحة.");
    const url=cleanText(data.bannerUrl,500);
    if(url&&!url.startsWith("/Image/")&&!url.startsWith("/api/media?pathname="))return fail("رابط صورة غير معتمد.");
    const updated=await prisma.transportOffer.update({where:{id},data:{
      title,description:cleanText(data.description,2500)||null,
      carrierName:cleanText(data.carrierName,100)||null,
      origin:cleanText(data.origin,80)||null,destination:cleanText(data.destination,80)||null,
      travelDate:parseDay(data.travelDate),amountSar:parseAmount(data.amountSar),
      priceUnit:cleanText(data.priceUnit,50)||null,
      bannerUrl:url||null,operationStatus:status,operationNote:cleanText(data.operationNote,1000)||null,
      isVisible:Boolean(data.isVisible),
      sortOrder:Number.isInteger(data.sortOrder)?Math.max(0,Math.min(9999,data.sortOrder)):current.sortOrder,
    }});
    await prisma.auditLog.create({data:{userId:access.id,action:"TRANSPORT_OFFER_UPDATED",entityType:"TransportOffer",entityId:id,afterData:{isVisible:updated.isVisible,operationStatus:updated.operationStatus}}}).catch(()=>{});
    return NextResponse.json({success:true,data:updated});
  }catch(err){console.error("Transport offer PUT failed",err);return fail(err instanceof Error&&/السعر|التاريخ/.test(err.message)?err.message:"تعذر تعديل العرض.",400);}
}
