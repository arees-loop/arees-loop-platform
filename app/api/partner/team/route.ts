import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { canManagePartnerTeam, getActivePartnerMembership, normalizePartnerPermissions } from "@/lib/partner-permissions";
import { sendEmail } from "@/lib/notifications/email";

function denied(message: string, status = 403) {
  return NextResponse.json({ success: false, message }, { status });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] || character);
}

async function managerMembership(userId: string) {
  const membership = await getActivePartnerMembership(userId);
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
    if ("error" in access) return access.error;
    const members = await prisma.partnerMember.findMany({
      where: { partnerId: access.membership.partnerId },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true } } },
      orderBy: { createdAt: "asc" },
    });
    const pendingTokens = await prisma.verificationToken.findMany({
      where: { type: "PARTNER_INVITATION", consumedAt: null, expiresAt: { gt: new Date() }, userId: { in: members.map((member) => member.userId) } },
      select: { userId: true },
    });
    const pendingUserIds = new Set(pendingTokens.map((token) => token.userId));
    return NextResponse.json({ success: true, members: members.map((member) => ({
      id: member.id,
      userId: member.userId,
      jobTitle: member.jobTitle,
      permissions: normalizePartnerPermissions(member.permissions),
      isActive: member.isActive,
      invitationPending: pendingUserIds.has(member.userId),
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
    let user = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true, status: true, emailVerifiedAt: true } });
    if (user && (canManagePartnerTeam(user.role) || user.role === "ADMIN" || user.role === "SUPER_ADMIN")) return denied("لا يمكن إضافة حساب إداري أو مالك كموظف.", 400);
    if (user?.status === "SUSPENDED" || user?.status === "DISABLED") return denied("هذا الحساب موقوف ولا يمكن دعوته.", 400);
    const duplicate = user ? await prisma.partnerMember.findUnique({ where: { partnerId_userId: { partnerId: access.membership.partnerId, userId: user.id } }, select: { id: true } }) : null;
    if (duplicate) return denied("هذا الحساب مضاف إلى المنشأة مسبقاً.", 409);

    const invited = !user || !user.emailVerifiedAt || user.status !== "ACTIVE";
    if (!user) {
      user = await prisma.user.create({ data: {
        email, passwordHash: await hash(randomBytes(32).toString("base64url"), 12), role: "PARTNER_STAFF", status: "PENDING_VERIFICATION",
      }, select: { id: true, role: true, status: true, emailVerifiedAt: true } });
    }
    const member = await prisma.partnerMember.create({ data: {
      partnerId: access.membership.partnerId, userId: user.id, jobTitle: jobTitle || null,
      permissions: normalizePartnerPermissions(body.permissions), isActive: !invited,
    }, include: { user: { select: { id: true, email: true } } } });

    if (invited) {
      await prisma.verificationToken.deleteMany({ where: { userId: user.id, type: "PARTNER_INVITATION", consumedAt: null } });
      const token = randomBytes(32).toString("base64url");
      const tokenHash = createHash("sha256").update(token).digest("hex");
      await prisma.verificationToken.create({ data: { userId: user.id, type: "PARTNER_INVITATION", tokenHash, target: `${email}|${member.id}`, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
      const inviteUrl = `${new URL(request.url).origin}/partner/invite?token=${encodeURIComponent(token)}`;
      let sent = false;
      try {
        const partnerName = escapeHtml(access.membership.partner.tradeNameAr || access.membership.partner.legalNameAr);
        const delivery = await sendEmail({ to: email, subject: "دعوة للانضمام إلى منشأة في Arees Loop", html: `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.9;color:#173b35"><h2>مرحباً بك في Arees Loop</h2><p>تمت دعوتك للانضمام إلى فريق الشريك ${partnerName}.</p><p>افتح الرابط لتأكيد بريدك واختيار كلمة المرور بنفسك. الرابط صالح لمدة 24 ساعة.</p><p><a href="${inviteUrl}" style="display:inline-block;background:#0D3B34;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none">تفعيل الحساب واختيار كلمة المرور</a></p></div>` });
        sent = delivery.sent;
      } catch (error) {
        console.error("Partner invitation email delivery failed:", error);
      }
      if (!sent) {
        await prisma.$transaction([
          prisma.partnerMember.delete({ where: { id: member.id } }),
          prisma.verificationToken.deleteMany({ where: { userId: user.id, type: "PARTNER_INVITATION", consumedAt: null } }),
        ]);
        return denied("تعذر إرسال الدعوة. تحقق من إعدادات البريد ثم أعد المحاولة.", 502);
      }
    }
    await prisma.auditLog.create({ data: { userId: session.user.id, action: invited ? "PARTNER_MEMBER_INVITED" : "PARTNER_MEMBER_ADDED", entityType: "PartnerMember", entityId: member.id, afterData: { partnerId: member.partnerId, employeeEmail: member.user.email, permissions: normalizePartnerPermissions(member.permissions), invitationPending: invited } } });
    return NextResponse.json({ success: true, message: invited ? "أُرسلت الدعوة إلى الموظف ليؤكد بريده ويختار كلمة مروره." : "تمت إضافة الموظف إلى المنشأة.", member: { id: member.id }, invitationPending: invited }, { status: 201 });
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
    const data: any = {};
    if (body.permissions !== undefined) data.permissions = normalizePartnerPermissions(body.permissions);
    if (body.jobTitle !== undefined) {
      const title = String(body.jobTitle || "").trim();
      if (title.length > 100) return denied("المسمى الوظيفي طويل جداً.", 400);
      data.jobTitle = title || null;
    }
    if (typeof body.isActive === "boolean") data.isActive = body.isActive;
    if (body.isActive === true) {
      const pending = await prisma.verificationToken.findFirst({ where: { userId: current.userId, type: "PARTNER_INVITATION", consumedAt: null, expiresAt: { gt: new Date() } }, select: { id: true } });
      if (pending) return denied("ينبغي أن يقبل الموظف الدعوة ويؤكد بريده أولاً.", 409);
    }
    const member = await prisma.partnerMember.update({ where: { id }, data });
    await prisma.auditLog.create({ data: { userId: session.user.id, action: "PARTNER_MEMBER_UPDATED", entityType: "PartnerMember", entityId: member.id, afterData: { partnerId: member.partnerId, isActive: member.isActive, permissions: normalizePartnerPermissions(member.permissions) } } });
    return NextResponse.json({ success: true, message: "تم تحديث بيانات الموظف وصلاحياته." });
  } catch (error) {
    console.error("PATCH /api/partner/team failed:", error);
    return denied("تعذر تحديث الموظف.", 500);
  }
}
