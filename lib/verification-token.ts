import {
  createHash,
  randomBytes,
  randomInt,
} from "crypto";

type VerificationTokenType =
  | "EMAIL_VERIFICATION"
  | "PHONE_VERIFICATION"
  | "PASSWORD_RESET";

type CreateVerificationTokenInput = {
  userId: string;
  type: VerificationTokenType;
  target?: string | null;
};

type VerifyVerificationTokenInput = {
  userId: string;
  type: VerificationTokenType;
  token: string;
  target?: string | null;
};

const OTP_EXPIRY_MS =
  1000 * 60 * 10; // 10 minutes

const PASSWORD_RESET_EXPIRY_MS =
  1000 * 60 * 15; // 15 minutes

const MAX_ATTEMPTS = 5;

function ensureDatabaseConfigured() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }
}

function hashToken(token: string) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

function generateOtp() {
  return randomInt(
    100000,
    1000000,
  ).toString();
}

function generateSecureToken() {
  return randomBytes(32).toString("base64url");
}

function getExpiryDuration(
  type: VerificationTokenType,
) {
  if (type === "PASSWORD_RESET") {
    return PASSWORD_RESET_EXPIRY_MS;
  }

  return OTP_EXPIRY_MS;
}

function generateToken(
  type: VerificationTokenType,
) {
  if (type === "PASSWORD_RESET") {
    return generateSecureToken();
  }

  return generateOtp();
}

export async function createVerificationToken({
  userId,
  type,
  target = null,
}: CreateVerificationTokenInput) {
  ensureDatabaseConfigured();

  const { prisma } =
    await import("@/lib/prisma");

  const token = generateToken(type);
  const tokenHash = hashToken(token);

  const expiresAt = new Date(
    Date.now() + getExpiryDuration(type),
  );

  await prisma.$transaction([
    prisma.verificationToken.deleteMany({
      where: {
        userId,
        type,
        consumedAt: null,
      },
    }),

    prisma.verificationToken.create({
      data: {
        userId,
        type,
        tokenHash,
        target,
        expiresAt,
        maxAttempts: MAX_ATTEMPTS,
      },
    }),
  ]);

  return {
    token,
    expiresAt,
  };
}

export async function verifyVerificationToken({
  userId,
  type,
  token,
  target = null,
}: VerifyVerificationTokenInput) {
  ensureDatabaseConfigured();

  const { prisma } =
    await import("@/lib/prisma");

  const verification =
    await prisma.verificationToken.findFirst({
      where: {
        userId,
        type,
        consumedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  if (!verification) {
    return {
      success: false as const,
      error: "TOKEN_NOT_FOUND",
    };
  }

  if (
    verification.expiresAt <= new Date()
  ) {
    await prisma.verificationToken.update({
      where: {
        id: verification.id,
      },
      data: {
        consumedAt: new Date(),
      },
    });

    return {
      success: false as const,
      error: "TOKEN_EXPIRED",
    };
  }

  if (
    verification.attempts >=
    verification.maxAttempts
  ) {
    await prisma.verificationToken.update({
      where: {
        id: verification.id,
      },
      data: {
        consumedAt: new Date(),
      },
    });

    return {
      success: false as const,
      error: "MAX_ATTEMPTS_REACHED",
    };
  }

  if (
    target !== null &&
    verification.target !== target
  ) {
    return {
      success: false as const,
      error: "TOKEN_TARGET_MISMATCH",
    };
  }

  const submittedHash =
    hashToken(token);

  if (
    submittedHash !==
    verification.tokenHash
  ) {
    const nextAttempts =
      verification.attempts + 1;

    await prisma.verificationToken.update({
      where: {
        id: verification.id,
      },
      data: {
        attempts: nextAttempts,
        consumedAt:
          nextAttempts >=
          verification.maxAttempts
            ? new Date()
            : null,
      },
    });

    if (
      nextAttempts >=
      verification.maxAttempts
    ) {
      return {
        success: false as const,
        error: "MAX_ATTEMPTS_REACHED",
      };
    }

    return {
      success: false as const,
      error: "INVALID_TOKEN",
      attemptsRemaining:
        verification.maxAttempts -
        nextAttempts,
    };
  }

  const consumedAt = new Date();

  await prisma.verificationToken.update({
    where: {
      id: verification.id,
    },
    data: {
      consumedAt,
    },
  });

  return {
    success: true as const,
    verificationId: verification.id,
    consumedAt,
  };
}

export async function revokeVerificationTokens(
  userId: string,
  type?: VerificationTokenType,
) {
  ensureDatabaseConfigured();

  const { prisma } =
    await import("@/lib/prisma");

  const consumedAt = new Date();

  await prisma.verificationToken.updateMany({
    where: {
      userId,
      consumedAt: null,
      ...(type
        ? {
            type,
          }
        : {}),
    },
    data: {
      consumedAt,
    },
  });
}