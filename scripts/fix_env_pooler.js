const fs = require('fs');
const content = [
    'DB_USER=postgres.lwwmmufsdtbetgieoefo', // Required format for pooler
    'DB_PASSWORD=Carlos0412*',
    'DB_HOST=44.208.221.186', // Direct IP of aws-0-us-east-1.pooler.supabase.co
    'DB_NAME=postgres',
    'DB_PORT=6543', // Pooler port
    'JWT_SECRET=spoon_jwt_secret_key_2024_super_secure_string_for_production',
    'NEXT_PUBLIC_APP_URL=http://localhost:3000',
    '' // Final newline
].join('\n');

fs.writeFileSync('.env.local', content, { encoding: 'utf8' });
console.log('✅ .env.local updated for Supabase Pooler (IPv4)');
