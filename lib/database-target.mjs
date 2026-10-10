import { createHash } from "node:crypto";

export const STAGING_VERCEL_PROJECT_ID = "prj_gkTSFNIfCgVwslbCUHsKtNhuwULk";
// Vercel/Prisma resource IDs are identifiers, not connection credentials. Pin
// the staging app to the already-approved store and keep the known production
// store distinct. Shared Prisma hostnames are intentionally not identity keys.
export const STAGING_PRISMA_STORE_ID = "store_fpCPANjbF7V7x3tT";
export const PRODUCTION_PRISMA_STORE_ID = "store_bETLhjbvDjRHRtFF";

export function isAreesStagingProject(env = process.env) {
  return env.VERCEL_PROJECT_ID === STAGING_VERCEL_PROJECT_ID;
}

function isAreesPreviewDeployment(env = process.env) {
  return env.VERCEL_ENV === "preview" && !isAreesStagingProject(env);
}

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
    username: decodeURIComponent(url.username),
    // Include a digest of the credential and connection options in the
    // fingerprint without returning or logging any secret material.
    connectionDigest: createHash("sha256")
      .update(JSON.stringify([
        decodeURIComponent(url.username),
        decodeURIComponent(url.password),
        [...url.searchParams.entries()].sort(([a], [b]) => a.localeCompare(b)),
      ]))
      .digest("hex"),
  };
}

export function databaseIdentityFingerprint(rawUrl) {
  const identity = connectionIdentity(rawUrl);
  // Prisma Postgres uses two hostnames for one database: pooled runtime and
  // direct admin/migration traffic. Normalize them so swapping URLs for the
  // same resource cannot pass the isolation check.
  const host = ["db.prisma.io", "pooled.db.prisma.io"].includes(identity.host)
    ? "prisma-postgres"
    : identity.host;
  return createHash("sha256")
    .update(JSON.stringify([host, identity.port, identity.database, identity.connectionDigest]))
    .digest("hex");
}

export function getStagingDatabaseUrl(env = process.env) {
  // Prisma's Vercel integration names its imported URL
  // AREES_STAGING_DATABASE_DATABASE_URL. Keep the app alias for manually
  // managed environments, preferring it when both are present.
  return env.AREES_STAGING_DATABASE_URL || env.AREES_STAGING_DATABASE_DATABASE_URL;
}

export function getMigrationDatabaseUrl(env = process.env) {
  if (!isAreesStagingProject(env)) return getDatabaseUrl(env);

  const directUrl = env.AREES_STAGING_DATABASE_DIRECT_URL || env.AREES_STAGING_DATABASE_POSTGRES_URL;
  if (!directUrl) {
    throw new Error("Staging Prisma commands require the dedicated direct database URL");
  }

  const direct = connectionIdentity(directUrl);
  if (env.AREES_DATABASE_ENV !== "staging") {
    throw new Error("Staging Prisma commands require AREES_DATABASE_ENV=staging");
  }
  if (env.AREES_STAGING_DATABASE_STORE_ID !== STAGING_PRISMA_STORE_ID) {
    throw new Error("Staging Prisma store ID does not match the approved Vercel resource");
  }
  if (direct.host !== "db.prisma.io") {
    throw new Error("Staging migrations require Prisma's direct database hostname");
  }
  const expectedDatabase = env.AREES_STAGING_DATABASE_EXPECTED_NAME;
  if (expectedDatabase && direct.database !== expectedDatabase) {
    throw new Error("Staging direct URL does not match its approved database identity");
  }
  return directUrl;
}

export function getDatabaseUrl(env = process.env) {
  if (isAreesStagingProject(env)) {
    if (env.AREES_DATABASE_ENV !== "staging") {
      throw new Error("Staging project requires AREES_DATABASE_ENV=staging");
    }

    const stagingUrl = getStagingDatabaseUrl(env);
    const expectedHost = env.AREES_STAGING_DATABASE_HOST?.toLowerCase();
    if (!stagingUrl || !expectedHost || !env.AREES_STAGING_DATABASE_STORE_ID) {
      throw new Error("Staging project requires its dedicated database URL, resource ID, and host allowlist");
    }
    if (env.AREES_STAGING_DATABASE_STORE_ID !== STAGING_PRISMA_STORE_ID) {
      throw new Error("Staging Prisma store ID does not match the approved Vercel resource");
    }

    const target = connectionIdentity(stagingUrl);
    if (target.host !== expectedHost) {
      throw new Error("Staging database host does not match its allowlist");
    }

    if (env.DATABASE_URL) {
      if (databaseIdentityFingerprint(env.DATABASE_URL) !== databaseIdentityFingerprint(stagingUrl)) {
        throw new Error("Staging project has a conflicting DATABASE_URL; refusing to connect");
      }
    }

    return stagingUrl;
  }

  if (isAreesPreviewDeployment(env)) {
    if (env.AREES_DATABASE_ENV !== "preview") {
      throw new Error("Preview deployment requires AREES_DATABASE_ENV=preview");
    }

    const previewUrl = env.AREES_PREVIEW_DATABASE_URL;
    const expectedHost = env.AREES_PREVIEW_DATABASE_HOST?.toLowerCase();
    if (!previewUrl || !expectedHost) {
      throw new Error("Preview deployment requires a dedicated database URL and host allowlist");
    }

    const target = connectionIdentity(previewUrl);
    if (target.host !== expectedHost) {
      throw new Error("Preview database host does not match its allowlist");
    }

    if (env.DATABASE_URL) {
      const production = connectionIdentity(env.DATABASE_URL);
      if (
        production.host === target.host &&
        production.port === target.port &&
        production.database === target.database
      ) {
        throw new Error("Preview database matches DATABASE_URL; refusing to connect");
      }
    }

    return previewUrl;
  }

  return env.DATABASE_URL;
}

export function isDatabaseConfigured(env = process.env) {
  return Boolean(getDatabaseUrl(env));
}

export function assertSeparateDatabases(sourceUrl, targetUrl, expectedTargetHost, resourceIds = {}) {
  const source = connectionIdentity(sourceUrl);
  const target = connectionIdentity(targetUrl);
  if (resourceIds.sourceStoreId !== PRODUCTION_PRISMA_STORE_ID) {
    throw new Error("Source database resource ID is not the approved production store");
  }
  if (resourceIds.targetStoreId !== STAGING_PRISMA_STORE_ID) {
    throw new Error("Target database resource ID is not the approved staging store");
  }
  if (resourceIds.sourceStoreId === resourceIds.targetStoreId) {
    throw new Error("Source and staging Prisma resource IDs must be different");
  }
  if (target.host !== expectedTargetHost.toLowerCase()) {
    throw new Error("Target database host does not match the staging allowlist");
  }
  if (databaseIdentityFingerprint(sourceUrl) === databaseIdentityFingerprint(targetUrl)) {
    throw new Error("Source and staging database connection identities must be different");
  }
  return {
    sourceHost: source.host,
    targetHost: target.host,
    sourceStoreId: resourceIds.sourceStoreId,
    targetStoreId: resourceIds.targetStoreId,
  };
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
