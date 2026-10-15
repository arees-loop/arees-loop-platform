import { resolveDatabaseUrl } from "@/lib/database-url";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Build-time imports must not make an unavailable Preview database prevent UI compilation.
// This deliberately unreachable endpoint cannot contain or access production data.
// At runtime any query using it fails closed until an isolated Preview URL is configured.
function getSafeConnectionString() {
  try {
    return resolveDatabaseUrl();
  } catch (error) {
    if (process.env.VERCEL_ENV !== "preview") throw error;
    return "postgresql://disabled:disabled@127.0.0.1:1/arees_preview_disabled";
  }
}

const connectionString = getSafeConnectionString();

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}