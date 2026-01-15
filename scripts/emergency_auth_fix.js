// scripts/emergency_auth_fix.js
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const poolConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false,
        servername: process.env.DB_SSL_SERVERNAME
    }
};

async function fixAdmin() {
    const pool = new Pool(poolConfig);
    try {
        console.log(`🔌 Connecting to fix admin user...`);
        const client = await pool.connect();

        const email = 'admin@spoon.com';
        const password = 'admin123';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        console.log(`🔑 Generated hash for '${password}'`);

        // Check if user exists
        const checkRes = await client.query('SELECT * FROM auth.users WHERE email = $1', [email]);

        if (checkRes.rows.length > 0) {
            console.log('👤 User exists, updating password...');
            await client.query(
                'UPDATE auth.users SET password_hash = $1, role = $2 WHERE email = $3',
                [hash, 'admin', email]
            );
            console.log('✅ Password updated successfully');
        } else {
            console.log('👤 User not found, creating new admin...');
            await client.query(
                `INSERT INTO auth.users (email, password_hash, name, role, created_at)
             VALUES ($1, $2, $3, $4, NOW())`,
                [email, hash, 'Admin Spoon', 'admin']
            );
            console.log('✅ User created successfully');
        }

        client.release();
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await pool.end();
    }
}

fixAdmin();
