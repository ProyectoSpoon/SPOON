require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const ips = ['54.94.90.106', '52.67.1.88', '15.229.150.166'];
const ports = [5432, 6543];
const snis = ['aws-0-sa-east-1.pooler.supabase.co', 'db.lwwmmufsdtbetgieoefo.supabase.co'];
// Note: User MUST be project-suffix for pooler usually, but testing 'postgres' just in case
const users = ['postgres.lwwmmufsdtbetgieoefo', 'postgres'];

async function test(ip, port, sni, user) {
    const config = {
        user,
        password: 'Carlos0412*',
        host: ip,
        port,
        database: 'postgres',
        ssl: { rejectUnauthorized: false, servername: sni },
        connectionTimeoutMillis: 3000
    };

    const pool = new Pool(config);
    try {
        const client = await pool.connect();
        console.log(`✅ SUCCESS: IP=${ip} Port=${port} SNI=${sni} User=${user}`);
        client.release();
        return true;
    } catch (err) {
        // Only log if NOT the standard errors to reduce noise
        const msg = err.message;
        const code = err.code || 'N/A';
        if (msg.includes('signature is missing')) {
            console.log(`❌ SIGNATURE_FAIL: IP=${ip} Port=${port} SNI=${sni} User=${user}`);
        } else if (msg.includes('Tenant or user not found')) {
            // console.log(`❌ TENANT_FAIL: IP=${ip} Port=${port} SNI=${sni} User=${user}`);
        } else {
            console.log(`❌ ${code}: ${msg} (IP=${ip} Port=${port} SNI=${sni} User=${user})`);
        }
    } finally {
        pool.end().catch(() => { });
    }
    return false;
}

async function run() {
    console.log('🚀 Starting Exhaustive SA-East Test...');
    for (const ip of ips) {
        for (const port of ports) {
            for (const sni of snis) {
                for (const user of users) {
                    const success = await test(ip, port, sni, user);
                    if (success) process.exit(0);
                }
            }
        }
    }
}

run();
