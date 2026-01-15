// scripts/debug_extensions.js
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    host: 'localhost',
    database: process.env.DB_NAME || 'spoon',
    port: process.env.DB_PORT || 5432,
});

async function listExtensions() {
    try {
        await client.connect();
        console.log('🔌 Connected. Listing available extensions...');

        // Lista todas las extensiones que el sistema conoce (pg_available_extensions)
        const res = await client.query(`
      SELECT name, default_version, installed_version, comment 
      FROM pg_available_extensions 
      WHERE name LIKE '%postgis%' OR name = 'plpgsql' 
      ORDER BY name;
    `);

        console.table(res.rows);

        if (res.rows.find(r => r.name === 'postgis')) {
            console.log('✅ PostGIS is available! You just need to CREATE EXTENSION.');
        } else {
            console.error('❌ PostGIS is NOT in pg_available_extensions. The Docker image is wrong!');
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

listExtensions();
