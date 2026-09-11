import { hash } from "bcryptjs";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  AUTH_RATE_LIMITS,
  checkRateLimit,
  createIpRateLimitKey,
  getRateLimitHeaders,
} from "@/lib/rate-limit";

const ALLOWED_PUBLIC_ROLES = [
  "CUSTOMER",
  "PARTNER_OWNER",
] as const;

type PublicRole =
  (typeof ALLOWED_PUBLIC_ROLES)[number];

function databaseNotConfigured() {
  return NextResponse.json(
    {
      success: false,
      error: "DATABASE_NOT_CONFIGURED",
      message:
        "Database connection is not configured yet.",
    },
    { status: 503 },
  );
}

function cleanOptionalString(
  value: unknown,
) {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.trim();

  return cleaned.length > 0
    ? cleaned
    : null;
}

function normalizeEmail(
  value: unknown,
) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .toLowerCase();
}

function normalizeUsername(
  value: unknown,
) {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value
    .trim()
    .toLowerCase();

  return cleaned.length > 0
    ? cleaned
    : null;
}

function normalizePhone(
  value: unknown,
) {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value
    .replace(/\s+/g, "")
    .trim();

  return cleaned.length > 0
    ? cleaned
    : null;
}

function isValidEmail(
  email: string,
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email,
  );
}

function isValidUsername(
  username: string,
) {
  return /^[a-z0-9._-]{4,30}$/.test(
    username,
  );
}

function isValidPassword(
  password: string,
) {
  return (
    password.length >= 8 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password)
  );
}

function getPublicRole(
  value: unknown,
): PublicRole | null {
  if (typeof value !== "string") {
    return "CUSTOMER";
  }

  if (
    ALLOWED_PUBLIC_ROLES.includes(
      value as PublicRole,
    )
  ) {
    return value as PublicRole;
  }

  return null;
}

function rateLimitExceeded(
  retryAfterSeconds: number,
  headers: Record<string, string>,
) {
  return NextResponse.json(
    {
      success: false,
      error: "RATE_LIMIT_EXCEEDED",
      message:
        "Too many registration attempts. Please try again later.",
      data: {
        retryAfterSeconds,
      },
    },
    {
      status: 429,
      headers,
    },
  );
}

export async function POST(
  request: NextRequest,
) {
  /*
   * Limit public account creation
   * attempts from the same IP address.
   */
  const ipRateLimit =
    checkRateLimit({
      key: createIpRateLimitKey(
        "auth:register:ip",
        request,
      ),
      limit:
        AUTH_RATE_LIMITS.registerByIp
          .limit,
      windowMs:
        AUTH_RATE_LIMITS.registerByIp
          .windowMs,
    });

  if (!ipRateLimit.allowed) {
    return rateLimitExceeded(
      ipRateLimit.retryAfterSeconds,
      getRateLimitHeaders(
        ipRateLimit,
      ),
    );
  }

  if (!process.env.DATABASE_URL) {
    return databaseNotConfigured();
  }

  try {
    const body = await request.json();

    const email =
      normalizeEmail(body.email);

    const username =
      normalizeUsername(
        body.username,
      );

    const phone =
      normalizePhone(body.phone);

    const password =
      typeof body.password ===
      "string"
        ? body.password
        : "";

    const firstName =
      cleanOptionalString(
        body.firstName,
      );

    const lastName =
      cleanOptionalString(
        body.lastName,
      );

    const role =
      getPublicRole(body.role);

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error:
            "EMAIL_REQUIRED",
          message:
            "Email is required.",
        },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "INVALID_EMAIL",
          message:
            "Please provide a valid email address.",
        },
        { status: 400 },
      );
    }

    if (
      username !== null &&
      !isValidUsername(username)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "INVALID_USERNAME",
          message:
            "Username must be 4 to 30 characters and contain only letters, numbers, dots, underscores, or hyphens.",
        },
        { status: 400 },
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          error:
            "PASSWORD_REQUIRED",
          message:
            "Password is required.",
        },
        { status: 400 },
      );
    }

    if (
      !isValidPassword(password)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "WEAK_PASSWORD",
          message:
            "Password must be at least 8 characters and contain letters and numbers.",
        },
        { status: 400 },
      );
    }

    if (!role) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_ROLE",
          message:
            "Public registration only supports CUSTOMER or PARTNER_OWNER.",
        },
        { status: 400 },
      );
    }

    if (
      role === "PARTNER_OWNER" &&
      !username
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "USERNAME_REQUIRED",
          message:
            "Username is required for partner owner accounts.",
        },
        { status: 400 },
      );
    }

    const { prisma } =
      await import("@/lib/prisma");

    const existingUser =
      await prisma.user.findFirst({
        where: {
          OR: [
            {
              email,
            },
            ...(username
              ? [
                  {
                    username,
                  },
                ]
              : []),
            ...(phone
              ? [
                  {
                    phone,
                  },
                ]
              : []),
          ],
        },
        select: {
          email: true,
          username: true,
          phone: true,
        },
      });

    if (existingUser) {
      if (
        existingUser.email ===
        email
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "EMAIL_ALREADY_EXISTS",
            message:
              "An account with this email already exists.",
          },
          { status: 409 },
        );
      }

      if (
        username &&
        existingUser.username ===
          username
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "USERNAME_ALREADY_EXISTS",
            message:
              "This username is already in use.",
          },
          { status: 409 },
        );
      }

      if (
        phone &&
        existingUser.phone === phone
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "PHONE_ALREADY_EXISTS",
            message:
              "An account with this phone number already exists.",
          },
          { status: 409 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          error:
            "ACCOUNT_ALREADY_EXISTS",
          message:
            "An account with these details already exists.",
        },
        { status: 409 },
      );
    }

    const passwordHash =
      await hash(password, 12);

    const user =
      await prisma.user.create({
        data: {
          email,
          username,
          phone,
          passwordHash,
          firstName,
          lastName,
          role,
          status:
            "PENDING_VERIFICATION",
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
          createdAt: true,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Account created successfully.",
        data: user,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "POST /api/auth/register error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "REGISTRATION_FAILED",
        message:
          "Unable to create account.",
      },
      { status: 500 },
    );
  }
}