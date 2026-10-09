import {sendEmail} from "@/lib/notifications/email";
import {NextResponse} from "next/server";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";
export async function GET(){
 const session=await getCurrentSession();
 if(!session||!["ADMIN","SUPER_ADMIN"].includes(session.user.role))return NextResponse.json({success:false},{status:403});
 const requests=await prisma.licenseRenewalRequest.findMany({where:{status:"UNDER_REVIEW"},orderBy:{createdAt:"asc"},take:100});
 return NextResponse.json({success:true,requests});
}
export async function PATCH(request:Request){
 const session=await getCurrentSession();
 if(!session||!["ADMIN","SUPER_ADMIN"].includes(session.user.role))return NextResponse.json({success:false},{status:403});
 const body=await request.json().catch(()=>null);
 const id=typeof body?.id==="string"?body.id:"",approved=body?.approved;
 const notes=typeof body?.notes==="string"?body.notes.trim():"";
 if(!id||typeof approved!=="boolean"||notes.length<20||body?.verifiedDocument!==true)return NextResponse.json({success:false,message:"يجب فحص المستند وتسجيل ملاحظات المراجعة"},{status:400});
 const result=await prisma.$transaction(async tx=>{
  const renewal=await tx.licenseRenewalRequest.findUnique({where:{id}});
  if(!renewal||renewal.status!=="UNDER_REVIEW")return false;
  if(approved&&renewal.requestedExpiryDate<=new Date())return false;
  const changed=await tx.licenseRenewalRequest.updateMany({where:{id,status:"UNDER_REVIEW"},data:{status:approved?"APPROVED":"REJECTED",reviewedAt:new Date(),reviewedById:session.user.id,reviewNotes:notes}});
  if(!changed.count)return false;
  if(approved)await tx.license.updateMany({where:{id:renewal.licenseId,partnerId:renewal.partnerId},data:{expiryDate:renewal.requestedExpiryDate,status:"VERIFIED",documentUrl:renewal.documentPath}});
  await tx.auditLog.create({data:{userId:session.user.id,action:"LICENSE_RENEWAL_REVIEWED",entityType:"License",entityId:renewal.licenseId,afterData:{requestId:id,approved,notes}}});
  return true;
 });
 if(!result)return NextResponse.json({success:false,message:"الطلب غير متاح"},{status:409});
 const renewal=await prisma.licenseRenewalRequest.findUnique({where:{id},select:{submittedById:true,licenseId:true}});
 const applicant=renewal?await prisma.user.findUnique({where:{id:renewal.submittedById},select:{email:true}}):null;
 const safeNotes=notes.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
 const delivery=applicant?.email?await sendEmail({to:applicant.email,subject:approved?"أريس لوب | اعتماد تجديد الترخيص":"أريس لوب | مراجعة تجديد الترخيص",html:`<div dir="rtl"><p>${approved?"تم اعتماد تجديد الترخيص":"لم تتم الموافقة على تجديد الترخيص"}.</p><p>ملاحظات الإدارة: ${safeNotes}</p><p>يمكنك متابعة الحالة من لوحة الشريك.</p></div>`}):{sent:false as const};
 return NextResponse.json({success:true,message:"تم تسجيل قرار المراجعة",applicantEmailSent:delivery.sent});
}
