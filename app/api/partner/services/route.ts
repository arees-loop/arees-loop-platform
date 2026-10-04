import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

async function getPartner(userId:string){
  return prisma.partnerMember.findFirst({
    where:{userId,isActive:true},
    include:{partner:true},
    orderBy:{createdAt:"desc"}
  });
}

export async function POST(request:Request){
  try{
    const session=await getCurrentSession();
    if(!session) return NextResponse.json({success:false,message:"يجب تسجيل الدخول أولاً."},{status:401});
    const membership=await getPartner(session.user.id);
    if(!membership) return NextResponse.json({success:false,message:"لا توجد منشأة مرتبطة بالحساب."},{status:404});
    if(membership.partner.status!=="ACTIVE") return NextResponse.json({success:false,message:"حساب الشريك غير مفعل."},{status:403});
    const body=await request.json();
    const basePrice=Number(body.basePrice||0);
    const vatIncluded=body.vatMode==="included";
    const vatRate=15;
    const finalPrice=vatIncluded?basePrice:basePrice*1.15;
    if(!body.nameAr?.trim()||!body.category?.trim()||basePrice<=0) return NextResponse.json({success:false,message:"أكمل اسم الخدمة والتصنيف والسعر."},{status:400});
    const latitude=Number(body.latitude);
    const longitude=Number(body.longitude);
    if(!body.city?.trim()||!body.locationName?.trim()||!Number.isFinite(latitude)||!Number.isFinite(longitude)){
      return NextResponse.json({success:false,message:"حدد مدينة وموقع تنفيذ الخدمة بدقة قبل الإرسال."},{status:400});
    }
    const service=await prisma.service.create({
      data:{
        partnerId:membership.partnerId,
        licenseId:body.licenseId?.trim()||null,
        nameAr:body.nameAr.trim(),
        nameEn:body.nameEn?.trim()||null,
        category:body.category.trim(),
        subCategory:body.subCategory?.trim()||null,
        descriptionAr:body.descriptionAr?.trim()||null,
        descriptionEn:body.descriptionEn?.trim()||null,
        city:body.city.trim(),
        locationName:body.locationName.trim(),
        formattedAddress:body.formattedAddress?.trim()||body.locationName.trim(),
        placeId:body.placeId?.trim()||null,
        latitude,
        longitude,
        basePrice,
        vatRate,
        finalPrice,
        capacity:Number(body.capacity||0)||null,
        cancellationPolicy:body.cancellationPolicy?.trim()||null,
        meetingInstructions:body.meetingInstructions?.trim()||null,
        status:"UNDER_REVIEW"
      },
      include:{images:true}
    });
    return NextResponse.json({success:true,message:"تم حفظ الخدمة وإرسالها للإدارة للمراجعة.",service:{...service,basePrice:Number(service.basePrice),vatRate:Number(service.vatRate),finalPrice:Number(service.finalPrice)}},{status:201});
  }catch(error){console.error("POST /api/partner/services failed:",error);return NextResponse.json({success:false,message:"تعذر حفظ الخدمة. حاول مرة أخرى."},{status:500});}
}
