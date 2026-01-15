require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

// Construct the pooler URL manually
const poolerHost = 'aws-0-sa-east-1.pooler.supabase.co';
const dbUrl = `postgresql://postgres.lwwmmufsdtbetgieoefo:Carlos0412*@${poolerHost}:5432/postgres`;
const dbUrlTx = `postgresql://postgres.lwwmmufsdtbetgieoefo:Carlos0412*@${poolerHost}:6543/postgres`;

async function test(url, name) {
    console.log(`\n🔌 Testing ${name}...`);
    console.log(`   URL: ${url.replace(/:[^:/@]+@/, ':****@')}`);
    const pool = new Pool({
        connectionString: url,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        console.log('✅ Connection Successful!');
        const res = await client.query('SELECT version()');
        console.log('📦 Version:', res.rows[0].version);
        client.release();
    } catch (err) {
        console.error(`❌ Failed (${name}):`, err.message);
    } finally {
        await pool.end();
    }
}

async function run() {
    await test(dbUrl, "Session Mode (5432)");
    await test(dbUrlTx, "Transaction Mode (6543)");
}

run();
