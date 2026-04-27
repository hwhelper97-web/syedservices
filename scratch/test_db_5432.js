
const { Client } = require('pg');
const client = new Client({
  connectionString: "postgresql://postgres.uzvyxhjohegqymnudboi:%40Blackzerox22%40@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require",
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => {
    console.log('Connected successfully to 5432');
    client.end();
  })
  .catch(err => {
    console.error('Connection error on 5432', err.stack);
  });
