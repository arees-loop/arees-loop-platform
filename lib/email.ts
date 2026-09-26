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