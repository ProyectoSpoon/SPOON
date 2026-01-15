const fs = require('fs');
const content = [
    'DB_USER=postgres.lwwmmufsdtbetgieoefo', // Correct pooler user
    'DB_PASSWORD=Carlos0412*',
    'DB_HOST=54.94.90.106', // SA East 1 IPv4
    'DB_NAME=postgres',
    'DB_PORT=6543', // Transaction mode
    'JWT_SECRET=spoon_jwt_secret_key_2024_super_secure_string_for_production',
    'NEXT_PUBLIC_APP_URL=http://localhost:3000',
    'DB_SSL_SERVERNAME=aws-0-sa-east-1.pooler.supabase.co', // Correct SNI
    ''
].join('\n');

fs.writeFileSync('.env.local', content, { encoding: 'utf8' });
console.log('✅ .env.local updated for SA East 1 (IPv4 + SNI)');
