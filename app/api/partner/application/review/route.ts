import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { runPartnerApplicationWorkflow } from "@/lib/partners/application-workflow";
import {
  checkRateLimit,
  createIdentityRateLimitKey,
  getRateLimitHeaders,
} from "@/lib/rate-limit";

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
          message: "هذا الحساب غير مخول لإرسال طلب الشراكة للمراجعة.",
        },
        { status: 403 },
      );
    }

    const limit = checkRateLimit({
      key: createIdentityRateLimitKey(
        "partner-ai-review",
        session.user.id,
      ),
      limit: 4,
      windowMs: 1000 * 60 * 15,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message:
            "تم طلب المراجعة عدة مرات خلال وقت قصير. حاول مرة أخرى بعد قليل.",
        },
        {
          status: 429,
          headers: getRateLimitHeaders(limit),
        },
      );
    }

    const membership = await prisma.partnerMember.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      include: {
        partner: {
          include: {
            documents: {
              select: {
                id: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

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

    if (
      partner.status === "ACTIVE" ||
      partner.status === "APPROVED" ||
      partner.status === "WAITING_AGREEMENT" ||
      partner.status === "AGREEMENT_ACCEPTED" ||
      partner.status === "REJECTED" ||
      partner.status === "SUSPENDED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "حالة الطلب الحالية لا تسمح بإعادة تشغيل المراجعة الآلية.",
        },
        { status: 409 },
      );
    }

    if (partner.documents.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "يجب رفع مستند واحد على الأقل قبل بدء المراجعة الآلية.",
        },
        { status: 400 },
      );
    }

    const previousStatus = partner.status;

    const workflow = await runPartnerApplicationWorkflow({
      partnerId: partner.id,
      legalNameAr: partner.legalNameAr,
      tradeNameAr: partner.tradeNameAr,
      partnerEmail: session.user.email,
      status: previousStatus,
      previousStatus,
    });

    const responseMessage =
      workflow.status === "NEEDS_COMPLETION"
        ? "اكتملت المراجعة الآلية ويوجد استكمال مطلوب."
        : workflow.aiReview?.outcome === "MANUAL_REVIEW"
          ? "اكتملت المراجعة الآلية وتم تحويل الطلب لمراجعة بشرية."
          : "اكتملت المراجعة الآلية وتم تحويل الطلب للمراجعة الإدارية.";

    return NextResponse.json(
      {
        success: true,
        message: responseMessage,
        application: {
          id: partner.id,
          status: workflow.status,
        },
        review: workflow.aiReview
          ? {
              outcome: workflow.aiReview.outcome,
              summary: workflow.aiReview.summary,
              partnerMessage: workflow.aiReview.partnerMessage,
              issues: workflow.aiReview.issues,
            }
          : {
              outcome: "MANUAL_REVIEW",
              summary:
                "تعذر إكمال المراجعة الآلية وتم تحويل الطلب للمراجعة الإدارية.",
              partnerMessage:
                "تم استلام طلبكم وتحويله للمراجعة الإدارية.",
              issues: [],
            },
      },
      {
        status: 200,
        headers: getRateLimitHeaders(limit),
      },
    );
  } catch (error) {
    console.error(
      "POST /api/partner/application/review failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "تعذر تشغيل المراجعة الآلية حالياً. تم حفظ الطلب ويمكن إعادة المحاولة.",
      },
      { status: 500 },
    );
  }
}
