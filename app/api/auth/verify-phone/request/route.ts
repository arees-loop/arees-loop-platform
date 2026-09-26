import { NextRequest, NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/session";
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

function normalizePhone(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, "").trim();
}

function isValidPhone(phone: string) {
  return /^\+[1-9]\d{7,14}$/.test(phone);
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

    if (
      session.user.phone === phone &&
      session.user.phoneVerifiedAt
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "PHONE_ALREADY_VERIFIED",
          message:
            "This phone number is already verified on your account.",
        },
        { status: 409 },
      );
    }

    const verification =
      await createVerificationToken({
        userId: session.user.id,
        type: "PHONE_VERIFICATION",
        target: phone,
      });

    /*
     * SMS INTEGRATION
     *
     * The verification code must be sent to `phone`
     * through the configured SMS provider.
     *
     * Do not return verification.token to the client.
     *
     * Production flow:
     *
     * await sendVerificationSms({
     *   to: phone,
     *   code: verification.token,
     * });
     */

    if (process.env.NODE_ENV !== "production") {
      console.log(
        "Phone verification code generated:",
        {
          userId: session.user.id,
          phone,
          code: verification.token,
          expiresAt: verification.expiresAt,
        },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code created successfully.",
      data: {
        phone,
        expiresAt: verification.expiresAt,
      },
    });
  } catch (error) {
    console.error(
      "POST /api/auth/verify-phone/request error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "VERIFICATION_REQUEST_FAILED",
        message:
          "Unable to create a phone verification request.",
      },
      { status: 500 },
    );
  }
}