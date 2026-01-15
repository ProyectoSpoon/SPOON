// scripts/force_init_db.js
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    host: 'localhost',
    database: process.env.DB_NAME || 'spoon',
    port: process.env.DB_PORT || 5433, // Defaulting to our new port
});

async function forceInit() {
    console.log('🚀 Starting Manual DB Initialization...');

    try {
        const sqlPath = path.join(__dirname, 'init-db.sql');
        if (!fs.existsSync(sqlPath)) {
            throw new Error(`Init file not found at: ${sqlPath}`);
        }

        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        console.log(`📄 Loaded init-db.sql (${sqlContent.length} bytes)`);

        console.log('🔌 Connecting to DB...');
        await client.connect();

        console.log('🔥 Executing SQL Batch (This might take a moment)...');
        // pg driver allows multiple statements in one query call
        await client.query(sqlContent);

        console.log('✅ Initialization Completed Successfully!');
        console.log('   - Schema "restaurant" created');
        console.log('   - Tables created');
        console.log('   - Extensions enabled');

    } catch (err) {
        console.error('\n❌ INIT FAILED');
        console.error('Error:', err.message);
        if (err.position) {
            console.error(`at position: ${err.position}`);
        }
    } finally {
        await client.end();
    }
}

forceInit();
