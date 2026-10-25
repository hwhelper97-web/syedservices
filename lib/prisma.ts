import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getRuntimeDatabaseUrl(): string | undefined {
  let url = process.env.DATABASE_URL;
  if (!url) return undefined;

  // If connecting to Supabase pooler on session mode (port 5432), route runtime queries to transaction mode (port 6543)
  // which supports thousands of concurrent serverless clients instead of the 15-connection session limit
  if (url.includes(".pooler.supabase.com:5432")) {
    url = url.replace(".pooler.supabase.com:5432", ".pooler.supabase.com:6543");
    if (!url.includes("pgbouncer=true")) {
      url += (url.includes("?") ? "&" : "?") + "pgbouncer=true";
    }
  }

  // Enforce serverless connection limit
  if (!url.includes("connection_limit=")) {
    url += (url.includes("?") ? "&" : "?") + "connection_limit=2";
  }

  return url;
}

const dbUrl = getRuntimeDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

// Retain a single PrismaClient across serverless invocations
globalForPrisma.prisma = prisma;
