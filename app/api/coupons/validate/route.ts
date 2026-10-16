import { NextRequest, NextResponse } from "next/server";
import { resolveDatabaseUrl } from "@/lib/database-url";

function money(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export async function POST(request: NextRequest) {
  try {
    resolveDatabaseUrl();
  } catch {
    return NextResponse.json({ success: false, error: "DATABASE_NOT_CONFIGURED" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    const requested = Array.isArray(body.items)
      ? body.items
      : [{ serviceId: body.serviceId, quantity: body.quantity }];
    if (requested.length < 1 || requested.length > 15 ||
        requested.some((line: unknown) => !line || typeof line !== "object" ||
          typeof (line as { serviceId?: unknown }).serviceId !== "string" ||
          !(line as { serviceId: string }).serviceId.trim() ||
          !Number.isInteger((line as { quantity?: unknown }).quantity) ||
          Number((line as { quantity: number }).quantity) < 1 ||
          Number((line as { quantity: number }).quantity) > 30)) {
      return NextResponse.json({ success: false, error: "INVALID_REQUEST", message: "بيانات السلة غير مكتملة." }, { status: 400 });
    }
    const lines = requested as { serviceId: string; quantity: number }[];
    const ids = lines.map(line => line.serviceId);
    if (new Set(ids).size !== ids.length) {
      return NextResponse.json({ success: false, error: "DUPLICATE_SERVICES", message: "السلة تحتوي خدمات مكررة." }, { status: 400 });
    }
    const { prisma } = await import("@/lib/prisma");
    const [coupon, services] = await Promise.all([
      prisma.coupon.findUnique({ where: { code } }),
      prisma.service.findMany({ where: { id: { in: ids }, status: "PUBLISHED" }, select: { id: true, finalPrice: true, category: true } }),
    ]);
    if (services.length !== ids.length) {
      return NextResponse.json({ success: false, error: "SERVICE_NOT_FOUND", message: "إحدى الخدمات غير متاحة." }, { status: 404 });
    }

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
    const pricedLines = lines.map(line => {
      const service = services.find(service => service.id === line.serviceId)!;
      return { line, service, unitPrice: Number(service.finalPrice) };
    });
    if (pricedLines.some(row => !Number.isFinite(row.unitPrice) || row.unitPrice <= 0)) {
      return NextResponse.json({ success: false, error: "INVALID_SERVICE_PRICE" }, { status: 409 });
    }
    const eligibleLines = pricedLines.filter(row =>
      (!coupon.serviceId || coupon.serviceId === row.line.serviceId) &&
      (!coupon.category || coupon.category === row.service.category));
    if (!eligibleLines.length) {
      return NextResponse.json({ success: false, error: "COUPON_NOT_APPLICABLE", message: "هذا الكوبون غير صالح للخدمات في السلة." }, { status: 400 });
    }
    const discountValue = Number(coupon.discountValue);
    if (!Number.isFinite(discountValue) || discountValue <= 0 || (coupon.discountType === "PERCENTAGE" && discountValue > 100)) {
      return NextResponse.json({ success: false, error: "INVALID_COUPON_VALUE", message: "قيمة الكوبون غير صالحة." }, { status: 400 });
    }

    const subtotal = money(pricedLines.reduce((sum, row) => sum + row.unitPrice * row.line.quantity, 0));
    const eligibleSubtotal = money(eligibleLines.reduce((sum, row) => sum + row.unitPrice * row.line.quantity, 0));
    if (coupon.minOrderAmount !== null && subtotal < Number(coupon.minOrderAmount)) {
      return NextResponse.json({ success: false, error: "MIN_ORDER_NOT_MET", message: `الحد الأدنى لاستخدام الكوبون هو ${Number(coupon.minOrderAmount).toLocaleString("ar-SA")} ر.س.` }, { status: 400 });
    }

    let discountAmount = coupon.discountType === "PERCENTAGE"
      ? eligibleSubtotal * (discountValue / 100)
      : discountValue;

    if (coupon.maxDiscountAmount !== null) {
      const cap = Number(coupon.maxDiscountAmount);
      if (!Number.isFinite(cap) || cap < 0) {
        return NextResponse.json({ success: false, error: "INVALID_COUPON_CAP" }, { status: 409 });
      }
      discountAmount = Math.min(discountAmount, cap);
    }
    discountAmount = money(Math.max(0, Math.min(discountAmount, eligibleSubtotal)));
    const total = money(subtotal - discountAmount);

    return NextResponse.json({
      success: true,
      data: { code: coupon.code, subtotal, eligibleSubtotal, eligibleItems: eligibleLines.length, discountAmount, total, discountType: coupon.discountType, discountValue: Number(coupon.discountValue) },
      message: "تم احتساب الخصم مبدئياً؛ السعر النهائي يُعتمد عند إنشاء الطلب على الخادم.",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("POST /api/coupons/validate error:", error);
    return NextResponse.json({ success: false, error: "COUPON_VALIDATION_FAILED", message: "تعذر التحقق من الكوبون حالياً." }, { status: 500 });
  }
}
