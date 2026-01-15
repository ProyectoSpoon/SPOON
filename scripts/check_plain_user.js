require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const config = {
    user: 'postgres.lwwmmufsdtbetgieoefo',
    password: 'WRONG_PASSWORD',
    host: '54.94.90.106', // SA East 1 IPv4
    port: 5432, // Session
    database: 'postgres',
    ssl: {
        rejectUnauthorized: false,
        servername: 'db.lwwmmufsdtbetgieoefo.supabase.co' // Direct DB SNI
    }
};

async function testPlain() {
    const pool = new Pool(config);
    try {
        console.log(`🔌 Testing Plain User + DB SNI...`);
        const client = await pool.connect();
        console.log('✅ Connection Successful!');
        const res = await client.query('SELECT version()');
        console.log('📦 Version:', res.rows[0].version);
        client.release();
    } catch (err) {
        console.error(`❌ Check Failed:`, err.message);
        if (err.code) console.error(`   Code:`, err.code);
    } finally {
        await pool.end();
    }
}

testPlain();
