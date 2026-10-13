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
const WORKFLOW=["NEW","PROCESSING","QUOTE_READY","QUOTE_SENT","PAID","EXECUTING","DONE","CANCELED"] as const;
const TRANSITIONS:Record<string,string[]> = {
  NEW:["PROCESSING","CANCELED"],
  PROCESSING:["QUOTE_READY","CANCELED"],
  QUOTE_READY:["QUOTE_SENT","PROCESSING","CANCELED"],
  QUOTE_SENT:["PAID","PROCESSING","CANCELED"],
  PAID:["EXECUTING","CANCELED"],
  EXECUTING:["DONE","CANCELED"],
  DONE:[],
  CANCELED:[],
};
const fullName=(session:{firstName?:string|null;lastName?:string|null;email?:string|null})=>
  [session.firstName,session.lastName].filter(Boolean).join(" ").trim()||session.email||"موظف أريس";

export async function GET(request:NextRequest) {
  const access=await adminAccess();if(access.error)return access.error;
  const mode=request.nextUrl.searchParams.get("mode")||"requests";
  try{
    if(mode==="staff"){
      if(access.role!=="SUPER_ADMIN")return fail("عرض الموظفين مخصص للسوبر أدمن.",403);
      const staff=await prisma.user.findMany({where:{role:{in:["ADMIN","SUPER_ADMIN"]},status:"ACTIVE"},select:{id:true,firstName:true,lastName:true,email:true,role:true},orderBy:{createdAt:"asc"}});
      return NextResponse.json({success:true,data:staff},{headers:{"Cache-Control":"no-store"}});
    }
    if(mode==="offers"){
      const offers=await prisma.transportOffer.findMany({orderBy:[{kind:"asc"},{sortOrder:"asc"},{createdAt:"desc"}],take:200});
      return NextResponse.json({success:true,data:offers.map(o=>({...o,amountSar:o.amountSar===null?null:Number(o.amountSar)}))},{headers:{"Cache-Control":"no-store"}});
    }
    const visible=access.role==="SUPER_ADMIN"?{}:{assignedToId:access.id};
    if(mode==="history"){
      const id=request.nextUrl.searchParams.get("id")||"";
      const item=await prisma.transportRequest.findFirst({where:{id,...visible},select:{id:true}});
      if(!item)return fail("الطلب غير متاح لحساب الموظف.",404);
      const events=await prisma.transportRequestEvent.findMany({where:{requestId:id},orderBy:{createdAt:"asc"},take:300});
      return NextResponse.json({success:true,data:events},{headers:{"Cache-Control":"no-store"}});
    }
    const requests=await prisma.transportRequest.findMany({where:visible,orderBy:{createdAt:"desc"},take:250});
    return NextResponse.json({success:true,data:requests.map(r=>({...r,quoteAmountSar:r.quoteAmountSar===null?null:Number(r.quoteAmountSar)}))},{headers:{"Cache-Control":"no-store"}});
  }catch(err){console.error("admin transport GET failed",err);return fail("تعذر تحميل الطلبات أو العروض. تحقق من اتصال قاعدة البيانات.",503);}
}

export async function PATCH(request:NextRequest) {
  const session=await getCurrentSession();
  if(!session)return fail("يرجى تسجيل الدخول.",401);
  if(!["SUPER_ADMIN","ADMIN"].includes(session.user.role))return fail("غير مصرح.",403);
  const superAdmin=session.user.role==="SUPER_ADMIN";
  const actorId=session.user.id;
  const actorName=fullName(session.user);
  try{
    const body=await request.json() as Record<string,unknown>;
    const id=cleanText(body.id,100);
    const current=await prisma.transportRequest.findUnique({where:{id}});
    if(!current)return fail("الطلب غير موجود.",404);
    if(!superAdmin && current.assignedToId!==actorId)return fail("الطلب غير مسند إلى حسابك.",403);
    const action=cleanText(body.action,30);

    if(action==="ASSIGN"){
      if(!superAdmin)return fail("إسناد الطلبات للسوبر أدمن فقط.",403);
      const assignedToId=cleanText(body.assignedToId,100)||null;
      let assigneeName:string|null=null;
      if(assignedToId){
        const assignee=await prisma.user.findFirst({
          where:{id:assignedToId,role:{in:["ADMIN","SUPER_ADMIN"]},status:"ACTIVE"},
          select:{id:true,firstName:true,lastName:true,email:true},
        });
        if(!assignee)return fail("اختر موظفاً إدارياً نشطاً.",400);
        assigneeName=fullName(assignee);
      }
      const [updated]=await prisma.$transaction([
        prisma.transportRequest.update({where:{id},data:{assignedToId}}),
        prisma.transportRequestEvent.create({data:{requestId:id,actorId,actorName,action:"ASSIGNED",fromStatus:current.status,toStatus:current.status,details:{from:current.assignedToId,to:assignedToId,employee:assigneeName}}}),
      ]);
      return NextResponse.json({success:true,data:{...updated,quoteAmountSar:updated.quoteAmountSar===null?null:Number(updated.quoteAmountSar)}});
    }

    if(action==="SAVE_QUOTE"){
      if(["DONE","CANCELED","PAID","EXECUTING"].includes(current.status))return fail("لا يمكن تعديل عرض الطلب في هذه المرحلة.",409);
      const carrier=cleanText(body.carrierName,100);
      const quoteNotes=cleanText(body.quoteNotes,2500);
      const internal=cleanText(body.adminNotes,2500);
      const amount=parseAmount(body.quoteAmountSar);
      const validUntil=parseDay(body.quoteValidUntil);
      if((carrier&&!amount && amount!==0)||(!carrier&&amount!==null))return fail("أدخل اسم الناقل والسعر معاً.",400);
      const ready=carrier.length>0&&amount!==null;
      const status=ready?"QUOTE_READY":current.status;
      const [updated]=await prisma.$transaction([
        prisma.transportRequest.update({where:{id},data:{
          status,carrierName:carrier||null,quoteAmountSar:amount,quoteNotes:quoteNotes||null,adminNotes:internal||null,
          quoteValidUntil:validUntil,quoteUpdatedAt:new Date(),
          whatsappStatus:ready?"NOT_SENT":current.whatsappStatus,
        }}),
        prisma.transportRequestEvent.create({data:{
          requestId:id,actorId,actorName,action:"QUOTE_SAVED",fromStatus:current.status,toStatus:status,
          details:{carrierName:carrier,amountSar:amount,validUntil:validUntil?.toISOString()||null},
        }}),
      ]);
      return NextResponse.json({success:true,data:{...updated,quoteAmountSar:updated.quoteAmountSar===null?null:Number(updated.quoteAmountSar)}});
    }

    if(action==="MARK_MANUAL_WHATSAPP"){
      if(current.status!=="QUOTE_READY"||!current.carrierName||current.quoteAmountSar===null)return fail("احفظ عرض السعر أولاً قبل تسجيل إرساله.",409);
      if(body.confirmed!==true)return fail("يجب تأكيد الإرسال الفعلي من حساب واتساب الشركة.",400);
      const [updated]=await prisma.$transaction([
        prisma.transportRequest.update({where:{id},data:{status:"QUOTE_SENT",whatsappStatus:"MANUALLY_MARKED_SENT"}}),
        prisma.transportRequestEvent.create({data:{requestId:id,actorId,actorName,action:"QUOTE_MARKED_SENT_MANUALLY",fromStatus:current.status,toStatus:"QUOTE_SENT",details:{method:"manual",proof:"staff_confirmation_only"}}}),
      ]);
      return NextResponse.json({success:true,data:{...updated,quoteAmountSar:updated.quoteAmountSar===null?null:Number(updated.quoteAmountSar)}});
    }

    if(action==="SET_STATUS"){
      const status=cleanText(body.status,30);
      if(!WORKFLOW.includes(status as typeof WORKFLOW[number]))return fail("الحالة غير صالحة.");
      if(!TRANSITIONS[current.status]?.includes(status))return fail("الانتقال لهذه الحالة غير مسموح؛ راجع تسلسل معالجة الطلب.",409);
      const reason=cleanText(body.cancellationReason,1500);
      const by=cleanText(body.canceledBy,30);
      if(status==="CANCELED" && (reason.length<5||!["PARTNER","STAFF","CUSTOMER"].includes(by)))return fail("حدد جهة الإلغاء والسبب (5 حروف على الأقل).");
      if(status==="PAID" && current.whatsappStatus!=="MANUALLY_MARKED_SENT")return fail("لا يمكن تسجيل السداد قبل تأكيد إرسال عرض السعر.",409);
      const [updated]=await prisma.$transaction([
        prisma.transportRequest.update({where:{id},data:{
          status,canceledBy:status==="CANCELED"?by:null,cancellationReason:status==="CANCELED"?reason:null,
        }}),
        prisma.transportRequestEvent.create({data:{
          requestId:id,actorId,actorName,action:status==="CANCELED"?"CANCELED":"STATUS_CHANGED",
          fromStatus:current.status,toStatus:status,
          details:status==="CANCELED"?{initiatedBy:by,reason}:undefined,
        }}),
      ]);
      return NextResponse.json({success:true,data:{...updated,quoteAmountSar:updated.quoteAmountSar===null?null:Number(updated.quoteAmountSar)}});
    }
    return fail("الإجراء غير معروف.");
  }catch(err){console.error("admin transport PATCH failed",err);return fail(err instanceof Error&&/السعر|التاريخ/.test(err.message)?err.message:"تعذر تنفيذ الإجراء. لم يتم تأكيد الحفظ.",500);}
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
