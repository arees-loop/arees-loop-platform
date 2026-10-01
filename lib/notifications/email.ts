import { Resend } from "resend";

export type EmailMessage = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

export type EmailDeliveryResult =
  | { sent: true; id: string | null }
  | { sent: false; reason: string };

function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey) {
    return { ok: false as const, reason: "RESEND_API_KEY_NOT_CONFIGURED" };
  }

  if (!from) {
    return { ok: false as const, reason: "RESEND_FROM_EMAIL_NOT_CONFIGURED" };
  }

  return { ok: true as const, apiKey, from };
}

export function getAdminNotificationEmails() {
  return (process.env.AREES_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

export async function sendEmail(
  message: EmailMessage
): Promise<EmailDeliveryResult> {
  const config = getEmailConfig();

  if (!config.ok) {
    console.warn("Email skipped:", config.reason);
    return { sent: false, reason: config.reason };
  }

  try {
    const resend = new Resend(config.apiKey);
    const result = await resend.emails.send({
      from: config.from,
      to: Array.isArray(message.to) ? message.to : [message.to],
      subject: message.subject,
      html: message.html,
      replyTo: message.replyTo,
    });

    if (result.error) {
      console.error("Resend delivery failed:", result.error);
      return { sent: false, reason: result.error.message };
    }

    return { sent: true, id: result.data?.id ?? null };
  } catch (error) {
    console.error("Email delivery failed:", error);
    return {
      sent: false,
      reason: error instanceof Error ? error.message : "EMAIL_DELIVERY_FAILED",
    };
  }
}
