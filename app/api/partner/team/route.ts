import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { canManagePartnerTeam, normalizePartnerPermissions } from "@/lib/partner-permissions";

function denied(message: string, status = 403) {
  return NextResponse.json({ success: false, message }, { status });
}

async function managerMembership(userId: string) {
  const membership = await prisma.partnerMember.findFirst({
    where: { userId, isActive: true },
    include: { user: { select: { id: true, role: true } }, partner: true },
    orderBy: { createdAt: "desc" },
  });
  if (!membership) return { error: denied("لا توجد منشأة مرتبطة بالحساب.", 404) };
  if (!canManagePartnerTeam(membership.user.role)) return { error: denied("إدارة الموظفين متاحة لمالك المنشأة أو مديرها فقط.") };
  if (membership.partner.status !== "ACTIVE") return { error: denied("يجب تفعيل حساب المنشأة أولاً.") };
  return { membership };
}

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) return denied("يجب تسجيل الدخول أولاً.", 401);
    const access = await managerMembership(session.user.id);
    if (access.error) return access.error;
    const members = await prisma.partnerMember.findMany({
      where: { partnerId: access.membership.partnerId },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ success: true, members: members.map((member) => ({
      id: member.id,
      userId: member.userId,
      jobTitle: member.jobTitle,
      permissions: normalizePartnerPermissions(member.permissions),
      isActive: member.isActive,
      isOwner: canManagePartnerTeam(member.user.role),
      user: member.user,
    })) });
  } catch (error) {
    console.error("GET /api/partner/team failed:", error);
    return denied("تعذر تحميل قائمة الموظفين.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) return denied("يجب تسجيل الدخول أولاً.", 401);
    const access = await managerMembership(session.user.id);
    if (access.error) return access.error;
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const jobTitle = String(body.jobTitle || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return denied("أدخل بريداً إلكترونياً صحيحاً.", 400);
    if (jobTitle.length > 100) return denied("المسمى الوظيفي طويل جداً.", 400);
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true, status: true, emailVerifiedAt: true } });
    if (!user) return denied("يجب أن ينشئ الموظف حساباً في Arees Loop ويتحقق من بريده أولاً.", 404);
    if (!user.emailVerifiedAt || user.status !== "ACTIVE") return denied("تحقق من البريد وفعّل حساب الموظف قبل إضافته.", 400);
    if (canManagePartnerTeam(user.role) || user.role === "ADMIN" || user.role === "SUPER_ADMIN") return denied("لا يمكن إضافة حساب إداري أو مالك كموظف.", 400);
    const duplicate = await prisma.partnerMember.findUnique({ where: { partnerId_userId: { partnerId: access.membership.partnerId, userId: user.id } }, select: { id: true } });
    if (duplicate) return denied("هذا الحساب مضاف إلى المنشأة مسبقاً.", 409);
    const member = await prisma.partnerMember.create({ data: {
      partnerId: access.membership.partnerId,
      userId: user.id,
      jobTitle: jobTitle || null,
      permissions: normalizePartnerPermissions(body.permissions),
      isActive: true,
    }, include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true } } } });
    await prisma.auditLog.create({ data: { userId: session.user.id, action: "PARTNER_MEMBER_ADDED", entityType: "PartnerMember", entityId: member.id, afterData: { partnerId: member.partnerId, employeeEmail: member.user.email, permissions: normalizePartnerPermissions(member.permissions) } } });
    return NextResponse.json({ success: true, message: "تمت إضافة الموظف.", member: { id: member.id } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/partner/team failed:", error);
    return denied("تعذر إضافة الموظف.", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) return denied("يجب تسجيل الدخول أولاً.", 401);
    const access = await managerMembership(session.user.id);
    if (access.error) return access.error;
    const body = await request.json();
    const id = String(body.id || "");
    const current = await prisma.partnerMember.findFirst({ where: { id, partnerId: access.membership.partnerId }, include: { user: { select: { role: true } } } });
    if (!current) return denied("الموظف غير موجود في هذه المنشأة.", 404);
    if (current.userId === session.user.id || canManagePartnerTeam(current.user.role)) return denied("لا يمكن تعديل صلاحيات المالك أو المدير من هذه الصفحة.", 400);
    const data: { permissions?: object; jobTitle?: string | null; isActive?: boolean } = {};
    if (body.permissions !== undefined) data.permissions = normalizePartnerPermissions(body.permissions);
    if (body.jobTitle !== undefined) {
      const title = String(body.jobTitle || "").trim();
      if (title.length > 100) return denied("المسمى الوظيفي طويل جداً.", 400);
      data.jobTitle = title || null;
    }
    if (typeof body.isActive === "boolean") data.isActive = body.isActive;
    const member = await prisma.partnerMember.update({ where: { id }, data });
    await prisma.auditLog.create({ data: { userId: session.user.id, action: "PARTNER_MEMBER_UPDATED", entityType: "PartnerMember", entityId: member.id, afterData: { partnerId: member.partnerId, isActive: member.isActive, permissions: normalizePartnerPermissions(member.permissions) } } });
    return NextResponse.json({ success: true, message: "تم تحديث بيانات الموظف وصلاحياته." });
  } catch (error) {
    console.error("PATCH /api/partner/team failed:", error);
    return denied("تعذر تحديث الموظف.", 500);
  }
}
