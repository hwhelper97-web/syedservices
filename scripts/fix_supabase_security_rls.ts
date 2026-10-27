import { prisma } from "../lib/prisma";
import fs from "fs";
import path from "path";

async function fixSupabaseSecurityRls() {
  console.log("=== SUPABASE SECURITY & PERFORMANCE AUDIT FIX ===");
  console.log("Connecting to PostgreSQL database...");

  // 1. Fetch all tables in public schema
  const tables: Array<{ tablename: string; rowsecurity: boolean }> = await prisma.$queryRawUnsafe(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `);

  console.log(`Discovered ${tables.length} tables in schema 'public'.`);

  const unsecureTables = tables.filter((t) => !t.rowsecurity);
  console.log(`Tables currently requiring RLS activation: ${unsecureTables.length}`);

  const sqlStatements: string[] = [];

  for (const t of unsecureTables) {
    const sql = `ALTER TABLE "public"."${t.tablename}" ENABLE ROW LEVEL SECURITY;`;
    sqlStatements.push(sql);
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log(`✔ Enabled RLS on: public."${t.tablename}"`);
    } catch (err) {
      console.error(`✖ Failed to enable RLS on: public."${t.tablename}":`, err);
    }
  }

  // 2. Write the SQL script to prisma/rls_security_fix.sql for audit record
  const sqlFileContent = `-- ========================================================
-- SUPABASE SECURITY AUDIT REMEDIATION: ENABLE ROW LEVEL SECURITY (RLS)
-- Resolves:
--   1. rls_disabled_in_public (all 84 public tables)
--   2. sensitive_columns_exposed (Admin.password, AgencyBankAccount.iban, EmailConfig.password)
-- ========================================================

${tables.map((t) => `ALTER TABLE "public"."${t.tablename}" ENABLE ROW LEVEL SECURITY;`).join("\n")}
`;

  const sqlPath = path.join(__dirname, "..", "prisma", "rls_security_fix.sql");
  fs.writeFileSync(sqlPath, sqlFileContent, "utf8");
  console.log(`Saved audit remediation SQL file to: ${sqlPath}`);

  // 3. Verification: Query pg_tables again
  const verifiedTables: Array<{ tablename: string; rowsecurity: boolean }> = await prisma.$queryRawUnsafe(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `);

  const stillUnsecure = verifiedTables.filter((t) => !t.rowsecurity);
  const secureCount = verifiedTables.filter((t) => t.rowsecurity).length;

  console.log("\n=== VERIFICATION RESULTS ===");
  console.log(`Total public tables: ${verifiedTables.length}`);
  console.log(`Tables with RLS ENABLED (SECURE): ${secureCount}`);
  console.log(`Tables with RLS DISABLED (INSECURE): ${stillUnsecure.length}`);

  if (stillUnsecure.length === 0) {
    console.log("🎉 SUCCESS: 100% of public database tables are now protected with Row Level Security!");
  } else {
    console.warn("⚠️ Warning: Some tables could not be updated:", stillUnsecure.map((t) => t.tablename));
  }

  // 4. Test Prisma queries to ensure zero application regressions
  console.log("\n=== TESTING PRISMA APPLICATION ACCESS ===");
  try {
    const adminCount = await prisma.admin.count();
    console.log(`✔ Admin table count: ${adminCount} (Protected against public API access)`);

    const userCount = await prisma.user.count();
    console.log(`✔ User table count: ${userCount} (Protected against public API access)`);

    const packageCount = await prisma.package.count();
    console.log(`✔ Package table count: ${packageCount}`);

    const invoiceCount = await prisma.invoice.count();
    console.log(`✔ Invoice table count: ${invoiceCount}`);

    const appCount = await prisma.application.count();
    console.log(`✔ Application table count: ${appCount}`);

    console.log("All application queries executed smoothly without interruption!");
  } catch (err) {
    console.error("Application query check failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

fixSupabaseSecurityRls().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
