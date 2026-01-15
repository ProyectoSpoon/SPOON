// scripts/check_postgis.js
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password', // Fallback defaults just in case
    host: 'localhost', // Force localhost for external script execution
    database: process.env.DB_NAME || 'spoon',
    port: process.env.DB_PORT || 5432,
});

async function checkPostGIS() {
    try {
        const passwordSource = process.env.DB_PASSWORD ? 'Env' : 'Default';
        console.log(`🔌 Connecting to DB (Host: localhost, User: ${process.env.DB_USER}, Pwd: ${passwordSource})...`);
        await client.connect();

        console.log('🔄 Attempting: CREATE EXTENSION IF NOT EXISTS postgis;');
        const res = await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
        console.log('✅ Success! PostGIS is available.');
        console.log('Result:', res);

        // Check version
        const versionRes = await client.query('SELECT postgis_full_version();');
        console.log('📏 Version:', versionRes.rows[0].postgis_full_version);

    } catch (err) {
        console.error('❌ Failure:', err.message);
        if (err.message.includes('could not open extension control file')) {
            console.error('👉 Diagnosis: PostGIS binaries are MISSING from this PostgreSQL image.');
        }
    } finally {
        await client.end();
    }
}

checkPostGIS();
