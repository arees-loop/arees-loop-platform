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
 return NextResponse.json({success:result,message:result?"تم تسجيل قرار المراجعة":"الطلب غير متاح"},{status:result?200:409});
}
