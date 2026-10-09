import {canManagePartnerServices,getPartnerAccessRole} from "@/lib/partner-permissions";
import {getAdminNotificationEmails,sendEmail} from "@/lib/notifications/email";
import {NextResponse} from "next/server";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";
import {put} from "@vercel/blob";
export const runtime="nodejs";
export async function GET(){
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false,message:"سجل الدخول أولاً"},{status:401});
 const member=await prisma.partnerMember.findFirst({where:{userId:session.user.id,isActive:true},select:{partnerId:true,permissions:true}});
 if(!member)return NextResponse.json({success:false,message:"حساب شريك مطلوب"},{status:403});
 if(!["OWNER","MANAGER"].includes(getPartnerAccessRole(member.permissions))||!canManagePartnerServices(member.permissions))return NextResponse.json({success:false,message:"ليست لديك صلاحية إدارة تراخيص المنشأة"},{status:403});
 const requests=await prisma.licenseRenewalRequest.findMany({where:{partnerId:member.partnerId},select:{id:true,licenseId:true,requestedExpiryDate:true,status:true,reviewNotes:true,createdAt:true,reviewedAt:true},orderBy:{createdAt:"desc"},take:50});
 return NextResponse.json({success:true,requests});
}
export async function POST(request:Request){
 try{
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false,message:"سجل الدخول أولاً"},{status:401});
 const member=await prisma.partnerMember.findFirst({where:{userId:session.user.id,isActive:true},select:{partnerId:true,permissions:true,partner:{select:{status:true}}}});
 if(!member)return NextResponse.json({success:false,message:"حساب شريك مطلوب"},{status:403});
 if(member.partner.status!=="ACTIVE"||!["OWNER","MANAGER"].includes(getPartnerAccessRole(member.permissions))||!canManagePartnerServices(member.permissions))return NextResponse.json({success:false,message:"ليس لديك صلاحية تجديد ترخيص المنشأة"},{status:403});
 const form=await request.formData();
 const licenseId=String(form.get("licenseId")||"");
 const expiry=new Date(String(form.get("expiryDate")||"")+"T00:00:00.000Z");
 const file=form.get("document");
 if(!licenseId||!Number.isFinite(expiry.getTime())||expiry<new Date(new Date().toISOString().slice(0,10)+"T00:00:00.000Z")||!(file instanceof File)||file.size<1||file.size>5*1024*1024||!["application/pdf","image/png","image/jpeg","image/webp"].includes(file.type))return NextResponse.json({success:false,message:"أدخل تاريخاً سارياً وارفع الترخيص PDF أو صورة حتى 5 ميجابايت"},{status:400});
 const license=await prisma.license.findFirst({where:{id:licenseId,partnerId:member.partnerId}});
 if(!license)return NextResponse.json({success:false,message:"الترخيص لا يتبع المنشأة"},{status:404});
 const pending=await prisma.licenseRenewalRequest.findFirst({where:{licenseId,status:"UNDER_REVIEW"}});
 if(pending)return NextResponse.json({success:false,message:"هناك طلب تجديد قيد المراجعة"},{status:409});
 const id=crypto.randomUUID();
 const blob=await put("licenses/renewals/"+id+"/document",file,{access:"private",contentType:file.type,addRandomSuffix:false});
 await prisma.$transaction(async tx=>{
  await tx.licenseRenewalRequest.create({data:{id,licenseId,partnerId:member.partnerId,submittedById:session.user.id,requestedExpiryDate:expiry,documentPath:blob.pathname}});
  await tx.auditLog.create({data:{userId:session.user.id,action:"LICENSE_RENEWAL_SUBMITTED",entityType:"License",entityId:licenseId,afterData:{requestId:id,requestedExpiryDate:expiry.toISOString()}}});
 });
 const admins=getAdminNotificationEmails();
 const origin=new URL(request.url).origin;
 const delivery=admins.length?await sendEmail({to:admins,subject:"أريس لوب | طلب تجديد ترخيص شريك",html:`<div dir="rtl"><h2>طلب تجديد ترخيص جديد</h2><p>رقم الترخيص: ${license.licenseNumber.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}</p><p>تاريخ الانتهاء المطلوب: ${expiry.toISOString().slice(0,10)}</p><p><a href="${origin}/admin/license-renewals">مراجعة طلبات التجديد</a></p></div>`}):{sent:false as const,reason:"ADMIN_EMAILS_NOT_CONFIGURED"};
 return NextResponse.json({success:true,message:"تم إرسال التجديد للإدارة للمراجعة.",adminEmailSent:delivery.sent});
 }catch(e){console.error("license renewal",e);return NextResponse.json({success:false,message:"تعذر إرسال طلب التجديد"},{status:500})}
}
