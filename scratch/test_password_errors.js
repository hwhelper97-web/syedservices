const { Client } = require("pg");

const host = "aws-0-ap-south-1.pooler.supabase.com";
const passwords = ["@Blackzerox22@", "@Black0x22@"];

async function main() {
  for (const password of passwords) {
    const encodedPassword = encodeURIComponent(password);
    const connectionString = `postgresql://postgres.uzvyxhjohegqymnudboi:${encodedPassword}@${host}:6543/postgres`;
    console.log(`Connecting with password: ${password}`);
    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });
    try {
      await client.connect();
      console.log("Success!");
      await client.end();
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }
  }
}

main().catch(console.error);
