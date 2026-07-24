const { Client } = require("pg");

const regions = [
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "ap-northeast-1",
  "ap-northeast-2",
  "ap-northeast-3",
  "ap-south-1",
  "ap-southeast-1",
  "ap-southeast-2",
  "ca-central-1",
  "eu-central-1",
  "eu-west-1",
  "eu-west-2",
  "eu-west-3",
  "eu-north-1",
  "me-central-1",
  "sa-east-1",
  "af-south-1"
];

const passwords = ["@Blackzerox22@", "@Black0x22@"];

async function testCombination(region, password) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const encodedPassword = encodeURIComponent(password);
  const connectionString = `postgresql://postgres.uzvyxhjohegqymnudboi:${encodedPassword}@${host}:6543/postgres`;
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000 // 5s timeout
  });
  try {
    await client.connect();
    console.log(`\n🎉 SUCCESS! Connected to region ${region} with password ${password}`);
    console.log(`Connection string: ${connectionString}`);
    await client.end();
    return connectionString;
  } catch (err) {
    if (err.message.includes("password authentication failed")) {
      console.log(`❌ Region ${region}: Host reached, but password "${password}" failed.`);
    } else {
      // Quietly log other errors (like ENOTFOUND for wrong region)
    }
    return null;
  }
}

async function main() {
  console.log("Starting parallel region testing...");
  const promises = [];
  for (const region of regions) {
    for (const password of passwords) {
      promises.push(testCombination(region, password));
    }
  }
  const results = await Promise.all(promises);
  const correct = results.find(r => r !== null);
  if (correct) {
    console.log("\n=========================================");
    console.log("USE THIS DATABASE_URL IN VERCEL & LOCAL:");
    console.log(correct);
    console.log("=========================================");
  } else {
    console.log("\nCould not find a working connection. Check database status or passwords.");
  }
}

main().catch(console.error);
