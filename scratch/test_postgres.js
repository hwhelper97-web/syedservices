const { Client } = require("pg");

async function testPassword(password) {
  const encodedPassword = encodeURIComponent(password);
  const connectionString = `postgresql://postgres:${encodedPassword}@db.uzvyxhjohegqymnudboi.supabase.co:5432/postgres`;
  console.log(`Testing password: ${password}`);
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log(`Success! Password "${password}" is correct.`);
    await client.end();
    return connectionString;
  } catch (error) {
    console.error(`Failed with password "${password}":`, error.message);
    return null;
  }
}

async function main() {
  let correctUrl = await testPassword("@Blackzerox22@");
  if (!correctUrl) {
    correctUrl = await testPassword("@Black0x22@");
  }
  if (correctUrl) {
    console.log("CORRECT DATABASE URL IS:", correctUrl);
  } else {
    console.log("Neither password worked.");
  }
}

main().catch(console.error);
