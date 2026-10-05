import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

async function ownedService(userId:string,id:string){
  const membership=await prisma.partnerMember.findFirst({where:{userId,isActive:true},select:{partnerId:true}});
  if(!membership) return null;
  return prisma.service.findFirst({where:{id,partnerId:membership.partnerId},include:{_count:{select:{bookings:true}}}});
}
export async function PATCH(request:NextRequest,context:{params:Promise<{id:string}>}){
  try{
    const session=await getCurrentSession(); if(!session) return NextResponse.json({success:false,message:"يجب تسجيل الدخول أولاً."},{status:401});
    const {id}=await context.params; const current=await ownedService(session.user.id,id); if(!current) return NextResponse.json({success:false,message:"الخدمة غير موجودة."},{status:404});
    const body=await request.json(); const basePrice=Number(body.basePrice||0); const latitude=Number(body.latitude); const longitude=Number(body.longitude);
    if(!body.nameAr?.trim()||!body.category?.trim()||basePrice<=0) return NextResponse.json({success:false,message:"أكمل اسم الخدمة والتصنيف والسعر."},{status:400});
    if(!body.city?.trim()||!body.locationName?.trim()||!Number.isFinite(latitude)||!Number.isFinite(longitude)) return NextResponse.json({success:false,message:"حدد مدينة وموقع تنفيذ الخدمة بدقة."},{status:400});
    const images=(Array.isArray(body.images)?body.images:[]).slice(0,10).filter((x:any)=>typeof x?.url==="string"&&x.url.startsWith("https://"));
    const status=body.submitForReview ? "UNDER_REVIEW" : current.status;
    const service=await prisma.$transaction(async(tx)=>{
      await tx.serviceImage.deleteMany({where:{serviceId:id}});
      return tx.service.update({where:{id},data:{
        nameAr:body.nameAr.trim(),nameEn:body.nameEn?.trim()||null,category:body.category.trim(),subCategory:body.subCategory?.trim()||null,
        descriptionAr:body.descriptionAr?.trim()||null,descriptionEn:body.descriptionEn?.trim()||null,city:body.city.trim(),locationName:body.locationName.trim(),
        formattedAddress:body.formattedAddress?.trim()||body.locationName.trim(),placeId:body.placeId?.trim()||null,latitude,longitude,basePrice,
        vatRate:15,finalPrice:body.vatMode==="included"?basePrice:basePrice*1.15,capacity:Number(body.capacity||0)||null,
        cancellationPolicy:body.cancellationPolicy?.trim()||null,meetingInstructions:body.meetingInstructions?.trim()||null,status,
        images:{create:images.map((x:any,index:number)=>({url:x.url,altText:x.altText?.trim()||body.nameAr.trim(),sortOrder:Number.isFinite(Number(x.sortOrder))?Number(x.sortOrder):index}))}
      },include:{images:true}});
    });
    return NextResponse.json({success:true,message:body.submitForReview?"تم حفظ التعديلات وإرسال الخدمة للمراجعة.":"تم حفظ التعديلات بنجاح.",service:{...service,basePrice:Number(service.basePrice),vatRate:Number(service.vatRate),finalPrice:Number(service.finalPrice)}});
  }catch(error){console.error("PATCH partner service failed",error);return NextResponse.json({success:false,message:"تعذر حفظ تعديلات الخدمة."},{status:500});}
}
export async function DELETE(_request:NextRequest,context:{params:Promise<{id:string}>}){
  const session=await getCurrentSession(); if(!session) return NextResponse.json({success:false,message:"يجب تسجيل الدخول أولاً."},{status:401});
  const {id}=await context.params; const service=await ownedService(session.user.id,id); if(!service) return NextResponse.json({success:false,message:"الخدمة غير موجودة."},{status:404});
  if(service._count.bookings>0) return NextResponse.json({success:false,message:"لا يمكن حذف هذه الخدمة لأنها مرتبطة بحجوزات. استخدم الأرشفة/الإخفاء للحفاظ على السجل."},{status:409});
  await prisma.$transaction([prisma.serviceImage.deleteMany({where:{serviceId:id}}),prisma.service.delete({where:{id}})]);
  return NextResponse.json({success:true,message:"تم حذف الخدمة نهائياً لعدم وجود حجوزات مرتبطة بها."});
}
