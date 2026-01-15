// Script de Carga de Datos - Migrado a Supabase SDK (HTTPS)
// Reemplaza a: scripts/08-create-real-restaurants.sql

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuración (Usamos Service Key para bypass RLS si es necesario, o la que tengamos)
// NOTA: En producción, usar variables de entorno. Aquí usamos la key detectada en scripts anteriores para facilitar la migración.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lwwmmufsdtbetgieoefo.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3d21tdWZzZHRiZXRnaWVvZWZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzM4MjE1NiwiZXhwIjoyMDY4OTU4MTU2fQ.ZBCKGjaoxyW8aXnArO4uS5LgC3HjHt21VI3cegj0hLQ';

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
});

const RESTAURANTS_DATA = [
    {
        name: 'La Cocina de la Abuela',
        description: 'Comida tradicional colombiana preparada con recetas familiares de más de 50 años. Especialistas en sancocho, bandeja paisa y postres caseros.',
        address: 'Carrera 15 #85-32, Chapinero, Bogotá',
        phone: '+57 1 555-0101',
        email: 'contacto@lacocinadelaabuela.com',
        latitude: 4.6097,
        longitude: -74.0817,
        rating: 4.8,
        is_active: true,
        opening_hours: { lunes: "11:00-22:00", martes: "11:00-22:00", miercoles: "11:00-22:00", jueves: "11:00-22:00", viernes: "11:00-23:00", sabado: "10:00-23:00", domingo: "10:00-21:00" },
        delivery_fee: 3500,
        minimum_order: 25000,
        cuisine_type_name: 'Tradicional Colombiana',
        image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
        menu: {
            name: 'Menú Tradicional',
            description: 'Platos típicos colombianos',
            products: [
                { category: 'Entradas', name: 'Sancocho Trifásico', description: 'Sancocho tradicional con pollo, cerdo y res, acompañado de yuca, plátano y mazorca', price: 28000, is_available: true, preparation_time: 45, calories: 650, ingredients: ['pollo', 'cerdo', 'res', 'yuca', 'plátano', 'mazorca', 'cilantro'], allergens: ['gluten'] },
                { category: 'Entradas', name: 'Ajiaco Santafereño', description: 'Sopa tradicional bogotana con pollo, papas criollas, guascas y alcaparras', price: 24000, is_available: true, preparation_time: 40, calories: 580, ingredients: ['pollo', 'papa criolla', 'papa sabanera', 'guascas', 'alcaparras', 'crema', 'aguacate'], allergens: [] },
                { category: 'Principios', name: 'Bandeja Paisa Completa', description: 'Frijoles, arroz, huevo frito, chorizo, morcilla, chicharrón, carne molida, plátano maduro y aguacate', price: 35000, is_available: true, preparation_time: 25, calories: 1200, ingredients: ['frijoles', 'arroz', 'huevo', 'chorizo', 'morcilla', 'chicharrón', 'carne molida', 'plátano', 'aguacate'], allergens: ['huevo'] },
                { category: 'Principios', name: 'Lechona Tolimense', description: 'Lechona tradicional con arroz con arveja y ensalada', price: 32000, is_available: true, preparation_time: 20, calories: 950, ingredients: ['cerdo', 'arroz', 'arveja', 'lechuga', 'tomate', 'cebolla'], allergens: [] },
                { category: 'Bebidas', name: 'Chicha de Maíz', description: 'Bebida tradicional fermentada de maíz con canela', price: 8000, is_available: true, preparation_time: 5, calories: 180, ingredients: ['maíz', 'canela', 'azúcar'], allergens: [] },
                { category: 'Acompanamientos', name: 'Tres Leches Casero', description: 'Postre tradicional con leche condensada, evaporada y crema', price: 12000, is_available: true, preparation_time: 10, calories: 420, ingredients: ['leche condensada', 'leche evaporada', 'crema', 'huevos', 'vainilla'], allergens: ['huevo', 'lactosa'] }
            ]
        }
    },
    {
        name: 'Sabores del Pacífico',
        description: 'Auténtica cocina del Pacífico colombiano. Especialistas en mariscos frescos, pescados y sabores afrocolombianos únicos.',
        address: 'Calle 93 #11-27, Zona Rosa, Bogotá',
        phone: '+57 1 555-0202',
        email: 'info@saboresdelpacifico.com',
        latitude: 4.6762,
        longitude: -74.0495,
        rating: 4.6,
        is_active: true,
        opening_hours: { lunes: "12:00-22:00", martes: "12:00-22:00", miercoles: "12:00-22:00", jueves: "12:00-22:00", viernes: "12:00-23:00", sabado: "12:00-23:00", domingo: "12:00-21:00" },
        delivery_fee: 4000,
        minimum_order: 30000,
        cuisine_type_name: 'Pacífico Colombiano',
        image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800',
        menu: {
            name: 'Menú Pacífico',
            description: 'Sabores auténticos del litoral',
            products: [
                { category: 'Entradas', name: 'Ceviche de Camarón', description: 'Camarones frescos marinados en limón con cebolla morada y cilantro', price: 26000, is_available: true, preparation_time: 15, calories: 320, ingredients: ['camarón', 'limón', 'cebolla morada', 'cilantro', 'ají'], allergens: ['mariscos'] },
                { category: 'Principios', name: 'Arroz con Coco y Camarón', description: 'Arroz cremoso cocinado en leche de coco con camarones del Pacífico', price: 38000, is_available: true, preparation_time: 30, calories: 720, ingredients: ['arroz', 'leche de coco', 'camarón', 'cebolla', 'ajo', 'cilantro'], allergens: ['mariscos'] },
                { category: 'Proteinas', name: 'Pescado Frito Entero', description: 'Pargo rojo frito acompañado de patacones y ensalada', price: 42000, is_available: true, preparation_time: 25, calories: 680, ingredients: ['pargo rojo', 'plátano verde', 'lechuga', 'tomate', 'limón'], allergens: ['pescado'] },
                { category: 'Principios', name: 'Sancocho de Pescado', description: 'Sancocho tradicional del Pacífico con pescado fresco y yuca', price: 32000, is_available: true, preparation_time: 50, calories: 590, ingredients: ['pescado', 'yuca', 'plátano', 'cilantro', 'cebolla'], allergens: ['pescado'] },
                { category: 'Bebidas', name: 'Lulada del Valle', description: 'Bebida refrescante con lulo, hielo y leche condensada', price: 9000, is_available: true, preparation_time: 5, calories: 220, ingredients: ['lulo', 'leche condensada', 'hielo'], allergens: ['lactosa'] }
            ]
        }
    }
];

async function seed() {
    console.log('🌱 Iniciando Seeding de Restaurantes con Supabase SDK...');

    // 1. Obtener Categorías (Mapa Nombre -> ID)
    console.log('📥 Obteniendo categorías...');
    const { data: categories, error: catError } = await supabase
        .schema('menu')
        .from('categories')
        .select('id, name');

    if (catError) {
        console.error('❌ Error obteniendo categorías:', catError);
        return;
    }

    const categoryMap = {};
    categories.forEach(c => categoryMap[c.name] = c.id);
    console.log('✅ Categorías cargadas:', Object.keys(categoryMap).join(', '));

    // 2. Procesar Restaurantes
    for (const restData of RESTAURANTS_DATA) {
        console.log(`\n🍔 Procesando: ${restData.name}`);

        // A. Buscar o Insertar Restaurante
        // Nota: Usamos maybeSingle para ver si existe por nombre
        const { data: existingRest } = await supabase
            .schema('restaurant')
            .from('restaurants')
            .select('id')
            .eq('name', restData.name)
            .maybeSingle();

        let restaurantId = existingRest?.id;

        if (restaurantId) {
            console.log(`   ⚠️ Restaurante ya existe (ID: ${restaurantId}). Actualizando...`);
            const { error: updateError } = await supabase
                .schema('restaurant')
                .from('restaurants')
                .update({
                    description: restData.description,
                    address: restData.address,
                    phone: restData.phone,
                    rating: restData.rating,
                    // ... otros campos si se desea actualizar
                })
                .eq('id', restaurantId);

            if (updateError) console.error('   ❌ Error al actualizar:', updateError.message);
        } else {
            console.log('   ✨ Creando nuevo restaurante...');
            // Buscar ID del cuisine_type (si existe tabla cuisine_types)
            // Omitimos validación estricta de cuisine para simplificar, asumimos que string funciona o es nullable
            // Pero si la tabla espera UUID, debemos buscarlo.
            // El script SQL original no hacía insert en cuisine_types, asumía existencia.

            const { data: newRest, error: createError } = await supabase
                .schema('restaurant')
                .from('restaurants')
                .insert({
                    name: restData.name,
                    description: restData.description,
                    address: restData.address,
                    phone: restData.phone,
                    email: restData.email,
                    latitude: restData.latitude,
                    longitude: restData.longitude,
                    rating: restData.rating,
                    is_active: restData.is_active,
                    opening_hours: restData.opening_hours,
                    delivery_fee: restData.delivery_fee,
                    minimum_order: restData.minimum_order,
                    image_url: restData.image_url,
                    // cuisine_type: ... (omitido para evitar error fk si no coinciden)
                })
                .select()
                .single();

            if (createError) {
                console.error('   ❌ Error creando restaurante:', createError.message);
                continue; // Saltar al siguiente
            }
            restaurantId = newRest.id;
            console.log(`   ✅ Restaurante creado con ID: ${restaurantId}`);
        }

        // B. Crear/Actualizar Menú
        if (restData.menu) {
            console.log(`   📜 Procesando menú: ${restData.menu.name}`);
            let menuId;

            const { data: existingMenu } = await supabase
                .schema('menu')
                .from('menus')
                .select('id')
                .eq('restaurant_id', restaurantId)
                .eq('name', restData.menu.name)
                .maybeSingle();

            if (existingMenu) {
                menuId = existingMenu.id;
                console.log(`      ⚠️ Menú ya existe (ID: ${menuId})`);
            } else {
                const { data: newMenu, error: menuError } = await supabase
                    .schema('menu')
                    .from('menus')
                    .insert({
                        restaurant_id: restaurantId,
                        name: restData.menu.name,
                        description: restData.menu.description,
                        is_active: true
                    })
                    .select()
                    .single();

                if (menuError) {
                    console.error('      ❌ Error creando menú:', menuError.message);
                    continue;
                }
                menuId = newMenu.id;
                console.log(`      ✅ Menú creado con ID: ${menuId}`);
            }

            // C. Insertar Productos
            if (restData.menu.products && menuId) {
                console.log(`      🥘 Procesando ${restData.menu.products.length} productos...`);
                let productsAdded = 0;

                for (const prod of restData.menu.products) {
                    const catId = categoryMap[prod.category];
                    if (!catId) {
                        console.warn(`         ⚠️ Categoría no encontrada: ${prod.category} (Saltando producto ${prod.name})`);
                        continue;
                    }

                    // Verificar si producto existe
                    const { data: existingProd } = await supabase
                        .schema('menu')
                        .from('products')
                        .select('id')
                        .eq('menu_id', menuId)
                        .eq('name', prod.name)
                        .maybeSingle();

                    if (!existingProd) {
                        const { error: prodError } = await supabase
                            .schema('menu')
                            .from('products')
                            .insert({
                                menu_id: menuId,
                                category_id: catId,
                                name: prod.name,
                                description: prod.description,
                                price: prod.price,
                                is_available: prod.is_available,
                                preparation_time: prod.preparation_time,
                                calories: prod.calories,
                                ingredients: prod.ingredients,
                                allergens: prod.allergens
                            });

                        if (prodError) {
                            console.error(`         ❌ Error producto ${prod.name}:`, prodError.message);
                        } else {
                            productsAdded++;
                        }
                    }
                }
                console.log(`      ✅ Agregados ${productsAdded} productos nuevos.`);
            }
        }
    }

    console.log('\n🏁 Seeding completado.');
}

seed().then(() => process.exit(0)).catch(e => { console.error('FATAL', e); process.exit(1); });
