import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/session";

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
          emailVerifiedAt:
            session.user.emailVerifiedAt,
          phoneVerifiedAt:
            session.user.phoneVerifiedAt,
        },
        session: {
          id: session.id,
          expiresAt: session.expiresAt,
          lastUsedAt: session.lastUsedAt,
        },
      },
    });
  } catch (error) {
    console.error(
      "GET /api/auth/me error:",
      error,
    );

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