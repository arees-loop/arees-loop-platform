import { NextRequest, NextResponse } from "next/server";

function databaseNotConfigured() {
  return NextResponse.json({success:false,error:"DATABASE_NOT_CONFIGURED",message:"Database connection is not configured yet."},{status:503});
}

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) return databaseNotConfigured();

  try {
    const { prisma } = await import("@/lib/prisma");
    const { searchParams } = new URL(request.url);
    // Public listing never exposes unpublished services via caller-controlled partnerId.
    if (searchParams.has("partnerId")) {
      return NextResponse.json({ success: false, error: "USE_PARTNER_SERVICES_ENDPOINT" }, { status: 403 });
    }

    const services = await prisma.service.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true, nameAr: true, nameEn: true, category: true, subCategory: true,
        descriptionAr: true, city: true, locationName: true, formattedAddress: true,
        basePrice: true, vatRate: true, finalPrice: true, loyaltyPoints: true, latitude: true, longitude: true,
        capacity: true, cancellationPolicy: true, meetingInstructions: true,
        organizerType: true, organizerName: true, organizerLicenseNumber: true, organizerLicenseIssuer: true,
        partner: { select: { legalNameAr: true, tradeNameAr: true } },
        images: { orderBy: { sortOrder: "asc" }, select: { url: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: services.map((service) => ({
        id: service.id,
        nameAr: service.nameAr,
        nameEn: service.nameEn,
        category: service.category,
        subCategory: service.subCategory,
        descriptionAr: service.descriptionAr,
        city: service.city,
        locationName: service.locationName,
        formattedAddress: service.formattedAddress,
        basePrice: Number(service.basePrice),
        vatRate: Number(service.vatRate),
        finalPrice: Number(service.finalPrice),
        loyaltyPoints: service.loyaltyPoints,
        latitude: service.latitude == null ? null : Number(service.latitude),
        longitude: service.longitude == null ? null : Number(service.longitude),
        capacity: service.capacity,
        cancellationPolicy: service.cancellationPolicy,
        meetingInstructions: service.meetingInstructions,
        organizerType: service.organizerType,
        organizerName: service.organizerName,
        organizerLicenseNumber: service.organizerLicenseNumber,
        organizerLicenseIssuer: service.organizerLicenseIssuer,
        partnerName: service.partner.tradeNameAr || service.partner.legalNameAr,
        images: service.images.map((image) => image.url),
      })),
    });
  } catch (error) {
    const errorCode=typeof error==="object"&&error!==null&&"code" in error?String((error as {code?:unknown}).code):"UNKNOWN";
    console.error("GET /api/services error:", errorCode);
    if(errorCode==="P1001"||errorCode==="P1002"||errorCode==="P1017"){
      return NextResponse.json({
        success:false,error:"SERVICE_DATABASE_UNAVAILABLE",
        message:process.env.VERCEL_ENV==="preview"
          ?"قاعدة بيانات المعاينة غير متصلة حالياً. لا يمكن عرض تجارب فعلية حتى تهيئة قاعدة اختبار معزولة."
          :"تعذر الاتصال بالتجارب حالياً. يرجى المحاولة لاحقاً."
      },{status:503,headers:{"Cache-Control":"no-store"}});
    }
    return NextResponse.json({success:false,error:"SERVICES_FETCH_FAILED",message:"تعذر جلب التجارب حالياً."},{status:500,headers:{"Cache-Control":"no-store"}});
  }
}


// Legacy public service creation was unauthenticated and accepted an arbitrary partnerId.
// Only the authenticated, permission-checked /api/partner/services endpoint may create partner services.
export async function POST() {
  return NextResponse.json({success:false,error:"USE_PARTNER_SERVICES_ENDPOINT",message:"أنشئ خدمات الشركاء عبر المسار المصرّح به."},{status:403});
}
