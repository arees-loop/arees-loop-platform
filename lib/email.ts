import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  return new Resend(apiKey);
}

function getEmailFrom() {
  return (
    process.env.EMAIL_FROM ||
    "Arees Loop <no-reply@areesloop.com>"
  );
}

type SendVerificationEmailInput = {
  to: string;
  code: string;
  expiresAt: Date;
};

export async function sendVerificationEmail({
  to,
  code,
  expiresAt,
}: SendVerificationEmailInput) {
  const resend = getResendClient();

  const { data, error } = await resend.emails.send({
    from: getEmailFrom(),
    to: [to],
    subject: "رمز التحقق | Arees Loop Verification Code",
    html: `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>

        <body
          style="
            margin:0;
            padding:0;
            background:#f5f1e8;
            font-family:Arial,Helvetica,sans-serif;
            color:#0d3b34;
          "
        >
          <div style="padding:40px 16px;">
            <div
              style="
                max-width:560px;
                margin:0 auto;
                background:#ffffff;
                border-radius:24px;
                padding:36px 28px;
                text-align:center;
              "
            >
              <div
                style="
                  color:#b99124;
                  font-size:12px;
                  font-weight:700;
                  letter-spacing:2px;
                "
              >
                Arees Loop
              </div>

              <h1
                style="
                  margin:18px 0 8px;
                  font-size:26px;
                  color:#0d3b34;
                "
              >
                رمز التحقق
              </h1>

              <p
                style="
                  margin:0;
                  font-size:14px;
                  line-height:1.9;
                  color:#5b6f6a;
                "
              >
                استخدم الرمز التالي لإكمال التحقق من بريدك الإلكتروني.
              </p>

              <div
                dir="ltr"
                style="
                  margin:28px auto;
                  padding:18px 20px;
                  max-width:280px;
                  border-radius:18px;
                  background:#0d3b34;
                  color:#ffffff;
                  font-size:32px;
                  font-weight:700;
                  letter-spacing:8px;
                "
              >
                ${code}
              </div>

              <p
                style="
                  margin:0;
                  font-size:13px;
                  line-height:1.8;
                  color:#71807c;
                "
              >
                الرمز صالح لمدة 10 دقائق.
                <br />
                إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة.
              </p>

              <div
                style="
                  margin:30px 0;
                  height:1px;
                  background:#ece8df;
                "
              ></div>

              <div dir="ltr">
                <h2
                  style="
                    margin:0 0 8px;
                    font-size:20px;
                    color:#0d3b34;
                  "
                >
                  Verification Code
                </h2>

                <p
                  style="
                    margin:0;
                    font-size:13px;
                    line-height:1.8;
                    color:#71807c;
                  "
                >
                  Use the code above to verify your email address.
                  <br />
                  This code expires in 10 minutes.
                </p>
              </div>

              <p
                style="
                  margin:30px 0 0;
                  font-size:11px;
                  color:#9a9a94;
                "
              >
                © ${new Date().getFullYear()} Arees Loop
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    throw new Error(
      `Resend email failed: ${error.message}`,
    );
  }

  return {
    id: data?.id ?? null,
    expiresAt,
  };
}

type PartnerApplicationNotificationType =
  | "REQUEST_COMPLETION"
  | "SEND_AGREEMENT"
  | "REJECT"
  | "APPROVED"
  | "ACTIVE";

type SendPartnerApplicationNotificationInput = {
  to: string;
  type: PartnerApplicationNotificationType;
  partnerName: string;
  notes?: string | null;
  applicationUrl?: string | null;
};

export async function sendPartnerApplicationNotification({
  to,
  type,
  partnerName,
  notes,
  applicationUrl,
}: SendPartnerApplicationNotificationInput) {
  const resend = getResendClient();

  const content = {
    REQUEST_COMPLETION: {
      subject: "تحديث على طلب الانضمام كشريك | Arees Loop",
      title: "طلب استكمال بيانات",
      message:
        "تمت مراجعة طلب الانضمام الخاص بكم، ونحتاج إلى استكمال بعض البيانات أو المتطلبات قبل مواصلة إجراءات المراجعة.",
    },

    SEND_AGREEMENT: {
      subject: "تمت مراجعة طلب الشراكة | Arees Loop",
      title: "انتقل طلبكم إلى مرحلة الاتفاقية",
      message:
        "تمت مراجعة طلب الانضمام بنجاح، وانتقل الطلب إلى مرحلة مراجعة وقبول شروط واتفاقية الشراكة.",
    },

    REJECT: {
      subject: "تحديث على طلب الانضمام كشريك | Arees Loop",
      title: "تحديث حالة طلب الشراكة",
      message:
        "تم الانتهاء من مراجعة طلب الانضمام، ويمكنكم الاطلاع على تفاصيل القرار من خلال حسابكم في Arees Loop.",
    },

    APPROVED: {
      subject: "اعتماد طلب الشراكة | Arees Loop",
      title: "تم اعتماد طلب الشراكة",
      message:
        "تم اعتماد طلب الشراكة بعد استكمال المتطلبات والإجراءات اللازمة.",
    },

    ACTIVE: {
      subject: "تم تفعيل حساب الشريك | Arees Loop",
      title: "حساب الشريك أصبح فعالاً",
      message:
        "تم تفعيل حساب الشريك في Arees Loop، ويمكنكم الآن الدخول إلى بوابة الشركاء والاستفادة من الخدمات المتاحة.",
    },
  }[type];

  const safePartnerName = escapeHtml(partnerName);
  const safeNotes = notes ? escapeHtml(notes) : null;
  const safeUrl = applicationUrl
    ? escapeHtml(applicationUrl)
    : null;

  const { data, error } = await resend.emails.send({
    from: getEmailFrom(),
    to: [to],
    subject: content.subject,
    html: `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </head>

        <body
          style="
            margin:0;
            padding:0;
            background:#f5f1e8;
            font-family:Arial,Helvetica,sans-serif;
            color:#0d3b34;
          "
        >
          <div style="padding:40px 16px;">
            <div
              style="
                max-width:600px;
                margin:0 auto;
                background:#ffffff;
                border-radius:24px;
                padding:36px 28px;
              "
            >
              <div
                style="
                  text-align:center;
                  color:#b99124;
                  font-size:12px;
                  font-weight:700;
                  letter-spacing:2px;
                "
              >
                AREES LOOP
              </div>

              <h1
                style="
                  margin:18px 0 12px;
                  text-align:center;
                  font-size:25px;
                  color:#0d3b34;
                "
              >
                ${content.title}
              </h1>

              <p
                style="
                  margin:24px 0 8px;
                  font-size:15px;
                  line-height:1.9;
                "
              >
                السلام عليكم،
              </p>

              <p
                style="
                  margin:0 0 18px;
                  font-size:15px;
                  line-height:1.9;
                "
              >
                بخصوص طلب الشراكة المسجل باسم
                <strong>${safePartnerName}</strong>:
              </p>

              <p
                style="
                  margin:0;
                  font-size:15px;
                  line-height:1.9;
                  color:#526761;
                "
              >
                ${content.message}
              </p>

              ${
                safeNotes
                  ? `
                    <div
                      style="
                        margin:24px 0;
                        padding:18px;
                        border-radius:16px;
                        background:#f7f5ef;
                        border:1px solid #ebe4d3;
                      "
                    >
                      <div
                        style="
                          margin-bottom:8px;
                          font-size:13px;
                          font-weight:700;
                          color:#0d3b34;
                        "
                      >
                        ملاحظات الإدارة
                      </div>

                      <div
                        style="
                          font-size:14px;
                          line-height:1.9;
                          color:#526761;
                          white-space:pre-wrap;
                        "
                      >
                        ${safeNotes}
                      </div>
                    </div>
                  `
                  : ""
              }

              ${
                safeUrl
                  ? `
                    <div
                      style="
                        text-align:center;
                        margin:30px 0 10px;
                      "
                    >
                      <a
                        href="${safeUrl}"
                        style="
                          display:inline-block;
                          padding:14px 24px;
                          border-radius:14px;
                          background:#0d3b34;
                          color:#ffffff;
                          text-decoration:none;
                          font-size:14px;
                          font-weight:700;
                        "
                      >
                        عرض حالة الطلب
                      </a>
                    </div>
                  `
                  : ""
              }

              <div
                style="
                  margin:30px 0 20px;
                  height:1px;
                  background:#ece8df;
                "
              ></div>

              <p
                style="
                  margin:0;
                  text-align:center;
                  font-size:12px;
                  line-height:1.8;
                  color:#8b9692;
                "
              >
                هذه رسالة آلية متعلقة بطلب الشراكة في Arees Loop.
                <br />
                يرجى الدخول إلى حسابكم للاطلاع على أحدث حالة للطلب.
              </p>

              <p
                style="
                  margin:24px 0 0;
                  text-align:center;
                  font-size:11px;
                  color:#aaa69e;
                "
              >
                © ${new Date().getFullYear()} Arees Loop
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    throw new Error(
      `Resend partner notification failed: ${error.message}`,
    );
  }

  return {
    id: data?.id ?? null,
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}