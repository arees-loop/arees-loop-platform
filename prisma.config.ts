import { resolveDatabaseUrl } from "./lib/database-url";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

if (!process.env.DATABASE_URL && !process.env.AREES_STAGING_DATABASE_DATABASE_URL && !process.env.AREES_PREVIEW_DATABASE_URL) {
  config({ path: ".env.local" });
}

// Schema/client generation does not connect to a database; use a non-routable placeholder\n// only for the generate command. Database commands must resolve the real isolated URL.\nconst clientGenerationOnly = process.argv.slice(2).includes("generate");\n\nexport default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    url: clientGenerationOnly\n      ? "postgresql://generator:unused@127.0.0.1:5432/generation_only"\n      : resolveDatabaseUrl(),
  },
});
