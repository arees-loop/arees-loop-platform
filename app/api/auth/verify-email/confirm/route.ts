import { NextRequest, NextResponse } from "next/server";

import {
  AUTH_RATE_LIMITS,
  checkRateLimit,
  createIdentityRateLimitKey,
  createIpRateLimitKey,
  getRateLimitHeaders,
} from "@/lib/rate-limit";

import { verifyVerificationToken } from "@/lib/verification-token";

function databaseNotConfigured() {
  return NextResponse.json(
    {
      success: false,
      error: "DATABASE_NOT_CONFIGURED",
      message: "Database connection is not configured yet.",
    },
    { status: 503 },
  );
}

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase();
}

function normalizeCode(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidVerificationCode(code: string) {
  return /^\d{6}$/.test(code);
}

function rateLimitExceeded(
  retryAfterSeconds: number,
  headers: Record<string, string>,
) {
  return NextResponse.json(
    {
      success: false,
      error: "RATE_LIMIT_EXCEEDED",
      message:
        "Too many verification attempts. Please try again later.",
      retryAfterSeconds,
    },
    {
      status: 429,
      headers,
    },
  );
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return databaseNotConfigured();
  }

  try {
    /*
     * First protection layer:
     * Limit verification attempts by IP address.
     */
    const ipRateLimit = checkRateLimit({
      key: createIpRateLimitKey(
        "auth:verify-email:confirm:ip",
        request,
      ),
      ...AUTH_RATE_LIMITS.verificationConfirmByIp,
    });

    if (!ipRateLimit.allowed) {
      return rateLimitExceeded(
        ipRateLimit.retryAfterSeconds,
        getRateLimitHeaders(ipRateLimit),
      );
    }

    const body = await request.json();

    const email = normalizeEmail(body.email);
    const code = normalizeCode(body.code);

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "EMAIL_REQUIRED",
          message: "Email is required.",
        },
        {
          status: 400,
          headers: getRateLimitHeaders(ipRateLimit),
        },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_EMAIL",
          message: "Please provide a valid email address.",
        },
        {
          status: 400,
          headers: getRateLimitHeaders(ipRateLimit),
        },
      );
    }

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          error: "CODE_REQUIRED",
          message: "Verification code is required.",
        },
        {
          status: 400,
          headers: getRateLimitHeaders(ipRateLimit),
        },
      );
    }

    if (!isValidVerificationCode(code)) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_CODE_FORMAT",
          message:
            "Verification code must contain exactly 6 digits.",
        },
        {
          status: 400,
          headers: getRateLimitHeaders(ipRateLimit),
        },
      );
    }

    /*
     * Second protection layer:
     * Limit verification attempts by email identity.
     */
    const identityRateLimit = checkRateLimit({
      key: createIdentityRateLimitKey(
        "auth:verify-email:confirm:identity",
        email,
      ),
      ...AUTH_RATE_LIMITS.verificationConfirmByIdentity,
    });

    if (!identityRateLimit.allowed) {
      return rateLimitExceeded(
        identityRateLimit.retryAfterSeconds,
        getRateLimitHeaders(identityRateLimit),
      );
    }

    const { prisma } = await import("@/lib/prisma");

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        status: true,
        emailVerifiedAt: true,
      },
    });

    /*
     * Do not reveal whether the account exists.
     */
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_VERIFICATION",
          message:
            "The verification code is invalid or expired.",
        },
        {
          status: 400,
          headers: getRateLimitHeaders(identityRateLimit),
        },
      );
    }

    /*
     * Do not expose suspended or disabled account state.
     */
    if (
      user.status === "SUSPENDED" ||
      user.status === "DISABLED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_VERIFICATION",
          message:
            "The verification code is invalid or expired.",
        },
        {
          status: 400,
          headers: getRateLimitHeaders(identityRateLimit),
        },
      );
    }

    /*
     * If the email was already verified, make sure an account
     * still waiting only for email verification becomes active.
     */
    if (user.emailVerifiedAt) {
      if (user.status === "PENDING_VERIFICATION") {
        const activatedUser = await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            status: "ACTIVE",
          },
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            emailVerifiedAt: true,
            phoneVerifiedAt: true,
          },
        });

        return NextResponse.json(
          {
            success: true,
            message: "Email address is already verified.",
            data: {
              user: activatedUser,
            },
          },
          {
            headers: getRateLimitHeaders(identityRateLimit),
          },
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Email address is already verified.",
          data: {
            emailVerified: true,
            emailVerifiedAt: user.emailVerifiedAt,
          },
        },
        {
          headers: getRateLimitHeaders(identityRateLimit),
        },
      );
    }

    const verification = await verifyVerificationToken({
      userId: user.id,
      type: "EMAIL_VERIFICATION",
      token: code,
      target: user.email,
    });

    if (!verification.success) {
      if (verification.error === "MAX_ATTEMPTS_REACHED") {
        return NextResponse.json(
          {
            success: false,
            error: "MAX_ATTEMPTS_REACHED",
            message:
              "Maximum verification attempts reached. Request a new code.",
          },
          {
            status: 429,
            headers: getRateLimitHeaders(identityRateLimit),
          },
        );
      }

      if (verification.error === "TOKEN_EXPIRED") {
        return NextResponse.json(
          {
            success: false,
            error: "CODE_EXPIRED",
            message:
              "Verification code has expired. Request a new code.",
          },
          {
            status: 400,
            headers: getRateLimitHeaders(identityRateLimit),
          },
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "INVALID_VERIFICATION",
          message:
            "The verification code is invalid or expired.",
          ...("attemptsRemaining" in verification
            ? {
                data: {
                  attemptsRemaining:
                    verification.attemptsRemaining,
                },
              }
            : {}),
        },
        {
          status: 400,
          headers: getRateLimitHeaders(identityRateLimit),
        },
      );
    }

    const verifiedAt = new Date();

    /*
     * Successful email verification activates the user account.
     *
     * This activates the person's login account only.
     * Partner/business approval remains a separate workflow.
     */
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerifiedAt: verifiedAt,
        status: "ACTIVE",
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Email address verified successfully.",
        data: {
          user: updatedUser,
        },
      },
      {
        headers: getRateLimitHeaders(identityRateLimit),
      },
    );
  } catch (error) {
    console.error(
      "POST /api/auth/verify-email/confirm error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "EMAIL_VERIFICATION_FAILED",
        message: "Unable to verify email address.",
      },
      { status: 500 },
    );
  }
}