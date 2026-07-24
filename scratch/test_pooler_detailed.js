const { Client } = require("pg");

const configs = [
  { host: "aws-0-ap-south-1.pooler.supabase.com", port: 6543 },
  { host: "aws-0-ap-southeast-1.pooler.supabase.com", port: 6543 },
  { host: "aws-0-ap-south-1.pooler.supabase.com", port: 5432 },
  { host: "aws-0-ap-southeast-1.pooler.supabase.com", port: 5432 }
];

const passwords = ["@Blackzerox22@", "@Black0x22@"];

async function test(host, port, password) {
  const encodedPassword = encodeURIComponent(password);
  // Try both username formats:
  // 1. postgres.uzvyxhjohegqymnudboi
  // 2. postgres
  const usernames = ["postgres.uzvyxhjohegqymnudboi", "postgres"];
  
  for (const user of usernames) {
    const connectionString = `postgresql://${user}:${encodedPassword}@${host}:${port}/postgres`;
    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });
    try {
      await client.connect();
      console.log(`\n🎉 WORKING CONNECTION:`);
      console.log(`String: ${connectionString}`);
      await client.end();
      return connectionString;
    } catch (e) {
      // Ignore
    }
  }
  return null;
}

async function main() {
  console.log("Testing combination pooler connections...");
  for (const config of configs) {
    for (const password of passwords) {
      const res = await test(config.host, config.port, password);
      if (res) return;
    }
  }
  console.log("None succeeded.");
}

main().catch(console.error);
