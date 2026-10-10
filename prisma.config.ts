import { config } from "dotenv";
import { defineConfig } from "prisma/config";
import { getDatabaseUrl, STAGING_VERCEL_PROJECT_ID } from "./lib/database-target.mjs";

const isPreviewDeployment =
  process.env.VERCEL_ENV === "preview" &&
  process.env.VERCEL_PROJECT_ID !== STAGING_VERCEL_PROJECT_ID;

if (
  process.env.VERCEL_PROJECT_ID !== STAGING_VERCEL_PROJECT_ID &&
  !isPreviewDeployment &&
  !process.env.DATABASE_URL
) {
  config({ path: ".env.local" });
}

const databaseUrl = getDatabaseUrl();

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    url: databaseUrl ?? "",
  },
});
