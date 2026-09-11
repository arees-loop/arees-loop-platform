import { NextRequest, NextResponse } from "next/server";

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

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return databaseNotConfigured();
  }

  try {
    const body = await request.json();

    const email = normalizeEmail(body.email);

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
      return NextResponse.json({
        success: true,
        message:
          "If an eligible account exists, a verification code will be sent.",
      });
    }

    if (
      user.status === "SUSPENDED" ||
      user.status === "DISABLED"
    ) {
      return NextResponse.json({
        success: true,
        message:
          "If an eligible account exists, a verification code will be sent.",
      });
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json(
        {
          success: false,
          error: "EMAIL_ALREADY_VERIFIED",
          message: "Email address is already verified.",
        },
        { status: 409 },
      );
    }

    const verification =
      await createVerificationToken({
        userId: user.id,
        type: "EMAIL_VERIFICATION",
        target: user.email,
      });

    /*
     * IMPORTANT:
     *
     * The verification code must be sent through
     * the configured email provider.
     *
     * Do not return verification.token to the client.
     *
     * Example future flow:
     *
     * await sendVerificationEmail({
     *   to: user.email,
     *   code: verification.token,
     * });
     */

    if (process.env.NODE_ENV !== "production") {
      console.log(
        "Email verification code generated:",
        {
          userId: user.id,
          email: user.email,
          code: verification.token,
          expiresAt: verification.expiresAt,
        },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "If an eligible account exists, a verification code will be sent.",
      data: {
        expiresAt: verification.expiresAt,
      },
    });
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
          "Unable to create an email verification request.",
      },
      { status: 500 },
    );
  }
}