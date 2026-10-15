/**
 * Explicit environment selection avoids letting Preview silently reuse the
 * production DATABASE_URL configured at the Vercel project level.
 * Never log or expose these credentials.
 */
function assertIsolated(candidate: string, production?: string) {
  if (!production) return;
  try {
    const a = new URL(candidate);
    const b = new URL(production);
    if (a.hostname === b.hostname && a.port === b.port &&
        a.pathname === b.pathname &&
        (a.searchParams.get("schema") || "public") === (b.searchParams.get("schema") || "public")) {
      throw new Error("Non-production database target matches production");
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Non-production database target matches production") throw error;
    throw new Error("Could not safely validate database isolation");
  }
}
export function resolveDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  // A staging override must never redirect an actual production deployment.\n  const staging = env.VERCEL_ENV === "production" ? undefined : env.AREES_STAGING_DATABASE_DATABASE_URL?.trim();
  if (staging) {
    assertIsolated(staging, env.DATABASE_URL);
    return staging;
  }
  if (env.VERCEL_ENV === "preview") {
    const preview = env.AREES_PREVIEW_DATABASE_URL?.trim();
    if (!preview) throw new Error("Isolated Preview database URL is not configured");
    assertIsolated(preview, env.DATABASE_URL);\n    const host = new URL(preview).hostname.toLowerCase();\n    if (["localhost", "127.0.0.1", "::1", "0.0.0.0"].includes(host)) {\n      throw new Error("Preview database cannot target a loopback address");\n    }
    return preview;
  }
  const database = env.DATABASE_URL?.trim();
  if (!database) throw new Error("Database connection URL is not configured");
  return database;
}
