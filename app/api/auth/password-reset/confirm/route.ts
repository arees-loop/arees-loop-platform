import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import { deleteAllUserSessions } from "@/lib/session";
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

function normalizeToken(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password: string) {
  return (
    password.length >= 8 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password)
  );
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return databaseNotConfigured();
  }

  try {
    const body = await request.json();

    const email = normalizeEmail(body.email);
    const token = normalizeToken(body.token);

    const newPassword =
      typeof body.newPassword === "string"
        ? body.newPassword
        : "";

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

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "TOKEN_REQUIRED",
          message: "Password reset token is required.",
        },
        { status: 400 },
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "PASSWORD_REQUIRED",
          message: "New password is required.",
        },
        { status: 400 },
      );
    }

    if (!isValidPassword(newPassword)) {
      return NextResponse.json(
        {
          success: false,
          error: "WEAK_PASSWORD",
          message:
            "Password must be at least 8 characters and contain letters and numbers.",
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

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_RESET_REQUEST",
          message:
            "The password reset request is invalid or expired.",
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
          error: "INVALID_RESET_REQUEST",
          message:
            "The password reset request is invalid or expired.",
        },
        { status: 400 },
      );
    }

    const verification =
      await verifyVerificationToken({
        userId: user.id,
        type: "PASSWORD_RESET",
        token,
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
              "Maximum reset attempts reached. Request a new password reset link.",
          },
          { status: 429 },
        );
      }

      if (verification.error === "TOKEN_EXPIRED") {
        return NextResponse.json(
          {
            success: false,
            error: "RESET_TOKEN_EXPIRED",
            message:
              "Password reset token has expired. Request a new reset link.",
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "INVALID_RESET_REQUEST",
          message:
            "The password reset request is invalid or expired.",
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

    const passwordHash = await hash(
      newPassword,
      12,
    );

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash,
      },
    });

    /*
     * Security requirement:
     *
     * Changing the password invalidates every
     * existing authenticated session belonging
     * to this user.
     */
    await deleteAllUserSessions(user.id);

    return NextResponse.json({
      success: true,
      message:
        "Password has been reset successfully. Please sign in again.",
    });
  } catch (error) {
    console.error(
      "POST /api/auth/password-reset/confirm error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "PASSWORD_RESET_FAILED",
        message: "Unable to reset password.",
      },
      { status: 500 },
    );
  }
}