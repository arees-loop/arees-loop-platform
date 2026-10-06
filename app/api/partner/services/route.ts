import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { getAdminNotificationEmails, sendEmail } from "@/lib/notifications/email";

async function getPartner(userId:string){
  return prisma.partnerMember.findFirst({
    where:{userId,isActive:true},
    include:{partner:true,user:true},
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
        organizerType:body.organizerType==="OTHER"?"OTHER":"SELF", organizerName:body.organizerName?.trim()||null,
        organizerLicenseNumber:body.organizerLicenseNumber?.trim()||null, organizerLicenseIssuer:body.organizerLicenseIssuer?.trim()||null,
        programApprovalNumber:body.programApprovalNumber?.trim()||null,
        status:"UNDER_REVIEW",
        images:{ create:(Array.isArray(body.images)?body.images:[]).slice(0,10).filter((image:any)=>typeof image?.url==="string" && (image.url.startsWith("https://") || image.url.startsWith("/api/media?pathname="))).map((image:any,index:number)=>({ url:image.url,?.trim()||body.nameAr.trim(), sortOrder:Number.isFinite(Number(image.sortOrder))?Number(image.sortOrder):index })) }
      },
      include:{images:true}
    });
    const partnerEmail=membership.user.email;
    const adminEmails=getAdminNotificationEmails();
    const origin=new URL(request.url).origin;
    const partnerName=membership.partner.legalNameAr || membership.partner.tradeNameAr || "الشريك";
    const serviceName=service.nameAr;
    const partnerDelivery=await sendEmail({
      to:partnerEmail,
      subject:"تم استلام خدمتك للمراجعة – Arees Loop",
      html:'<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.9;color:#173b35"><h2>تم استلام الخدمة</h2><p>مرحباً،</p><p>تم استلام خدمة <b>'+serviceName+'</b> وإرسالها إلى إدارة Arees Loop للمراجعة والموافقة.</p><p>الحالة الحالية: <b>تحت المراجعة</b>.</p><p>سنرسل لك إشعاراً عبر البريد الإلكتروني عند تحديث حالة الخدمة.</p></div>'
    });
    let adminDelivery:{sent:boolean;reason?:string}={sent:false,reason:"NO_ADMIN_EMAILS"};
    if(adminEmails.length){
      adminDelivery=await sendEmail({
        to:adminEmails,
        subject:"خدمة جديدة تحتاج إلى المراجعة – Arees Loop",
        replyTo:partnerEmail,
        html:'<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.9;color:#173b35"><h2>خدمة جديدة بانتظار المراجعة</h2><p><b>الشريك:</b> '+partnerName+'</p><p><b>الخدمة:</b> '+serviceName+'</p><p><b>المدينة:</b> '+service.city+'</p><p><a href="'+origin+'/admin/partners" style="display:inline-block;background:#0D3B34;color:white;padding:12px 20px;border-radius:10px;text-decoration:none">فتح لوحة المراجعة</a></p></div>'
      });
    }
    if(!partnerDelivery.sent) console.warn("Partner service email not sent",partnerDelivery);
    if(!adminDelivery.sent) console.warn("Admin service email not sent",adminDelivery);
    return NextResponse.json({success:true,message:"تم إرسال الخدمة إلى إدارة Arees Loop للمراجعة والموافقة بنجاح.",service:{...service,basePrice:Number(service.basePrice),vatRate:Number(service.vatRate),finalPrice:Number(service.finalPrice)},notifications:{partner:partnerDelivery.sent,admin:adminDelivery.sent}},{status:201});
  }catch(error){console.error("POST /api/partner/services failed:",error);return NextResponse.json({success:false,message:"تعذر حفظ الخدمة. حاول مرة أخرى."},{status:500});}
}
