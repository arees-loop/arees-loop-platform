import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

type AdminDecision =
  | "REQUEST_COMPLETION"
  | "SEND_AGREEMENT"
  | "REJECT";

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

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "يجب تسجيل الدخول أولاً.",
        },
        { status: 401 }
      );
    }

    if (
      session.user.role !== "ADMIN" &&
      session.user.role !== "SUPER_ADMIN"
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
        {
          success: false,
          message: "نوع الإجراء مطلوب.",
        },
        { status: 400 }
      );
    }

    if (
      action !== "REQUEST_COMPLETION" &&
      action !== "SEND_AGREEMENT" &&
      action !== "REJECT"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "الإجراء المطلوب غير صالح.",
        },
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
      where: {
        id,
      },

      include: {
        members: {
          where: {
            isActive: true,
          },

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
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!partner) {
      return NextResponse.json(
        {
          success: false,
          message: "طلب الشريك غير موجود.",
        },
        { status: 404 }
      );
    }

    if (
      partner.status !== "SUBMITTED" &&
      partner.status !== "UNDER_REVIEW" &&
      partner.status !== "NEEDS_COMPLETION"
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

    const now = new Date();

    const beforeData = {
      status: partner.status,
      reviewNotes: partner.reviewNotes,
      completionNotes: partner.completionNotes,
      reviewedAt: partner.reviewedAt,
      rejectedAt: partner.rejectedAt,
      commissionRate: partner.commissionRate?.toString() ?? null,
    };

    let nextStatus:
      | "NEEDS_COMPLETION"
      | "WAITING_AGREEMENT"
      | "REJECTED";

    if (action === "REQUEST_COMPLETION") {
      nextStatus = "NEEDS_COMPLETION";
    } else if (action === "SEND_AGREEMENT") {
      nextStatus = "WAITING_AGREEMENT";
    } else {
      nextStatus = "REJECTED";
    }

    const result = await prisma.$transaction(async (tx) => {
      if (action === "REQUEST_COMPLETION") {
        const updatedPartner = await tx.partner.update({
          where: {
            id: partner.id,
          },

          data: {
            status: "NEEDS_COMPLETION",
            completionNotes: notes,
            reviewNotes: null,
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

        return {
          partner: updatedPartner,
          agreement: null,
        };
      }

      if (action === "SEND_AGREEMENT") {
        const commissionRate =
          typeof body.commissionRate === "number"
            ? body.commissionRate
            : partner.commissionRate
              ? Number(partner.commissionRate)
              : null;

        if (
          commissionRate === null ||
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
          where: {
            id: partner.id,
          },

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

        return {
          partner: updatedPartner,
          agreement,
        };
      }

      const updatedPartner = await tx.partner.update({
        where: {
          id: partner.id,
        },

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

      return {
        partner: updatedPartner,
        agreement: null,
      };
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

    return NextResponse.json({
      success: true,
      message:
        action === "REQUEST_COMPLETION"
          ? "تم إرسال الطلب للاستكمال."
          : action === "SEND_AGREEMENT"
            ? "تم اعتماد المراجعة وإرسال الطلب إلى مرحلة الاتفاقية."
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
          sent: false,
          reason: "EMAIL_NOT_CONNECTED_YET",
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