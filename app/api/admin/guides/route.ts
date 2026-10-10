import {utcLicenseDay} from "@/lib/license-validity";
import {hasAdminPermission} from "@/lib/admin-permissions";
import {sendGuideStatusEmail} from "@/lib/guides/status-email";
import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
export async function GET(){
 const session=await getCurrentSession();
 if(!session||!hasAdminPermission(session.user,"PARTNER_REQUESTS"))return NextResponse.json({success:false,message:"غير مصرح"},{status:403});
 const data=await prisma.guideApplication.findMany({orderBy:{createdAt:"desc"},take:100,select:{id:true,fullName:true,email:true,phone:true,gender:true,countries:true,city:true,licenseCategory:true,licenseNumber:true,licenseExpiresAt:true,specialization:true,languages:true,bio:true,photoPublicationConsent:true,status:true,createdAt:true,reviewNotes:true}});
 return NextResponse.json({success:true,data});
}
export async function PATCH(request:Request){
 const session=await getCurrentSession();
 if(!session||!hasAdminPermission(session.user,"PARTNER_REQUESTS"))return NextResponse.json({success:false,message:"غير مصرح"},{status:403});
 const body=await request.json().catch(()=>null);
 const id=typeof body?.id==="string"?body.id:"",status=body?.status,reviewNotes=typeof body?.reviewNotes==="string"?body.reviewNotes.trim():"";
 if(!id||!["APPROVED","REJECTED","NEEDS_COMPLETION"].includes(status)||reviewNotes.length<20||reviewNotes.length>2000)return NextResponse.json({success:false,message:"يلزم إدخال ملاحظات مراجعة موثقة (20-2000 حرف). "},{status:400});
 if(status==="APPROVED"&&body?.confirmLicenseVerified!==true)return NextResponse.json({success:false,message:"يجب تأكيد فحص الترخيص لدى الجهة المختصة."},{status:400});
 const current=await prisma.guideApplication.findUnique({where:{id}});
 if(!current||current.status!=="UNDER_REVIEW")return NextResponse.json({success:false,message:"الطلب غير متاح للمراجعة"},{status:409});
 if(status==="APPROVED"&&current.licenseExpiresAt<utcLicenseDay())return NextResponse.json({success:false,message:"انتهت صلاحية الترخيص"},{status:400});
 const updated=await prisma.$transaction(async tx=>{
  const change=await tx.guideApplication.updateMany({where:{id,status:"UNDER_REVIEW"},data:{status,reviewNotes,reviewedAt:new Date()}});
  if(change.count)await tx.auditLog.create({data:{userId:session.user.id,action:"GUIDE_APPLICATION_REVIEWED",entityType:"GuideApplication",entityId:id,beforeData:{status:current.status},afterData:{status,reviewNotes,licenseVerifiedConfirmed:body?.confirmLicenseVerified===true}}});
  return change.count;
 });
 if(!updated)return NextResponse.json({success:false,message:"تمت مراجعة الطلب بالفعل"},{status:409});
 let emailSent=true;
 try{await sendGuideStatusEmail(current.email,current.fullName,status,reviewNotes)}catch(error){console.error("Guide status email failed",error);emailSent=false;}
 return NextResponse.json({success:true,emailSent,message:emailSent?"تم تحديث الطلب وإرسال البريد.":"تم تحديث الطلب لكن تعذر إرسال البريد؛ يلزم إعادة الإشعار."});
}
