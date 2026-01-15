// scripts/debug_connection_variants.js
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const variants = [
    { name: 'SA East 1 - Suffix User - Pooler SNI', user: 'postgres.lwwmmufsdtbetgieoefo', sni: 'aws-0-sa-east-1.pooler.supabase.co', host: '54.94.90.106' },
    { name: 'SA East 1 - Plain User - Pooler SNI', user: 'postgres', sni: 'aws-0-sa-east-1.pooler.supabase.co', host: '54.94.90.106' },
    { name: 'SA East 1 - Suffix User - DB SNI', user: 'postgres.lwwmmufsdtbetgieoefo', sni: 'db.lwwmmufsdtbetgieoefo.supabase.co', host: '54.94.90.106' },
    { name: 'SA East 1 - Plain User - DB SNI', user: 'postgres', sni: 'db.lwwmmufsdtbetgieoefo.supabase.co', host: '54.94.90.106' },
];

const commonConfig = {
    password: 'Carlos0412*', // Using known password
    port: 5432, // Session mode
    database: 'postgres'
};

async function testVariant(variant) {
    if (variant.host === 'REPLACE_ME') return;
    console.log(`\n🧪 Testing: ${variant.name}`);
    console.log(`   Host: ${variant.host}`);
    console.log(`   User: ${variant.user}`);
    console.log(`   SNI: ${variant.sni}`);

    const pool = new Pool({
        ...commonConfig,
        user: variant.user,
        host: variant.host,
        ssl: { rejectUnauthorized: false, servername: variant.sni }
    });

    try {
        const client = await pool.connect();
        console.log('   ✅ SUCCESS! Connected.');
        const res = await client.query('SELECT version()');
        console.log('   📦 Version:', res.rows[0].version);
        await client.release();
        return true;
    } catch (err) {
        console.log('   ❌ FAILED:', err.message);
        if (err.code) console.log('   Code:', err.code);
        return false;
    } finally {
        await pool.end();
    }
}

async function run() {
    for (const variant of variants) {
        if (await testVariant(variant)) break;
    }
}

run();
