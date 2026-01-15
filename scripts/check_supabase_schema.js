// Script para verificar estructura de tabla users en Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lwwmmufsdtbetgieoefo.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
    db: { schema: 'auth' } // Intentar esquema auth
});

async function checkSchema() {
    console.log('🔍 Verificando estructura de tabla users...\n');

    // Intentar diferentes esquemas y nombres
    const attempts = [
        { schema: 'public', table: 'users', desc: 'public.users' },
        { schema: 'auth', table: 'users', desc: 'auth.users' },
    ];

    for (const attempt of attempts) {
        console.log(`📋 Intentando: ${attempt.desc}`);
        try {
            const client = createClient(supabaseUrl, supabaseKey, {
                db: { schema: attempt.schema }
            });

            const { data, error } = await client
                .from(attempt.table)
                .select('*')
                .limit(1);

            if (data && data.length > 0) {
                console.log('✅ Tabla encontrada!');
                console.log('📊 Columnas disponibles:', Object.keys(data[0]));
                console.log('📄 Ejemplo de registro:', JSON.stringify(data[0], null, 2));
                break;
            } else if (error) {
                console.log('❌ Error:', error.message);
            } else {
                console.log('⚠️ Tabla vacía\n');
            }
        } catch (e) {
            console.log('❌ Falló:', e.message, '\n');
        }
    }
}

checkSchema();
