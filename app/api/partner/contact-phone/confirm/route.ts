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
} from "@/lib/sms";
import { verifyVerificationToken } from "@/lib/verification-token";

function rateLimitExceeded(
  retryAfterSeconds: number,
  headers: Record<string, string>,
) {
  return NextResponse.json(
    {
      success: false,
      error: "RATE_LIMIT_EXCEEDED",
      message:
        "تمت محاولات تحقق كثيرة. حاول مرة أخرى بعد قليل.",
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
        "partner:contact-phone:confirm:ip",
        request,
      ),
      ...AUTH_RATE_LIMITS
        .verificationConfirmByIp,
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
  const code =
    typeof body.code === "string"
      ? body.code.trim()
      : "";

  if (!phone) {
    return NextResponse.json(
      {
        success: false,
        error:
          "INVALID_SAUDI_MOBILE",
        message:
          "أدخل رقم جوال سعودي صحيحاً.",
      },
      { status: 400 },
    );
  }

  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json(
      {
        success: false,
        error:
          "INVALID_CODE_FORMAT",
        message:
          "رمز التحقق يجب أن يتكون من 6 أرقام.",
      },
      { status: 400 },
    );
  }

  const identityRateLimit =
    checkRateLimit({
      key:
        createIdentityRateLimitKey(
          "partner:contact-phone:confirm:identity",
          phone,
        ),
      ...AUTH_RATE_LIMITS
        .verificationConfirmByIdentity,
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

  const pending =
    await prisma.partnerContactVerification.findUnique({
      where: {
        userId: session.user.id,
      },
    });

  if (
    !pending ||
    pending.phone !== phone
  ) {
    return NextResponse.json(
      {
        success: false,
        error:
          "VERIFICATION_TARGET_MISMATCH",
        message:
          "اطلب رمز تحقق جديداً لهذا الرقم.",
      },
      {
        status: 400,
        headers:
          getRateLimitHeaders(
            identityRateLimit,
          ),
      },
    );
  }

  const verification =
    await verifyVerificationToken({
      userId: session.user.id,
      type:
        "PARTNER_CONTACT_PHONE_VERIFICATION",
      token: code,
      target: phone,
    });

  if (!verification.success) {
    const messages: Record<
      string,
      string
    > = {
      TOKEN_EXPIRED:
        "انتهت صلاحية الرمز. اطلب رمزاً جديداً.",
      MAX_ATTEMPTS_REACHED:
        "تم تجاوز عدد المحاولات. اطلب رمزاً جديداً.",
      INVALID_TOKEN:
        "رمز التحقق غير صحيح.",
      TOKEN_NOT_FOUND:
        "اطلب رمز تحقق جديداً.",
      TOKEN_TARGET_MISMATCH:
        "اطلب رمز تحقق جديداً لهذا الرقم.",
    };

    return NextResponse.json(
      {
        success: false,
        error:
          verification.error,
        message:
          messages[
            verification.error
          ] ||
          "تعذر التحقق من الرمز.",
      },
      {
        status:
          verification.error ===
          "MAX_ATTEMPTS_REACHED"
            ? 429
            : 400,
        headers:
          getRateLimitHeaders(
            identityRateLimit,
          ),
      },
    );
  }

  const verifiedAt =
    new Date();

  const record =
    await prisma.partnerContactVerification.update({
      where: {
        userId: session.user.id,
      },
      data: {
        verifiedAt,
      },
    });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action:
        "PARTNER_CONTACT_PHONE_VERIFIED",
      entityType:
        "PartnerContactVerification",
      entityId: record.id,
      afterData: {
        phone,
        verifiedAt:
          verifiedAt.toISOString(),
      },
    },
  });

  return NextResponse.json(
    {
      success: true,
      message:
        "تم توثيق رقم مسؤول التواصل.",
      data: {
        phone,
        verifiedAt,
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
