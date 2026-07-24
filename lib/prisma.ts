import { PrismaClient } from "@prisma/client";
import path from "path";

// Ensure DATABASE_URL is set to a valid SQLite file path in production/development
// to avoid schema validation errors if cPanel/serverless env overrides it or leaves it empty.
if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith("file:")) {
  const dbPath = path.join(process.cwd(), "prisma", "dev.db");
  process.env.DATABASE_URL = `file:${dbPath}`;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}