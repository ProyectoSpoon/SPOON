// Verificar estructura completa de esquemas en Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lwwmmufsdtbetgieoefo.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3d21tdWZzZHRiZXRnaWVvZWZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzM4MjE1NiwiZXhwIjoyMDY4OTU4MTU2fQ.ZBCKGjaoxyW8aXnArO4uS5LgC3HjHt21VI3cegj0hLQ';

const supabase = createClient(supabaseUrl, serviceKey);

async function checkDatabase() {
    console.log('🔍 Verificando estructura de base de datos...\n');

    // 1. Verificar qué esquemas existen usando información del sistema
    console.log('📋 Intentando listar esquemas disponibles...');
    try {
        const { data: schemas, error } = await supabase.rpc('list_schemas');
        if (data) {
            console.log('Esquemas encontrados:', schemas);
        } else {
            console.log('No se pudo listar esquemas (función RPC no existe)');
        }
    } catch (e) {
        console.log('RPC list_schemas no disponible');
    }

    // 2. Buscar usuarios en diferentes ubicaciones posibles
    const locations = [
        { schema: 'public', table: 'users' },
        { schema: 'auth', table: 'users' },
        { schema: 'public', table: 'auth_users' },
    ];

    for (const loc of locations) {
        console.log(`\n📍 Buscando en: ${loc.schema}.${loc.table}`);
        try {
            const client = createClient(supabaseUrl, serviceKey, {
                db: { schema: loc.schema }
            });

            const { data, error, count } = await client
                .from(loc.table)
                .select('*', { count: 'exact' })
                .limit(1);

            if (error) {
                console.log(`   ❌ Error: ${error.message}`);
            } else {
                console.log(`   ✅ Tabla encontrada! Total registros: ${count}`);
                if (data && data.length > 0) {
                    console.log(`   📄 Columnas:`, Object.keys(data[0]));
                    console.log(`   📊 Primer registro (sin password):`, {
                        id: data[0].id,
                        email: data[0].email,
                        role: data[0].role || 'N/A'
                    });
                }
            }
        } catch (e) {
            console.log(`   ❌ Excepción:`, e.message);
        }
    }
}

checkDatabase().then(() => process.exit(0));
