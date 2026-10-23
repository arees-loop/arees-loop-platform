import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { allowedTransportKinds, canManageTransport } from "@/lib/transport-permissions";

export const runtime = "nodejs";

async function adminAccess(superOnly=false) {
  const session=await getCurrentSession();
  if(!session) return {error:NextResponse.json({success:false,message:"يرجى تسجيل الدخول."},{status:401})};
  if(!["SUPER_ADMIN","ADMIN"].includes(session.user.role) || (superOnly && session.user.role!=="SUPER_ADMIN")){
    return {error:NextResponse.json({success:false,message:"غير مصرح بهذا الإجراء."},{status:403})};
  }
  return {id:session.user.id,role:session.user.role,allowedKinds:allowedTransportKinds(session.user)};
}
const fail=(message:string,status=400)=>NextResponse.json({success:false,message},{status});
const num=(value:unknown)=>value===null||value===undefined||value===""?null:Number(value);
function cleanText(input:unknown,max:number){return String(input??"").trim().slice(0,max);}
function parseOfferImages(value:unknown, fallback:string|null, previous?:unknown){
  const input=value===undefined?previous:value;
  if(input===undefined||input===null)return fallback?[fallback]:[];
  if(!Array.isArray(input)||input.length>10)throw new Error("يمكن إضافة 10 صور كحد أقصى لكل عرض.");
  const urls=input.map(item=>cleanText(item,500));
  if(urls.some(url=>!url||(!url.startsWith("/Image/")&&!url.startsWith("/api/media?pathname="))))throw new Error("تأكد من روابط صور العرض.");
  return [...new Set(urls)];
}
function parseDay(value:unknown){
  const s=String(value??"");
  if(!s)return null;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(s))throw new Error("تاريخ غير صالح.");
  const d=new Date(s+"T12:00:00.000Z");
  if(Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==s)throw new Error("التاريخ غير صالح.");
  return d;
}
function parseOfferDate(value:unknown, end=false) {
  const date=parseDay(value);
  if (!date) return null;
  const day=date.toISOString().slice(0,10);
  // Include the chosen Saudi calendar day in the campaign window (Asia/Riyadh, UTC+03).
  return new Date(day+(end?"T23:59:59.999+03:00":"T00:00:00.000+03:00"));
}
function offerPeriod(startsAt:unknown, endsAt:unknown) {
  const start=parseOfferDate(startsAt), end=parseOfferDate(endsAt,true);
  if(start && end && start.getTime()>end.getTime())throw new Error("نهاية العرض يجب ألا تسبق تاريخ بدايته.");
  return { startsAt:start, endsAt:end };
}
function parseAmount(value:unknown){
  const n=num(value);
  if(n===null)return null;
  if(!Number.isFinite(n)||n<0||n>1000000||Math.round(n*100)!==n*100)throw new Error("السعر يجب أن يكون بالريال ورقمين عشريين كحد أقصى.");
  return n;
}
function parseSchedule(typeValue:unknown,input:unknown,legacyDate:unknown){
  const type=String(typeValue||"SINGLE");
  const data=input&&typeof input==="object"?input as Record<string,unknown>:{};
  const list=(value:unknown)=>String(value??"").split(/[\n,،;]+/).map(x=>x.trim()).filter(Boolean);
  const date=(value:unknown)=>{const parsed=parseDay(value);if(!parsed)throw new Error("أدخل تاريخاً صحيحاً للجدول.");return parsed.toISOString().slice(0,10);};
  let scheduleData:Record<string,unknown>={},travelDate:Date|null=null;
  if(type==="VISA_META"){const cities=Array.isArray(data.appointmentCities)?data.appointmentCities:[];if(cities.length>30||cities.some(c=>typeof c!=="string"||c.length>70))throw new Error("مدن المواعيد غير صحيحة.");scheduleData={visaType:cleanText(data.visaType,100),requirements:cleanText(data.requirements,2500),processingTime:cleanText(data.processingTime,120),needsAppointment:data.needsAppointment===true,appointmentCities:data.needsAppointment===true?[...new Set(cities.map(c=>String(c).trim()).filter(Boolean))]:[]};}
  else if(type==="SINGLE"){const value=data.date||legacyDate;if(value){const d=date(value);scheduleData={date:d};travelDate=parseDay(d);}}
  else if(type==="MULTIPLE"){const values=Array.isArray(data.dates)?data.dates:list(data.datesText);const dates=[...new Set(values.map(date))].sort();if(!dates.length)throw new Error("أدخل تاريخاً واحداً على الأقل.");scheduleData={dates};travelDate=parseDay(dates[0]);}
  else if(type==="RANGE"){const from=date(data.from),to=date(data.to);if(from>to)throw new Error("نهاية الفترة يجب ألا تسبق بدايتها.");scheduleData={from,to};travelDate=parseDay(from);}
  else if(type==="WEEKLY"){const weekdays=(Array.isArray(data.weekdays)?data.weekdays:list(data.weekdaysText)).map(Number);if(!weekdays.length||weekdays.some(x=>!Number.isInteger(x)||x<0||x>6))throw new Error("اختر يوماً واحداً على الأقل من أيام الأسبوع.");scheduleData={weekdays:[...new Set(weekdays)].sort((a,b)=>a-b),until:data.until?date(data.until):null};}
  else if(type==="MONTHLY"){const monthDays=(Array.isArray(data.monthDays)?data.monthDays:list(data.monthDaysText)).map(Number);if(!monthDays.length||monthDays.some(x=>!Number.isInteger(x)||x<1||x>31))throw new Error("أدخل أيام الشهر من 1 إلى 31.");scheduleData={monthDays:[...new Set(monthDays)].sort((a,b)=>a-b),until:data.until?date(data.until):null};}
  else throw new Error("نوع جدول الرحلات غير صالح.");
  return {scheduleType:type,scheduleData,travelDate};
}
const WORKFLOW=["NEW","PROCESSING","QUOTE_READY","QUOTE_SENT","PAID","EXECUTING","DONE","CANCELED"] as const;
const TRANSITIONS:Record<string,string[]> = {
  NEW:["PROCESSING","CANCELED"],
  PROCESSING:["QUOTE_READY","CANCELED"],
  QUOTE_READY:["QUOTE_SENT","PROCESSING","CANCELED"],
  QUOTE_SENT:["PAID","PROCESSING","CANCELED"],
  PAID:["EXECUTING","DONE","CANCELED"],
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
      const staff=await prisma.user.findMany({where:{role:{in:["ADMIN","SUPER_ADMIN"]},status:"ACTIVE"},select:{id:true,firstName:true,lastName:true,email:true,role:true,adminPermissions:true},orderBy:{createdAt:"asc"}});
      return NextResponse.json({success:true,data:staff},{headers:{"Cache-Control":"no-store"}});
    }
    if(mode==="offers"){
      if(access.role!=="SUPER_ADMIN")return NextResponse.json({success:true,data:[]},{headers:{"Cache-Control":"no-store"}});
      const offers=await prisma.transportOffer.findMany({where:{deletedAt:null},orderBy:[{kind:"asc"},{sortOrder:"asc"},{createdAt:"desc"}],take:200});
      return NextResponse.json({success:true,data:offers.map(o=>({...o,imageUrls:Array.isArray(o.imageUrls)?o.imageUrls:(o.bannerUrl?[o.bannerUrl]:[]),amountSar:o.amountSar===null?null:Number(o.amountSar),adultPriceSar:o.adultPriceSar===null?null:Number(o.adultPriceSar),childPriceSar:o.childPriceSar===null?null:Number(o.childPriceSar),infantPriceSar:o.infantPriceSar===null?null:Number(o.infantPriceSar)}))},{headers:{"Cache-Control":"no-store"}});
    }
    const visible=access.role==="SUPER_ADMIN"?{}:{assignedToId:access.id,kind:{in:access.allowedKinds}};
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
    if(!superAdmin && (current.assignedToId!==actorId || !canManageTransport(session.user, current.kind==="FERRY"?"FERRY":current.kind==="VISA"?"VISA":current.kind==="DRIVING_LICENSE"?"DRIVING_LICENSE":"FLIGHT")))return fail("الطلب غير مسند إلى حسابك أو لا تملك صلاحية القسم.",403);
    const action=cleanText(body.action,30);

    if(action==="VERIFY_EXTERNAL_BANK_TRANSFER"){
      // This workflow records a human-confirmed bank reconciliation, not a platform payment.
      if(!superAdmin)return fail("اعتماد حوالة خارج المنصة متاح للسوبر أدمن فقط.",403);
      if(!["FERRY","FLIGHT"].includes(current.kind))return fail("هذه المراجعة لطلبات الطيران والبواخر فقط.",400);
      if(!["NEW","PROCESSING","QUOTE_READY","QUOTE_SENT"].includes(current.status))return fail("الحالة الحالية لا تسمح بتسجيل حوالة جديدة.",409);
      if(body.bankStatementConfirmed!==true)return fail("يجب تأكيد مطابقة الحوالة مع كشف البنك الرسمي.",400);
      const bankReference=cleanText(body.bankReference,120);
      const amountSar=parseAmount(body.amountSar);
      const bankNote=cleanText(body.bankNote,500);
      if(bankReference.length<5||amountSar===null||amountSar<=0)return fail("أدخل مرجع الحوالة البنكي (5 أحرف على الأقل) ومبلغاً صحيحاً بالريال.",400);
      const updated=await prisma.$transaction(async tx=>{
        await tx.$queryRaw`SELECT id FROM "TransportRequest" WHERE id = ${id} FOR UPDATE`;
        const fresh=await tx.transportRequest.findUniqueOrThrow({where:{id},select:{status:true,kind:true}});
        if(!["NEW","PROCESSING","QUOTE_READY","QUOTE_SENT"].includes(fresh.status))return null;
        const record=await tx.transportRequest.update({where:{id},data:{status:"PAID"}});
        await tx.transportRequestEvent.create({data:{
          requestId:id,actorId,actorName,action:"ADMIN_PAYMENT_VERIFIED",
          fromStatus:fresh.status,toStatus:"PAID",
          details:{source:"EXTERNAL_WHATSAPP_BANK_TRANSFER",bankReference,amountSar,bankNote,verifiedAgainstBankStatement:true,verifiedBy:actorId}
        }});
        return record;
      });
      if(!updated)return fail("تغيرت حالة الطلب أثناء المراجعة. حدّث الصفحة وأعد المحاولة.",409);
      return NextResponse.json({success:true,data:{...updated,quoteAmountSar:updated.quoteAmountSar===null?null:Number(updated.quoteAmountSar)}});
    }

    if(action==="REPLY_CUSTOMER"){
      if(["CANCELED","DONE"].includes(current.status))return fail("لا يمكن الرد على طلب مغلق؛ أعد فتحه بإجراء معتمد أولاً.",409);
      const customerReply=cleanText(body.customerReply,2500);
      if(!customerReply)return fail("اكتب الرد الذي سيظهر للعميل.",400);
      const [updated]=await prisma.$transaction([
        prisma.transportRequest.update({where:{id},data:{customerReply}}),
        prisma.transportRequestEvent.create({data:{
          requestId:id,actorId,actorName,action:"CUSTOMER_REPLY_PUBLISHED",
          fromStatus:current.status,toStatus:current.status,
          details:{messageLength:customerReply.length},
        }}),
      ]);
      return NextResponse.json({success:true,data:{...updated,quoteAmountSar:updated.quoteAmountSar===null?null:Number(updated.quoteAmountSar)}});
    }

    if(action==="ASSIGN"){
      if(!superAdmin)return fail("إسناد الطلبات للسوبر أدمن فقط.",403);
      const assignedToId=cleanText(body.assignedToId,100)||null;
      let assigneeName:string|null=null;
      if(assignedToId){
        const assignee=await prisma.user.findFirst({
          where:{id:assignedToId,role:{in:["ADMIN","SUPER_ADMIN"]},status:"ACTIVE"},
          select:{id:true,firstName:true,lastName:true,email:true,role:true,adminPermissions:true},
        });
        if(!assignee)return fail("اختر موظفاً إدارياً نشطاً.",400);
        if(!canManageTransport(assignee,current.kind==="FERRY"?"FERRY":current.kind==="VISA"?"VISA":current.kind==="DRIVING_LICENSE"?"DRIVING_LICENSE":"FLIGHT"))return fail("هذا الموظف ليست لديه صلاحية إدارة القسم المطلوب.",403);
        assigneeName=fullName(assignee);
      }
      const [updated]=await prisma.$transaction([
        prisma.transportRequest.update({where:{id},data:{assignedToId}}),
        prisma.transportRequestEvent.create({data:{requestId:id,actorId,actorName,action:"ASSIGNED",fromStatus:current.status,toStatus:current.status,details:{from:current.assignedToId,to:assignedToId,employee:assigneeName}}}),
      ]);
      return NextResponse.json({success:true,data:{...updated,quoteAmountSar:updated.quoteAmountSar===null?null:Number(updated.quoteAmountSar)}});
    }

    if(action==="PUBLISH_SERVICE_DECISION"){
      if(!["VISA","FLIGHT","FERRY","DRIVING_LICENSE"].includes(current.kind))return fail("نوع الخدمة غير مدعوم.",400);
      if(["CANCELED","DONE","PAID","EXECUTING"].includes(current.status))return fail("لا يمكن تعديل طلب مغلق أو قيد التنفيذ أو مسدد.",409);
      const availability=cleanText(body.availability,20);
      if(availability==="AVAILABLE"){
        const amount=parseAmount(body.quoteAmountSar);
        if(amount===null||amount<=0)return fail("أدخل سعراً صحيحاً أكبر من صفر.",400);
        const notes=cleanText(body.quoteNotes,2500);
        const message=["تمت مراجعة طلبكم والخدمة المطلوبة متاحة حالياً.","السعر الإجمالي: "+amount.toLocaleString("ar-SA")+" ريال سعودي.",notes?"التفاصيل: "+notes:"","الطلب تحت الإجراء، وسيتم التواصل معكم بشأن الخطوات التالية. لا يعني هذا تأكيد الحجز أو الإصدار أو استلام السداد."].filter(Boolean).join("\\n");
        const [updated]=await prisma.$transaction([
          prisma.transportRequest.update({where:{id},data:{status:"PROCESSING",carrierName:null,quoteAmountSar:amount,quoteNotes:notes||null,customerReply:message,quoteUpdatedAt:new Date(),whatsappStatus:"NOT_SENT"}}),
          prisma.transportRequestEvent.create({data:{requestId:id,actorId,actorName,action:"SERVICE_OFFER_PUBLISHED",fromStatus:current.status,toStatus:"PROCESSING",details:{amountSar:amount,messageLength:message.length}}}),
        ]);
        return NextResponse.json({success:true,data:{...updated,quoteAmountSar:Number(updated.quoteAmountSar)}});
      }
      if(availability==="UNAVAILABLE"){
        const reason=cleanText(body.reason,1500);
        const message="نعتذر لكم، الخدمة المطلوبة غير متاحة حالياً، ولذلك تم إغلاق الطلب دون تأكيد حجز أو تحصيل رسوم."+(reason?"\\nالتوضيح: "+reason:"");
        const [updated]=await prisma.$transaction([
          prisma.transportRequest.update({where:{id},data:{status:"CANCELED",customerReply:message,canceledBy:"STAFF",cancellationReason:reason||"الخدمة غير متاحة حالياً",quoteAmountSar:null,quoteNotes:null,carrierName:null}}),
          prisma.transportRequestEvent.create({data:{requestId:id,actorId,actorName,action:"SERVICE_UNAVAILABLE_CLOSED",fromStatus:current.status,toStatus:"CANCELED",details:{reason:reason||"خدمة التأشيرة غير متاحة",messageLength:message.length}}}),
        ]);
        return NextResponse.json({success:true,data:{...updated,quoteAmountSar:null}});
      }
      return fail("حدد حالة توفر التأشيرة.",400);
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

    if(action==="PUBLISH_QUOTE_TO_CUSTOMER"){
      if(current.status!=="QUOTE_READY"||!current.carrierName||current.quoteAmountSar===null)
        return fail("يجب حفظ عرض سعر مكتمل قبل نشره للعميل.",409);
      const updated=await prisma.$transaction(async tx=>{
        await tx.$queryRaw`SELECT id FROM "TransportRequest" WHERE id = ${id} FOR UPDATE`;
        const fresh=await tx.transportRequest.findUniqueOrThrow({where:{id},select:{status:true,carrierName:true,quoteAmountSar:true,whatsappStatus:true}});
        if(fresh.status!=="QUOTE_READY"||!fresh.carrierName||fresh.quoteAmountSar===null)
          return null;
        const result=await tx.transportRequest.update({where:{id},data:{status:"QUOTE_SENT"}});
        await tx.transportRequestEvent.create({data:{
          requestId:id,actorId,actorName,action:"QUOTE_PUBLISHED_TO_CUSTOMER",
          fromStatus:"QUOTE_READY",toStatus:"QUOTE_SENT",
          details:{channel:"customer_portal",whatsappStatus:fresh.whatsappStatus,amountSar:Number(fresh.quoteAmountSar)},
        }});
        return result;
      });
      if(!updated)return fail("تغيرت حالة الطلب. حدّث الصفحة وأعد المحاولة.",409);
      return NextResponse.json({success:true,data:{...updated,quoteAmountSar:updated.quoteAmountSar===null?null:Number(updated.quoteAmountSar)}});
    }

    if(action==="MARK_MANUAL_WHATSAPP"){
      if(!["QUOTE_READY","QUOTE_SENT"].includes(current.status)||!current.carrierName||current.quoteAmountSar===null)return fail("احفظ عرض السعر أولاً قبل تسجيل إرساله.",409);
      if(current.whatsappStatus==="MANUALLY_MARKED_SENT")return fail("تم تسجيل إرسال العرض يدوياً مسبقاً.",409);
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
      // A financial status is never set manually: it requires bank reconciliation.
      if(status==="PAID")return fail("تأكيد وصول السداد يتم من قسم مراجعة الإيصالات بعد المطابقة البنكية فقط.",409);
      const changed=await prisma.$transaction(async tx=>{
        await tx.$queryRaw`SELECT id FROM "TransportRequest" WHERE id = ${id} FOR UPDATE`;
        const fresh=await tx.transportRequest.findUniqueOrThrow({where:{id},select:{status:true,kind:true}});
        if(fresh.status!==current.status||!TRANSITIONS[fresh.status]?.includes(status))return null;
        if(status==="DONE"&&["FLIGHT","FERRY"].includes(fresh.kind)){
          const [bankVerified,ticket,confirmedDetails]=await Promise.all([
            tx.transportRequestEvent.findFirst({where:{requestId:id,action:"ADMIN_PAYMENT_VERIFIED"},select:{id:true}}),
            tx.transportRequestEvent.findFirst({where:{requestId:id,action:"TICKET_PDF_DELIVERED"},select:{id:true}}),
            tx.transportRequestEvent.findFirst({where:{requestId:id,action:"BOOKING_CONFIRMATION_DETAILS_SAVED"},select:{id:true}})
          ]);
          if(!bankVerified||!ticket||!confirmedDetails)return "MISSING_REQUIREMENTS" as const;
        }
        const updated=await tx.transportRequest.update({where:{id},data:{
          status,canceledBy:status==="CANCELED"?by:null,cancellationReason:status==="CANCELED"?reason:null,
        }});
        await tx.transportRequestEvent.create({data:{
          requestId:id,actorId,actorName,action:status==="CANCELED"?"CANCELED":status==="DONE"?"TICKET_FULFILLED":"STATUS_CHANGED",
          fromStatus:fresh.status,toStatus:status,
          details:status==="CANCELED"?{initiatedBy:by,reason}:status==="DONE"?{completedBy:actorId}:undefined,
        }});
        return updated;
      });
      if(changed==="MISSING_REQUIREMENTS")return fail("يلزم اعتماد التحويل البنكي وحفظ تفاصيل الحجز المؤكد وإرفاق التذكرة الأصلية للعميل قبل «تم التنفيذ».",409);
      if(!changed)return fail("تغيرت حالة الطلب. حدّث الصفحة وأعد المحاولة.",409);
      const updated=changed;
      return NextResponse.json({success:true,data:{...updated,quoteAmountSar:updated.quoteAmountSar===null?null:Number(updated.quoteAmountSar)}});
    }
    return fail("الإجراء غير معروف.");
  }catch(err){console.error("admin transport PATCH failed",err);return fail(err instanceof Error&&/السعر|التاريخ/.test(err.message)?err.message:"تعذر تنفيذ الإجراء. لم يتم تأكيد الحفظ.",500);}
}
export async function POST(request:NextRequest) {
  const access=await adminAccess(true);if(access.error)return access.error;
  try{
    const data=await request.json();
    if(!["FLIGHT","FERRY","VISA"].includes(data.kind))return fail("نوع العرض غير صحيح.");
    const title=cleanText(data.title,160);
    if(!title)return fail("عنوان العرض مطلوب.");
    if(data.kind==="VISA"&&data.scheduleType!=="VISA_META")return fail("استخدم نموذج التأشيرات المخصص.");
    const schedule=parseSchedule(data.scheduleType,data.scheduleData,data.travelDate);
    const amount=parseAmount(data.amountSar);
    const status=cleanText(data.operationStatus,30)||"AVAILABLE";
    if(!["AVAILABLE","SUSPENDED","UNKNOWN"].includes(status))return fail("حالة تشغيل غير صحيحة.");
    const url=cleanText(data.bannerUrl,500)||null;
    if(url&&!url.startsWith("/Image/")&&!url.startsWith("/api/media?pathname="))return fail("أضف رابطاً لصورة موجودة في مكتبة المشروع.");
    const period=offerPeriod(data.startsAt,data.endsAt);
    const imageUrls=parseOfferImages(data.imageUrls,url);
    const offer=await prisma.transportOffer.create({data:{...period,
      kind:data.kind,title,description:cleanText(data.description,2500)||null,
      carrierName:cleanText(data.carrierName,100)||null,
      origin:cleanText(data.origin,80)||null,destination:cleanText(data.destination,80)||null,
      travelDate:schedule.travelDate,scheduleType:schedule.scheduleType,scheduleData:schedule.scheduleData as never,amountSar:amount,
      adultPriceSar:parseAmount(data.adultPriceSar),childPriceSar:parseAmount(data.childPriceSar),infantPriceSar:parseAmount(data.infantPriceSar),
      priceUnit:cleanText(data.priceUnit,50)||null,
      bannerUrl:url,imageUrls:imageUrls as never,operationStatus:status,operationNote:cleanText(data.operationNote,1000)||null,
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
    const current=await prisma.transportOffer.findFirst({where:{id,deletedAt:null}});
    if(!current)return fail("العرض غير موجود.",404);
    const title=cleanText(data.title,160);
    if(!title)return fail("العنوان مطلوب.");
    const status=cleanText(data.operationStatus,30)||"AVAILABLE";
    if(!["AVAILABLE","SUSPENDED","UNKNOWN"].includes(status))return fail("حالة التشغيل غير صحيحة.");
    const url=cleanText(data.bannerUrl,500)||null;
    if(url&&!url.startsWith("/Image/")&&!url.startsWith("/api/media?pathname="))return fail("رابط صورة غير معتمد.");
    const period=offerPeriod(data.startsAt,data.endsAt);
    if(current.kind==="VISA"&&data.scheduleType!=="VISA_META")return fail("استخدم نموذج التأشيرات المخصص.");
    const schedule=parseSchedule(data.scheduleType,data.scheduleData,data.travelDate);
    const imageUrls=parseOfferImages(data.imageUrls,url,current.imageUrls);
    const updated=await prisma.transportOffer.update({where:{id},data:{...period,
      title,description:cleanText(data.description,2500)||null,
      carrierName:cleanText(data.carrierName,100)||null,
      origin:cleanText(data.origin,80)||null,destination:cleanText(data.destination,80)||null,
      travelDate:schedule.travelDate,scheduleType:schedule.scheduleType,scheduleData:schedule.scheduleData as never,amountSar:parseAmount(data.amountSar),
      adultPriceSar:parseAmount(data.adultPriceSar),childPriceSar:parseAmount(data.childPriceSar),infantPriceSar:parseAmount(data.infantPriceSar),
      priceUnit:cleanText(data.priceUnit,50)||null,
      bannerUrl:url||null,imageUrls:imageUrls as never,operationStatus:status,operationNote:cleanText(data.operationNote,1000)||null,
      isVisible:Boolean(data.isVisible),
      sortOrder:Number.isInteger(data.sortOrder)?Math.max(0,Math.min(9999,data.sortOrder)):current.sortOrder,
    }});
    await prisma.auditLog.create({data:{userId:access.id,action:"TRANSPORT_OFFER_UPDATED",entityType:"TransportOffer",entityId:id,afterData:{isVisible:updated.isVisible,operationStatus:updated.operationStatus}}}).catch(()=>{});
    return NextResponse.json({success:true,data:updated});
  }catch(err){console.error("Transport offer PUT failed",err);return fail(err instanceof Error&&/السعر|التاريخ/.test(err.message)?err.message:"تعذر تعديل العرض.",400);}
}

export async function DELETE(request:NextRequest) {
  const access=await adminAccess(true);if(access.error)return access.error;
  try {
    const body=await request.json();
    const id=cleanText(body.id,100);
    if(!id)return fail("معرف العرض مطلوب.");
    const previous=await prisma.transportOffer.findFirst({where:{id,deletedAt:null}});
    if(!previous)return fail("العرض غير موجود.",404);
    const updated=await prisma.transportOffer.update({where:{id},data:{deletedAt:new Date(),isVisible:false}});
    await prisma.auditLog.create({data:{userId:access.id,action:"TRANSPORT_OFFER_ARCHIVED",entityType:"TransportOffer",entityId:id,beforeData:{title:previous.title,isVisible:previous.isVisible},afterData:{deletedAt:updated.deletedAt?.toISOString()}}})
      .catch(err=>console.error("Transport archive audit failed",err));
    return NextResponse.json({success:true,message:"تمت أرشفة العرض وإخفاؤه دون حذف بياناته.",data:{id}});
  } catch(err) {
    console.error("DELETE transport offer failed",err);
    return fail("تعذر أرشفة العرض.",500);
  }
}
