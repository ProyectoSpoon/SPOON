// scripts/verify_supabase.js
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

async function verify() {
    let client; // Declare client outside try block for finally access
    let localPool; // Declare localPool for potential closing in finally
    try {
        const host = process.env.DB_HOST || '';
        console.log(`🔌 Conectando a Supabase...`);
        console.log(`   Host raw: "${host}"`);
        console.log(`   Length: ${host.length}`);
        console.log(`   Char codes: ${JSON.stringify(host.split('').map(c => c.charCodeAt(0)))}`);
        console.log(`👤 Usuario: ${process.env.DB_USER}`);

        // Fallback hardcoded para descartar problemas de .env
        const poolConfig = {
            user: process.env.DB_USER,
            host: host.trim(), // Asegurar trim
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
            ssl: { rejectUnauthorized: false }
        };

        localPool = new Pool(poolConfig); // Create a new pool instance
        client = await localPool.connect(); // Connect using the new pool
        console.log('✅ Conexión exitosa!');

        // 1. Verificar versión y base de datos
        const versionRes = await client.query('SELECT version(), current_database()');
        console.log('📦 Versión:', versionRes.rows[0].version);
        console.log('💾 DB:', versionRes.rows[0].current_database);

        // 2. Verificar Tabla auth.users
        try {
            const usersRes = await client.query('SELECT count(*) FROM auth.users');
            console.log(`👥 auth.users: ${usersRes.rows[0].count} registros`);
        } catch (e) {
            console.error('❌ Error en auth.users:', e.message);
        }

        // 3. Verificar Tabla restaurant.restaurants
        try {
            const restRes = await client.query('SELECT count(*) FROM restaurant.restaurants');
            console.log(`🍽️ restaurant.restaurants: ${restRes.rows[0].count} registros`);

            // Verificar columnas críticas
            const colsRes = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'restaurant' 
            AND table_name = 'restaurants' 
            AND column_name IN ('geom', 'owner_id', 'latitude', 'longitude')
        `);
            console.log('🔍 Columnas críticas encontradas:', colsRes.rows.map(r => r.column_name).join(', '));

        } catch (e) {
            console.error('❌ Error en restaurant.restaurants:', e.message);
        }

        client.release();
    } catch (err) {
        console.error('❌ Error fatal de conexión:', err);
    } finally {
        await pool.end();
    }
}

verify();
