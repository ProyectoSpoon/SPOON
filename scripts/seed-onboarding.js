
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuración
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lwwmmufsdtbetgieoefo.supabase.co';
// Usamos la Service Role Key para tener permisos de admin (acceder a auth.users, bypass RLS)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3d21tdWZzZHRiZXRnaWVvZWZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzM4MjE1NiwiZXhwIjoyMDY4OTU4MTU2fQ.ZBCKGjaoxyW8aXnArO4uS5LgC3HjHt21VI3cegj0hLQ';

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const TARGET_EMAIL = 'carlos.test@spoon.com';

async function seed() {
    console.log(`🌱 Iniciando Seed de Onboarding para: ${TARGET_EMAIL}`);

    // 1. Buscar Usuario en Auth
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
        console.error('❌ Error listando usuarios:', userError);
        return;
    }

    const user = users.find(u => u.email === TARGET_EMAIL);

    if (!user) {
        console.error(`❌ Usuario ${TARGET_EMAIL} no encontrado. Por favor regístralo primero o usa crea-test-user.`);
        return;
    }

    console.log(`✅ Usuario encontrado: ${user.id}`);

    // 2. Crear Restaurant (o actualizar)
    console.log('🍔 Procesando Restaurante...');

    // Verificar si ya existe
    const { data: existingRest } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

    let restaurantId = existingRest?.id;

    if (restaurantId) {
        console.log(`   ⚠️ Restaurante ya existe (ID: ${restaurantId}). Actualizando ubicación...`);
        await supabase.from('restaurants').update({
            name: 'Spoon Ocaña',
            address: 'Calle 10 # 5-67, Centro, Ocaña',
            latitude: 8.237,
            longitude: -73.356,
            logo_url: 'https://via.placeholder.com/150'
        }).eq('id', restaurantId);
    } else {
        const { data: newRest, error: createError } = await supabase
            .from('restaurants')
            .insert({
                owner_id: user.id,
                name: 'Spoon Ocaña',
                address: 'Calle 10 # 5-67, Centro, Ocaña',
                latitude: 8.237,
                longitude: -73.356,
                logo_url: 'https://via.placeholder.com/150',
                is_active: true
            })
            .select()
            .single();

        if (createError) {
            console.error('   ❌ Error creando restaurante:', createError);
            return;
        }
        restaurantId = newRest.id;
        console.log(`   ✅ Restaurante creado: ${restaurantId}`);
    }

    // 3. Insertar Horarios (Business Hours)
    console.log('⏰ Procesando Horarios...');
    // Limpiar anteriores para evitar duplicados en este test
    await supabase.from('business_hours').delete().eq('restaurant_id', restaurantId);

    const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    const hoursData = days.map(day => ({
        restaurant_id: restaurantId,
        day_of_week: day,
        open_time: '08:00:00',
        close_time: '20:00:00',
        is_closed: false
    }));

    const { error: hoursError } = await supabase.from('business_hours').insert(hoursData);
    if (hoursError) console.error('   ❌ Error insertando horarios:', hoursError);
    else console.log('   ✅ Horarios insertados (L-V, 8am-8pm)');

    // 4. Insertar Imagen
    console.log('📸 Procesando Imágenes...');
    await supabase.from('restaurant_images').delete().eq('restaurant_id', restaurantId);

    const { error: imgError } = await supabase.from('restaurant_images').insert({
        restaurant_id: restaurantId,
        image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        description: 'Ambiente principal',
        is_primary: true
    });

    if (imgError) console.error('   ❌ Error insertando imagen:', imgError);
    else console.log('   ✅ Imagen insertada');

    console.log('\n🏁 Seed de Onboarding Finalizado con Éxito.');
}

seed();
