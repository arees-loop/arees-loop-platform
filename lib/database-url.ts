/**
 * Explicit environment selection avoids letting Preview silently reuse the
 * production DATABASE_URL configured at the Vercel project level.
 * Never log or expose these credentials.
 */
export function resolveDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const staging = env.AREES_STAGING_DATABASE_DATABASE_URL?.trim();
  if (staging) return staging;

  if (env.VERCEL_ENV === "preview") {
    const preview = env.AREES_PREVIEW_DATABASE_URL?.trim();
    if (!preview) throw new Error("Isolated Preview database URL is not configured");
    return preview;
  }

  const database = env.DATABASE_URL?.trim();
  if (!database) throw new Error("Database connection URL is not configured");
  return database;
}
