const fs = require('fs');

const dbUrl = 'postgresql://postgres.lwwmmufsdtbetgieoefo:Carlos0412*@db.lwwmmufsdtbetgieoefo.supabase.co:5432/postgres';

const content = [
    `DATABASE_URL=${dbUrl}`,
    'DB_USER=postgres.lwwmmufsdtbetgieoefo',
    'DB_PASSWORD=Carlos0412*',
    'DB_HOST=db.lwwmmufsdtbetgieoefo.supabase.co',
    'DB_NAME=postgres',
    'DB_PORT=5432',
    'JWT_SECRET=spoon_jwt_secret_key_2024_super_secure_string_for_production',
    'NEXT_PUBLIC_APP_URL=http://localhost:3000',
    ''
].join('\n');

fs.writeFileSync('.env.local', content, { encoding: 'utf8' });
console.log('✅ .env.local updated with standard DATABASE_URL');
