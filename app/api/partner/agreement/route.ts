import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { getRequestIp } from "@/lib/rate-limit";
import {
  getAdminNotificationEmails,
  sendEmail,
} from "@/lib/notifications/email";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function getPartnerMembership(userId: string) {
  return prisma.partnerMember.findFirst({
    where: {
      userId,
      isActive: true,
    },
    include: {
      partner: {
        include: {
          agreements: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "يجب تسجيل الدخول أولاً.",
        },
        { status: 401 },
      );
    }

    const membership = await getPartnerMembership(
      session.user.id,
    );

    if (!membership) {
      return NextResponse.json(
        {
          success: false,
          message: "لا يوجد طلب شراكة مرتبط بهذا الحساب.",
        },
        { status: 404 },
      );
    }

    const agreement =
      membership.partner.agreements[0] ?? null;

    if (!agreement) {
      return NextResponse.json({
        success: true,
        agreement: null,
        partner: {
          id: membership.partner.id,
          status: membership.partner.status,
          legalNameAr: membership.partner.legalNameAr,
          tradeNameAr: membership.partner.tradeNameAr,
        },
      });
    }

    return NextResponse.json({
      success: true,
      partner: {
        id: membership.partner.id,
        status: membership.partner.status,
        legalNameAr: membership.partner.legalNameAr,
        tradeNameAr: membership.partner.tradeNameAr,
        unifiedNumber: membership.partner.unifiedNumber,
        commercialRegister:
          membership.partner.commercialRegister,
        mainContactName:
          membership.partner.mainContactName,
        mainContactEmail:
          membership.partner.mainContactEmail,
        mainContactPhone:
          membership.partner.mainContactPhone,
        transferFee:
          membership.partner.transferFee.toString(),
      },
      agreement: {
        id: agreement.id,
        version: agreement.version,
        commissionRate:
          agreement.commissionRate?.toString() ?? null,
        termsSnapshot: agreement.termsSnapshot,
        sentAt: agreement.sentAt,
        acceptedAt: agreement.acceptedAt,
        acceptedByName: agreement.acceptedByName,
        acceptedByEmail: agreement.acceptedByEmail,
        status: agreement.status,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/partner/agreement failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "تعذر تحميل اتفاقية الشريك.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "يجب تسجيل الدخول أولاً.",
        },
        { status: 401 },
      );
    }

    if (
      session.user.role !== "PARTNER_OWNER" &&
      session.user.role !== "PARTNER_ADMIN"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "هذا الحساب غير مخول لقبول اتفاقية الشريك.",
        },
        { status: 403 },
      );
    }

    const body = (await request.json()) as {
      acceptedTerms?: boolean;
      authorityConfirmed?: boolean;
    };

    if (
      body.acceptedTerms !== true ||
      body.authorityConfirmed !== true
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "يجب الإقرار بقراءة الاتفاقية وصلاحية التوقيع قبل القبول.",
        },
        { status: 400 },
      );
    }

    const membership = await getPartnerMembership(
      session.user.id,
    );

    if (!membership) {
      return NextResponse.json(
        {
          success: false,
          message: "لا يوجد طلب شراكة مرتبط بهذا الحساب.",
        },
        { status: 404 },
      );
    }

    const partner = membership.partner;
    const agreement = partner.agreements[0];

    if (
      partner.status !== "WAITING_AGREEMENT" ||
      !agreement ||
      agreement.status !== "SENT"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "لا توجد اتفاقية مرسلة بانتظار موافقتك حالياً.",
        },
        { status: 409 },
      );
    }

    const acceptedAt = new Date();
    const acceptedByName =
      [session.user.firstName, session.user.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      partner.mainContactName ||
      session.user.email;

    const ipAddress = getRequestIp(request);
    const userAgent =
      request.headers.get("user-agent");

    const result = await prisma.$transaction(
      async (tx) => {
        const updatedAgreement =
          await tx.agreement.update({
            where: {
              id: agreement.id,
            },
            data: {
              status: "ACCEPTED",
              acceptedAt,
              acceptedByName,
              acceptedByEmail:
                session.user.email,
              acceptedIp: ipAddress,
              acceptedUserAgent: userAgent,
            },
          });

        const updatedPartner =
          await tx.partner.update({
            where: {
              id: partner.id,
            },
            data: {
              status: "AGREEMENT_ACCEPTED",
            },
          });

        await tx.auditLog.create({
          data: {
            userId: session.user.id,
            action:
              "PARTNER_AGREEMENT_ACCEPTED",
            entityType: "Agreement",
            entityId: agreement.id,
            beforeData: {
              partnerStatus: partner.status,
              agreementStatus:
                agreement.status,
            },
            afterData: {
              partnerStatus:
                updatedPartner.status,
              agreementStatus:
                updatedAgreement.status,
              acceptedAt,
              acceptedByName,
              acceptedByEmail:
                session.user.email,
            },
            ipAddress,
            userAgent,
          },
        });

        return {
          partner: updatedPartner,
          agreement: updatedAgreement,
        };
      },
    );

    const displayName =
      partner.tradeNameAr ||
      partner.legalNameAr;

    const safeDisplayName =
      escapeHtml(displayName);

    const partnerEmailResult = await sendEmail({
      to: session.user.email,
      subject:
        "تم تسجيل قبول اتفاقية الشريك — Arees Loop",
      html: `
        <div dir="rtl" style="font-family:Arial,sans-serif;max-width:640px;margin:auto;line-height:1.8;color:#17201d">
          <h2>تم تسجيل قبول الاتفاقية</h2>
          <p>مرحباً <strong>${safeDisplayName}</strong>،</p>
          <p>تم تسجيل قبولكم الإلكتروني لاتفاقية الشريك بنجاح.</p>
          <p><strong>نسخة الاتفاقية:</strong> ${escapeHtml(
            agreement.version,
          )}</p>
          <p>الطلب الآن بانتظار الاعتماد النهائي من Arees Loop.</p>
        </div>
      `,
    });

    const adminEmails =
      getAdminNotificationEmails();

    const adminEmailResult =
      adminEmails.length === 0
        ? {
            sent: false as const,
            reason:
              "AREES_ADMIN_EMAILS_NOT_CONFIGURED",
          }
        : await sendEmail({
            to: adminEmails,
            subject:
              `الشريك قبل الاتفاقية — ${displayName}`,
            html: `
              <div dir="rtl" style="font-family:Arial,sans-serif;max-width:640px;margin:auto;line-height:1.8;color:#17201d">
                <h2>تم قبول اتفاقية الشريك</h2>
                <p><strong>الشريك:</strong> ${safeDisplayName}</p>
                <p><strong>رقم الطلب:</strong> ${escapeHtml(
                  partner.id,
                )}</p>
                <p><strong>النسخة:</strong> ${escapeHtml(
                  agreement.version,
                )}</p>
                <p>الحالة الحالية: بانتظار الاعتماد النهائي.</p>
              </div>
            `,
          });

    return NextResponse.json({
      success: true,
      message:
        "تم تسجيل قبول الاتفاقية بنجاح.",
      partner: {
        id: result.partner.id,
        status: result.partner.status,
      },
      agreement: {
        id: result.agreement.id,
        status: result.agreement.status,
        acceptedAt:
          result.agreement.acceptedAt,
      },
      notifications: {
        partner: partnerEmailResult,
        admin: adminEmailResult,
      },
    });
  } catch (error) {
    console.error(
      "POST /api/partner/agreement failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "تعذر تسجيل قبول الاتفاقية حالياً.",
      },
      { status: 500 },
    );
  }
}
