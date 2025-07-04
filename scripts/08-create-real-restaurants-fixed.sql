-- =====================================================
-- SPOON - CREAR RESTAURANTES REALES (CORREGIDO)
-- =====================================================
-- Archivo: 08-create-real-restaurants-fixed.sql
-- Propósito: Crear 5 restaurantes reales con la estructura correcta
-- Fecha: 7 de Enero, 2025
-- Versión: 1.1
-- =====================================================

-- Primero necesitamos un usuario owner (usar el existente o crear uno temporal)
DO $$
DECLARE
    temp_user_id UUID;
BEGIN
    -- Verificar si existe un usuario, si no crear uno temporal
    SELECT id INTO temp_user_id FROM auth.users LIMIT 1;
    
    IF temp_user_id IS NULL THEN
        INSERT INTO auth.users (id, email, password_hash, role, is_active)
        VALUES (gen_random_uuid(), 'admin@spoon.com', 'temp_hash', 'admin', true)
        RETURNING id INTO temp_user_id;
    END IF;
END $$;

-- Limpiar datos existentes si es necesario
DELETE FROM sales.order_items WHERE order_id IN (SELECT id FROM sales.orders);
DELETE FROM sales.orders;
DELETE FROM menu.products WHERE restaurant_id IN (SELECT id FROM restaurant.restaurants WHERE name != 'Restaurante Demo');
DELETE FROM restaurant.restaurants WHERE name != 'Restaurante Demo';

-- =====================================================
-- RESTAURANTE 1: LA COCINA DE LA ABUELA
-- =====================================================

INSERT INTO restaurant.restaurants (
    id, name, slug, description, address, city, state, country,
    latitude, longitude, phone, email, cuisine_type, 
    owner_id, status, created_by, updated_by
) VALUES (
    gen_random_uuid(),
    'La Cocina de la Abuela',
    'la-cocina-de-la-abuela',
    'Comida tradicional colombiana preparada con recetas familiares de más de 50 años. Especialistas en sancocho, bandeja paisa y postres caseros.',
    'Carrera 15 #85-32, Chapinero',
    'Bogotá',
    'Cundinamarca',
    'Colombia',
    4.6097, -74.0817,
    '+57 1 555-0101',
    'contacto@lacocinadelaabuela.com',
    'Tradicional Colombiana',
    (SELECT id FROM auth.users LIMIT 1),
    'active',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1)
);

-- Productos para La Cocina de la Abuela
DO $$
DECLARE
    restaurant_id_1 UUID;
    cat_entradas UUID;
    cat_principales UUID;
    cat_bebidas UUID;
    cat_acompanamientos UUID;
BEGIN
    SELECT id INTO restaurant_id_1 FROM restaurant.restaurants WHERE name = 'La Cocina de la Abuela';
    SELECT id INTO cat_entradas FROM menu.categories WHERE name = 'Entradas';
    SELECT id INTO cat_principales FROM menu.categories WHERE name = 'Principios';
    SELECT id INTO cat_bebidas FROM menu.categories WHERE name = 'Bebidas';
    SELECT id INTO cat_acompanamientos FROM menu.categories WHERE name = 'Acompanamientos';
    
    INSERT INTO menu.products (id, restaurant_id, category_id, name, description, price, is_available, preparation_time_minutes) VALUES
    (gen_random_uuid(), restaurant_id_1, cat_entradas, 'Sancocho Trifásico', 'Sancocho tradicional con pollo, cerdo y res, acompañado de yuca, plátano y mazorca', 28000, true, 45),
    (gen_random_uuid(), restaurant_id_1, cat_entradas, 'Ajiaco Santafereño', 'Sopa tradicional bogotana con pollo, papas criollas, guascas y alcaparras', 24000, true, 40),
    (gen_random_uuid(), restaurant_id_1, cat_principales, 'Bandeja Paisa Completa', 'Frijoles, arroz, huevo frito, chorizo, morcilla, chicharrón, carne molida, plátano maduro y aguacate', 35000, true, 25),
    (gen_random_uuid(), restaurant_id_1, cat_principales, 'Lechona Tolimense', 'Lechona tradicional con arroz con arveja y ensalada', 32000, true, 20),
    (gen_random_uuid(), restaurant_id_1, cat_bebidas, 'Chicha de Maíz', 'Bebida tradicional fermentada de maíz con canela', 8000, true, 5),
    (gen_random_uuid(), restaurant_id_1, cat_acompanamientos, 'Tres Leches Casero', 'Postre tradicional con leche condensada, evaporada y crema', 12000, true, 10);
END $$;

-- =====================================================
-- RESTAURANTE 2: SABORES DEL PACÍFICO
-- =====================================================

INSERT INTO restaurant.restaurants (
    id, name, slug, description, address, city, state, country,
    latitude, longitude, phone, email, cuisine_type, 
    owner_id, status, created_by, updated_by
) VALUES (
    gen_random_uuid(),
    'Sabores del Pacífico',
    'sabores-del-pacifico',
    'Auténtica cocina del Pacífico colombiano. Especialistas en mariscos frescos, pescados y sabores afrocolombianos únicos.',
    'Calle 93 #11-27, Zona Rosa',
    'Bogotá',
    'Cundinamarca',
    'Colombia',
    4.6762, -74.0495,
    '+57 1 555-0202',
    'info@saboresdelpacifico.com',
    'Pacífico Colombiano',
    (SELECT id FROM auth.users LIMIT 1),
    'active',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1)
);

-- Productos para Sabores del Pacífico
DO $$
DECLARE
    restaurant_id_2 UUID;
    cat_entradas UUID;
    cat_principales UUID;
    cat_bebidas UUID;
    cat_proteinas UUID;
BEGIN
    SELECT id INTO restaurant_id_2 FROM restaurant.restaurants WHERE name = 'Sabores del Pacífico';
    SELECT id INTO cat_entradas FROM menu.categories WHERE name = 'Entradas';
    SELECT id INTO cat_principales FROM menu.categories WHERE name = 'Principios';
    SELECT id INTO cat_bebidas FROM menu.categories WHERE name = 'Bebidas';
    SELECT id INTO cat_proteinas FROM menu.categories WHERE name = 'Proteinas';
    
    INSERT INTO menu.products (id, restaurant_id, category_id, name, description, price, is_available, preparation_time_minutes) VALUES
    (gen_random_uuid(), restaurant_id_2, cat_entradas, 'Ceviche de Camarón', 'Camarones frescos marinados en limón con cebolla morada y cilantro', 26000, true, 15),
    (gen_random_uuid(), restaurant_id_2, cat_principales, 'Arroz con Coco y Camarón', 'Arroz cremoso cocinado en leche de coco con camarones del Pacífico', 38000, true, 30),
    (gen_random_uuid(), restaurant_id_2, cat_proteinas, 'Pescado Frito Entero', 'Pargo rojo frito acompañado de patacones y ensalada', 42000, true, 25),
    (gen_random_uuid(), restaurant_id_2, cat_principales, 'Sancocho de Pescado', 'Sancocho tradicional del Pacífico con pescado fresco y yuca', 32000, true, 50),
    (gen_random_uuid(), restaurant_id_2, cat_bebidas, 'Lulada del Valle', 'Bebida refrescante con lulo, hielo y leche condensada', 9000, true, 5);
END $$;

-- =====================================================
-- RESTAURANTE 3: PIZZA ITALIANA ROMA
-- =====================================================

INSERT INTO restaurant.restaurants (
    id, name, slug, description, address, city, state, country,
    latitude, longitude, phone, email, cuisine_type, 
    owner_id, status, created_by, updated_by
) VALUES (
    gen_random_uuid(),
    'Pizza Italiana Roma',
    'pizza-italiana-roma',
    'Auténtica pizza italiana preparada en horno de leña. Ingredientes importados directamente de Italia y recetas tradicionales.',
    'Carrera 13 #96-67, Zona Rosa',
    'Bogotá',
    'Cundinamarca',
    'Colombia',
    4.6823, -74.0368,
    '+57 1 555-0303',
    'ciao@pizzaroma.com',
    'Italiana',
    (SELECT id FROM auth.users LIMIT 1),
    'active',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1)
);

-- Productos para Pizza Roma
DO $$
DECLARE
    restaurant_id_3 UUID;
    cat_entradas UUID;
    cat_principales UUID;
    cat_bebidas UUID;
    cat_acompanamientos UUID;
BEGIN
    SELECT id INTO restaurant_id_3 FROM restaurant.restaurants WHERE name = 'Pizza Italiana Roma';
    SELECT id INTO cat_entradas FROM menu.categories WHERE name = 'Entradas';
    SELECT id INTO cat_principales FROM menu.categories WHERE name = 'Principios';
    SELECT id INTO cat_bebidas FROM menu.categories WHERE name = 'Bebidas';
    SELECT id INTO cat_acompanamientos FROM menu.categories WHERE name = 'Acompanamientos';
    
    INSERT INTO menu.products (id, restaurant_id, category_id, name, description, price, is_available, preparation_time_minutes) VALUES
    (gen_random_uuid(), restaurant_id_3, cat_entradas, 'Bruschetta Italiana', 'Pan tostado con tomate fresco, albahaca y aceite de oliva extra virgen', 18000, true, 10),
    (gen_random_uuid(), restaurant_id_3, cat_principales, 'Pizza Margherita', 'Pizza clásica con salsa de tomate, mozzarella di bufala y albahaca fresca', 32000, true, 15),
    (gen_random_uuid(), restaurant_id_3, cat_principales, 'Pizza Quattro Stagioni', 'Pizza con jamón, champiñones, alcachofas y aceitunas', 38000, true, 18),
    (gen_random_uuid(), restaurant_id_3, cat_principales, 'Pasta Carbonara', 'Spaghetti con panceta, huevo, parmesano y pimienta negra', 28000, true, 12),
    (gen_random_uuid(), restaurant_id_3, cat_bebidas, 'Limonada Italiana', 'Limonada con limones de Sicilia y menta fresca', 8000, true, 5),
    (gen_random_uuid(), restaurant_id_3, cat_acompanamientos, 'Tiramisu Casero', 'Postre tradicional italiano con café, mascarpone y cacao', 15000, true, 8);
END $$;

-- =====================================================
-- RESTAURANTE 4: BURGER HOUSE
-- =====================================================

INSERT INTO restaurant.restaurants (
    id, name, slug, description, address, city, state, country,
    latitude, longitude, phone, email, cuisine_type, 
    owner_id, status, created_by, updated_by
) VALUES (
    gen_random_uuid(),
    'Burger House',
    'burger-house',
    'Las mejores hamburguesas gourmet de la ciudad. Carne 100% res, pan artesanal y ingredientes frescos. Ambiente casual y familiar.',
    'Calle 119 #15-08, Usaquén',
    'Bogotá',
    'Cundinamarca',
    'Colombia',
    4.7110, -74.0721,
    '+57 1 555-0404',
    'pedidos@burgerhouse.com',
    'Americana',
    (SELECT id FROM auth.users LIMIT 1),
    'active',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1)
);

-- Productos para Burger House
DO $$
DECLARE
    restaurant_id_4 UUID;
    cat_entradas UUID;
    cat_principales UUID;
    cat_bebidas UUID;
    cat_proteinas UUID;
BEGIN
    SELECT id INTO restaurant_id_4 FROM restaurant.restaurants WHERE name = 'Burger House';
    SELECT id INTO cat_entradas FROM menu.categories WHERE name = 'Entradas';
    SELECT id INTO cat_principales FROM menu.categories WHERE name = 'Principios';
    SELECT id INTO cat_bebidas FROM menu.categories WHERE name = 'Bebidas';
    SELECT id INTO cat_proteinas FROM menu.categories WHERE name = 'Proteinas';
    
    INSERT INTO menu.products (id, restaurant_id, category_id, name, description, price, is_available, preparation_time_minutes) VALUES
    (gen_random_uuid(), restaurant_id_4, cat_entradas, 'Papas Gajo con Cheddar', 'Papas en gajos crujientes con salsa de queso cheddar y tocineta', 16000, true, 12),
    (gen_random_uuid(), restaurant_id_4, cat_principales, 'Classic Burger', 'Hamburguesa clásica con carne de res, lechuga, tomate, cebolla y salsa especial', 24000, true, 15),
    (gen_random_uuid(), restaurant_id_4, cat_principales, 'BBQ Bacon Burger', 'Hamburguesa con carne, tocineta, queso cheddar y salsa BBQ', 28000, true, 18),
    (gen_random_uuid(), restaurant_id_4, cat_proteinas, 'Pollo Crispy', 'Pechuga de pollo empanizada con especias secretas', 26000, true, 20),
    (gen_random_uuid(), restaurant_id_4, cat_bebidas, 'Malteada de Vainilla', 'Malteada cremosa de vainilla con helado artesanal', 12000, true, 5),
    (gen_random_uuid(), restaurant_id_4, cat_bebidas, 'Coca-Cola', 'Coca-Cola fría en botella de vidrio', 5000, true, 2);
END $$;

-- =====================================================
-- RESTAURANTE 5: SUSHI TOKYO
-- =====================================================

INSERT INTO restaurant.restaurants (
    id, name, slug, description, address, city, state, country,
    latitude, longitude, phone, email, cuisine_type, 
    owner_id, status, created_by, updated_by
) VALUES (
    gen_random_uuid(),
    'Sushi Tokyo',
    'sushi-tokyo',
    'Auténtica experiencia japonesa con sushi fresco preparado por chef japonés. Pescados importados y técnicas tradicionales.',
    'Carrera 11 #93-07, Zona Rosa',
    'Bogotá',
    'Cundinamarca',
    'Colombia',
    4.6745, -74.0512,
    '+57 1 555-0505',
    'konnichiwa@sushitokyo.com',
    'Japonesa',
    (SELECT id FROM auth.users LIMIT 1),
    'active',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1)
);

-- Productos para Sushi Tokyo
DO $$
DECLARE
    restaurant_id_5 UUID;
    cat_entradas UUID;
    cat_principales UUID;
    cat_bebidas UUID;
    cat_proteinas UUID;
BEGIN
    SELECT id INTO restaurant_id_5 FROM restaurant.restaurants WHERE name = 'Sushi Tokyo';
    SELECT id INTO cat_entradas FROM menu.categories WHERE name = 'Entradas';
    SELECT id INTO cat_principales FROM menu.categories WHERE name = 'Principios';
    SELECT id INTO cat_bebidas FROM menu.categories WHERE name = 'Bebidas';
    SELECT id INTO cat_proteinas FROM menu.categories WHERE name = 'Proteinas';
    
    INSERT INTO menu.products (id, restaurant_id, category_id, name, description, price, is_available, preparation_time_minutes) VALUES
    (gen_random_uuid(), restaurant_id_5, cat_entradas, 'Gyoza de Cerdo', 'Dumplings japoneses rellenos de cerdo y vegetales, servidos con salsa ponzu', 22000, true, 15),
    (gen_random_uuid(), restaurant_id_5, cat_entradas, 'Edamame', 'Vainas de soja cocidas al vapor con sal marina', 14000, true, 8),
    (gen_random_uuid(), restaurant_id_5, cat_principales, 'Sushi Variado (12 piezas)', 'Selección del chef con salmón, atún, camarón y anguila', 48000, true, 25),
    (gen_random_uuid(), restaurant_id_5, cat_principales, 'Ramen Tonkotsu', 'Sopa de fideos con caldo de hueso de cerdo, chashu y huevo marinado', 32000, true, 20),
    (gen_random_uuid(), restaurant_id_5, cat_proteinas, 'Salmón Teriyaki', 'Filete de salmón glaseado con salsa teriyaki y vegetales', 38000, true, 18),
    (gen_random_uuid(), restaurant_id_5, cat_bebidas, 'Té Verde Matcha', 'Té verde japonés tradicional en polvo', 8000, true, 5),
    (gen_random_uuid(), restaurant_id_5, cat_bebidas, 'Sake Caliente', 'Sake japonés premium servido caliente', 18000, true, 3);
END $$;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Mostrar resumen de restaurantes creados
SELECT 
    r.name as restaurante,
    r.cuisine_type as cocina,
    COUNT(p.id) as productos,
    r.phone as telefono,
    r.address as direccion,
    r.city as ciudad
FROM restaurant.restaurants r
LEFT JOIN menu.products p ON r.id = p.restaurant_id
WHERE r.name != 'Restaurante Demo'
GROUP BY r.id, r.name, r.cuisine_type, r.phone, r.address, r.city
ORDER BY r.name;

COMMIT;
