import {
  getAdminNotificationEmails,
  sendEmail,
} from "@/lib/notifications/email";
import type { PartnerAiReviewResult } from "@/lib/partners/ai-review";

type PartnerApplicationNotice = {
  partnerId: string;
  legalNameAr: string;
  tradeNameAr?: string | null;
  partnerEmail: string;
  status: string;
  previousStatus?: string | null;
  nextAction?: string | null;
  submittedAt?: Date | null;
  aiReview?: PartnerAiReviewResult | null;
};

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "تم استلام الطلب",
  UNDER_REVIEW: "تمت المراجعة الآلية وتحويل الطلب للإدارة",
  NEEDS_COMPLETION: "مطلوب استكمال",
  NEEDS_INFO: "مطلوب استكمال",
  WAITING_AGREEMENT: "بانتظار موافقة الشريك على الاتفاقية",
  AWAITING_PARTNER_ACCEPTANCE: "بانتظار موافقة الشريك على الاتفاقية",
  AGREEMENT_ACCEPTED: "تم قبول الاتفاقية",
  PARTNER_ACCEPTED: "تم قبول الاتفاقية",
  APPROVED: "معتمد",
  ACTIVE: "معتمد ونشط",
  REJECTED: "مرفوض",
};

const OUTCOME_LABELS: Record<string, string> = {
  READY: "جاهز للمراجعة الإدارية",
  NEEDS_COMPLETION: "يحتاج استكمال",
  MANUAL_REVIEW: "يحتاج مراجعة بشرية",
};

export function partnerStatusLabel(status: string) {
  return STATUS_LABELS[status] ?? status;
}

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const shell = (title: string, body: string) => `
  <div dir="rtl" style="font-family:Arial,sans-serif;max-width:680px;margin:auto;line-height:1.8;color:#17201d">
    <h2 style="margin-bottom:8px">${escapeHtml(title)}</h2>
    ${body}
    <hr style="border:0;border-top:1px solid #e7e7e7;margin:24px 0" />
    <p style="font-size:12px;color:#6b7280">Arees Loop — إشعار آلي من منصة الشركاء.</p>
  </div>`;

function statusBlock(input: PartnerApplicationNotice) {
  const current = partnerStatusLabel(input.status);
  const previous = input.previousStatus
    ? `<p><strong>الحالة السابقة:</strong> ${escapeHtml(
        partnerStatusLabel(input.previousStatus),
      )}</p>`
    : "";
  const action = input.nextAction?.trim()
    ? `<p><strong>الإجراء المطلوب الآن:</strong> ${escapeHtml(
        input.nextAction.trim(),
      )}</p>`
    : "";

  return `${previous}<p><strong>حالة الطلب الحالية:</strong> ${escapeHtml(
    current,
  )}</p>${action}`;
}

function partnerIssuesBlock(review?: PartnerAiReviewResult | null) {
  if (!review?.issues.length) return "";

  const actionable = review.issues
    .filter((issue) => issue.severity === "ERROR")
    .map(
      (issue) =>
        `<li style="margin-bottom:8px"><strong>${escapeHtml(
          issue.message,
        )}</strong>${
          issue.requestedAction
            ? ` — ${escapeHtml(issue.requestedAction)}`
            : ""
        }</li>`,
    )
    .join("");

  if (!actionable) return "";

  return `<div style="margin:18px 0;padding:14px 18px;background:#fff8e8;border-radius:12px">
    <strong>المطلوب استكماله:</strong>
    <ul style="margin:8px 0 0;padding-right:20px">${actionable}</ul>
  </div>`;
}

function adminReviewBlock(review?: PartnerAiReviewResult | null) {
  if (!review) {
    return `<p><strong>تقرير الذكاء الاصطناعي:</strong> غير متاح.</p>`;
  }

  const issues = review.issues.length
    ? `<ul style="padding-right:20px">${review.issues
        .map(
          (issue) =>
            `<li style="margin-bottom:8px"><strong>[${escapeHtml(
              issue.severity,
            )}] ${escapeHtml(issue.message)}</strong>${
              issue.requestedAction
                ? ` — الإجراء: ${escapeHtml(issue.requestedAction)}`
                : ""
            }</li>`,
        )
        .join("")}</ul>`
    : "<p>لم يرصد النظام ملاحظات واضحة.</p>";

  const documents = review.documentResults.length
    ? `<ul style="padding-right:20px">${review.documentResults
        .map(
          (document) =>
            `<li><strong>${escapeHtml(
              document.documentId,
            )}:</strong> ${escapeHtml(document.status)}${
              document.notes
                ? ` — ${escapeHtml(document.notes)}`
                : ""
            }</li>`,
        )
        .join("")}</ul>`
    : "<p>لا توجد نتائج مستندات قابلة للعرض.</p>";

  return `
    <div style="margin:18px 0;padding:16px 18px;background:#f4f6f5;border-radius:12px">
      <p><strong>نتيجة AI:</strong> ${escapeHtml(
        OUTCOME_LABELS[review.outcome] ?? review.outcome,
      )}</p>
      <p><strong>الملخص:</strong> ${escapeHtml(review.summary)}</p>
      <p><strong>ملاحظة للإدارة:</strong> ${escapeHtml(
        review.adminMessage,
      )}</p>
      <p><strong>الملاحظات:</strong></p>
      ${issues}
      <p><strong>نتائج قراءة المستندات:</strong></p>
      ${documents}
      <p style="font-size:12px;color:#6b7280">النموذج: ${escapeHtml(
        review.model,
      )} — هذه مراجعة مساعدة وليست قرار اعتماد نهائي.</p>
    </div>
  `;
}

export async function notifyPartnerApplicationSubmitted(
  input: PartnerApplicationNotice,
) {
  const displayName =
    input.tradeNameAr?.trim() || input.legalNameAr;

  const partnerSubject =
    input.aiReview?.outcome === "NEEDS_COMPLETION"
      ? "مطلوب استكمال طلب الشراكة — Arees Loop"
      : "تمت مراجعة طلب الشراكة — Arees Loop";

  const partnerResult = await sendEmail({
    to: input.partnerEmail,
    subject: partnerSubject,
    html: shell(
      input.aiReview?.outcome === "NEEDS_COMPLETION"
        ? "نحتاج استكمال طلب الشراكة"
        : "اكتملت المراجعة الآلية لطلب الشراكة",
      `<p>مرحباً <strong>${escapeHtml(displayName)}</strong>،</p>
       <p><strong>رقم الطلب:</strong> ${escapeHtml(input.partnerId)}</p>
       ${statusBlock(input)}
       ${
         input.aiReview
           ? `<p>${escapeHtml(input.aiReview.partnerMessage)}</p>`
           : ""
       }
       ${partnerIssuesBlock(input.aiReview)}
       <p>سيصلكم أي تحديث لاحق على الطلب عبر البريد الإلكتروني.</p>`,
    ),
  });

  const adminEmails = getAdminNotificationEmails();
  const adminResult =
    adminEmails.length === 0
      ? {
          sent: false as const,
          reason: "AREES_ADMIN_EMAILS_NOT_CONFIGURED",
        }
      : await sendEmail({
          to: adminEmails,
          subject: `مراجعة طلب شريك — ${partnerStatusLabel(
            input.status,
          )} — ${displayName}`,
          html: shell(
            "تقرير مراجعة طلب شريك",
            `<p><strong>الاسم القانوني:</strong> ${escapeHtml(
              input.legalNameAr,
            )}</p>
             <p><strong>الاسم التجاري:</strong> ${escapeHtml(
               displayName,
             )}</p>
             <p><strong>رقم الطلب:</strong> ${escapeHtml(
               input.partnerId,
             )}</p>
             ${statusBlock(input)}
             ${adminReviewBlock(input.aiReview)}
             <p><strong>تنبيه:</strong> التقرير الآلي أداة مساعدة، والقرار الإداري النهائي يبقى لدى فريق Arees Loop.</p>`,
          ),
        });

  return { partner: partnerResult, admin: adminResult };
}
