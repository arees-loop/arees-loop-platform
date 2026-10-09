import {canApproveLicenseRenewal} from "@/lib/license-validity";
import {hasAdminPermission} from "@/lib/admin-permissions";
import {sendEmail} from "@/lib/notifications/email";
import {NextResponse} from "next/server";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";
export async function GET(){
 const session=await getCurrentSession();
 if(!session||!hasAdminPermission(session.user,"PARTNER_REQUESTS"))return NextResponse.json({success:false},{status:403});
 const requests=await prisma.licenseRenewalRequest.findMany({where:{status:"UNDER_REVIEW"},orderBy:{createdAt:"asc"},take:100});
 const audits=await prisma.auditLog.findMany({where:{entityType:"LicenseRenewalRequest",action:"LICENSE_RENEWAL_AI_REVIEW",entityId:{in:requests.map(x=>x.id)}},orderBy:{createdAt:"desc"}});
 const aiById=new Map(audits.toReversed().map(x=>[x.entityId,x.afterData]));
 return NextResponse.json({success:true,requests:requests.map(x=>({...x,aiReview:aiById.get(x.id)||null}))});
}
export async function PATCH(request:Request){
 const session=await getCurrentSession();
 if(!session||!hasAdminPermission(session.user,"PARTNER_REQUESTS"))return NextResponse.json({success:false},{status:403});
 const body=await request.json().catch(()=>null);
 const id=typeof body?.id==="string"?body.id:"",approved=body?.approved;
 const notes=typeof body?.notes==="string"?body.notes.trim():"";
 if(!id||typeof approved!=="boolean"||notes.length<20||notes.length>2000||(approved&&body?.verifiedDocument!==true))return NextResponse.json({success:false,message:"يجب فحص المستند وتسجيل ملاحظات المراجعة"},{status:400});
 const result=await prisma.$transaction(async tx=>{
  const renewal=await tx.licenseRenewalRequest.findUnique({where:{id}});
  if(!renewal||renewal.status!=="UNDER_REVIEW")return false;
  if(approved&&renewal.requestedExpiryDate<new Date(new Date().toISOString().slice(0,10)+"T00:00:00.000Z"))return false;
  const license=approved?await tx.license.findFirst({where:{id:renewal.licenseId,partnerId:renewal.partnerId},include:{partner:{select:{status:true}}}}):null;
  if(approved&&(!license||!canApproveLicenseRenewal(license,renewal.requestedExpiryDate,license.partner.status)))return false;
  if(approved&&license){const updated=await tx.license.updateMany({where:{id:license.id,partnerId:renewal.partnerId,status:license.status,expiryDate:license.expiryDate,partner:{status:"ACTIVE"}},data:{expiryDate:renewal.requestedExpiryDate,status:"VERIFIED",documentUrl:renewal.documentPath}});if(updated.count!==1)return false;}
  const changed=await tx.licenseRenewalRequest.updateMany({where:{id,status:"UNDER_REVIEW"},data:{status:approved?"APPROVED":"REJECTED",reviewedAt:new Date(),reviewedById:session.user.id,reviewNotes:notes}});
  if(!changed.count)throw new Error("RENEWAL_CONCURRENT_REVIEW");
  await tx.auditLog.create({data:{userId:session.user.id,action:"LICENSE_RENEWAL_REVIEWED",entityType:"License",entityId:renewal.licenseId,afterData:{requestId:id,approved,notes}}});
  return true;
 }).catch(error=>{if(error instanceof Error&&error.message==="RENEWAL_CONCURRENT_REVIEW")return false;throw error});
 if(!result)return NextResponse.json({success:false,message:"الطلب غير متاح"},{status:409});
 let emailSent=false;
 try{
 const renewal=await prisma.licenseRenewalRequest.findUnique({where:{id},select:{submittedById:true,licenseId:true}});
 const applicant=renewal?await prisma.user.findUnique({where:{id:renewal.submittedById},select:{email:true}}):null;
 const safeNotes=notes.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
 const delivery=applicant?.email?await sendEmail({to:applicant.email,subject:approved?"أريس لوب | اعتماد تجديد الترخيص":"أريس لوب | مراجعة تجديد الترخيص",html:`<div dir="rtl"><p>${approved?"تم اعتماد تجديد الترخيص":"لم تتم الموافقة على تجديد الترخيص"}.</p><p>ملاحظات الإدارة: ${safeNotes}</p><p>يمكنك متابعة الحالة من لوحة الشريك.</p></div>`}):{sent:false as const};

 emailSent=delivery.sent;
 }catch(error){console.error("License renewal decision notification failed",error);}
 return NextResponse.json({success:true,message:"تم تسجيل قرار المراجعة",applicantEmailSent:emailSent});
}
