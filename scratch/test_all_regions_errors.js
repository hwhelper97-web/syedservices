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

async function testRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const connectionString = `postgresql://postgres.uzvyxhjohegqymnudboi:mock_password@${host}:6543/postgres`;
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });
  try {
    await client.connect();
    await client.end();
  } catch (err) {
    console.log(`Region: ${region} -> Error: ${err.message}`);
  }
}

async function main() {
  console.log("Testing regions for error responses...");
  for (const region of regions) {
    await testRegion(region);
  }
}

main().catch(console.error);
