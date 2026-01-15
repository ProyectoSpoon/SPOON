const fs = require('fs');
const content = [
    'DB_USER=postgres',
    'DB_PASSWORD=Carlos0412*', // Using the password found in project
    'DB_HOST=db.lwwmmufsdtbetgieoefo.supabase.co',
    'DB_NAME=postgres',
    'DB_PORT=5432', // Direct connection port
    'JWT_SECRET=spoon_jwt_secret_key_2024_super_secure_string_for_production',
    'NEXT_PUBLIC_APP_URL=http://localhost:3000',
    '' // Final newline
].join('\n');

fs.writeFileSync('.env.local', content, { encoding: 'utf8' });
console.log('✅ .env.local rewritten cleanly with Node.js');
