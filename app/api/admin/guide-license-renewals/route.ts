import {NextResponse} from "next/server";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";
export async function GET(){
 const session=await getCurrentSession();
 if(!session||!["ADMIN","SUPER_ADMIN"].includes(session.user.role))return NextResponse.json({success:false},{status:403});
 const requests=await prisma.guideLicenseRenewal.findMany({where:{status:"UNDER_REVIEW"},orderBy:{createdAt:"asc"},take:100});
 return NextResponse.json({success:true,requests});
}
export async function PATCH(request:Request){
 const session=await getCurrentSession();
 if(!session||!["ADMIN","SUPER_ADMIN"].includes(session.user.role))return NextResponse.json({success:false},{status:403});
 const body=await request.json().catch(()=>null);
 const id=typeof body?.id==="string"?body.id:"",approved=body?.approved,notes=typeof body?.notes==="string"?body.notes.trim():"";
 if(!id||typeof approved!=="boolean"||notes.length<20||body?.verifiedLicense!==true)return NextResponse.json({success:false,message:"تحقق من الترخيص وسجل ملاحظاتك"},{status:400});
 const outcome=await prisma.$transaction(async tx=>{
 const renewal=await tx.guideLicenseRenewal.findUnique({where:{id}});
 if(!renewal||renewal.status!=="UNDER_REVIEW"||(approved&&renewal.requestedExpiryDate<=new Date()))return false;
 const changed=await tx.guideLicenseRenewal.updateMany({where:{id,status:"UNDER_REVIEW"},data:{status:approved?"APPROVED":"REJECTED",reviewedAt:new Date(),reviewedById:session.user.id,reviewNotes:notes}});
 if(!changed.count)return false;
 if(approved){
 const updated=await tx.guideApplication.updateMany({where:{id:renewal.applicationId,userId:renewal.userId,status:"APPROVED"},data:{licenseNumber:renewal.licenseNumber,licenseExpiresAt:renewal.requestedExpiryDate,licensePath:renewal.documentPath,reviewedAt:new Date(),reviewNotes:notes}});
 if(!updated.count)throw new Error("GUIDE_NOT_APPROVED");
 }
 await tx.auditLog.create({data:{userId:session.user.id,action:"GUIDE_LICENSE_RENEWAL_REVIEWED",entityType:"GuideApplication",entityId:renewal.applicationId,afterData:{renewalId:id,approved,notes}}});
 return true;
 });
 return NextResponse.json({success:outcome,message:outcome?"تم تسجيل قرار المراجعة":"الطلب غير متاح"},{status:outcome?200:409});
}
