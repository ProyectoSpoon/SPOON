-- =====================================================
-- SPOON - CREAR RESTAURANTES REALES
-- =====================================================
-- Archivo: 08-create-real-restaurants.sql
-- Propósito: Crear 5 restaurantes reales con toda la información
-- Fecha: 7 de Enero, 2025
-- Versión: 1.0
-- =====================================================

-- Limpiar datos existentes si es necesario
DELETE FROM sales.order_items WHERE order_id IN (SELECT id FROM sales.orders);
DELETE FROM sales.orders;
DELETE FROM menu.products;
DELETE FROM menu.menus;
DELETE FROM restaurant.restaurants WHERE name != 'Restaurante Demo';

-- =====================================================
-- RESTAURANTE 1: LA COCINA DE LA ABUELA
-- =====================================================

INSERT INTO restaurant.restaurants (
    id, name, description, address, phone, email, 
    latitude, longitude, rating, is_active, 
    opening_hours, delivery_fee, minimum_order, 
    cuisine_type, image_url
) VALUES (
    gen_random_uuid(),
    'La Cocina de la Abuela',
    'Comida tradicional colombiana preparada con recetas familiares de más de 50 años. Especialistas en sancocho, bandeja paisa y postres caseros.',
    'Carrera 15 #85-32, Chapinero, Bogotá',
    '+57 1 555-0101',
    'contacto@lacocinadelaabuela.com',
    4.6097, -74.0817,
    4.8,
    true,
    '{"lunes": "11:00-22:00", "martes": "11:00-22:00", "miercoles": "11:00-22:00", "jueves": "11:00-22:00", "viernes": "11:00-23:00", "sabado": "10:00-23:00", "domingo": "10:00-21:00"}',
    3500,
    25000,
    'Tradicional Colombiana',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'
);

-- Obtener ID del restaurante
DO $$
DECLARE
    restaurant_id_1 UUID;
    menu_id_1 UUID;
    cat_entradas UUID;
    cat_principales UUID;
    cat_bebidas UUID;
    cat_postres UUID;
BEGIN
    -- Obtener ID del restaurante
    SELECT id INTO restaurant_id_1 FROM restaurant.restaurants WHERE name = 'La Cocina de la Abuela';
    
    -- Crear menú
    INSERT INTO menu.menus (id, restaurant_id, name, description, is_active)
    VALUES (gen_random_uuid(), restaurant_id_1, 'Menú Tradicional', 'Platos típicos colombianos', true)
    RETURNING id INTO menu_id_1;
    
    -- Obtener IDs de categorías
    SELECT id INTO cat_entradas FROM menu.categories WHERE name = 'Entradas';
    SELECT id INTO cat_principales FROM menu.categories WHERE name = 'Principios';
    SELECT id INTO cat_bebidas FROM menu.categories WHERE name = 'Bebidas';
    SELECT id INTO cat_postres FROM menu.categories WHERE name = 'Acompanamientos';
    
    -- Productos del restaurante
    INSERT INTO menu.products (id, menu_id, category_id, name, description, price, is_available, preparation_time, calories, ingredients, allergens) VALUES
    (gen_random_uuid(), menu_id_1, cat_entradas, 'Sancocho Trifásico', 'Sancocho tradicional con pollo, cerdo y res, acompañado de yuca, plátano y mazorca', 28000, true, 45, 650, ARRAY['pollo', 'cerdo', 'res', 'yuca', 'plátano', 'mazorca', 'cilantro'], ARRAY['gluten']),
    (gen_random_uuid(), menu_id_1, cat_entradas, 'Ajiaco Santafereño', 'Sopa tradicional bogotana con pollo, papas criollas, guascas y alcaparras', 24000, true, 40, 580, ARRAY['pollo', 'papa criolla', 'papa sabanera', 'guascas', 'alcaparras', 'crema', 'aguacate'], ARRAY[]),
    (gen_random_uuid(), menu_id_1, cat_principales, 'Bandeja Paisa Completa', 'Frijoles, arroz, huevo frito, chorizo, morcilla, chicharrón, carne molida, plátano maduro y aguacate', 35000, true, 25, 1200, ARRAY['frijoles', 'arroz', 'huevo', 'chorizo', 'morcilla', 'chicharrón', 'carne molida', 'plátano', 'aguacate'], ARRAY['huevo']),
    (gen_random_uuid(), menu_id_1, cat_principales, 'Lechona Tolimense', 'Lechona tradicional con arroz con arveja y ensalada', 32000, true, 20, 950, ARRAY['cerdo', 'arroz', 'arveja', 'lechuga', 'tomate', 'cebolla'], ARRAY[]),
    (gen_random_uuid(), menu_id_1, cat_bebidas, 'Chicha de Maíz', 'Bebida tradicional fermentada de maíz con canela', 8000, true, 5, 180, ARRAY['maíz', 'canela', 'azúcar'], ARRAY[]),
    (gen_random_uuid(), menu_id_1, cat_postres, 'Tres Leches Casero', 'Postre tradicional con leche condensada, evaporada y crema', 12000, true, 10, 420, ARRAY['leche condensada', 'leche evaporada', 'crema', 'huevos', 'vainilla'], ARRAY['huevo', 'lactosa']);
END $$;

-- =====================================================
-- RESTAURANTE 2: SABORES DEL PACÍFICO
-- =====================================================

INSERT INTO restaurant.restaurants (
    id, name, description, address, phone, email, 
    latitude, longitude, rating, is_active, 
    opening_hours, delivery_fee, minimum_order, 
    cuisine_type, image_url
) VALUES (
    gen_random_uuid(),
    'Sabores del Pacífico',
    'Auténtica cocina del Pacífico colombiano. Especialistas en mariscos frescos, pescados y sabores afrocolombianos únicos.',
    'Calle 93 #11-27, Zona Rosa, Bogotá',
    '+57 1 555-0202',
    'info@saboresdelpacifico.com',
    4.6762, -74.0495,
    4.6,
    true,
    '{"lunes": "12:00-22:00", "martes": "12:00-22:00", "miercoles": "12:00-22:00", "jueves": "12:00-22:00", "viernes": "12:00-23:00", "sabado": "12:00-23:00", "domingo": "12:00-21:00"}',
    4000,
    30000,
    'Pacífico Colombiano',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800'
);

-- Crear menú y productos para Sabores del Pacífico
DO $$
DECLARE
    restaurant_id_2 UUID;
    menu_id_2 UUID;
    cat_entradas UUID;
    cat_principales UUID;
    cat_bebidas UUID;
    cat_proteinas UUID;
BEGIN
    SELECT id INTO restaurant_id_2 FROM restaurant.restaurants WHERE name = 'Sabores del Pacífico';
    
    INSERT INTO menu.menus (id, restaurant_id, name, description, is_active)
    VALUES (gen_random_uuid(), restaurant_id_2, 'Menú Pacífico', 'Sabores auténticos del litoral', true)
    RETURNING id INTO menu_id_2;
    
    SELECT id INTO cat_entradas FROM menu.categories WHERE name = 'Entradas';
    SELECT id INTO cat_principales FROM menu.categories WHERE name = 'Principios';
    SELECT id INTO cat_bebidas FROM menu.categories WHERE name = 'Bebidas';
    SELECT id INTO cat_proteinas FROM menu.categories WHERE name = 'Proteinas';
    
    INSERT INTO menu.products (id, menu_id, category_id, name, description, price, is_available, preparation_time, calories, ingredients, allergens) VALUES
    (gen_random_uuid(), menu_id_2, cat_entradas, 'Ceviche de Camarón', 'Camarones frescos marinados en limón con cebolla morada y cilantro', 26000, true, 15, 320, ARRAY['camarón', 'limón', 'cebolla morada', 'cilantro', 'ají'], ARRAY['mariscos']),
    (gen_random_uuid(), menu_id_2, cat_principales, 'Arroz con Coco y Camarón', 'Arroz cremoso cocinado en leche de coco con camarones del Pacífico', 38000, true, 30, 720, ARRAY['arroz', 'leche de coco', 'camarón', 'cebolla', 'ajo', 'cilantro'], ARRAY['mariscos']),
    (gen_random_uuid(), menu_id_2, cat_proteinas, 'Pescado Frito Entero', 'Pargo rojo frito acompañado de patacones y ensalada', 42000, true, 25, 680, ARRAY['pargo rojo', 'plátano verde', 'lechuga', 'tomate', 'limón'], ARRAY['pescado']),
    (gen_random_uuid(), menu_id_2, cat_principales, 'Sancocho de Pescado', 'Sancocho tradicional del Pacífico con pescado fresco y yuca', 32000, true, 50, 590, ARRAY['pescado', 'yuca', 'plátano', 'cilantro', 'cebolla'], ARRAY['pescado']),
    (gen_random_uuid(), menu_id_2, cat_bebidas, 'Lulada del Valle', 'Bebida refrescante con lulo, hielo y leche condensada', 9000, true, 5, 220, ARRAY['lulo', 'leche condensada', 'hielo'], ARRAY['lactosa']);
END $$;

-- =====================================================
-- RESTAURANTE 3: PIZZA ITALIANA ROMA
-- =====================================================

INSERT INTO restaurant.restaurants (
    id, name, description, address, phone, email, 
    latitude, longitude, rating, is_active, 
    opening_hours, delivery_fee, minimum_order, 
    cuisine_type, image_url
) VALUES (
    gen_random_uuid(),
    'Pizza Italiana Roma',
    'Auténtica pizza italiana preparada en horno de leña. Ingredientes importados directamente de Italia y recetas tradicionales.',
    'Carrera 13 #96-67, Zona Rosa, Bogotá',
    '+57 1 555-0303',
    'ciao@pizzaroma.com',
    4.6823, -74.0368,
    4.7,
    true,
    '{"lunes": "17:00-23:00", "martes": "17:00-23:00", "miercoles": "17:00-23:00", "jueves": "17:00-23:00", "viernes": "17:00-24:00", "sabado": "12:00-24:00", "domingo": "12:00-22:00"}',
    5000,
    35000,
    'Italiana',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800'
);

-- Crear menú y productos para Pizza Roma
DO $$
DECLARE
    restaurant_id_3 UUID;
    menu_id_3 UUID;
    cat_entradas UUID;
    cat_principales UUID;
    cat_bebidas UUID;
    cat_postres UUID;
BEGIN
    SELECT id INTO restaurant_id_3 FROM restaurant.restaurants WHERE name = 'Pizza Italiana Roma';
    
    INSERT INTO menu.menus (id, restaurant_id, name, description, is_active)
    VALUES (gen_random_uuid(), restaurant_id_3, 'Menú Italiano', 'Auténtica cocina italiana', true)
    RETURNING id INTO menu_id_3;
    
    SELECT id INTO cat_entradas FROM menu.categories WHERE name = 'Entradas';
    SELECT id INTO cat_principales FROM menu.categories WHERE name = 'Principios';
    SELECT id INTO cat_bebidas FROM menu.categories WHERE name = 'Bebidas';
    SELECT id INTO cat_postres FROM menu.categories WHERE name = 'Acompanamientos';
    
    INSERT INTO menu.products (id, menu_id, category_id, name, description, price, is_available, preparation_time, calories, ingredients, allergens) VALUES
    (gen_random_uuid(), menu_id_3, cat_entradas, 'Bruschetta Italiana', 'Pan tostado con tomate fresco, albahaca y aceite de oliva extra virgen', 18000, true, 10, 280, ARRAY['pan', 'tomate', 'albahaca', 'aceite de oliva', 'ajo'], ARRAY['gluten']),
    (gen_random_uuid(), menu_id_3, cat_principales, 'Pizza Margherita', 'Pizza clásica con salsa de tomate, mozzarella di bufala y albahaca fresca', 32000, true, 15, 650, ARRAY['masa de pizza', 'salsa de tomate', 'mozzarella', 'albahaca'], ARRAY['gluten', 'lactosa']),
    (gen_random_uuid(), menu_id_3, cat_principales, 'Pizza Quattro Stagioni', 'Pizza con jamón, champiñones, alcachofas y aceitunas', 38000, true, 18, 720, ARRAY['masa de pizza', 'jamón', 'champiñones', 'alcachofas', 'aceitunas', 'mozzarella'], ARRAY['gluten', 'lactosa']),
    (gen_random_uuid(), menu_id_3, cat_principales, 'Pasta Carbonara', 'Spaghetti con panceta, huevo, parmesano y pimienta negra', 28000, true, 12, 580, ARRAY['spaghetti', 'panceta', 'huevo', 'parmesano', 'pimienta'], ARRAY['gluten', 'huevo', 'lactosa']),
    (gen_random_uuid(), menu_id_3, cat_bebidas, 'Limonada Italiana', 'Limonada con limones de Sicilia y menta fresca', 8000, true, 5, 120, ARRAY['limón siciliano', 'menta', 'agua', 'azúcar'], ARRAY[]),
    (gen_random_uuid(), menu_id_3, cat_postres, 'Tiramisu Casero', 'Postre tradicional italiano con café, mascarpone y cacao', 15000, true, 8, 380, ARRAY['café', 'mascarpone', 'huevos', 'azúcar', 'cacao'], ARRAY['huevo', 'lactosa']);
END $$;

-- =====================================================
-- RESTAURANTE 4: BURGER HOUSE
-- =====================================================

INSERT INTO restaurant.restaurants (
    id, name, description, address, phone, email, 
    latitude, longitude, rating, is_active, 
    opening_hours, delivery_fee, minimum_order, 
    cuisine_type, image_url
) VALUES (
    gen_random_uuid(),
    'Burger House',
    'Las mejores hamburguesas gourmet de la ciudad. Carne 100% res, pan artesanal y ingredientes frescos. Ambiente casual y familiar.',
    'Calle 119 #15-08, Usaquén, Bogotá',
    '+57 1 555-0404',
    'pedidos@burgerhouse.com',
    4.7110, -74.0721,
    4.5,
    true,
    '{"lunes": "11:00-23:00", "martes": "11:00-23:00", "miercoles": "11:00-23:00", "jueves": "11:00-23:00", "viernes": "11:00-24:00", "sabado": "11:00-24:00", "domingo": "11:00-22:00"}',
    3000,
    20000,
    'Americana',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800'
);

-- Crear menú y productos para Burger House
DO $$
DECLARE
    restaurant_id_4 UUID;
    menu_id_4 UUID;
    cat_entradas UUID;
    cat_principales UUID;
    cat_bebidas UUID;
    cat_proteinas UUID;
BEGIN
    SELECT id INTO restaurant_id_4 FROM restaurant.restaurants WHERE name = 'Burger House';
    
    INSERT INTO menu.menus (id, restaurant_id, name, description, is_active)
    VALUES (gen_random_uuid(), restaurant_id_4, 'Menú Gourmet', 'Hamburguesas y más', true)
    RETURNING id INTO menu_id_4;
    
    SELECT id INTO cat_entradas FROM menu.categories WHERE name = 'Entradas';
    SELECT id INTO cat_principales FROM menu.categories WHERE name = 'Principios';
    SELECT id INTO cat_bebidas FROM menu.categories WHERE name = 'Bebidas';
    SELECT id INTO cat_proteinas FROM menu.categories WHERE name = 'Proteinas';
    
    INSERT INTO menu.products (id, menu_id, category_id, name, description, price, is_available, preparation_time, calories, ingredients, allergens) VALUES
    (gen_random_uuid(), menu_id_4, cat_entradas, 'Papas Gajo con Cheddar', 'Papas en gajos crujientes con salsa de queso cheddar y tocineta', 16000, true, 12, 450, ARRAY['papa', 'queso cheddar', 'tocineta', 'cebollín'], ARRAY['lactosa']),
    (gen_random_uuid(), menu_id_4, cat_principales, 'Classic Burger', 'Hamburguesa clásica con carne de res, lechuga, tomate, cebolla y salsa especial', 24000, true, 15, 680, ARRAY['carne de res', 'pan brioche', 'lechuga', 'tomate', 'cebolla', 'salsa especial'], ARRAY['gluten']),
    (gen_random_uuid(), menu_id_4, cat_principales, 'BBQ Bacon Burger', 'Hamburguesa con carne, tocineta, queso cheddar y salsa BBQ', 28000, true, 18, 820, ARRAY['carne de res', 'tocineta', 'queso cheddar', 'salsa BBQ', 'cebolla caramelizada'], ARRAY['gluten', 'lactosa']),
    (gen_random_uuid(), menu_id_4, cat_proteinas, 'Pollo Crispy', 'Pechuga de pollo empanizada con especias secretas', 26000, true, 20, 590, ARRAY['pechuga de pollo', 'empanizado', 'especias'], ARRAY['gluten']),
    (gen_random_uuid(), menu_id_4, cat_bebidas, 'Malteada de Vainilla', 'Malteada cremosa de vainilla con helado artesanal', 12000, true, 5, 380, ARRAY['helado de vainilla', 'leche', 'vainilla'], ARRAY['lactosa']),
    (gen_random_uuid(), menu_id_4, cat_bebidas, 'Coca-Cola', 'Coca-Cola fría en botella de vidrio', 5000, true, 2, 140, ARRAY['agua carbonatada', 'azúcar', 'cafeína'], ARRAY[]);
END $$;

-- =====================================================
-- RESTAURANTE 5: SUSHI TOKYO
-- =====================================================

INSERT INTO restaurant.restaurants (
    id, name, description, address, phone, email, 
    latitude, longitude, rating, is_active, 
    opening_hours, delivery_fee, minimum_order, 
    cuisine_type, image_url
) VALUES (
    gen_random_uuid(),
    'Sushi Tokyo',
    'Auténtica experiencia japonesa con sushi fresco preparado por chef japonés. Pescados importados y técnicas tradicionales.',
    'Carrera 11 #93-07, Zona Rosa, Bogotá',
    '+57 1 555-0505',
    'konnichiwa@sushitokyo.com',
    4.6745, -74.0512,
    4.9,
    true,
    '{"lunes": "18:00-23:00", "martes": "18:00-23:00", "miercoles": "18:00-23:00", "jueves": "18:00-23:00", "viernes": "18:00-24:00", "sabado": "12:00-24:00", "domingo": "12:00-22:00"}',
    6000,
    45000,
    'Japonesa',
    'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800'
);

-- Crear menú y productos para Sushi Tokyo
DO $$
DECLARE
    restaurant_id_5 UUID;
    menu_id_5 UUID;
    cat_entradas UUID;
    cat_principales UUID;
    cat_bebidas UUID;
    cat_proteinas UUID;
BEGIN
    SELECT id INTO restaurant_id_5 FROM restaurant.restaurants WHERE name = 'Sushi Tokyo';
    
    INSERT INTO menu.menus (id, restaurant_id, name, description, is_active)
    VALUES (gen_random_uuid(), restaurant_id_5, 'Menú Japonés', 'Auténtica cocina japonesa', true)
    RETURNING id INTO menu_id_5;
    
    SELECT id INTO cat_entradas FROM menu.categories WHERE name = 'Entradas';
    SELECT id INTO cat_principales FROM menu.categories WHERE name = 'Principios';
    SELECT id INTO cat_bebidas FROM menu.categories WHERE name = 'Bebidas';
    SELECT id INTO cat_proteinas FROM menu.categories WHERE name = 'Proteinas';
    
    INSERT INTO menu.products (id, menu_id, category_id, name, description, price, is_available, preparation_time, calories, ingredients, allergens) VALUES
    (gen_random_uuid(), menu_id_5, cat_entradas, 'Gyoza de Cerdo', 'Dumplings japoneses rellenos de cerdo y vegetales, servidos con salsa ponzu', 22000, true, 15, 320, ARRAY['masa de gyoza', 'cerdo', 'repollo', 'cebollín', 'jengibre'], ARRAY['gluten', 'soja']),
    (gen_random_uuid(), menu_id_5, cat_entradas, 'Edamame', 'Vainas de soja cocidas al vapor con sal marina', 14000, true, 8, 180, ARRAY['edamame', 'sal marina'], ARRAY['soja']),
    (gen_random_uuid(), menu_id_5, cat_principales, 'Sushi Variado (12 piezas)', 'Selección del chef con salmón, atún, camarón y anguila', 48000, true, 25, 520, ARRAY['arroz sushi', 'salmón', 'atún', 'camarón', 'anguila', 'nori'], ARRAY['pescado', 'mariscos']),
    (gen_random_uuid(), menu_id_5, cat_principales, 'Ramen Tonkotsu', 'Sopa de fideos con caldo de hueso de cerdo, chashu y huevo marinado', 32000, true, 20, 680, ARRAY['fideos ramen', 'caldo tonkotsu', 'chashu', 'huevo', 'nori', 'cebollín'], ARRAY['gluten', 'huevo', 'soja']),
    (gen_random_uuid(), menu_id_5, cat_proteinas, 'Salmón Teriyaki', 'Filete de salmón glaseado con salsa teriyaki y vegetales', 38000, true, 18, 450, ARRAY['salmón', 'salsa teriyaki', 'brócoli', 'zanahoria'], ARRAY['pescado', 'soja']),
    (gen_random_uuid(), menu_id_5, cat_bebidas, 'Té Verde Matcha', 'Té verde japonés tradicional en polvo', 8000, true, 5, 25, ARRAY['matcha', 'agua caliente'], ARRAY[]),
    (gen_random_uuid(), menu_id_5, cat_bebidas, 'Sake Caliente', 'Sake japonés premium servido caliente', 18000, true, 3, 120, ARRAY['sake', 'arroz'], ARRAY[]);
END $$;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Mostrar resumen de restaurantes creados
SELECT 
    r.name as restaurante,
    r.cuisine_type as cocina,
    r.rating as calificacion,
    COUNT(p.id) as productos,
    r.phone as telefono,
    r.address as direccion
FROM restaurant.restaurants r
LEFT JOIN menu.menus m ON r.id = m.restaurant_id
LEFT JOIN menu.products p ON m.id = p.menu_id
WHERE r.name != 'Restaurante Demo'
GROUP BY r.id, r.name, r.cuisine_type, r.rating, r.phone, r.address
ORDER BY r.name;

COMMIT;
