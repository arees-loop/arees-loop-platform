import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { getAdminNotificationEmails, sendEmail } from "@/lib/notifications/email";
import { canManagePartnerServices } from "@/lib/partner-permissions";

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
    if(!canManagePartnerServices(membership.permissions)) return NextResponse.json({success:false,message:"ليس لديك صلاحية إدارة الخدمات."},{status:403});
    const body=await request.json();
    const basePrice=Number(body.basePrice||0);
    const vatIncluded=body.vatMode==="included";
    const vatRate=15;
    const finalPrice=vatIncluded?basePrice:basePrice*1.15;
    const loyaltyPoints=Math.max(150,Math.floor(Number(body.loyaltyPoints||150)));
    if(!body.nameAr?.trim()||!body.category?.trim()||basePrice<=0) return NextResponse.json({success:false,message:"أكمل اسم الخدمة والتصنيف والسعر."},{status:400});
    const latitude=body.latitude==null||body.latitude===""?null:Number(body.latitude);
    const longitude=body.longitude==null||body.longitude===""?null:Number(body.longitude);
    if(!body.country?.trim()||!body.region?.trim()||!body.city?.trim()||!((latitude===null&&longitude===null)||(latitude!==null&&longitude!==null&&Number.isFinite(latitude)&&Number.isFinite(longitude)&&latitude>=-90&&latitude<=90&&longitude>=-180&&longitude<=180))){
      return NextResponse.json({success:false,message:"أكمل الدولة والمنطقة والمدينة وتحقق من الإحداثيات الاختيارية."},{status:400});
    }
    const licenseId=typeof body.licenseId==="string"?body.licenseId.trim():"";
    if(licenseId){
      const license=await prisma.license.findFirst({where:{id:licenseId,partnerId:membership.partnerId},select:{id:true}});
      if(!license) return NextResponse.json({success:false,message:"الترخيص المحدد لا يتبع منشأتك."},{status:400});
    }
    if(!licenseId)return NextResponse.json({success:false,message:"يجب ربط الخدمة بترخيص ساري ومعتمد."},{status:400});
    const activeLicense=await prisma.license.findFirst({where:{id:licenseId,partnerId:membership.partnerId,status:"VERIFIED",expiryDate:{gte:new Date(new Date().toISOString().slice(0,10)+"T00:00:00.000Z")}},select:{id:true}});
    if(!activeLicense)return NextResponse.json({success:false,message:"الترخيص غير معتمد أو منتهي الصلاحية. يرجى تجديده."},{status:403});
    const service=await prisma.service.create({
      data:{
        partnerId:membership.partnerId,
        licenseId:licenseId||null,
        nameAr:body.nameAr.trim(),
        nameEn:body.nameEn?.trim()||null,
        category:body.category.trim(),
        subCategory:body.subCategory?.trim()||null,
        descriptionAr:body.descriptionAr?.trim()||null,
        descriptionEn:body.descriptionEn?.trim()||null,
        city:body.city.trim(),
        region:body.region.trim(),
        locationName:body.locationName?.trim()||null,
        formattedAddress:body.formattedAddress?.trim()||null,
        placeId:body.placeId?.trim()||null,
        country:body.country.trim(),
        countryCode:body.countryCode?.trim()||null,
        latitude,
        longitude,
        basePrice,
        vatRate,
        finalPrice,
        loyaltyPoints,
        capacity:Number(body.capacity||0)||null,
        cancellationPolicy:body.cancellationPolicy?.trim()||null,
        meetingInstructions:body.meetingInstructions?.trim()||null,
        meetingPointName:body.hasMeetingPoint?body.meetingPointName?.trim()||null:null,
        meetingPointAddress:body.hasMeetingPoint?body.meetingPointAddress?.trim()||null:null,
        meetingLatitude:body.hasMeetingPoint&&Number.isFinite(Number(body.meetingLatitude))?Number(body.meetingLatitude):null,
        meetingLongitude:body.hasMeetingPoint&&Number.isFinite(Number(body.meetingLongitude))?Number(body.meetingLongitude):null,
        organizerType:body.organizerType==="OTHER"?"OTHER":"SELF", organizerName:body.organizerName?.trim()||null,
        organizerLicenseNumber:body.organizerLicenseNumber?.trim()||null, organizerLicenseIssuer:body.organizerLicenseIssuer?.trim()||null,
        programApprovalNumber:body.programApprovalNumber?.trim()||null,
        status:"UNDER_REVIEW",
        images:{ create:(Array.isArray(body.images)?body.images:[]).slice(0,10).filter((image:any)=>typeof image?.url==="string" && (image.url.startsWith("https://") || image.url.startsWith("/api/media?pathname="))).map((image:any,index:number)=>({ url:image.url, sortOrder:Number.isFinite(Number(image.sortOrder))?Number(image.sortOrder):index })) }
      },
      include:{images:true}
    });
    await prisma.auditLog.create({data:{userId:session.user.id,action:"PARTNER_SERVICE_CREATED",entityType:"Service",entityId:service.id,afterData:{partnerId:membership.partnerId,nameAr:service.nameAr,status:service.status,employeeEmail:membership.user.email}}});
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
