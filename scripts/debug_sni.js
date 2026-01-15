// scripts/debug_sni.js
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const poolConfig = {
    user: 'postgres.lwwmmufsdtbetgieoefo', // Valid pooler user
    host: '44.208.221.186', // Direct IP
    database: 'postgres',
    password: 'Carlos0412*',
    port: 6543, // Transaction pooler
    ssl: {
        rejectUnauthorized: false,
        servername: 'aws-0-us-east-1.pooler.supabase.co' // Inject SNI
    }
};

async function verify() {
    const pool = new Pool(poolConfig);
    try {
        console.log(`🔌 Testing Connection with SNI...`);
        console.log(`   Host: ${poolConfig.host}`);
        console.log(`   SNI: ${poolConfig.ssl.servername}`);

        const client = await pool.connect();
        console.log('✅ Connection Successful!');

        const res = await client.query('SELECT version()');
        console.log('📦 Version:', res.rows[0].version);

        client.release();
    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
        if (err.code) console.error('   Code:', err.code);
    } finally {
        await pool.end();
    }
}

verify();
