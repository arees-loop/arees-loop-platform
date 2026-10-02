import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";
import {
  AUTH_RATE_LIMITS,
  checkRateLimit,
  createIdentityRateLimitKey,
  createIpRateLimitKey,
  getRateLimitHeaders,
} from "@/lib/rate-limit";
import { getCurrentSession } from "@/lib/session";
import {
  isSmsVerificationEnabled,
  normalizeSaudiMobile,
  sendPartnerContactVerificationSms,
} from "@/lib/sms";
import {
  createVerificationToken,
  revokeVerificationTokens,
} from "@/lib/verification-token";

function rateLimitExceeded(
  retryAfterSeconds: number,
  headers: Record<string, string>,
) {
  return NextResponse.json(
    {
      success: false,
      error: "RATE_LIMIT_EXCEEDED",
      message:
        "تمت محاولات كثيرة لإرسال رمز التحقق. حاول مرة أخرى بعد قليل.",
      retryAfterSeconds,
    },
    {
      status: 429,
      headers,
    },
  );
}

export async function POST(
  request: NextRequest,
) {
  if (!isSmsVerificationEnabled()) {
    return NextResponse.json(
      {
        success: false,
        enabled: false,
        error:
          "SMS_VERIFICATION_DISABLED",
        message:
          "التحقق عبر الجوال غير مفعّل حالياً.",
      },
      { status: 503 },
    );
  }

  const session =
    await getCurrentSession();

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        error: "AUTH_REQUIRED",
        message:
          "يجب تسجيل الدخول أولاً.",
      },
      { status: 401 },
    );
  }

  if (
    session.user.role !==
      "PARTNER_OWNER" &&
    session.user.role !==
      "PARTNER_ADMIN"
  ) {
    return NextResponse.json(
      {
        success: false,
        error:
          "PARTNER_ROLE_REQUIRED",
        message:
          "هذا الحساب غير مخول للتحقق من بيانات الشريك.",
      },
      { status: 403 },
    );
  }

  const ipRateLimit =
    checkRateLimit({
      key: createIpRateLimitKey(
        "partner:contact-phone:request:ip",
        request,
      ),
      ...AUTH_RATE_LIMITS
        .verificationRequestByIp,
    });

  if (!ipRateLimit.allowed) {
    return rateLimitExceeded(
      ipRateLimit.retryAfterSeconds,
      getRateLimitHeaders(
        ipRateLimit,
      ),
    );
  }

  const body =
    await request.json();

  const phone =
    normalizeSaudiMobile(
      body.phone,
    );

  if (!phone) {
    return NextResponse.json(
      {
        success: false,
        error:
          "INVALID_SAUDI_MOBILE",
        message:
          "أدخل رقم جوال سعودي صحيحاً.",
      },
      {
        status: 400,
        headers:
          getRateLimitHeaders(
            ipRateLimit,
          ),
      },
    );
  }

  const identityRateLimit =
    checkRateLimit({
      key:
        createIdentityRateLimitKey(
          "partner:contact-phone:request:identity",
          phone,
        ),
      ...AUTH_RATE_LIMITS
        .verificationRequestByIdentity,
    });

  if (
    !identityRateLimit.allowed
  ) {
    return rateLimitExceeded(
      identityRateLimit
        .retryAfterSeconds,
      getRateLimitHeaders(
        identityRateLimit,
      ),
    );
  }

  const existing =
    await prisma.partnerContactVerification.findUnique({
      where: {
        userId: session.user.id,
      },
    });

  if (
    existing?.phone === phone &&
    existing.verifiedAt
  ) {
    return NextResponse.json(
      {
        success: true,
        alreadyVerified: true,
        message:
          "رقم مسؤول التواصل موثّق مسبقاً.",
        data: {
          phone,
          verifiedAt:
            existing.verifiedAt,
        },
      },
      {
        headers:
          getRateLimitHeaders(
            identityRateLimit,
          ),
      },
    );
  }

  await prisma.partnerContactVerification.upsert({
    where: {
      userId: session.user.id,
    },
    create: {
      userId: session.user.id,
      phone,
      verifiedAt: null,
    },
    update: {
      phone,
      verifiedAt: null,
    },
  });

  const verification =
    await createVerificationToken({
      userId: session.user.id,
      type:
        "PARTNER_CONTACT_PHONE_VERIFICATION",
      target: phone,
    });

  try {
    await sendPartnerContactVerificationSms({
      to: phone,
      code: verification.token,
    });
  } catch (error) {
    await revokeVerificationTokens(
      session.user.id,
      "PARTNER_CONTACT_PHONE_VERIFICATION",
    );

    console.error(
      "Msegat partner contact SMS failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "SMS_DELIVERY_FAILED",
        message:
          "تعذر إرسال رمز التحقق حالياً.",
      },
      {
        status: 502,
        headers:
          getRateLimitHeaders(
            identityRateLimit,
          ),
      },
    );
  }

  return NextResponse.json(
    {
      success: true,
      message:
        "تم إرسال رمز التحقق.",
      data: {
        phone,
        expiresAt:
          verification.expiresAt,
      },
    },
    {
      headers:
        getRateLimitHeaders(
          identityRateLimit,
        ),
    },
  );
}
