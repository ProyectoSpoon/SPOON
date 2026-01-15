require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

const sql = postgres({
    host: '54.94.90.106', // SA East 1
    port: 5432,
    database: 'postgres',
    username: 'postgres.lwwmmufsdtbetgieoefo',
    password: 'Carlos0412*', // Your password
    ssl: { rejectUnauthorized: false }, // Postgres.js SSL option
    transform: { undefined: null }
});

async function testPostgresJS() {
    try {
        console.log('🔌 Testing postgres.js connection...');
        const result = await sql`SELECT version()`;
        console.log('✅ Success!', result[0].version);
        await sql.end();
    } catch (err) {
        console.error('❌ Failed:', err);
        process.exit(1);
    }
}

testPostgresJS();
