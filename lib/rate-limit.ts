import { createHash } from "crypto";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfterSeconds: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __areesRateLimitStore:
    | Map<string, RateLimitBucket>
    | undefined;
}

const store =
  globalThis.__areesRateLimitStore ??
  new Map<string, RateLimitBucket>();

if (
  process.env.NODE_ENV !== "production"
) {
  globalThis.__areesRateLimitStore = store;
}

function hashKey(value: string) {
  return createHash("sha256")
    .update(value)
    .digest("hex");
}

function normalizeKey(value: string) {
  return value
    .trim()
    .toLowerCase();
}

function cleanupExpiredBuckets(now: number) {
  if (store.size < 1000) {
    return;
  }

  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function getRequestIp(
  request: Request,
) {
  const forwardedFor =
    request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const firstIp =
      forwardedFor
        .split(",")[0]
        ?.trim();

    if (firstIp) {
      return firstIp;
    }
  }

  const realIp =
    request.headers.get("x-real-ip");

  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

export function createRateLimitKey(
  scope: string,
  identifier: string,
) {
  const normalizedScope =
    normalizeKey(scope);

  const normalizedIdentifier =
    normalizeKey(identifier);

  return hashKey(
    `${normalizedScope}:${normalizedIdentifier}`,
  );
}

export function createIpRateLimitKey(
  scope: string,
  request: Request,
) {
  return createRateLimitKey(
    scope,
    getRequestIp(request),
  );
}

export function createIdentityRateLimitKey(
  scope: string,
  identifier: string,
) {
  return createRateLimitKey(
    scope,
    identifier,
  );
}

export function checkRateLimit({
  key,
  limit,
  windowMs,
}: RateLimitOptions): RateLimitResult {
  if (
    !Number.isInteger(limit) ||
    limit <= 0
  ) {
    throw new Error(
      "Rate limit must be a positive integer.",
    );
  }

  if (
    !Number.isFinite(windowMs) ||
    windowMs <= 0
  ) {
    throw new Error(
      "Rate limit window must be positive.",
    );
  }

  const now = Date.now();

  cleanupExpiredBuckets(now);

  const existing =
    store.get(key);

  if (
    !existing ||
    existing.resetAt <= now
  ) {
    const resetAt =
      now + windowMs;

    store.set(key, {
      count: 1,
      resetAt,
    });

    return {
      allowed: true,
      limit,
      remaining:
        Math.max(limit - 1, 0),
      resetAt: new Date(resetAt),
      retryAfterSeconds: 0,
    };
  }

  if (existing.count >= limit) {
    const retryAfterSeconds =
      Math.max(
        Math.ceil(
          (existing.resetAt - now) /
            1000,
        ),
        1,
      );

    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt:
        new Date(existing.resetAt),
      retryAfterSeconds,
    };
  }

  existing.count += 1;

  store.set(key, existing);

  return {
    allowed: true,
    limit,
    remaining:
      Math.max(
        limit - existing.count,
        0,
      ),
    resetAt:
      new Date(existing.resetAt),
    retryAfterSeconds: 0,
  };
}

export function getRateLimitHeaders(
  result: RateLimitResult,
) {
  const headers: Record<
    string,
    string
  > = {
    "X-RateLimit-Limit":
      result.limit.toString(),

    "X-RateLimit-Remaining":
      result.remaining.toString(),

    "X-RateLimit-Reset":
      Math.ceil(
        result.resetAt.getTime() /
          1000,
      ).toString(),
  };

  if (!result.allowed) {
    headers["Retry-After"] =
      result.retryAfterSeconds.toString();
  }

  return headers;
}

export function clearRateLimit(
  key: string,
) {
  store.delete(key);
}

export const AUTH_RATE_LIMITS = {
  loginByIp: {
    limit: 20,
    windowMs:
      1000 * 60 * 15,
  },

  loginByIdentity: {
    limit: 10,
    windowMs:
      1000 * 60 * 15,
  },

  registerByIp: {
    limit: 10,
    windowMs:
      1000 * 60 * 60,
  },

  verificationRequestByIp: {
    limit: 10,
    windowMs:
      1000 * 60 * 15,
  },

  verificationRequestByIdentity: {
    limit: 5,
    windowMs:
      1000 * 60 * 15,
  },

  verificationConfirmByIp: {
    limit: 20,
    windowMs:
      1000 * 60 * 15,
  },

  verificationConfirmByIdentity: {
    limit: 10,
    windowMs:
      1000 * 60 * 15,
  },

  passwordResetRequestByIp: {
    limit: 10,
    windowMs:
      1000 * 60 * 60,
  },

  passwordResetRequestByIdentity: {
    limit: 5,
    windowMs:
      1000 * 60 * 60,
  },

  passwordResetConfirmByIp: {
    limit: 20,
    windowMs:
      1000 * 60 * 60,
  },

  passwordResetConfirmByIdentity: {
    limit: 10,
    windowMs:
      1000 * 60 * 60,
  },
} as const;