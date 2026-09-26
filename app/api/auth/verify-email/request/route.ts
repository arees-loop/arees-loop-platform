import { NextRequest, NextResponse } from "next/server";

import {
  AUTH_RATE_LIMITS,
  checkRateLimit,
  createIdentityRateLimitKey,
  createIpRateLimitKey,
  getRateLimitHeaders,
} from "@/lib/rate-limit";

import { sendVerificationEmail } from "@/lib/email";
import { createVerificationToken } from "@/lib/verification-token";

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

function emailNotConfigured() {
  return NextResponse.json(
    {
      success: false,
      error: "EMAIL_NOT_CONFIGURED",
      message: "Email delivery is not configured yet.",
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

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
        "Too many verification requests. Please try again later.",
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

  if (
    !process.env.RESEND_API_KEY ||
    !process.env.EMAIL_FROM
  ) {
    return emailNotConfigured();
  }

  try {
    /*
     * First protection layer:
     * Limit requests by IP address.
     */
    const ipRateLimit = checkRateLimit({
      key: createIpRateLimitKey(
        "auth:verify-email:request:ip",
        request,
      ),
      ...AUTH_RATE_LIMITS.verificationRequestByIp,
    });

    if (!ipRateLimit.allowed) {
      return rateLimitExceeded(
        ipRateLimit.retryAfterSeconds,
        getRateLimitHeaders(ipRateLimit),
      );
    }

    const body = await request.json();
    const email = normalizeEmail(body.email);

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

    /*
     * Second protection layer:
     * Limit requests by email identity.
     */
    const identityRateLimit = checkRateLimit({
      key: createIdentityRateLimitKey(
        "auth:verify-email:request:identity",
        email,
      ),
      ...AUTH_RATE_LIMITS.verificationRequestByIdentity,
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
          success: true,
          message:
            "If an eligible account exists, a verification code will be sent.",
        },
        {
          headers: getRateLimitHeaders(identityRateLimit),
        },
      );
    }

    /*
     * Do not expose account status.
     */
    if (
      user.status === "SUSPENDED" ||
      user.status === "DISABLED"
    ) {
      return NextResponse.json(
        {
          success: true,
          message:
            "If an eligible account exists, a verification code will be sent.",
        },
        {
          headers: getRateLimitHeaders(identityRateLimit),
        },
      );
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json(
        {
          success: false,
          error: "EMAIL_ALREADY_VERIFIED",
          message: "Email address is already verified.",
        },
        {
          status: 409,
          headers: getRateLimitHeaders(identityRateLimit),
        },
      );
    }

    const verification =
      await createVerificationToken({
        userId: user.id,
        type: "EMAIL_VERIFICATION",
        target: user.email,
      });

    /*
     * Send the verification code through
     * the configured transactional email provider.
     *
     * Never return the verification token
     * to the client.
     */
    await sendVerificationEmail({
      to: user.email,
      code: verification.token,
      expiresAt: verification.expiresAt,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "If an eligible account exists, a verification code will be sent.",
        data: {
          expiresAt: verification.expiresAt,
        },
      },
      {
        headers: getRateLimitHeaders(identityRateLimit),
      },
    );
  } catch (error) {
    console.error(
      "POST /api/auth/verify-email/request error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "VERIFICATION_REQUEST_FAILED",
        message:
          "Unable to create or send an email verification request.",
      },
      { status: 500 },
    );
  }
}