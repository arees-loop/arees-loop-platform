import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

function cleanName(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.trim().replace(/\s+/g, " ");

  if (cleaned.length < 2 || cleaned.length > 50) {
    return null;
  }

  return cleaned;
}

function normalizeOptionalPhone(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.replace(/\s+/g, "").trim();

  if (!cleaned) {
    return "";
  }

  if (!/^\+[1-9]\d{7,14}$/.test(cleaned)) {
    return null;
  }

  return cleaned;
}

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "UNAUTHENTICATED",
          message: "No active session found.",
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: session.user.id,
          email: session.user.email,
          username: session.user.username,
          phone: session.user.phone,
          firstName: session.user.firstName,
          lastName: session.user.lastName,
          role: session.user.role,
          status: session.user.status,
          emailVerifiedAt: session.user.emailVerifiedAt,
          phoneVerifiedAt: session.user.phoneVerifiedAt,
          visitorType: session.user.visitorType,
          interests: session.user.interests.map(
            (item) => item.code,
          ),
        },
        session: {
          id: session.id,
          expiresAt: session.expiresAt,
          lastUsedAt: session.lastUsedAt,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "SESSION_LOOKUP_FAILED",
        message:
          "Unable to retrieve the current session.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "UNAUTHENTICATED",
          message: "No active session found.",
        },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_REQUEST",
          message: "Invalid request body.",
        },
        { status: 400 },
      );
    }

    const firstName = cleanName(body.firstName);
    const lastName = cleanName(body.lastName);
    const phone = normalizeOptionalPhone(body.phone);

    if (!firstName || !lastName) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_NAME",
          message:
            "First name and last name must each contain between 2 and 50 characters.",
        },
        { status: 400 },
      );
    }

    if (phone === null) {
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

    if (phone) {
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
    }

    const phoneChanged =
      (session.user.phone ?? "") !== phone;

    const user = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        firstName,
        lastName,
        phone: phone || null,

        /*
         * Phone verification is not required in phase one.
         * Email remains the primary verified sign-in method.
         *
         * If the optional phone number changes,
         * any previous phone verification state is cleared.
         */
        ...(phoneChanged
          ? {
              phoneVerifiedAt: null,
            }
          : {}),
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
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
        visitorType: true,
        interests: {
          select: {
            code: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          ...user,
          interests: user.interests.map(
            (item) => item.code,
          ),
        },
      },
    });
  } catch (error) {
    console.error("PATCH /api/auth/me error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "PROFILE_UPDATE_FAILED",
        message: "Unable to update the profile.",
      },
      { status: 500 },
    );
  }
}