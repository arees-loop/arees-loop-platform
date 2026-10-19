export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.AREES_DATABASE_ENV !== "staging") return;

  // The staging database credentials use dedicated names so they cannot be
  // confused with production credentials or accidentally reused in previews.
  const stagingUrl =
    process.env.AREES_STAGING_DATABASE_DATABASE_URL ||
    process.env.AREES_STAGING_DATABASE_PRISMA_DATABASE_URL;
  if (!stagingUrl) {
    throw new Error("The isolated staging database URL is not configured.");
  }
  process.env.DATABASE_URL = stagingUrl;
}
