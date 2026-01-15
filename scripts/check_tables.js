// scripts/check_tables.js
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    host: 'localhost',
    database: process.env.DB_NAME || 'spoon',
    port: process.env.DB_PORT || 5433,
});

async function checkTables() {
    try {
        await client.connect();
        console.log('🔌 Connected. Listing Schemas and Tables...');

        const res = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog') 
      ORDER BY table_schema, table_name;
    `);

        if (res.rows.length === 0) {
            console.log('❌ No user tables found in the database.');
        } else {
            console.table(res.rows);
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

checkTables();
