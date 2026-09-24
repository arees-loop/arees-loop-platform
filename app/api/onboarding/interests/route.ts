import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

const INTEREST_CODES = [
  "HERITAGE",
  "ADVENTURE",
  "FOOD",
  "EVENTS",
  "SHOPPING",
  "GUIDES",
  "STAYS",
  "NATURE",
  "FAMILY",
  "SPORTS",
  "TECHNOLOGY",
  "SEASONAL",
] as const;

type InterestCodeInput = (typeof INTEREST_CODES)[number];

const allowedInterestCodes = new Set<string>(INTEREST_CODES);

function isInterestCode(value: unknown): value is InterestCodeInput {
  return typeof value === "string" && allowedInterestCodes.has(value);
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
    const interests = body?.interests;

    if (!Array.isArray(interests)) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_INTERESTS",
          message: "Interests must be provided as an array.",
        },
        { status: 400 },
      );
    }

    if (interests.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "NO_INTERESTS_SELECTED",
          message: "Select at least one interest to continue.",
        },
        { status: 400 },
      );
    }

    if (!interests.every(isInterestCode)) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_INTEREST",
          message: "One or more selected interests are invalid.",
        },
        { status: 400 },
      );
    }

    const uniqueInterests = [...new Set<InterestCodeInput>(interests)];

    const savedInterests = await prisma.$transaction(async (tx) => {
      await tx.userInterest.deleteMany({
        where: {
          userId: currentSession.user.id,
        },
      });

      await tx.userInterest.createMany({
        data: uniqueInterests.map((code) => ({
          userId: currentSession.user.id,
          code,
        })),
      });

      return tx.userInterest.findMany({
        where: {
          userId: currentSession.user.id,
        },
        select: {
          id: true,
          code: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        interests: savedInterests,
      },
    });
  } catch (error) {
    console.error("POST /api/onboarding/interests error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Unable to save interests right now.",
      },
      { status: 500 },
    );
  }
}