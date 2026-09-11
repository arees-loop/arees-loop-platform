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

function cleanOptionalString(value: unknown) {
  if (typeof value !== "string") return null;

  const cleaned = value.trim();

  return cleaned.length > 0 ? cleaned : null;
}

function parseOptionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return databaseNotConfigured();
  }

  try {
    const { prisma } = await import("@/lib/prisma");

    const { searchParams } = new URL(request.url);

    const partnerId = searchParams.get("partnerId");

    if (!partnerId) {
      return NextResponse.json(
        {
          success: false,
          error: "PARTNER_ID_REQUIRED",
          message: "partnerId is required.",
        },
        { status: 400 },
      );
    }

    const services = await prisma.service.findMany({
      where: {
        partnerId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("GET /api/services error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "SERVICES_FETCH_FAILED",
        message: "Unable to load services.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return databaseNotConfigured();
  }

  try {
    const body = await request.json();

    const partnerId =
      typeof body.partnerId === "string" ? body.partnerId.trim() : "";

    const licenseId = cleanOptionalString(body.licenseId);

    const nameAr =
      typeof body.nameAr === "string" ? body.nameAr.trim() : "";

    const nameEn = cleanOptionalString(body.nameEn);

    const category =
      typeof body.category === "string" ? body.category.trim() : "";

    const subCategory = cleanOptionalString(body.subCategory);

    const descriptionAr = cleanOptionalString(body.descriptionAr);
    const descriptionEn = cleanOptionalString(body.descriptionEn);

    const city = cleanOptionalString(body.city);
    const locationName = cleanOptionalString(body.locationName);
    const formattedAddress = cleanOptionalString(body.formattedAddress);
    const placeId = cleanOptionalString(body.placeId);

    const latitude = parseOptionalNumber(body.latitude);
    const longitude = parseOptionalNumber(body.longitude);

    const basePrice = Number(body.basePrice);
    const finalPrice = Number(body.finalPrice);

    const vatRate =
      body.vatRate === undefined || body.vatRate === null || body.vatRate === ""
        ? 15
        : Number(body.vatRate);

    const capacity =
      body.capacity === undefined ||
      body.capacity === null ||
      body.capacity === ""
        ? null
        : Number(body.capacity);

    const cancellationPolicy = cleanOptionalString(body.cancellationPolicy);

    const meetingInstructions = cleanOptionalString(body.meetingInstructions);

    if (!partnerId) {
      return NextResponse.json(
        {
          success: false,
          error: "PARTNER_ID_REQUIRED",
          message: "partnerId is required.",
        },
        { status: 400 },
      );
    }

    if (!nameAr) {
      return NextResponse.json(
        {
          success: false,
          error: "SERVICE_NAME_REQUIRED",
          message: "Arabic service name is required.",
        },
        { status: 400 },
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "CATEGORY_REQUIRED",
          message: "Service category is required.",
        },
        { status: 400 },
      );
    }

    if (!Number.isFinite(basePrice) || basePrice < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_BASE_PRICE",
          message: "basePrice must be a valid positive number.",
        },
        { status: 400 },
      );
    }

    if (!Number.isFinite(finalPrice) || finalPrice < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_FINAL_PRICE",
          message: "finalPrice must be a valid positive number.",
        },
        { status: 400 },
      );
    }

    if (!Number.isFinite(vatRate) || vatRate < 0 || vatRate > 100) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_VAT_RATE",
          message: "vatRate must be between 0 and 100.",
        },
        { status: 400 },
      );
    }

    if (
      capacity !== null &&
      (!Number.isInteger(capacity) || capacity < 1)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_CAPACITY",
          message: "capacity must be a positive whole number.",
        },
        { status: 400 },
      );
    }

    if (
      latitude !== null &&
      (latitude < -90 || latitude > 90)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_LATITUDE",
          message: "latitude must be between -90 and 90.",
        },
        { status: 400 },
      );
    }

    if (
      longitude !== null &&
      (longitude < -180 || longitude > 180)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_LONGITUDE",
          message: "longitude must be between -180 and 180.",
        },
        { status: 400 },
      );
    }

    const { prisma } = await import("@/lib/prisma");

    const service = await prisma.service.create({
      data: {
        partnerId,
        licenseId,

        nameAr,
        nameEn,

        category,
        subCategory,

        descriptionAr,
        descriptionEn,

        city,
        locationName,
        formattedAddress,
        placeId,

        latitude,
        longitude,

        basePrice,
        vatRate,
        finalPrice,

        capacity,
        cancellationPolicy,
        meetingInstructions,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: service,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/services error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "SERVICE_CREATE_FAILED",
        message: "Unable to create service.",
      },
      { status: 500 },
    );
  }
}