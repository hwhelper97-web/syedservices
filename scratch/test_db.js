
const { Client } = require('pg');
const client = new Client({
  connectionString: "postgresql://postgres.uzvyxhjohegqymnudboi:%40Blackzerox22%40@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require",
});

client.connect()
  .then(() => {
    console.log('Connected successfully');
    client.end();
  })
  .catch(err => {
    console.error('Connection error', err.stack);
  });
