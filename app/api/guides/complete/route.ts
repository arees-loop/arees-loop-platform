import {NextResponse} from "next/server";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";
import {GUIDE_LICENSE_CATEGORIES} from "@/lib/guides/reference-data";
export async function PATCH(request:Request){
 const session=await getCurrentSession();
 if(!session?.user.emailVerifiedAt)return NextResponse.json({success:false,message:"يجب تأكيد البريد الإلكتروني."},{status:401});
 const body=await request.json().catch(()=>null);
 const id=typeof body?.id==="string"?body.id:"";
 const application=await prisma.guideApplication.findFirst({where:{id,userId:session.user.id,status:"NEEDS_COMPLETION"}});
 if(!application)return NextResponse.json({success:false,message:"الطلب غير متاح للاستكمال."},{status:404});
 const bio=typeof body?.bio==="string"?body.bio.trim():"";
 const specialization=typeof body?.specialization==="string"?body.specialization.trim():"";
 const fullName=typeof body?.fullName==="string"?body.fullName.trim():"";
 const phone=typeof body?.phone==="string"?body.phone.trim():"";
 const city=typeof body?.city==="string"?body.city.trim():"";
 const licenseNumber=typeof body?.licenseNumber==="string"?body.licenseNumber.trim():"";
 const licenseCategory=typeof body?.licenseCategory==="string"?body.licenseCategory:"";
 const expires=new Date(body?.licenseExpiresAt||"");
 const countries=Array.isArray(body?.countries)?body.countries.filter((x:unknown):x is string=>typeof x==="string"&&x.trim().length>0).slice(0,30):[];
 const languages=Array.isArray(body?.languages)?body.languages.filter((x:unknown):x is string=>typeof x==="string"&&x.trim().length>0).slice(0,20):[];
 if(fullName.length<4||fullName.length>120||!/^\+?[0-9]{8,15}$/.test(phone)||!city||city.length>100||licenseNumber.length<3||licenseNumber.length>100||!GUIDE_LICENSE_CATEGORIES.some(x=>x===licenseCategory)||!countries.length||!languages.length||!Number.isFinite(expires.getTime())||expires<=new Date()||bio.length>2000||specialization.length>300||body?.confirmResubmit!==true)return NextResponse.json({success:false,message:"راجع البيانات والترخيص الساري وأكد إعادة الإرسال."},{status:400});
 const changed=await prisma.$transaction(async tx=>{
  const updated=await tx.guideApplication.updateMany({where:{id,userId:session.user.id,status:"NEEDS_COMPLETION"},data:{fullName,phone,city,licenseNumber,licenseCategory,licenseExpiresAt:expires,countries,languages,bio:bio||null,specialization:specialization||null,status:"UNDER_REVIEW",reviewedAt:null,reviewNotes:null}});
  if(updated.count)await tx.auditLog.create({data:{userId:session.user.id,action:"GUIDE_APPLICATION_RESUBMITTED",entityType:"GuideApplication",entityId:id,beforeData:{status:"NEEDS_COMPLETION"},afterData:{status:"UNDER_REVIEW"}}});
  return updated.count;
 });
 return NextResponse.json({success:changed===1,message:changed?"أُعيد الطلب للمراجعة.":"تغيرت حالة الطلب."},{status:changed?200:409});
}
