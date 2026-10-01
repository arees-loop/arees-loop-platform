import { getAdminNotificationEmails, sendEmail } from "@/lib/notifications/email";

type PartnerApplicationNotice = {
  partnerId: string;
  legalNameAr: string;
  tradeNameAr?: string | null;
  partnerEmail: string;
  status: string;
  previousStatus?: string | null;
  nextAction?: string | null;
  submittedAt?: Date | null;
};

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "تم استلام الطلب",
  UNDER_REVIEW: "قيد المراجعة",
  NEEDS_COMPLETION: "مطلوب استكمال",
  NEEDS_INFO: "مطلوب استكمال",
  PRE_APPROVED: "موافقة مبدئية",
  WAITING_AGREEMENT: "بانتظار موافقة الشريك على الاتفاقية",
  AWAITING_PARTNER_ACCEPTANCE: "بانتظار موافقة الشريك على الاتفاقية",
  AGREEMENT_ACCEPTED: "تم قبول الاتفاقية",
  PARTNER_ACCEPTED: "تم قبول الاتفاقية",
  ACTIVE: "معتمد ونشط",
  REJECTED: "مرفوض",
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
  <div dir="rtl" style="font-family:Arial,sans-serif;max-width:640px;margin:auto;line-height:1.8;color:#17201d">
    <h2 style="margin-bottom:8px">${escapeHtml(title)}</h2>
    ${body}
    <hr style="border:0;border-top:1px solid #e7e7e7;margin:24px 0" />
    <p style="font-size:12px;color:#6b7280">Arees Loop — إشعار آلي من منصة الشركاء.</p>
  </div>`;

function statusBlock(input: PartnerApplicationNotice) {
  const current = partnerStatusLabel(input.status);
  const previous = input.previousStatus
    ? `<p><strong>الحالة السابقة:</strong> ${escapeHtml(partnerStatusLabel(input.previousStatus))}</p>`
    : "";
  const action = input.nextAction?.trim()
    ? `<p><strong>الإجراء المطلوب الآن:</strong> ${escapeHtml(input.nextAction.trim())}</p>`
    : "";

  return `${previous}<p><strong>حالة الطلب الحالية:</strong> ${escapeHtml(current)}</p>${action}`;
}

export async function notifyPartnerApplicationSubmitted(
  input: PartnerApplicationNotice
) {
  const displayName = input.tradeNameAr?.trim() || input.legalNameAr;

  const partnerResult = await sendEmail({
    to: input.partnerEmail,
    subject: `تحديث طلب الشراكة — ${partnerStatusLabel(input.status)} — Arees Loop`,
    html: shell(
      "تحديث طلب الشراكة",
      `<p>مرحباً <strong>${escapeHtml(displayName)}</strong>،</p>
       <p>تم استلام طلب الانضمام إلى Arees Loop بنجاح.</p>
       <p><strong>رقم الطلب:</strong> ${escapeHtml(input.partnerId)}</p>
       ${statusBlock(input)}
       <p>سنرسل لكم أي تحديث جديد على الطلب عبر البريد الإلكتروني.</p>`
    ),
  });

  const adminEmails = getAdminNotificationEmails();
  const adminResult =
    adminEmails.length === 0
      ? { sent: false as const, reason: "AREES_ADMIN_EMAILS_NOT_CONFIGURED" }
      : await sendEmail({
          to: adminEmails,
          subject: `طلب شريك — ${partnerStatusLabel(input.status)} — ${displayName}`,
          html: shell(
            "تحديث طلب شريك",
            `<p>يوجد طلب شريك جديد أو تحديث على طلب قائم.</p>
             <p><strong>الاسم القانوني:</strong> ${escapeHtml(input.legalNameAr)}</p>
             <p><strong>الاسم التجاري:</strong> ${escapeHtml(displayName)}</p>
             <p><strong>رقم الطلب:</strong> ${escapeHtml(input.partnerId)}</p>
             ${statusBlock(input)}
             <p>سيظهر تقرير مراجعة الذكاء الاصطناعي هنا بعد تشغيل AI Review لهذا الطلب.</p>`
          ),
        });

  return { partner: partnerResult, admin: adminResult };
}
