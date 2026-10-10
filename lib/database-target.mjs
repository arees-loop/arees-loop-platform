export const STAGING_VERCEL_PROJECT_ID = "prj_gkTSFNIfCgVwslbCUHsKtNhuwULk";

function connectionIdentity(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("Database connection URL is invalid");
  }

  if (!["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error("Database connection must use PostgreSQL");
  }

  return {
    host: url.hostname.toLowerCase(),
    port: url.port || "5432",
    database: decodeURIComponent(url.pathname.replace(/^\//, "")),
  };
}

export function getDatabaseUrl(env = process.env) {
  if (env.VERCEL_PROJECT_ID !== STAGING_VERCEL_PROJECT_ID) {
    return env.DATABASE_URL;
  }

  if (env.AREES_DATABASE_ENV !== "staging") {
    throw new Error("Staging project requires AREES_DATABASE_ENV=staging");
  }

  const stagingUrl = env.AREES_STAGING_DATABASE_URL;
  const expectedHost = env.AREES_STAGING_DATABASE_HOST?.toLowerCase();
  if (!stagingUrl || !expectedHost) {
    throw new Error("Staging project requires its dedicated database URL and host allowlist");
  }

  const target = connectionIdentity(stagingUrl);
  if (target.host !== expectedHost) {
    throw new Error("Staging database host does not match its allowlist");
  }

  if (env.DATABASE_URL) {
    const fallback = connectionIdentity(env.DATABASE_URL);
    if (
      fallback.host !== target.host ||
      fallback.port !== target.port ||
      fallback.database !== target.database
    ) {
      throw new Error("Staging project has a conflicting DATABASE_URL; refusing to connect");
    }
  }

  return stagingUrl;
}

export function assertSeparateDatabases(sourceUrl, targetUrl, expectedTargetHost) {
  const source = connectionIdentity(sourceUrl);
  const target = connectionIdentity(targetUrl);
  if (target.host !== expectedTargetHost.toLowerCase()) {
    throw new Error("Target database host does not match the staging allowlist");
  }
  if (source.host === target.host) {
    throw new Error("Source and staging database must use separate database hosts");
  }
  return { sourceHost: source.host, targetHost: target.host };
}

export function assertBlobTokenStore(token, expectedStoreId) {
  const parts = typeof token === "string" ? token.split("_") : [];
  const actualStoreId = parts[0] === "vercel" && parts[1] === "blob" && parts[2] === "rw"
    ? `store_${parts[3] || ""}`
    : "";
  if (!actualStoreId || actualStoreId !== expectedStoreId) {
    throw new Error("Vercel Blob token does not belong to the expected store");
  }
  return true;
}
