import { NextRequest, NextResponse } from "next/server";

function databaseNotConfigured() {
  return NextResponse.json(
    {
      success: false,
      error: "DATABASE_NOT_CONFIGURED",
      message: "Database connection is not configured yet.",
    },
    { status: 503 },
  );
}

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) return databaseNotConfigured();

  try {
    const { prisma } = await import("@/lib/prisma");
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get("partnerId");

    const services = await prisma.service.findMany({
      where: { status: "PUBLISHED", ...(partnerId ? { partnerId } : {}) },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true, nameAr: true, nameEn: true, category: true, subCategory: true,
        descriptionAr: true, city: true, region: true, country: true, countryCode: true, locationName: true, formattedAddress: true,
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
        region: service.region,
        country: service.country,
        countryCode: service.countryCode,
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
    console.error("GET /api/services error:", error);
    return NextResponse.json({ success: false, error: "SERVICES_FETCH_FAILED", message: "Unable to load services." }, { status: 500 });
  }
}

