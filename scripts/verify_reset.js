require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function verifyReset() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('❌ DATABASE_URL missing!');
        process.exit(1);
    }

    console.log(`🔌 Testing DATABASE_URL Connection...`);
    // Mask password for logging
    console.log(`   URL: ${dbUrl.replace(/:[^:/@]+@/, ':****@')}`);

    const pool = new Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        console.log('✅ Connection Successful!');
        const res = await client.query('SELECT version(), current_user');
        console.log('📦 Version:', res.rows[0].version);
        console.log('👤 User:', res.rows[0].current_user);
        client.release();
    } catch (err) {
        console.error('❌ Failed:', err.message);
        if (err.code) console.error('   Code:', err.code);
    } finally {
        await pool.end();
    }
}

verifyReset();
