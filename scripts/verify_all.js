// scripts/verify_all.js
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    host: 'localhost',
    database: process.env.DB_NAME || 'spoon',
    port: process.env.DB_PORT || 5433,
});

async function verify() {
    console.log('🔍 Starting System Verification...');
    console.log('-----------------------------------');

    try {
        console.log('1. Connecting to Database...');
        await client.connect();
        console.log('✅ Connected successfully.');

        console.log('\n2. Checking PostgreSQL Version...');
        const versionRes = await client.query('SELECT version();');
        console.log(`ℹ️  ${versionRes.rows[0].version}`);

        console.log('\n3. Checking PostGIS Extension...');
        const postgisRes = await client.query('SELECT postgis_full_version();');
        console.log(`✅ PostGIS Active: ${postgisRes.rows[0].postgis_full_version}`);

        console.log('\n4. Checking "geom" column in restaurants table...');
        const colRes = await client.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns 
      WHERE table_schema = 'restaurant' 
      AND table_name = 'restaurants' 
      AND column_name = 'geom';
    `);

        if (colRes.rows.length > 0) {
            console.log(`✅ Column 'geom' found! Type: ${colRes.rows[0].udt_name} (${colRes.rows[0].data_type})`);
        } else {
            console.warn('⚠️  Column "geom" NOT found. You need to run the migration script.');
        }

    } catch (err) {
        console.error('\n❌ VERIFICATION FAILED');
        console.error('Error:', err.message);
        if (err.message.includes('function postgis_full_version() does not exist')) {
            console.error('👉 Diagnosis: PostGIS extension is NOT installed/enabled in this database.');
        }
        process.exit(1);
    } finally {
        await client.end();
    }
}

verify();
