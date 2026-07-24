const { Client } = require("pg");

async function testPooler(password) {
  const encodedPassword = encodeURIComponent(password);
  // Supabase connection pooler host is usually [region].pooler.supabase.com or aws-0-[region].pooler.supabase.com
  const regions = [
    "aws-0-us-east-1.pooler.supabase.com",
    "aws-0-eu-central-1.pooler.supabase.com",
    "aws-0-ap-southeast-1.pooler.supabase.com"
  ];

  for (const host of regions) {
    const connectionString = `postgresql://postgres.uzvyxhjohegqymnudboi:${encodedPassword}@${host}:6543/postgres`;
    console.log(`Testing host: ${host} with password: ${password}`);
    const client = new Client({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });
    try {
      await client.connect();
      console.log(`SUCCESS! Connected to ${host} using password "${password}"`);
      await client.end();
      return connectionString;
    } catch (e) {
      console.log(`Failed for ${host}:`, e.message);
    }
  }
  return null;
}

async function main() {
  let url = await testPooler("@Blackzerox22@");
  if (!url) {
    url = await testPooler("@Black0x22@");
  }
  if (url) {
    console.log("WORKING CONNECTION STRING IS:", url);
  } else {
    console.log("Could not connect to any pooler.");
  }
}

main().catch(console.error);
