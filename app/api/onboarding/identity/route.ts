import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

type VisitorTypeInput = "CITIZEN" | "RESIDENT" | "VISITOR";

const allowedVisitorTypes = new Set<VisitorTypeInput>([
  "CITIZEN",
  "RESIDENT",
  "VISITOR",
]);

function isVisitorType(value: unknown): value is VisitorTypeInput {
  return (
    typeof value === "string" &&
    allowedVisitorTypes.has(value as VisitorTypeInput)
  );
}

export async function POST(request: NextRequest) {
  try {
    const currentSession = await getCurrentSession();

    if (!currentSession) {
      return NextResponse.json(
        {
          success: false,
          error: "UNAUTHORIZED",
          message: "You must be signed in to continue.",
        },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);
    const visitorType = body?.visitorType;

    if (!isVisitorType(visitorType)) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_VISITOR_TYPE",
          message: "A valid visitor type is required.",
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.update({
      where: {
        id: currentSession.user.id,
      },
      data: {
        visitorType,
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        visitorType: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("POST /api/onboarding/identity error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Unable to save visitor identity right now.",
      },
      { status: 500 },
    );
  }
}