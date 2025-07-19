-- Script para crear restaurante de prueba y datos necesarios
-- Ejecutar este script para que el sistema funcione correctamente

-- 1. Crear un restaurante de prueba
INSERT INTO restaurant.restaurants (
    id,
    name,
    description,
    phone,
    email,
    address,
    city,
    state,
    country,
    logo_url,
    cover_image_url,
    status,
    created_at,
    updated_at,
    created_by,
    owner_id
) VALUES (
    '4073a4ad-b275-4e17-b197-844881f0319e', -- ID del .env
    'Restaurante Demo SPOON',
    'Restaurante de demostración para pruebas del sistema SPOON',
    '+57 300 123 4567',
    'demo@spoon.com',
    'Calle 123 #45-67',
    'Bogotá',
    'Cundinamarca',
    'Colombia',
    NULL,
    NULL,
    'active',
    NOW(),
    NOW(),
    'b40bff69-722e-4e49-ba56-ad85f82f6716', -- ID del admin del .env
    'b40bff69-722e-4e49-ba56-ad85f82f6716'  -- ID del admin del .env
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = NOW();

-- 2. Asignar el admin como owner del restaurante (si no existe la relación)
INSERT INTO restaurant.restaurant_users (
    restaurant_id,
    user_id,
    role,
    created_at,
    created_by
) VALUES (
    '4073a4ad-b275-4e17-b197-844881f0319e',
    'b40bff69-722e-4e49-ba56-ad85f82f6716',
    'owner',
    NOW(),
    'b40bff69-722e-4e49-ba56-ad85f82f6716'
) ON CONFLICT (restaurant_id, user_id) DO NOTHING;

-- 3. Crear configuración de precios para el restaurante
INSERT INTO restaurant.menu_pricing (
    restaurant_id,
    daily_menu_price,
    special_menu_price,
    currency,
    is_active,
    created_at,
    updated_at
) VALUES (
    '4073a4ad-b275-4e17-b197-844881f0319e',
    10000.00,
    15000.00,
    'COP',
    true,
    NOW(),
    NOW()
) ON CONFLICT (restaurant_id) DO UPDATE SET
    daily_menu_price = EXCLUDED.daily_menu_price,
    special_menu_price = EXCLUDED.special_menu_price,
    updated_at = NOW();

-- 4. Agregar todos los productos del sistema al menú del restaurante
INSERT INTO restaurant.menu_items (
    restaurant_id,
    product_id,
    is_available,
    is_featured,
    created_at,
    updated_at
)
SELECT 
    '4073a4ad-b275-4e17-b197-844881f0319e',
    p.id,
    true,
    false,
    NOW(),
    NOW()
FROM system.products p
WHERE p.is_active = true
ON CONFLICT (restaurant_id, product_id) DO UPDATE SET
    is_available = true,
    updated_at = NOW();

-- 5. Verificar que todo se creó correctamente
SELECT 
    'Restaurante creado' as tipo,
    r.name as nombre,
    r.status as estado
FROM restaurant.restaurants r 
WHERE r.id = '4073a4ad-b275-4e17-b197-844881f0319e'

UNION ALL

SELECT 
    'Productos en menú' as tipo,
    COUNT(*)::text as nombre,
    'disponibles' as estado
FROM restaurant.menu_items mi 
WHERE mi.restaurant_id = '4073a4ad-b275-4e17-b197-844881f0319e'
    AND mi.is_available = true

UNION ALL

SELECT 
    'Precios configurados' as tipo,
    CONCAT('$', mp.daily_menu_price, ' / $', mp.special_menu_price) as nombre,
    mp.currency as estado
FROM restaurant.menu_pricing mp 
WHERE mp.restaurant_id = '4073a4ad-b275-4e17-b197-844881f0319e'

UNION ALL

SELECT 
    'Usuario owner' as tipo,
    u.email as nombre,
    ru.role as estado
FROM restaurant.restaurant_users ru
JOIN auth.users u ON ru.user_id = u.id
WHERE ru.restaurant_id = '4073a4ad-b275-4e17-b197-844881f0319e'
    AND ru.role = 'owner';
