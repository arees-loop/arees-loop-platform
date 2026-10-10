import {hasAdminPermission} from "@/lib/admin-permissions";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { sendEmail } from "@/lib/notifications/email";

type AdminDecision =
  | "REQUEST_COMPLETION"
  | "SEND_AGREEMENT"
  | "REJECT"
  | "ACTIVATE";

type DecisionBody = {
  action?: AdminDecision;
  notes?: string;
  commissionRate?: number;
};

function getRequestIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return request.headers.get("x-real-ip");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "يجب تسجيل الدخول أولاً." },
        { status: 401 }
      );
    }

    if (
      !hasAdminPermission(session.user,"PARTNER_REQUESTS")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح لك بتنفيذ قرارات إدارة الشركاء.",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = (await request.json()) as DecisionBody;
    const action = body.action;
    const notes = body.notes?.trim() || null;

    if (!action) {
      return NextResponse.json(
        { success: false, message: "نوع الإجراء مطلوب." },
        { status: 400 }
      );
    }

    if (
      action !== "REQUEST_COMPLETION" &&
      action !== "SEND_AGREEMENT" &&
      action !== "REJECT" &&
      action !== "ACTIVATE"
    ) {
      return NextResponse.json(
        { success: false, message: "الإجراء المطلوب غير صالح." },
        { status: 400 }
      );
    }

    if (
      (action === "REQUEST_COMPLETION" || action === "REJECT") &&
      !notes
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            action === "REQUEST_COMPLETION"
              ? "يجب كتابة تفاصيل الاستكمال المطلوبة."
              : "يجب كتابة سبب الرفض.",
        },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.findUnique({
      where: { id },
      include: {
        members: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
        agreements: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!partner) {
      return NextResponse.json(
        { success: false, message: "طلب الشريك غير موجود." },
        { status: 404 }
      );
    }

    const reviewActionsAllowed =
      partner.status === "SUBMITTED" ||
      partner.status === "UNDER_REVIEW" ||
      partner.status === "NEEDS_COMPLETION";

    if (
      action !== "ACTIVATE" &&
      !reviewActionsAllowed
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "لا يمكن تنفيذ هذا الإجراء على الطلب في حالته الحالية.",
        },
        { status: 409 }
      );
    }

    if (
      action === "ACTIVATE" &&
      partner.status !== "AGREEMENT_ACCEPTED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "لا يمكن تفعيل الشريك قبل قبوله الاتفاقية الإلكترونية.",
        },
        { status: 409 }
      );
    }

    const now = new Date();
    const beforeData = {
      status: partner.status,
      reviewNotes: partner.reviewNotes,
      completionNotes: partner.completionNotes,
      reviewedAt: partner.reviewedAt,
      rejectedAt: partner.rejectedAt,
      commissionRate: partner.commissionRate?.toString() ?? null,
    };

    const result = await prisma.$transaction(async (tx) => {
      if (action === "REQUEST_COMPLETION") {
        const updatedPartner = await tx.partner.update({
          where: { id: partner.id },
          data: {
            status: "NEEDS_COMPLETION",
            completionNotes: notes,
            reviewedAt: now,
            rejectedAt: null,
          },
        });

        await tx.auditLog.create({
          data: {
            userId: session.user.id,
            action: "PARTNER_REQUEST_COMPLETION",
            entityType: "Partner",
            entityId: partner.id,
            beforeData,
            afterData: {
              status: updatedPartner.status,
              completionNotes: updatedPartner.completionNotes,
              reviewedAt: updatedPartner.reviewedAt,
            },
            ipAddress: getRequestIp(request),
            userAgent: request.headers.get("user-agent"),
          },
        });

        return { partner: updatedPartner, agreement: null };
      }

      if (action === "SEND_AGREEMENT") {
        const commissionRate =
          typeof body.commissionRate === "number"
            ? body.commissionRate
            : partner.commissionRate
              ? Number(partner.commissionRate)
              : 10;

        if (
          !Number.isFinite(commissionRate) ||
          commissionRate < 0 ||
          commissionRate > 100
        ) {
          throw new Error("INVALID_COMMISSION_RATE");
        }

        const agreement = await tx.agreement.create({
          data: {
            partnerId: partner.id,
            version: "v1.0",
            commissionRate,
            termsSnapshot: {
              version: "v1.0",
              commissionRate,
              transferFee: partner.transferFee.toString(),
              generatedAt: now.toISOString(),
            },
            sentAt: now,
            status: "SENT",
          },
        });

        const updatedPartner = await tx.partner.update({
          where: { id: partner.id },
          data: {
            status: "WAITING_AGREEMENT",
            commissionRate,
            reviewNotes: notes,
            completionNotes: null,
            reviewedAt: now,
            rejectedAt: null,
          },
        });

        await tx.auditLog.create({
          data: {
            userId: session.user.id,
            action: "PARTNER_AGREEMENT_SENT",
            entityType: "Partner",
            entityId: partner.id,
            beforeData,
            afterData: {
              status: updatedPartner.status,
              commissionRate:
                updatedPartner.commissionRate?.toString() ?? null,
              agreementId: agreement.id,
              agreementVersion: agreement.version,
              agreementStatus: agreement.status,
              sentAt: agreement.sentAt,
            },
            ipAddress: getRequestIp(request),
            userAgent: request.headers.get("user-agent"),
          },
        });

        return { partner: updatedPartner, agreement };
      }

      if (action === "ACTIVATE") {
        const updatedPartner = await tx.partner.update({
          where: { id: partner.id },
          data: {
            status: "ACTIVE",
            approvedAt: now,
            activatedAt: now,
            rejectedAt: null,
          },
        });

        await tx.auditLog.create({
          data: {
            userId: session.user.id,
            action: "PARTNER_ACTIVATED",
            entityType: "Partner",
            entityId: partner.id,
            beforeData,
            afterData: {
              status: updatedPartner.status,
              approvedAt: updatedPartner.approvedAt,
              activatedAt: updatedPartner.activatedAt,
            },
            ipAddress: getRequestIp(request),
            userAgent: request.headers.get("user-agent"),
          },
        });

        return { partner: updatedPartner, agreement: partner.agreements[0] ?? null };
      }

      const updatedPartner = await tx.partner.update({
        where: { id: partner.id },
        data: {
          status: "REJECTED",
          reviewNotes: notes,
          completionNotes: null,
          reviewedAt: now,
          rejectedAt: now,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "PARTNER_REJECTED",
          entityType: "Partner",
          entityId: partner.id,
          beforeData,
          afterData: {
            status: updatedPartner.status,
            reviewNotes: updatedPartner.reviewNotes,
            reviewedAt: updatedPartner.reviewedAt,
            rejectedAt: updatedPartner.rejectedAt,
          },
          ipAddress: getRequestIp(request),
          userAgent: request.headers.get("user-agent"),
        },
      });

      return { partner: updatedPartner, agreement: null };
    });

    const contactEmail =
      partner.mainContactEmail ||
      partner.businessEmail ||
      partner.members.find(
        (member) =>
          member.user.role === "PARTNER_OWNER" ||
          member.user.role === "PARTNER_ADMIN"
      )?.user.email ||
      null;

    let notification:
      | { sent: true; id: string | null }
      | { sent: false; reason: string } = {
      sent: false,
      reason: "PARTNER_EMAIL_NOT_AVAILABLE",
    };

    if (contactEmail) {
      const displayName =
        partner.tradeNameAr ||
        partner.legalNameAr;

      const appOrigin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || new URL(request.url).origin;
      const portalUrl = `${appOrigin}/partner/status`;
      const agreementUrl = `${appOrigin}/partner/agreement`;
      const dashboardUrl = `${appOrigin}/partner/dashboard`;
      const guideUrl = `${appOrigin}/partner/guide`;

      const subject =
        action === "REQUEST_COMPLETION"
          ? "يوجد تحديث على طلب انضمامكم إلى Arees Loop"
          : action === "SEND_AGREEMENT"
            ? "تم إرسال اتفاقية الشراكة للتوقيع الإلكتروني — Arees Loop"
            : action === "ACTIVATE"
              ? "مبروك، تم اعتماد وتفعيل حسابكم — Arees Loop"
              : "تحديث طلب الشراكة — Arees Loop";

      const bodyText =
        action === "REQUEST_COMPLETION"
          ? "يوجد تحديث جديد على طلب انضمام منشأتكم إلى منصة Arees Loop. يرجى الدخول إلى لوحة الشريك لمراجعة التحديث واستكمال المطلوب."
          : action === "SEND_AGREEMENT"
            ? "اكتملت مراجعة طلبكم وتم إرسال اتفاقية الشراكة للتوقيع الإلكتروني. يرجى مراجعة الاتفاقية والشروط التجارية ثم قبولها إلكترونياً."
            : action === "ACTIVATE"
              ? "مبروك، تم اعتماد وتفعيل حسابكم كشريك في Arees Loop. يمكنكم الآن الدخول إلى لوحة الشريك والبدء في إضافة التجارب والبرامج لإرسالها للمراجعة قبل النشر."
              : `تم تحديث حالة طلب الشراكة. سبب الرفض: ${notes ?? ""}`;

      notification = await sendEmail({
        to: contactEmail,
        subject,
        html: `
          <div dir="rtl" style="font-family:Arial,sans-serif;max-width:640px;margin:auto;line-height:1.8;color:#17201d">
            <h2>تحديث طلب الشراكة</h2>
            <p>مرحباً <strong>${escapeHtml(displayName)}</strong>،</p>
            <p>${escapeHtml(bodyText)}</p>
            <p><strong>رقم الطلب:</strong> ${escapeHtml(partner.id)}</p>
            ${action === "REQUEST_COMPLETION"
              ? `<p style="margin:28px 0"><a href="${escapeHtml(portalUrl)}" style="display:inline-block;background:#0D3B34;color:#fff;text-decoration:none;padding:12px 22px;border-radius:12px;font-weight:700">الدخول إلى لوحة الشريك</a></p>`
              : action === "ACTIVATE"
                ? `<p style="margin:28px 0"><a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;background:#D4AF37;color:#0D3B34;text-decoration:none;padding:13px 24px;border-radius:12px;font-weight:700">الدخول إلى لوحة الشريك</a></p><p style="font-size:13px;color:#6b7280">يمكنكم الآن إضافة التجارب والبرامج، وتخضع كل خدمة جديدة للمراجعة قبل النشر.</p><p><a href="${escapeHtml(guideUrl)}" style="color:#0D3B34;font-weight:700">فتح دليل الشريك المبسط</a></p><p style="font-size:12px;color:#6b7280">الدعم الفني: info@areesloop.com</p>`
                : ""}
            ${
              action === "SEND_AGREEMENT"
                ? `<p style="margin:28px 0"><a href="${escapeHtml(agreementUrl)}" style="display:inline-block;background:#D4AF37;color:#0D3B34;text-decoration:none;padding:13px 24px;border-radius:12px;font-weight:700">مراجعة وتوقيع الاتفاقية</a></p><p style="font-size:13px;color:#6b7280">بعد قبول الاتفاقية إلكترونياً، ينتقل طلبكم إلى مرحلة الاعتماد النهائي لدى Arees Loop.</p>`
                : ""
            }
          </div>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      message:
        action === "REQUEST_COMPLETION"
          ? "تم إرسال الطلب للاستكمال."
          : action === "SEND_AGREEMENT"
            ? "تم إرسال الاتفاقية للشريك."
            : action === "ACTIVATE"
              ? "تم اعتماد وتفعيل الشريك."
              : "تم رفض طلب الشريك.",
      data: {
        id: result.partner.id,
        status: result.partner.status,
        completionNotes: result.partner.completionNotes,
        reviewNotes: result.partner.reviewNotes,
        commissionRate:
          result.partner.commissionRate?.toString() ?? null,
        agreement: result.agreement
          ? {
              id: result.agreement.id,
              version: result.agreement.version,
              status: result.agreement.status,
              sentAt: result.agreement.sentAt,
            }
          : null,
        notification: {
          email: contactEmail,
          ...notification,
        },
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_COMMISSION_RATE"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "نسبة العمولة يجب أن تكون بين 0 و100.",
        },
        { status: 400 }
      );
    }

    console.error(
      "POST /api/admin/partners/[id]/decision error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "تعذر تنفيذ قرار الإدارة.",
      },
      { status: 500 }
    );
  }
}
