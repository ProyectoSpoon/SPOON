// scripts/verify_supabase_sni.js
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const poolConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false,
        servername: process.env.DB_SSL_SERVERNAME
    }
};

async function verify() {
    const pool = new Pool(poolConfig);
    try {
        console.log(`🔌 Verifying Supabase connection with SNI...`);
        console.log(`   Host: ${poolConfig.host}`);
        console.log(`   SNI: ${poolConfig.ssl.servername}`);

        const client = await pool.connect();
        console.log('✅ Conexión exitosa!');

        const versionRes = await client.query('SELECT version(), current_database()');
        console.log('📦 Versión:', versionRes.rows[0].version);

        // Check key tables
        try {
            const usersRes = await client.query('SELECT count(*) FROM auth.users');
            console.log(`👥 auth.users: ${usersRes.rows[0].count}`);
        } catch (e) { console.error('❌ Error checking auth.users:', e.message); }

        try {
            const restRes = await client.query('SELECT count(*) FROM restaurant.restaurants');
            console.log(`🍽️ restaurant.restaurants: ${restRes.rows[0].count}`);
        } catch (e) { console.error('❌ Error checking restaurants:', e.message); }

        client.release();
    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
    } finally {
        await pool.end();
    }
}

verify();
