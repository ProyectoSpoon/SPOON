const fs = require('fs');
const content = [
    'DB_USER=postgres.lwwmmufsdtbetgieoefo',
    'DB_PASSWORD=Carlos0412*',
    'DB_HOST=44.208.221.186',
    'DB_NAME=postgres',
    'DB_PORT=5432',
    'JWT_SECRET=spoon_jwt_secret_key_2024_super_secure_string_for_production',
    'NEXT_PUBLIC_APP_URL=http://localhost:3000',
    'DB_SSL_SERVERNAME=db.lwwmmufsdtbetgieoefo.supabase.co', // Critical for correct routing
    ''
].join('\n');

fs.writeFileSync('.env.local', content, { encoding: 'utf8' });
console.log('✅ .env.local rewritten with final Supabase config (IPv4 + SNI)');
