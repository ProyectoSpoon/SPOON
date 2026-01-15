require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const config = {
    user: process.env.DB_USER, // postgres.lww...
    password: process.env.DB_PASSWORD, // Carlos0412*
    host: process.env.DB_HOST, // 54.94.90.106
    port: 6543, // Transaction pooler
    database: 'postgres',
    ssl: {
        rejectUnauthorized: false,
        servername: process.env.DB_SSL_SERVERNAME // aws-0-sa-east-1...
    }
};

async function testPort() {
    const pool = new Pool(config);
    try {
        console.log(`🔌 Testing Port ${config.port}...`);
        const client = await pool.connect();
        console.log('✅ Connection Successful!');
        const res = await client.query('SELECT version()');
        console.log('📦 Version:', res.rows[0].version);
        client.release();
    } catch (err) {
        console.error(`❌ Port ${config.port} Failed:`, err.message);
    } finally {
        await pool.end();
    }
}

testPort();
