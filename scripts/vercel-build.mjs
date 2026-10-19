import { spawnSync } from "node:child_process";

const shouldMigrate = process.env.AREES_LICENSE_MIGRATIONS_ENABLED === "true";
const isStaging = process.env.AREES_DATABASE_ENV === "staging";

if (shouldMigrate) {
  if (process.env.VERCEL_ENV !== "production") {
    throw new Error("Database migrations are blocked outside a production-target deployment.");
  }

  let databaseUrl;
  if (isStaging) {
    if (process.env.AREES_STAGING_DATABASE_STORE_ID !== "store_fpCPANjbF7V7x3tT") {
      throw new Error("Staging database identity check failed; migration stopped.");
    }
    databaseUrl = process.env.AREES_STAGING_DATABASE_PRISMA_DATABASE_URL;
  } else {
    databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PRISMA_DATABASE_URL;
  }

  if (!databaseUrl) throw new Error("Database migration URL is unavailable.");
  const run = (command, args, env) => {
    const result = spawnSync(command, args, { stdio: "inherit", env });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status || 1);
  };
  const migrationEnv = { ...process.env, DATABASE_URL: databaseUrl };
  run("npx", ["prisma", "migrate", "deploy"], migrationEnv);

  if (isStaging) {
    run("node", ["scripts/license-upload-acceptance.mjs"], migrationEnv);
  }
}

const build = spawnSync("npx", ["next", "build"], { stdio: "inherit", env: process.env });
if (build.error) throw build.error;
process.exit(build.status || 0);
