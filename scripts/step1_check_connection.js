// scripts/step1_check_connection.js
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    host: 'localhost',
    database: process.env.DB_NAME || 'spoon',
    port: process.env.DB_PORT || 5433, // Default to 5433 (external Docker)
});

async function runStep1() {
    console.log('🔍 STEP 1: Connection Verification');
    console.log('-----------------------------------');

    try {
        console.log('🔌 Connecting to localhost:' + client.port + '...');
        await client.connect();

        // Get Runtime Info
        const res = await client.query('SELECT version(), inet_server_addr(), inet_server_port(), current_database();');
        const row = res.rows[0];

        console.log('\n✅ CONNECTION SUCCESSFUL');
        console.log(`   Database: ${row.current_database}`);
        console.log(`   Server IP: ${row.inet_server_addr}`);
        console.log(`   Internal Port: ${row.inet_server_port}`);
        console.log(`   Version: ${row.version}`);

        console.log('\n💡 ANALYSIS:');
        if (row.version.includes('Debian') || row.version.includes('linux')) {
            console.log('   🐧 OS: LINUX (Docker Container) -> CORRECT environment.');
        } else if (row.version.includes('Windows')) {
            console.log('   🪟 OS: WINDOWS (Local Install) -> INCORRECT environment (Port Conflict).');
        }

    } catch (err) {
        console.error('\n❌ CONNECTION FAILED');
        console.error('   Error:', err.message);
        console.error('   Hint: Ensure Docker is running and port 5433 is mapped.');
    } finally {
        await client.end();
    }
}

runStep1();
