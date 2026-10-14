import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { canManagePartnerTeam, getActivePartnerMembership } from "@/lib/partner-permissions";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ success: false, message: "يجب تسجيل الدخول أولاً." }, { status: 401 });

  const membership = await getActivePartnerMembership(session.user.id);
  if (!membership) return NextResponse.json({ success: false, message: "اختر جهة الشراكة أولاً." }, { status: 409 });
  if (!canManagePartnerTeam(membership.user.role)) return NextResponse.json({ success: false, message: "سجل النشاط متاح لمالك المنشأة أو مديرها فقط." }, { status: 403 });

  const partnerId = membership.partnerId;
  const [members, services, documents, agreements, events, coupons] = await Promise.all([
    prisma.partnerMember.findMany({ where: { partnerId }, select: { id: true, userId: true } }),
    prisma.service.findMany({ where: { partnerId }, select: { id: true } }),
    prisma.partnerDocument.findMany({ where: { partnerId }, select: { id: true } }),
    prisma.agreement.findMany({ where: { partnerId }, select: { id: true } }),
    prisma.publicEvent.findMany({ where: { partnerId }, select: { id: true } }),
    prisma.coupon.findMany({ where: { service: { partnerId } }, select: { id: true } }),
  ]);
  const userIds = [...new Set(members.map((item) => item.userId))];
  const entityIds = [
    ...members.map((item) => item.id), ...services.map((item) => item.id),
    ...documents.map((item) => item.id), ...agreements.map((item) => item.id),
    ...events.map((item) => item.id), ...coupons.map((item) => item.id), partnerId,
  ];

  const [sessions, logs] = await Promise.all([
    prisma.session.findMany({
      where: { userId: { in: userIds } },
      select: { id: true, userId: true, createdAt: true, lastUsedAt: true, ipAddress: true, userAgent: true },
      orderBy: { createdAt: "desc" }, take: 100,
    }),
    prisma.auditLog.findMany({
      where: { entityId: { in: entityIds } },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: "desc" }, take: 150,
    }),
  ]);

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, firstName: true, lastName: true, email: true },
  });
  const userById = new Map(users.map((user) => [user.id, user]));
  const loginActivity = sessions.map((item) => {
    const user = userById.get(item.userId);
    return {
      id: `login-${item.id}`, kind: "LOGIN", action: "تسجيل دخول",
      employee: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "مستخدم",
      email: user?.email || "", createdAt: item.createdAt, lastUsedAt: item.lastUsedAt,
      ipAddress: item.ipAddress, userAgent: item.userAgent, details: null,
    };
  });
  const operationActivity = logs.map((item) => ({
    id: `operation-${item.id}`, kind: item.action === "PARTNER_USER_LOGIN" ? "LOGIN" : "OPERATION", action: item.action === "PARTNER_USER_LOGIN" ? "تسجيل دخول" : item.action,
    employee: [item.user?.firstName, item.user?.lastName].filter(Boolean).join(" ") || item.user?.email || "مستخدم سابق",
    email: item.user?.email || "", createdAt: item.createdAt, lastUsedAt: null,
    ipAddress: item.ipAddress, userAgent: item.userAgent,
    details: { entityType: item.entityType, entityId: item.entityId, beforeData: item.beforeData, afterData: item.afterData },
  }));
  // Session rows disappear at logout; the persistent audit login event remains.
  // Suppress the matching live-session row so one login is not displayed twice.
  const nonDuplicateSessions = loginActivity.filter((login) => !operationActivity.some((operation) =>
    operation.kind === "LOGIN" && operation.email === login.email &&
    Math.abs(new Date(operation.createdAt).getTime() - new Date(login.createdAt).getTime()) < 60_000
  ));
  const activity = [...nonDuplicateSessions, ...operationActivity]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 200);

  return NextResponse.json({ success: true, activity }, { headers: { "Cache-Control": "no-store" } });
}
