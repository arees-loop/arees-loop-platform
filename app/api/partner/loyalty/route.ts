import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

async function membershipFor(userId: string) {
  return prisma.partnerMember.findFirst({
    where: { userId, isActive: true },
    select: { partnerId: true },
  });
}

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ success: false }, { status: 401 });
  const membership = await membershipFor(session.user.id);
  if (!membership) return NextResponse.json({ success: false }, { status: 404 });

  const settings = await prisma.partnerLoyaltySetting.findMany({
    where: { partnerId: membership.partnerId },
    include: { service: { select: { id: true, nameAr: true, category: true } } },
    orderBy: { createdAt: "desc" },
  });
  const services = await prisma.service.findMany({
    where: { partnerId: membership.partnerId, status: "PUBLISHED" },
    select: { id: true, nameAr: true, category: true },
    orderBy: { nameAr: "asc" },
  });
  return NextResponse.json({ success: true, settings, services });
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) return NextResponse.json({ success: false, message: "يجب تسجيل الدخول أولاً." }, { status: 401 });
    const membership = await membershipFor(session.user.id);
    if (!membership) return NextResponse.json({ success: false, message: "لا توجد منشأة مرتبطة بالحساب." }, { status: 404 });

    const body = await request.json();
    const scope = String(body.scope || "");
    if (!["ALL", "CATEGORY", "SERVICE"].includes(scope)) {
      return NextResponse.json({ success: false, message: "نطاق النقاط غير صحيح." }, { status: 400 });
    }
    let category: string | null = null;
    let serviceId: string | null = null;
    if (scope === "CATEGORY") {
      category = String(body.category || "").trim();
      if (!category) return NextResponse.json({ success: false, message: "اختر التصنيف." }, { status: 400 });
      const exists = await prisma.service.findFirst({ where: { partnerId: membership.partnerId, category, status: "PUBLISHED" }, select: { id: true } });
      if (!exists) return NextResponse.json({ success: false, message: "التصنيف غير متاح." }, { status: 400 });
    }
    if (scope === "SERVICE") {
      serviceId = String(body.serviceId || "");
      const exists = await prisma.service.findFirst({ where: { id: serviceId, partnerId: membership.partnerId, status: "PUBLISHED" }, select: { id: true } });
      if (!exists) return NextResponse.json({ success: false, message: "الخدمة غير متاحة." }, { status: 400 });
    }

    await prisma.partnerLoyaltySetting.deleteMany({ where: { partnerId: membership.partnerId } });
    const setting = await prisma.partnerLoyaltySetting.create({
      data: { partnerId: membership.partnerId, scope: scope as "ALL" | "CATEGORY" | "SERVICE", category, serviceId, isActive: true },
    });
    return NextResponse.json({ success: true, setting });
  } catch (error) {
    console.error("POST /api/partner/loyalty failed:", error);
    return NextResponse.json({ success: false, message: "تعذر حفظ إعدادات النقاط." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) return NextResponse.json({ success: false }, { status: 401 });
    const membership = await membershipFor(session.user.id);
    if (!membership) return NextResponse.json({ success: false }, { status: 404 });
    const body = await request.json();
    await prisma.partnerLoyaltySetting.updateMany({
      where: { partnerId: membership.partnerId },
      data: { isActive: Boolean(body.isActive) },
    });
    return NextResponse.json({ success: true, isActive: Boolean(body.isActive) });
  } catch (error) {
    console.error("PATCH /api/partner/loyalty failed:", error);
    return NextResponse.json({ success: false, message: "تعذر تحديث برنامج النقاط." }, { status: 500 });
  }
}
