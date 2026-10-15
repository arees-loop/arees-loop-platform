import { resolveDatabaseUrl } from "./lib/database-url";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

if (!process.env.DATABASE_URL && !process.env.AREES_STAGING_DATABASE_DATABASE_URL && !process.env.AREES_PREVIEW_DATABASE_URL) {
  config({ path: ".env.local" });
}

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    url: resolveDatabaseUrl(),
  },
});
