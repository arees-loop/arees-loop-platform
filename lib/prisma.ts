import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

// Reuse the client whenever this Vercel Node.js isolate is warm, including in
// production. A pool per render/request leads to resource exhaustion on small
// databases. One TCP connection per isolate limits bursts, while the actual
// runtime DATABASE_URL must still point to the provider's pooled endpoint.
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter: new PrismaPg({
    connectionString,
    max: 1,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 5_000,
  }),
});

globalForPrisma.prisma = prisma;
