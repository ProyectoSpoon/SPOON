// scripts/debug_connection.js
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    host: 'localhost',
    database: process.env.DB_NAME || 'spoon',
    port: process.env.DB_PORT || 5433,
});

async function checkConnection() {
    try {
        console.log('🔌 Connecting...');
        await client.connect();

        // Query system info to identify the server
        const res = await client.query('SELECT version(), inet_server_addr(), inet_server_port();');
        console.log('✅ Connected!');
        console.log('---------------------------------------------------');
        console.log('Server Version:', res.rows[0].version);
        console.log('Server IP:', res.rows[0].inet_server_addr);
        console.log('Server Port:', res.rows[0].inet_server_port);
        console.log('---------------------------------------------------');

        if (res.rows[0].version.includes('Debian') || res.rows[0].version.includes('Alpine')) {
            console.log('🐧 OS: Linux/Docker (Likely Correct)');
        } else if (res.rows[0].version.includes('Windows')) {
            console.log('🪟 OS: Windows (WRONG SERVER - You are connecting to local Postgres!)');
        }

    } catch (err) {
        console.error('❌ Connection failed:', err.message);
    } finally {
        await client.end();
    }
}

checkConnection();
