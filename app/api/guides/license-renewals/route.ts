import {Prisma} from "@prisma/client";
import {NextResponse} from "next/server";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";
import {put,del} from "@vercel/blob";
import {getAdminNotificationEmails,sendEmail} from "@/lib/notifications/email";
export const runtime="nodejs";
export async function GET(){
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false},{status:401});
 const renewals=await prisma.guideLicenseRenewal.findMany({where:{userId:session.user.id},select:{id:true,applicationId:true,licenseNumber:true,requestedExpiryDate:true,status:true,reviewNotes:true,createdAt:true},orderBy:{createdAt:"desc"},take:30});
 return NextResponse.json({success:true,renewals});
}
export async function POST(request:Request){
 try{
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false,message:"يرجى تسجيل الدخول"},{status:401});
 if(!session.user.emailVerifiedAt)return NextResponse.json({success:false,message:"يجب تأكيد البريد الإلكتروني"},{status:403});
 const form=await request.formData();
 const applicationId=String(form.get("applicationId")||"");
 const licenseNumber=String(form.get("licenseNumber")||"").trim();
 const dateText=String(form.get("expiryDate")||"");
 const expiry=new Date(dateText+"T00:00:00.000Z");
 const file=form.get("document");
 if(!/^\d{4}-\d{2}-\d{2}$/.test(dateText)||!Number.isFinite(expiry.getTime())||expiry.toISOString().slice(0,10)!==dateText||expiry<new Date(new Date().toISOString().slice(0,10)+"T00:00:00.000Z")||licenseNumber.length<3||licenseNumber.length>100||!(file instanceof File)||file.size<1||file.size>5*1024*1024||!["application/pdf","image/png","image/jpeg","image/webp"].includes(file.type))return NextResponse.json({success:false,message:"يرجى إدخال رقم الترخيص والتاريخ الجديد وإرفاق مستند PDF أو صورة حتى 5 ميجابايت"},{status:400});
 const application=await prisma.guideApplication.findFirst({where:{id:applicationId,userId:session.user.id,status:"APPROVED"},select:{id:true,fullName:true}});
 if(!application)return NextResponse.json({success:false,message:"لا يوجد ملف مرشد معتمد مرتبط بالحساب"},{status:404});
 const pending=await prisma.guideLicenseRenewal.findFirst({where:{applicationId,status:"UNDER_REVIEW"},select:{id:true}});
 if(pending)return NextResponse.json({success:false,message:"يوجد طلب تجديد قيد المراجعة"},{status:409});
 const id=crypto.randomUUID();
 let uploadedPath:string|undefined;
 const blob=await put("guides/renewals/"+id+"/license",file,{access:"private",contentType:file.type,addRandomSuffix:false});
 uploadedPath=blob.pathname;
 try{
 await prisma.$transaction(async tx=>{
 await tx.guideLicenseRenewal.create({data:{id,applicationId,userId:session.user.id,licenseNumber,requestedExpiryDate:expiry,documentPath:blob.pathname}});
 await tx.auditLog.create({data:{userId:session.user.id,action:"GUIDE_LICENSE_RENEWAL_SUBMITTED",entityType:"GuideApplication",entityId:applicationId,afterData:{renewalId:id,expiryDate:dateText}}});
 });
 }catch(error){
  try{if(uploadedPath)await del(uploadedPath);}catch(cleanupError){console.error("Renewal document cleanup failed",cleanupError);}
  throw error;
 }
 let adminEmailSent=false;
 try{
 const admins=getAdminNotificationEmails();
 const delivery=admins.length?await sendEmail({to:admins,subject:"أريس لوب | طلب تجديد ترخيص مرشد",html:`<div dir="rtl"><h2>طلب تجديد ترخيص مرشد</h2><p>طلب جديد بانتظار المراجعة.</p><a href="${new URL(request.url).origin}/admin/guide-license-renewals">مراجعة التجديد</a></div>`}):{sent:false as const};

 adminEmailSent=delivery.sent;
 }catch(error){console.error("Renewal admin notification failed",error);}
 return NextResponse.json({success:true,message:adminEmailSent?"تم تسجيل طلب التجديد وإرسال إشعار للإدارة.":"تم تسجيل طلب التجديد بنجاح وهو بانتظار مراجعة الإدارة. تعذر إرسال إشعار البريد الإلكتروني.",adminEmailSent});
 }catch(e){
 if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==="P2002")return NextResponse.json({success:false,message:"يوجد طلب تجديد قيد المراجعة بالفعل. انتظر قرار الإدارة قبل تقديم طلب جديد."},{status:409});
 console.error("license renewal submission",e);
 return NextResponse.json({success:false,message:"تعذر إرسال طلب التجديد"},{status:500});
 }
}
