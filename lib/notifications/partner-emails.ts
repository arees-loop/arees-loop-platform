import { getAdminNotificationEmails, sendEmail } from "@/lib/notifications/email";

type PartnerApplicationNotice = {
  partnerId: string;
  legalNameAr: string;
  tradeNameAr?: string | null;
  partnerEmail: string;
  submittedAt?: Date | null;
};

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

export async function notifyPartnerApplicationSubmitted(
  input: PartnerApplicationNotice
) {
  const displayName = input.tradeNameAr?.trim() || input.legalNameAr;

  const partnerResult = await sendEmail({
    to: input.partnerEmail,
    subject: "تم استلام طلب الشراكة — Arees Loop",
    html: shell(
      "تم استلام طلبكم",
      `<p>مرحباً <strong>${escapeHtml(displayName)}</strong>،</p>
       <p>تم استلام طلب الانضمام إلى Arees Loop بنجاح، وهو الآن قيد التدقيق والمراجعة.</p>
       <p>سنرسل لكم أي طلب استكمال أو تحديث على حالة الطلب عبر البريد الإلكتروني.</p>
       <p><strong>رقم الطلب:</strong> ${escapeHtml(input.partnerId)}</p>`
    ),
  });

  const adminEmails = getAdminNotificationEmails();
  const adminResult =
    adminEmails.length === 0
      ? { sent: false as const, reason: "AREES_ADMIN_EMAILS_NOT_CONFIGURED" }
      : await sendEmail({
          to: adminEmails,
          subject: `طلب شريك جديد يحتاج مراجعة — ${displayName}`,
          html: shell(
            "طلب شريك جديد",
            `<p>تم استلام طلب شراكة جديد ويحتاج إلى المراجعة.</p>
             <p><strong>الاسم القانوني:</strong> ${escapeHtml(input.legalNameAr)}</p>
             <p><strong>الاسم التجاري:</strong> ${escapeHtml(displayName)}</p>
             <p><strong>رقم الطلب:</strong> ${escapeHtml(input.partnerId)}</p>
             <p><strong>الحالة:</strong> تحت التدقيق</p>
             <p>سيتم إرفاق خلاصة مراجعة الذكاء الاصطناعي في هذا الإشعار بعد تفعيل محرك AI Review.</p>`
          ),
        });

  return { partner: partnerResult, admin: adminResult };
}
