import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { ACTIVE_PARTNER_COOKIE } from "@/lib/partner-permissions";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ success: false, message: "يجب تسجيل الدخول أولاً." }, { status: 401 });
  const memberships = await prisma.partnerMember.findMany({
    where: { userId: session.user.id, isActive: true },
    select: { partnerId: true, partner: { select: { id: true, tradeNameAr: true, legalNameAr: true, publicName: true, partnerType: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });
  const selectedId = (await cookies()).get(ACTIVE_PARTNER_COOKIE)?.value;
  const selectedValid = memberships.some((item) => item.partnerId === selectedId);
  const selectedPartnerId = selectedValid ? selectedId : memberships.length === 1 ? memberships[0].partnerId : null;
  return NextResponse.json({
    success: true,
    requiresSelection: memberships.length > 1 && !selectedPartnerId,
    selectedPartnerId,
    memberships: memberships.map(({ partnerId, partner }) => ({
      id: partnerId,
      name: partner.tradeNameAr || partner.publicName || partner.legalNameAr,
      legalName: partner.legalNameAr,
      partnerType: partner.partnerType,
      status: partner.status,
      isSelected: partnerId === selectedPartnerId,
    })),
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ success: false, message: "يجب تسجيل الدخول أولاً." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const partnerId = typeof body?.partnerId === "string" ? body.partnerId : "";
  if (!partnerId) return NextResponse.json({ success: false, message: "اختر الشريك المطلوب." }, { status: 400 });
  const membership = await prisma.partnerMember.findFirst({
    where: { userId: session.user.id, partnerId, isActive: true },
    select: { partnerId: true },
  });
  if (!membership) return NextResponse.json({ success: false, message: "هذا الشريك غير مرتبط بحسابك أو عضويته موقوفة." }, { status: 403 });
  (await cookies()).set(ACTIVE_PARTNER_COOKIE, membership.partnerId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return NextResponse.json({ success: true, partnerId: membership.partnerId });
}
