import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/database-target.mjs";

function money(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, error: "DATABASE_NOT_CONFIGURED" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    const serviceId = typeof body.serviceId === "string" ? body.serviceId.trim() : "";
    const quantity = Number(body.quantity);

    if (!code || !serviceId || !Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json({ success: false, error: "INVALID_REQUEST", message: "بيانات الكوبون غير مكتملة." }, { status: 400 });
    }

    const { prisma } = await import("@/lib/prisma");
    const [coupon, service] = await Promise.all([
      prisma.coupon.findUnique({ where: { code } }),
      prisma.service.findFirst({ where: { id: serviceId, status: "PUBLISHED" }, select: { finalPrice: true, category: true } }),
    ]);

    if (!coupon) {
      return NextResponse.json({ success: false, error: "COUPON_NOT_FOUND", message: "الكوبون غير موجود." }, { status: 404 });
    }

    const now = new Date();
    if (!coupon.isActive) {
      return NextResponse.json({ success: false, error: "COUPON_INACTIVE", message: "الكوبون غير متاح حالياً." }, { status: 400 });
    }
    if (coupon.startsAt && now < coupon.startsAt) {
      return NextResponse.json({ success: false, error: "COUPON_NOT_STARTED", message: "الكوبون غير فعال بعد." }, { status: 400 });
    }
    if (coupon.expiresAt && now > coupon.expiresAt) {
      return NextResponse.json({ success: false, error: "COUPON_EXPIRED", message: "الكوبون منتهي الصلاحية." }, { status: 400 });
    }
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ success: false, error: "COUPON_LIMIT_REACHED", message: "تم استنفاد عدد استخدامات الكوبون." }, { status: 400 });
    }
    if (coupon.serviceId && coupon.serviceId !== serviceId) {
      return NextResponse.json({ success: false, error: "COUPON_NOT_APPLICABLE", message: "هذا الكوبون غير صالح لهذه الخدمة." }, { status: 400 });
    }
    if (coupon.category && service && coupon.category !== service.category) {
      return NextResponse.json({ success: false, error: "COUPON_NOT_APPLICABLE", message: "هذا الكوبون غير صالح لتصنيف هذه الخدمة." }, { status: 400 });
    }
    if (!service) {
      return NextResponse.json({ success: false, error: "SERVICE_NOT_FOUND", message: "الخدمة غير متاحة." }, { status: 404 });
    }

    const subtotal = money(Number(service.finalPrice) * quantity);
    if (coupon.minOrderAmount !== null && subtotal < Number(coupon.minOrderAmount)) {
      return NextResponse.json({ success: false, error: "MIN_ORDER_NOT_MET", message: `الحد الأدنى لاستخدام الكوبون هو ${Number(coupon.minOrderAmount).toLocaleString("ar-SA")} ر.س.` }, { status: 400 });
    }

    let discountAmount = coupon.discountType === "PERCENTAGE"
      ? subtotal * (Number(coupon.discountValue) / 100)
      : Number(coupon.discountValue);

    if (coupon.maxDiscountAmount !== null) discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountAmount));
    discountAmount = money(Math.min(discountAmount, subtotal));
    const total = money(subtotal - discountAmount);

    return NextResponse.json({
      success: true,
      data: { code: coupon.code, subtotal, discountAmount, total, discountType: coupon.discountType, discountValue: Number(coupon.discountValue) },
      message: "تم تطبيق الكوبون بنجاح.",
    });
  } catch (error) {
    console.error("POST /api/coupons/validate error:", error);
    return NextResponse.json({ success: false, error: "COUPON_VALIDATION_FAILED", message: "تعذر التحقق من الكوبون حالياً." }, { status: 500 });
  }
}
