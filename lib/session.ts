import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "arees_loop_session";

const SESSION_DURATION_MS =
  1000 * 60 * 60 * 24 * 7; // 7 days

function hashSessionToken(token: string) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

function generateSessionToken() {
  return randomBytes(32).toString("base64url");
}

export async function createSession(
  userId: string,
  request?: Request,
) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  const { prisma } = await import("@/lib/prisma");

  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);

  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_MS,
  );

  const ipAddress =
    request?.headers
      .get("x-forwarded-for")
      ?.split(",")[0]
      ?.trim() ?? null;

  const userAgent =
    request?.headers.get("user-agent") ?? null;

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      ipAddress,
      userAgent,
    },
  });

  const cookieStore = await cookies();

  cookieStore.set(
    SESSION_COOKIE_NAME,
    token,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    },
  );

  return {
    expiresAt,
  };
}

export async function getCurrentSession() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const cookieStore = await cookies();

  const token =
    cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const tokenHash = hashSessionToken(token);

  const { prisma } = await import("@/lib/prisma");

  const session = await prisma.session.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: {
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
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    });

    return null;
  }

  if (
    session.user.status === "SUSPENDED" ||
    session.user.status === "DISABLED"
  ) {
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    });

    return null;
  }

  await prisma.session.update({
    where: {
      id: session.id,
    },
    data: {
      lastUsedAt: new Date(),
    },
  });

  return session;
}

export async function deleteCurrentSession() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (
    token &&
    process.env.DATABASE_URL
  ) {
    const tokenHash = hashSessionToken(token);

    const { prisma } = await import("@/lib/prisma");

    await prisma.session.deleteMany({
      where: {
        tokenHash,
      },
    });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function deleteAllUserSessions(
  userId: string,
) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  const { prisma } = await import("@/lib/prisma");

  await prisma.session.deleteMany({
    where: {
      userId,
    },
  });
}