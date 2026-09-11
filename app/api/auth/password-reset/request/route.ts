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

function genericSuccessResponse() {
  return NextResponse.json({
    success: true,
    message:
      "If an eligible account exists, password reset instructions will be sent.",
  });
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
      },
    });

    /*
     * Do not reveal whether an account exists.
     * Suspended and disabled accounts receive
     * the same generic response.
     */
    if (
      !user ||
      user.status === "SUSPENDED" ||
      user.status === "DISABLED"
    ) {
      return genericSuccessResponse();
    }

    const reset =
      await createVerificationToken({
        userId: user.id,
        type: "PASSWORD_RESET",
        target: user.email,
      });

    /*
     * IMPORTANT:
     *
     * The raw reset token must never be stored
     * in the database or returned to the client.
     *
     * In production, send it through the
     * configured email provider.
     *
     * Example future flow:
     *
     * const resetUrl =
     *   `${process.env.APP_URL}/reset-password?token=${reset.token}`;
     *
     * await sendPasswordResetEmail({
     *   to: user.email,
     *   resetUrl,
     * });
     */

    if (process.env.NODE_ENV !== "production") {
      console.log(
        "Password reset token generated:",
        {
          userId: user.id,
          email: user.email,
          token: reset.token,
          expiresAt: reset.expiresAt,
        },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "If an eligible account exists, password reset instructions will be sent.",
      data: {
        expiresAt: reset.expiresAt,
      },
    });
  } catch (error) {
    console.error(
      "POST /api/auth/password-reset/request error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "PASSWORD_RESET_REQUEST_FAILED",
        message:
          "Unable to create a password reset request.",
      },
      { status: 500 },
    );
  }
}