-- =====================================================
-- SPOON - AGREGAR PRODUCTOS A RESTAURANTES EXISTENTES
-- =====================================================
-- Archivo: 09-add-products-only.sql
-- Propósito: Agregar productos a los restaurantes ya creados
-- Fecha: 7 de Enero, 2025
-- Versión: 1.0
-- =====================================================

-- Productos para La Cocina de la Abuela
DO $$
DECLARE
    restaurant_id_1 UUID;
    cat_entradas UUID;
    cat_principales UUID;
    cat_bebidas UUID;
    cat_acompanamientos UUID;
    user_id UUID;
BEGIN
    SELECT id INTO restaurant_id_1 FROM restaurant.restaurants WHERE name = 'La Cocina de la Abuela';
    SELECT id INTO cat_entradas FROM menu.categories WHERE name = 'Entradas';
    SELECT id INTO cat_principales FROM menu.categories WHERE name = 'Principios';
    SELECT id INTO cat_bebidas FROM menu.categories WHERE name = 'Bebidas';
    SELECT id INTO cat_acompanamientos FROM menu.categories WHERE name = 'Acompanamientos';
    SELECT id INTO user_id FROM auth.users LIMIT 1;
    
    INSERT INTO menu.products (
        id, restaurant_id, category_id, name, description, slug,
        base_price, current_price, preparation_time, status,
        created_by, updated_by
    ) VALUES
    (gen_random_uuid(), restaurant_id_1, cat_entradas, 'Sancocho Trifásico', 'Sancocho tradicional con pollo, cerdo y res, acompañado de yuca, plátano y mazorca', 'sancocho-trifasico', 28000, 28000, 45, 'active', user_id, user_id),
    (gen_random_uuid(), restaurant_id_1, cat_entradas, 'Ajiaco Santafereño', 'Sopa tradicional bogotana con pollo, papas criollas, guascas y alcaparras', 'ajiaco-santafereno', 24000, 24000, 40, 'active', user_id, user_id),
    (gen_random_uuid(), restaurant_id_1, cat_principales, 'Bandeja Paisa Completa', 'Frijoles, arroz, huevo frito, chorizo, morcilla, chicharrón, carne molida, plátano maduro y aguacate', 'bandeja-paisa-completa', 35000, 35000, 25, 'active', user_id, user_id),
    (gen_random_uuid(), restaurant_id_1, cat_principales, 'Lechona Tolimense', 'Lechona tradicional con arroz con arveja y ensalada', 'lechona-tolimense', 32000, 32000, 20, 'active', user_id, user_id),
    (gen_random_uuid(), restaurant_id_1, cat_bebidas, 'Chicha de Maíz', 'Bebida tradicional fermentada de maíz con canela', 'chicha-de-maiz', 8000, 8000, 5, 'active', user_id, user_id),
    (gen_random_uuid(), restaurant_id_1, cat_acompanamientos, 'Tres Leches Casero', 'Postre tradicional con leche condensada, evaporada y crema', 'tres-leches-casero', 12000, 12000, 10, 'active', user_id, user_id);
END $$;

-- Productos para Sabores del Pacífico
DO $$
DECLARE
    restaurant_id_2 UUID;
    cat_entradas UUID;
    cat_principales UUID;
    cat_bebidas UUID;
    cat_proteinas UUID;
    user_id UUID;
BEGIN
    SELECT id INTO restaurant_id_2 FROM restaurant.restaurants WHERE name = 'Sabores del Pacífico';
    SELECT id INTO cat_entradas FROM menu.categories WHERE name = 'Entradas';
    SELECT id INTO cat_principales FROM menu.categories WHERE name = 'Principios';
    SELECT id INTO cat_bebidas FROM menu.categories WHERE name = 'Bebidas';
    SELECT id INTO cat_proteinas FROM menu.categories WHERE name = 'Proteinas';
    SELECT id INTO user_id FROM auth.users LIMIT 1;
    
    INSERT INTO menu.products (
        id, restaurant_id, category_id, name, description, slug,
        base_price, current_price, preparation_time, status,
        created_by, updated_by
    ) VALUES
    (gen_random_uuid(), restaurant_id_2, cat_entradas, 'Ceviche de Camarón', 'Camarones frescos marinados en limón con cebolla morada y cilantro', 'ceviche-de-camaron', 26000, 26000, 15, 'active', user_id, user_id),
    (gen_random_uuid(), restaurant_id_2, cat_principales, 'Arroz con Coco y Camarón', 'Arroz cremoso cocinado en leche de coco con camarones del Pacífico', 'arroz-con-coco-y-camaron', 38000, 38000, 30, 'active', user_id, user_id),
    (gen_random_uuid(), restaurant_id_2, cat_proteinas, 'Pescado Frito Entero', 'Pargo rojo frito acompañado de patacones y ensalada', 'pescado-frito-entero', 42000, 42000, 25, 'active', user_id, user_id),
    (gen_random_uuid(), restaurant_id_2, cat_principales, 'Sancocho de Pescado', 'Sancocho tradicional del Pacífico con pescado fresco y yuca', 'sancocho-de-pescado', 32000, 32000, 50, 'active', user_id, user_id),
    (gen_random_uuid(), restaurant_id_2, cat_bebidas, 'Lulada del Valle', 'Bebida refrescante con lulo, hielo y leche condensada', 'lulada-del-valle', 9000, 9000, 5, 'active', user_id, user_id);
END $$;

-- Productos para Pizza Italiana Roma
DO $$
DECLARE
    restaurant_id_3 UUID;
    cat_entradas UUID;
    cat_principales UUID;
    cat_bebidas UUID;
    cat_acompanamientos UUID;
    user_id UUID;
BEGIN
    SELECT id INTO restaurant_id_3 FROM restaurant.restaurants WHERE name = 'Pizza Italiana Roma';
    SELECT id INTO cat_entradas FROM menu.categories WHERE name = 'Entradas';
    SELECT id INTO cat_principales FROM menu.categories WHERE name = 'Principios';
    SELECT id INTO cat_bebidas FROM menu.categories WHERE name = 'Bebidas';
    SELECT id INTO cat_acompanamientos FROM menu.categories WHERE name = 'Acompanamientos';
    SELECT id INTO user_id FROM auth.users LIMIT 1;
    
    INSERT INTO menu.products (
        id, restaurant_id, category_id, name, description, slug,
        base_price, current_price, preparation_time, status,
        created_by, updated_by
    ) VALUES
    (gen_random_uuid(), restaurant_id_3, cat_entradas, 'Bruschetta Italiana', 'Pan tostado con tomate fresco, albahaca y aceite de oliva extra virgen', 'bruschetta-italiana', 18000, 18000, 10, 'active', user_id, user_id),
    (gen_random_uuid(), restaurant_id_3, cat_principales, 'Pizza Margherita', 'Pizza clásica con salsa de tomate, mozzarella di bufala y albahaca fresca', 'pizza-margherita', 32000, 32000, 15, 'active', user_id, user_id),
    (gen_random_uuid(), restaurant_id_3, cat_principales, 'Pizza Quattro Stagioni', 'Pizza con jamón, champiñones, alcachofas y aceitunas', 'pizza-quattro-stagioni', 38000, 38000, 18, 'active', user_id, user_id),
    (gen_random_uuid(), restaurant_id_3, cat_principales, 'Pasta Carbonara', 'Spaghetti con panceta, huevo, parmesano y pimienta negra', 'pasta-carbonara', 28000, 28000, 12, 'active', user_id, user_id),
    (gen_random_uuid(), restaurant_id_3, cat_bebidas, 'Limonada Italiana', 'Limonada con limones de Sicilia y menta fresca', 'limonada-italiana', 8000, 8000, 5, 'active', user_id, user_id),
    (gen_random_uuid(), restaurant_id_3, cat_acompanamientos, 'Tiramisu Casero', 'Postre tradicional italiano con café, mascarpone y cacao', 'tiramisu-casero', 15000, 15000, 8, 'active', user_id, user_id);
END $$;

-- Productos para Burger House
DO $$
DECLARE
    restaurant_id_4 UUID;
    cat_entradas UUID;
    cat_principales UUID;
    cat_bebidas UUID;
    cat_proteinas UUID;
    user_id UUID;
BEGIN
    SELECT id INTO restaurant_id_4 FROM restaurant.restaurants WHERE name = 'Burger House';
    SELECT id INTO cat_entradas FROM menu.categories WHERE name = 'Entradas';
    SELECT id INTO cat_principales FROM menu.categories WHERE name = 'Principios';
    SELECT id INTO cat_bebidas FROM menu.categories WHERE name = 'Bebidas';
    SELECT id INTO cat_proteinas FROM menu.categories WHERE name = 'Proteinas';
    SELECT id INTO user_id FROM auth.users LIMIT 1;
    
    INSERT INTO menu.products (
        id, restaurant_id, category_id, name, description, slug,
        base_price, current_price, preparation_time, status,
        created_by, updated_by
    ) VALUES
    (gen_random_uuid(), restaurant_id_4, cat_entradas, 'Papas Gajo con Cheddar', 'Papas en gajos crujientes con salsa de queso cheddar y tocineta', 'papas-gajo-con-cheddar', 16000, 16000, 12, 'active', user_id, user_id),
    (gen_random_uuid(), restaurant_id_4, cat_principales, 'Classic Burger', 'Hamburguesa clásica con carne de res, lechuga, tomate, cebolla y salsa especial', 'classic-burger', 24000, 24000, 15, 'active', user_id, user_id),
    (gen_random_uuid(), restaurant_id_4, cat_principales, 'BBQ Bacon Burger', 'Hamburguesa con carne, tocineta, queso cheddar y salsa BBQ', 'bbq-bacon-burger', 28000, 28000, 18, 'active', user_id, user_id),
    (gen_random_uuid(), restaurant_id_4, cat_proteinas, 'Pollo Crispy', 'Pechuga de pollo empanizada con especias secretas', 'pollo-crispy', 26000, 26000, 20, 'active', user_id, user_id),
    (gen_random_uuid(), restaurant_id_4, cat_bebidas, 'Malteada de Vainilla', 'Malteada cremosa de vainilla con helado artesanal', 'malteada-de-vainilla', 12000, 12000, 5, 'active', user_id, user_id),
    (gen_random_uuid(), restaurant_id_4, cat_bebidas, 'Coca-Cola', 'Coca-Cola fría en botella de vidrio', 'coca-cola', 5000, 5000, 2, 'active', user_id, user_id);
END $$;

-- Productos para Sushi Tokyo
DO $$
DECLARE
    restaurant_id_5 UUID;
    cat_entradas UUID;
    cat_principales UUID;
    cat_bebidas UUID;
    cat_proteinas UUID;
    user_id UUID;
BEGIN
    SELECT id INTO restaurant_id_5 FROM restaurant.restaurants WHERE name = 'Sushi Tokyo';
    SELECT id INTO cat_entradas FROM menu.categories WHERE name = 'Entradas';
    SELECT id INTO cat_principales FROM menu.categories WHERE name = 'Principios';
    SELECT id INTO cat_bebidas FROM menu.categories WHERE name = 'Bebidas';
    SELECT id INTO cat_proteinas FROM menu.categories WHERE name = 'Proteinas';
    SELECT id INTO user_id FROM auth.users LIMIT 1;
    
    INSERT INTO menu.products (
        id, restaurant_id, category_id, name, description, slug,
        base_price, current_price, preparation_time, status,
        created_by, updated_by
    ) VALUES
    (gen_random_uuid(), restaurant_id_5, cat_entradas, 'Gyoza de Cerdo', 'Dumplings japoneses rellenos de cerdo y vegetales, servidos con salsa ponzu', 'gyoza-de-cerdo', 22000, 22000, 15, 'active', user_id, user_id),
    (gen_random_uuid(), restaurant_id_5, cat_entradas, 'Edamame', 'Vainas de soja cocidas al vapor con sal marina', 'edamame', 14000, 14000, 8, 'active', user_id, user_id),
    (gen_random_uuid(), restaurant_id_5, cat_principales, 'Sushi Variado (12 piezas)', 'Selección del chef con salmón, atún, camarón y anguila', 'sushi-variado-12-piezas', 48000, 48000, 25, 'active', user_id, user_id),
    (gen_random_uuid(), restaurant_id_5, cat_principales, 'Ramen Tonkotsu', 'Sopa de fideos con caldo de hueso de cerdo, chashu y huevo marinado', 'ramen-tonkotsu', 32000, 32000, 20, 'active', user_id, user_id),
    (gen_random_uuid(), restaurant_id_5, cat_proteinas, 'Salmón Teriyaki', 'Filete de salmón glaseado con salsa teriyaki y vegetales', 'salmon-teriyaki', 38000, 38000, 18, 'active', user_id, user_id),
    (gen_random_uuid(), restaurant_id_5, cat_bebidas, 'Té Verde Matcha', 'Té verde japonés tradicional en polvo', 'te-verde-matcha', 8000, 8000, 5, 'active', user_id, user_id),
    (gen_random_uuid(), restaurant_id_5, cat_bebidas, 'Sake Caliente', 'Sake japonés premium servido caliente', 'sake-caliente', 18000, 18000, 3, 'active', user_id, user_id);
END $$;

-- Verificación final
SELECT 
    r.name as restaurante,
    r.cuisine_type as cocina,
    COUNT(p.id) as productos,
    r.phone as telefono,
    r.city as ciudad
FROM restaurant.restaurants r
LEFT JOIN menu.products p ON r.id = p.restaurant_id
WHERE r.name != 'Restaurante Demo'
GROUP BY r.id, r.name, r.cuisine_type, r.phone, r.city
ORDER BY r.name;

COMMIT;
