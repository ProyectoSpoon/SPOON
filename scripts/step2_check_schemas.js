// scripts/step2_check_schemas.js
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    host: 'localhost',
    database: process.env.DB_NAME || 'Spoon_db', // Ensure case matches Step 1 output if sensitive
    port: process.env.DB_PORT || 5433,
});

async function runStep2() {
    console.log('🔍 STEP 2: Schema Discovery');
    console.log('-----------------------------------');

    try {
        await client.connect();

        const query = `
      SELECT schema_name, schema_owner 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY schema_name;
    `;

        const res = await client.query(query);

        console.log('📂 Found Schemas:');
        console.table(res.rows);

        const hasRestaurant = res.rows.some(r => r.schema_name === 'restaurant');

        if (hasRestaurant) {
            console.log('\n✅ Schema "restaurant" FOUND. This is correct.');
        } else {
            console.log('\n❌ Schema "restaurant" NOT FOUND.');
            console.log('   The tables might be in "public" or missing entirely.');
        }

    } catch (err) {
        console.error('❌ QUERY FAILED:', err.message);
    } finally {
        await client.end();
    }
}

runStep2();
