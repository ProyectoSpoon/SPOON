-- 3.1 Estructura completa de restaurantes
\d+ restaurant.restaurants;

-- 3.2 PROBLEMA CRÍTICO: Usuarios con múltiples restaurantes
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    COUNT(r.id) as restaurant_count,
    STRING_AGG(r.name, ' | ' ORDER BY r.created_at) as restaurant_names,
    STRING_AGG(r.id::text, ' | ' ORDER BY r.created_at) as restaurant_ids
FROM auth.users u
LEFT JOIN restaurant.restaurants r ON u.id = r.owner_id
WHERE r.status = 'active'
GROUP BY u.id, u.email, u.first_name, u.last_name
HAVING COUNT(r.id) > 1
ORDER BY COUNT(r.id) DESC;

-- 3.3 Distribución geográfica de restaurantes
SELECT 
    country,
    state,
    city,
    COUNT(*) as restaurant_count
FROM restaurant.restaurants
WHERE status = 'active'
GROUP BY country, state, city
ORDER BY country, state, city;

-- 3.4 Análisis de tipos de cocina más populares
SELECT 
    ct.name as cuisine_type,
    COUNT(r.id) as restaurant_count,
    ROUND(COUNT(r.id) * 100.0 / SUM(COUNT(r.id)) OVER(), 2) as percentage
FROM restaurant.restaurants r
LEFT JOIN system.cuisine_types ct ON r.cuisine_type_id = ct.id
WHERE r.status = 'active'
GROUP BY ct.name
ORDER BY restaurant_count DESC;

-- 3.5 Análisis de completitud de perfiles de restaurantes
SELECT 
    'Información Básica' as category,
    COUNT(CASE WHEN name IS NOT NULL AND description IS NOT NULL AND phone IS NOT NULL THEN 1 END) as complete,
    COUNT(*) - COUNT(CASE WHEN name IS NOT NULL AND description IS NOT NULL AND phone IS NOT NULL THEN 1 END) as incomplete
FROM restaurant.restaurants
WHERE status = 'active'

UNION ALL

SELECT 
    'Ubicación' as category,
    COUNT(CASE WHEN address IS NOT NULL AND latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as complete,
    COUNT(*) - COUNT(CASE WHEN address IS NOT NULL AND latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as incomplete
FROM restaurant.restaurants
WHERE status = 'active'

UNION ALL

SELECT 
    'Imágenes' as category,
    COUNT(CASE WHEN logo_url IS NOT NULL AND cover_image_url IS NOT NULL THEN 1 END) as complete,
    COUNT(*) - COUNT(CASE WHEN logo_url IS NOT NULL AND cover_image_url IS NOT NULL THEN 1 END) as incomplete
FROM restaurant.restaurants
WHERE status = 'active';

-- 3.6 Restaurantes por fecha de creación (growth tracking)
SELECT 
    DATE_TRUNC('week', created_at) as week,
    COUNT(*) as new_restaurants,
    SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('week', created_at)) as cumulative_restaurants
FROM restaurant.restaurants
WHERE status = 'active'
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week;
