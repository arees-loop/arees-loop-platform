import { NextRequest, NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/session";
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

function normalizePhone(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, "").trim();
}

function normalizeCode(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function isValidPhone(phone: string) {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

function isValidVerificationCode(code: string) {
  return /^\d{6}$/.test(code);
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return databaseNotConfigured();
  }

  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "UNAUTHENTICATED",
          message: "You must be signed in to continue.",
        },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);

    const phone = normalizePhone(body?.phone);
    const code = normalizeCode(body?.code);

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          error: "PHONE_REQUIRED",
          message: "Phone number is required.",
        },
        { status: 400 },
      );
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_PHONE",
          message:
            "Phone number must be in international format, for example +9665XXXXXXXX.",
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

    const existingUser = await prisma.user.findUnique({
      where: {
        phone,
      },
      select: {
        id: true,
      },
    });

    if (
      existingUser &&
      existingUser.id !== session.user.id
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "PHONE_ALREADY_IN_USE",
          message:
            "This phone number is already associated with another account.",
        },
        { status: 409 },
      );
    }

    const verification =
      await verifyVerificationToken({
        userId: session.user.id,
        type: "PHONE_VERIFICATION",
        token: code,
        target: phone,
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
        id: session.user.id,
      },
      data: {
        phone,
        phoneVerifiedAt: verifiedAt,
      },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        visitorType: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully.",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error(
      "POST /api/auth/verify-phone/confirm error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "PHONE_VERIFICATION_FAILED",
        message: "Unable to verify phone number.",
      },
      { status: 500 },
    );
  }
}