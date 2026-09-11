import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

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

function normalizeIdentifier(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase();
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return databaseNotConfigured();
  }

  try {
    const body = await request.json();

    const identifier = normalizeIdentifier(body.identifier);

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!identifier) {
      return NextResponse.json(
        {
          success: false,
          error: "IDENTIFIER_REQUIRED",
          message: "Email or username is required.",
        },
        { status: 400 },
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          error: "PASSWORD_REQUIRED",
          message: "Password is required.",
        },
        { status: 400 },
      );
    }

    const { prisma } = await import("@/lib/prisma");

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email: identifier,
          },
          {
            username: identifier,
          },
        ],
      },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_CREDENTIALS",
          message: "Invalid email, username, or password.",
        },
        { status: 401 },
      );
    }

    const passwordMatches = await compare(
      password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_CREDENTIALS",
          message: "Invalid email, username, or password.",
        },
        { status: 401 },
      );
    }

    if (user.status === "SUSPENDED") {
      return NextResponse.json(
        {
          success: false,
          error: "ACCOUNT_SUSPENDED",
          message: "This account is suspended.",
        },
        { status: 403 },
      );
    }

    if (user.status === "DISABLED") {
      return NextResponse.json(
        {
          success: false,
          error: "ACCOUNT_DISABLED",
          message: "This account is disabled.",
        },
        { status: 403 },
      );
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLoginAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Login successful.",
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          emailVerifiedAt: user.emailVerifiedAt,
          phoneVerifiedAt: user.phoneVerifiedAt,
        },
      },
    });
  } catch (error) {
    console.error(
      "POST /api/auth/login error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "LOGIN_FAILED",
        message: "Unable to sign in.",
      },
      { status: 500 },
    );
  }
}