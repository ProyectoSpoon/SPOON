// scripts/run_migration.js
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    host: 'localhost',
    database: process.env.DB_NAME || 'spoon',
    port: process.env.DB_PORT || 5433,
});

async function runMigration() {
    try {
        console.log('🔌 Connecting to DB...');
        await client.connect();

        const sqlPath = path.join(__dirname, 'add_geom_column.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📜 Executing migration script...');
        await client.query(sql);

        console.log('✅ Migration successful!');
        console.log('[DB_SPATIAL] Extension PostGIS active, column \'geom\' indexed and synced.');

    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();
