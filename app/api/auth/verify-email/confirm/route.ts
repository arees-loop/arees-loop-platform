import { NextRequest, NextResponse } from "next/server";

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

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return databaseNotConfigured();
  }

  try {
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
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_EMAIL",
          message: "Please provide a valid email address.",
        },
        { status: 400 },
      );
    }

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          error: "CODE_REQUIRED",
          message: "Verification code is required.",
        },
        { status: 400 },
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
        { status: 400 },
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

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_VERIFICATION",
          message:
            "The verification code is invalid or expired.",
        },
        { status: 400 },
      );
    }

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
        { status: 400 },
      );
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json({
        success: true,
        message: "Email address is already verified.",
        data: {
          emailVerified: true,
          emailVerifiedAt: user.emailVerifiedAt,
        },
      });
    }

    const verification =
      await verifyVerificationToken({
        userId: user.id,
        type: "EMAIL_VERIFICATION",
        token: code,
        target: user.email,
      });

    if (!verification.success) {
      if (
        verification.error === "MAX_ATTEMPTS_REACHED"
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "MAX_ATTEMPTS_REACHED",
            message:
              "Maximum verification attempts reached. Request a new code.",
          },
          { status: 429 },
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
          { status: 400 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "INVALID_VERIFICATION",
          message:
            "The verification code is invalid or expired.",
          ...(
            "attemptsRemaining" in verification
              ? {
                  data: {
                    attemptsRemaining:
                      verification.attemptsRemaining,
                  },
                }
              : {}
          ),
        },
        { status: 400 },
      );
    }

    const verifiedAt = new Date();

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerifiedAt: verifiedAt,
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

    return NextResponse.json({
      success: true,
      message: "Email address verified successfully.",
      data: {
        user: updatedUser,
      },
    });
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