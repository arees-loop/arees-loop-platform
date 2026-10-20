import {NextRequest,NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";
import {getAdminNotificationEmails,sendEmail} from "@/lib/notifications/email";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const TYPE="LICENSE_CART_APPLICATION";
const ACTION="LICENSE_FORM_ADDED_TO_CART";
const headers={"Cache-Control":"private, no-store"};
const fail=(message:string,status=400)=>NextResponse.json({success:false,message},{status,headers});
type Application={
 name:string;phone:string;countryCode:string;passportDocumentId:string;
 localLicenseDocumentId:string;portraitDocumentId:string;durationYears:string;
};
function safe(s:string){return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");}
export async function POST(req:NextRequest){
 let session:Awaited<ReturnType<typeof getCurrentSession>>;
 try{session=await getCurrentSession();}
 catch(error){console.error("License registration session unavailable",error instanceof Error?error.name:"UNKNOWN");return fail("تعذر التحقق من الجلسة مؤقتاً؛ أعد المحاولة دون رفع الصور من جديد.",503);}
 if(!session)return fail("سجّل الدخول أولاً لإضافة الرخصة إلى السلة.",401);
 if(session.user.status!=="ACTIVE")return fail("الحساب مسجّل دخوله، لكنه يحتاج استكمال التفعيل قبل إرسال الرخصة.",403);
 try{
  const body=await req.json().catch(()=>null);
  const a=body?.application as Application|undefined;
  if(!a||typeof a.name!=="string"||a.name.trim().length<2||a.name.length>100||
    typeof a.phone!=="string"||!/^\d{6,15}$/.test(a.phone)||
    typeof a.countryCode!=="string"||!/^\d{1,4}$/.test(a.countryCode)||a.durationYears!=="1")
    return fail("بيانات نموذج الرخصة غير مكتملة.");
  const ids=[a.passportDocumentId,a.localLicenseDocumentId,a.portraitDocumentId];
  if(!ids.every(id=>typeof id==="string"&&id.length>=10&&id.length<160)||new Set(ids).size!==3)return fail("المستندات الثلاثة مطلوبة.");
  const docs=await prisma.internationalLicenseDocument.findMany({
   where:{userId:session.user.id,id:{in:ids}},select:{id:true,slot:true}
  });
  if(docs.length!==3||![
   ["PASSPORT",a.passportDocumentId],["LOCAL_LICENSE",a.localLicenseDocumentId],["PORTRAIT",a.portraitDocumentId]
  ].every(([slot,id])=>docs.some(d=>d.id===id&&d.slot===slot)))return fail("تعذر التحقق من مستندات الرخصة المرفوعة.",403);
  const recent=await prisma.auditLog.findMany({where:{userId:session.user.id,entityType:TYPE,action:ACTION,createdAt:{gte:new Date(Date.now()-24*60*60*1000)}},
   orderBy:{createdAt:"desc"},take:20,select:{entityId:true,afterData:true}});
  const duplicate=recent.find(x=>{
   const d=x.afterData;
   return !!d&&typeof d==="object"&&!Array.isArray(d)&&"documentIds" in d&&
    Array.isArray(d.documentIds)&&ids.every(id=>(d.documentIds as unknown[]).includes(id));
  });
  if(duplicate?.entityId)return NextResponse.json({success:true,reference:duplicate.entityId,notificationStatus:"ALREADY_RECORDED"},{headers});
  const reference="LICC-"+randomUUID();
  const currentOffer=await prisma.transportOffer.findFirst({
    where:{kind:"DRIVING_LICENSE",isVisible:true,deletedAt:null},orderBy:[{sortOrder:"asc"},{createdAt:"desc"}],
    select:{amountSar:true}
  });
  await prisma.auditLog.create({data:{userId:session.user.id,entityType:TYPE,entityId:reference,action:ACTION,
   afterData:{name:a.name.trim(),phone:"+"+a.countryCode+a.phone,documentIds:ids,
     height:typeof body.application.height==="string"?body.application.height.slice(0,8):"",
     eyeColor:typeof body.application.eyeColor==="string"?body.application.eyeColor.slice(0,60):"",
     deliveryAddress:typeof body.application.deliveryAddress==="string"?body.application.deliveryAddress.slice(0,250):"",
     deliveryLink:typeof body.application.deliveryLink==="string"?body.application.deliveryLink.slice(0,400):"",
     priceSar:currentOffer?.amountSar===null||!currentOffer?199:Number(currentOffer.amountSar),
     stage:"IN_CART_AWAITING_PAYMENT"}
  }});
  const admins=getAdminNotificationEmails().filter(x=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x)).slice(0,12);
  let sent=false;
  if(admins.length){
   const result=await sendEmail({to:admins,subject:"طلب رخصة دولية جديد في السلة · "+reference,
    html:`<main dir="rtl" style="font-family:Arial,sans-serif;color:#0D3B34"><h2>رخصة قيادة دولية — طلب جديد في السلة</h2>
     <p>أكمل العميل النموذج ورفع المستندات الثلاثة. <b>لم يثبت السداد بعد.</b></p>
     <p><strong>المرجع:</strong> ${safe(reference)}</p>
     <p><strong>اسم العميل:</strong> ${safe(a.name.trim())}</p>
     <p><strong>الجوال:</strong> ${safe("+"+a.countryCode+a.phone)}</p>
     <p>للمتابعة افتح <a href="https://www.areesloop.com/admin/transport/driving-licenses?view=requests">طلبات الرخص الدولية</a>.</p>
     <p style="color:#777;font-size:12px">لا تدرج صور الهوية أو المستندات الحساسة في البريد.</p></main>`}).catch((error:unknown)=>{console.error("License admin email failed",error instanceof Error?error.name:"UNKNOWN");return {sent:false};});
   sent=result.sent;
  }
  await prisma.auditLog.create({data:{userId:session.user.id,entityType:TYPE,entityId:reference,
    action:sent?"LICENSE_CART_EMAIL_SENT":"LICENSE_CART_EMAIL_FAILED",
    afterData:{deliveryStatus:sent?"SENT":"FAILED"}}}).catch(()=>{});
  return NextResponse.json({success:true,reference,notificationStatus:sent?"SENT":"FAILED",
   message:"تمت إضافة طلب الرخصة إلى السلة. يمكنك المتابعة للتحويل البنكي."},{status:201,headers});
 }catch(err){
  console.error("License form cart registration failed",err instanceof Error?err.name:"UNKNOWN");
  return fail("تعذر تسجيل الطلب في النظام، حاول مرة أخرى.",503);
 }
}

export async function GET(req:NextRequest){
 const session=await getCurrentSession();
 if(!session||session.user.status!=="ACTIVE")return fail("سجّل الدخول لمتابعة طلبات الرخصة.",401);
 try{
  const reference=req.nextUrl.searchParams.get("reference");
  if(reference&&(!/^LICC-[0-9a-f-]{36}$/.test(reference)))return fail("رقم الطلب غير صحيح.");
  const rows=await prisma.auditLog.findMany({
   where:{userId:session.user.id,entityType:TYPE,action:ACTION,
    ...(reference?{entityId:reference}:{})},
   orderBy:[{createdAt:"desc"},{id:"desc"}],take:100,
   select:{entityId:true,createdAt:true,afterData:true}
  });
  const requests=rows.filter(row=>!!row.entityId).map(row=>{
   const d=row.afterData&&typeof row.afterData==="object"&&!Array.isArray(row.afterData)?
    row.afterData as Record<string,unknown>:{};
   return {reference:row.entityId,createdAt:row.createdAt,priceSar:typeof d.priceSar==="number"?d.priceSar:Number(d.priceSar||199),
    status:"AWAITING_PAYMENT" as const};
  });
  return NextResponse.json({success:true,requests,...(reference?{found:requests.length>0}:{})},{headers});
 }catch(error){
  console.error("License application history failed",error instanceof Error?error.name:"UNKNOWN");
  return fail("تعذر تحميل طلبات الرخصة.",503);
 }
}
