import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { canManagePartnerServices } from "@/lib/partner-permissions";

async function ownedService(userId:string,id:string){
  const membership=await prisma.partnerMember.findFirst({where:{userId,isActive:true},orderBy:{createdAt:"desc"},select:{partnerId:true,permissions:true,partner:{select:{status:true}}}});
  if(!membership || membership.partner.status!=="ACTIVE" || !canManagePartnerServices(membership.permissions)) return null;
  return prisma.service.findFirst({where:{id,partnerId:membership.partnerId},include:{_count:{select:{bookings:true}}}});
}
export async function PATCH(request:NextRequest,context:{params:Promise<{id:string}>}){
  try{
    const session=await getCurrentSession(); if(!session) return NextResponse.json({success:false,message:"يجب تسجيل الدخول أولاً."},{status:401});
    const {id}=await context.params; const current=await ownedService(session.user.id,id); if(!current) return NextResponse.json({success:false,message:"الخدمة غير موجودة."},{status:404});
    const body=await request.json(); const basePrice=Number(body.basePrice||0); const loyaltyPoints=Math.max(150,Math.floor(Number(body.loyaltyPoints||150))); const latitude=body.latitude==null||body.latitude===""?null:Number(body.latitude); const longitude=body.longitude==null||body.longitude===""?null:Number(body.longitude);
    if(!body.nameAr?.trim()||!body.category?.trim()||basePrice<=0) return NextResponse.json({success:false,message:"أكمل اسم الخدمة والتصنيف والسعر."},{status:400});
    if(!body.country?.trim()||!body.region?.trim()||!body.city?.trim()||!((latitude===null&&longitude===null)||(latitude!==null&&longitude!==null&&Number.isFinite(latitude)&&Number.isFinite(longitude)&&latitude>=-90&&latitude<=90&&longitude>=-180&&longitude<=180))) return NextResponse.json({success:false,message:"أكمل الدولة والمنطقة والمدينة، وتأكد من صحة إحداثيات الموقع الاختيارية."},{status:400});
    const licenseId=typeof body.licenseId==="string"?body.licenseId.trim():"";
    if(licenseId){
      const license=await prisma.license.findFirst({where:{id:licenseId,partnerId:current.partnerId},select:{id:true}});
      if(!license) return NextResponse.json({success:false,message:"الترخيص المحدد لا يتبع منشأتك."},{status:400});
    }
    const images=(Array.isArray(body.images)?body.images:[]).slice(0,10).filter((x:any)=>typeof x?.url==="string"&&(x.url.startsWith("https://")||x.url.startsWith("/api/media?pathname=")));
    const status = current.status === "PUBLISHED" || body.submitForReview ? "UNDER_REVIEW" : current.status;
    const service=await prisma.$transaction(async(tx)=>{
      await tx.serviceImage.deleteMany({where:{serviceId:id}});
      const updated=await tx.service.update({where:{id},data:{
        licenseId:licenseId||null,
        nameAr:body.nameAr.trim(),nameEn:body.nameEn?.trim()||null,category:body.category.trim(),subCategory:body.subCategory?.trim()||null,
        descriptionAr:body.descriptionAr?.trim()||null,descriptionEn:body.descriptionEn?.trim()||null,city:body.city.trim(),region:body.region.trim(),country:body.country.trim(),countryCode:body.countryCode?.trim()||null,locationName:body.locationName?.trim()||null,
        formattedAddress:body.formattedAddress?.trim()||null,placeId:body.placeId?.trim()||null,latitude,longitude,basePrice,
        vatRate:15,finalPrice:body.vatMode==="included"?basePrice:basePrice*1.15,loyaltyPoints,capacity:Number(body.capacity||0)||null,
        cancellationPolicy:body.cancellationPolicy?.trim()||null,meetingInstructions:body.meetingInstructions?.trim()||null,
        organizerType:body.organizerType==="OTHER"?"OTHER":"SELF",organizerName:body.organizerName?.trim()||null,organizerLicenseNumber:body.organizerLicenseNumber?.trim()||null,
        organizerLicenseIssuer:body.organizerLicenseIssuer?.trim()||null,programApprovalNumber:body.programApprovalNumber?.trim()||null,status,
        images:{create:images.map((x:any,index:number)=>({url:x.url,sortOrder:Number.isFinite(Number(x.sortOrder))?Number(x.sortOrder):index}))}
      },include:{images:true}});
      await tx.auditLog.create({data:{userId:session.user.id,action:"PARTNER_SERVICE_UPDATED",entityType:"Service",entityId:id,beforeData:{nameAr:current.nameAr,status:current.status,finalPrice:String(current.finalPrice)},afterData:{nameAr:updated.nameAr,status:updated.status,finalPrice:String(updated.finalPrice)}}});
      return updated;
    });
    return NextResponse.json({success:true,message:status==="UNDER_REVIEW"?"تم حفظ التعديلات وإرسال الخدمة للمراجعة.":"تم حفظ التعديلات بنجاح.",service:{...service,basePrice:Number(service.basePrice),vatRate:Number(service.vatRate),finalPrice:Number(service.finalPrice)}});
  }catch(error){console.error("PATCH partner service failed",error);return NextResponse.json({success:false,message:"تعذر حفظ تعديلات الخدمة."},{status:500});}
}
export async function POST(request:NextRequest,context:{params:Promise<{id:string}>}){
  try{
    const session=await getCurrentSession(); if(!session) return NextResponse.json({success:false,message:"يجب تسجيل الدخول أولاً."},{status:401});
    const {id}=await context.params; const service=await ownedService(session.user.id,id); if(!service) return NextResponse.json({success:false,message:"الخدمة غير موجودة."},{status:404});
    const body=await request.json(); const action=body?.action;
    if(action==="HIDE"){
      if(service.status!=="PUBLISHED") return NextResponse.json({success:false,message:"يمكن إخفاء الخدمة بعد نشرها فقط."},{status:409});
      await prisma.$transaction(async tx=>{
        const changed=await tx.service.updateMany({where:{id,status:"PUBLISHED"},data:{status:"SUSPENDED"}});
        if(changed.count!==1) throw new Error("SERVICE_STATUS_CHANGED");
        await tx.auditLog.create({data:{userId:session.user.id,action:"PARTNER_SERVICE_HIDDEN",entityType:"Service",entityId:id,beforeData:{status:service.status},afterData:{status:"SUSPENDED"}}});
      });
      return NextResponse.json({success:true,status:"SUSPENDED",message:"تم إخفاء الخدمة من العملاء مؤقتاً."});
    }
    if(action==="PUBLISH"){
      if(service.status!=="SUSPENDED") return NextResponse.json({success:false,message:"الخدمة ليست مخفية حالياً."},{status:409});
      await prisma.$transaction(async tx=>{
        const changed=await tx.service.updateMany({where:{id,status:"SUSPENDED"},data:{status:"UNDER_REVIEW"}});
        if(changed.count!==1) throw new Error("SERVICE_STATUS_CHANGED");
        await tx.auditLog.create({data:{userId:session.user.id,action:"PARTNER_SERVICE_REPUBLICATION_REQUESTED",entityType:"Service",entityId:id,beforeData:{status:service.status},afterData:{status:"UNDER_REVIEW"}}});
      });
      return NextResponse.json({success:true,status:"UNDER_REVIEW",message:"تم إرسال طلب إعادة نشر الخدمة لمراجعة الإدارة."});
    }
    return NextResponse.json({success:false,message:"إجراء غير مدعوم."},{status:400});
  }catch(error){console.error("POST partner service action failed",error);return NextResponse.json({success:false,message:"تعذر تنفيذ الإجراء."},{status:500});}
}
export async function DELETE(_request:NextRequest,context:{params:Promise<{id:string}>}){
  const session=await getCurrentSession(); if(!session) return NextResponse.json({success:false,message:"يجب تسجيل الدخول أولاً."},{status:401});
  const {id}=await context.params; const service=await ownedService(session.user.id,id); if(!service) return NextResponse.json({success:false,message:"الخدمة غير موجودة."},{status:404});
  if(service._count.bookings>0) return NextResponse.json({success:false,message:"لا يمكن حذف هذه الخدمة لأنها مرتبطة بحجوزات. استخدم الأرشفة/الإخفاء للحفاظ على السجل."},{status:409});
  await prisma.$transaction(async tx=>{
    await tx.serviceImage.deleteMany({where:{serviceId:id}});
    await tx.service.delete({where:{id}});
    await tx.auditLog.create({data:{userId:session.user.id,action:"PARTNER_SERVICE_DELETED",entityType:"Service",entityId:id,beforeData:{nameAr:service.nameAr,status:service.status}}});
  });
  return NextResponse.json({success:true,message:"تم حذف الخدمة نهائياً لعدم وجود حجوزات مرتبطة بها."});
}
