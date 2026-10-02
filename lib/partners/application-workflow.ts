import { prisma } from "@/lib/prisma";
import { notifyPartnerApplicationSubmitted } from "@/lib/notifications/partner-emails";
import { reviewPartnerApplicationWithAi } from "@/lib/partners/ai-review";

export type PartnerApplicationWorkflowInput = {
  partnerId: string;
  legalNameAr: string;
  tradeNameAr?: string | null;
  partnerEmail: string;
  status: string;
  previousStatus?: string | null;
};

export async function runPartnerApplicationWorkflow(
  input: PartnerApplicationWorkflowInput,
) {
  try {
    const aiReview = await reviewPartnerApplicationWithAi(
      input.partnerId,
    );

    const status =
      aiReview.outcome === "NEEDS_COMPLETION"
        ? "NEEDS_COMPLETION"
        : "UNDER_REVIEW";

    const nextAction =
      aiReview.outcome === "NEEDS_COMPLETION"
        ? "استكمل الملاحظات الموضحة ثم أعد إرسال الطلب للمراجعة."
        : aiReview.outcome === "MANUAL_REVIEW"
          ? "لا يلزم إجراء منك حالياً؛ الطلب يحتاج مراجعة بشرية من فريق Arees Loop."
          : "لا يلزم إجراء منك حالياً؛ تم تحويل الطلب للمراجعة الإدارية.";

    const notifications =
      await notifyPartnerApplicationSubmitted({
        partnerId: input.partnerId,
        legalNameAr: input.legalNameAr,
        tradeNameAr: input.tradeNameAr,
        partnerEmail: input.partnerEmail,
        status,
        previousStatus: input.previousStatus,
        nextAction,
        aiReview,
      });

    return {
      aiReview,
      status,
      notifications,
    };
  } catch (error) {
    const reason =
      error instanceof Error
        ? error.message
        : "PARTNER_AI_REVIEW_FAILED";

    console.error("Partner AI review failed:", {
      partnerId: input.partnerId,
      reason,
    });

    await prisma.$transaction(async (tx) => {
      await tx.partner.update({
        where: { id: input.partnerId },
        data: {
          status: "UNDER_REVIEW",
          reviewNotes: JSON.stringify({
            source: "ai",
            outcome: "MANUAL_REVIEW",
            error: reason,
            reviewedAt: new Date().toISOString(),
          }),
        },
      });

      await tx.auditLog.create({
        data: {
          action: "PARTNER_AI_REVIEW_FAILED",
          entityType: "Partner",
          entityId: input.partnerId,
          afterData: {
            status: "UNDER_REVIEW",
            reason,
          },
        },
      });
    });

    const notifications =
      await notifyPartnerApplicationSubmitted({
        partnerId: input.partnerId,
        legalNameAr: input.legalNameAr,
        tradeNameAr: input.tradeNameAr,
        partnerEmail: input.partnerEmail,
        status: "UNDER_REVIEW",
        previousStatus: input.previousStatus,
        nextAction:
          "لا يلزم إجراء منك حالياً؛ تم تحويل الطلب للمراجعة الإدارية.",
        aiReview: null,
      });

    return {
      aiReview: null,
      status: "UNDER_REVIEW",
      notifications,
      error: reason,
    };
  }
}
