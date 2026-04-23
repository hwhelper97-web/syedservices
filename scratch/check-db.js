const pg = require('pg');
const connectionString = "postgresql://postgres.uzvyxhjohegqymnudboi:%40Blackzerox22%40@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require";

const pool = new pg.Pool({ connectionString });

pool.query('SELECT * FROM "Admin"', (err, res) => {
    if (err) {
        console.error('Database Error:', err.message);
        if (err.message.includes('does not exist')) {
            console.log('Tables are not created yet.');
        }
    } else {
        console.log('Users found:', res.rows.length);
        res.rows.forEach(user => {
            console.log('Email:', user.email);
        });
    }
    pool.end();
});
