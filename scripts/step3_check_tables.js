// scripts/step3_check_tables.js
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    host: 'localhost',
    database: process.env.DB_NAME || 'Spoon_db',
    port: process.env.DB_PORT || 5433,
});

async function runStep3() {
    console.log('🔍 STEP 3: Table & Column Inspection');
    console.log('-----------------------------------');

    try {
        await client.connect();

        // Get all tables in 'restaurant' schema
        const resTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'restaurant'
      ORDER BY table_name;
    `);

        if (resTables.rows.length === 0) {
            console.log('❌ No tables found in "restaurant" schema.');
            return;
        }

        console.log(`📂 Found ${resTables.rows.length} tables in "restaurant" schema:\n`);

        // For each table, get its columns
        for (const table of resTables.rows) {
            const tableName = table.table_name;
            const resColumns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'restaurant' AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);

            const columns = resColumns.rows.map(c => `${c.column_name} (${c.data_type})`).join(', ');
            console.log(`   📄 Table: [${tableName}]`);
            console.log(`      Columns: ${columns}\n`);
        }

        // Check specifically for English vs Spanish mismatch
        const hasSpanish = resTables.rows.some(t => t.table_name === 'restaurantes');
        const hasEnglish = resTables.rows.some(t => t.table_name === 'restaurants');

        console.log('💡 ANALYSIS:');
        if (hasSpanish && !hasEnglish) {
            console.log('   ⚠️  LANGUAGE MISMATCH DETECTED: Tables are in SPANISH ("restaurantes").');
            console.log('       The Application Code expects ENGLISH ("restaurants").');
        } else if (hasEnglish) {
            console.log('   ✅ Tables seem to be in ENGLISH ("restaurants"). This matches the code.');
        }

    } catch (err) {
        console.error('❌ QUERY FAILED:', err.message);
    } finally {
        await client.end();
    }
}

runStep3();
