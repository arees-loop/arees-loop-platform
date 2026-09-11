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
    const body = await request.json();

    const phone = normalizePhone(body.phone);

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

    const user = await prisma.user.findUnique({
      where: {
        phone,
      },
      select: {
        id: true,
        phone: true,
        status: true,
        phoneVerifiedAt: true,
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

    if (user.phoneVerifiedAt) {
      return NextResponse.json(
        {
          success: false,
          error: "PHONE_ALREADY_VERIFIED",
          message: "Phone number is already verified.",
        },
        { status: 409 },
      );
    }

    if (!user.phone) {
      return NextResponse.json(
        {
          success: false,
          error: "PHONE_NOT_AVAILABLE",
          message:
            "No phone number is associated with this account.",
        },
        { status: 400 },
      );
    }

    const verification =
      await createVerificationToken({
        userId: user.id,
        type: "PHONE_VERIFICATION",
        target: user.phone,
      });

    /*
     * IMPORTANT:
     *
     * The verification code must be sent through
     * the configured SMS provider.
     *
     * Do not return verification.token to the client.
     *
     * Future production flow:
     *
     * await sendVerificationSms({
     *   to: user.phone,
     *   code: verification.token,
     * });
     */

    if (process.env.NODE_ENV !== "production") {
      console.log(
        "Phone verification code generated:",
        {
          userId: user.id,
          phone: user.phone,
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