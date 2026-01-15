-- 9.1 Funnel de conversión: Freemium → SaaS → Marketplace
-- (Preparado para cuando implementes los campos de monetización)
SELECT 
    'Total Restaurantes Registrados' as stage,
    COUNT(*) as count
FROM restaurant.restaurants
WHERE status = 'active'

UNION ALL

SELECT 
    'Restaurantes con Perfil Completo' as stage,
    COUNT(*) as count
FROM restaurant.restaurants r
LEFT JOIN restaurant.business_hours bh ON r.id = bh.restaurant_id
WHERE r.status = 'active'
AND r.name IS NOT NULL
AND r.description IS NOT NULL
AND r.address IS NOT NULL
AND bh.restaurant_id IS NOT NULL;

-- 9.2 Análisis de readiness para marketplace
-- Restaurantes listos para empezar a vender
SELECT 
    r.name,
    r.email,
    r.phone,
    CASE 
        WHEN r.name IS NOT NULL AND r.description IS NOT NULL AND r.phone IS NOT NULL AND r.address IS NOT NULL THEN 'READY'
        ELSE 'INCOMPLETE'
    END as marketplace_readiness,
    COUNT(bh.id) as configured_business_days
FROM restaurant.restaurants r
LEFT JOIN restaurant.business_hours bh ON r.id = bh.restaurant_id AND bh.is_closed = false
WHERE r.status = 'active'
GROUP BY r.id, r.name, r.email, r.phone, r.description, r.address
ORDER BY marketplace_readiness DESC, configured_business_days DESC;

-- 9.3 Análisis de regiones para expansión
SELECT 
    COALESCE(state, 'No especificado') as state,
    COALESCE(city, 'No especificado') as city,
    COUNT(*) as restaurant_count,
    COUNT(CASE WHEN address IS NOT NULL AND latitude IS NOT NULL THEN 1 END) as with_complete_location
FROM restaurant.restaurants
WHERE status = 'active'
GROUP BY state, city
ORDER BY restaurant_count DESC;

-- 9.4 Análisis de potencial de red (network effects)
-- Densidad de restaurantes por área geográfica
SELECT 
    city,
    COUNT(*) as restaurant_count,
    AVG(latitude) as avg_lat,
    AVG(longitude) as avg_lng,
    CASE 
        WHEN COUNT(*) >= 10 THEN 'HIGH_DENSITY'
        WHEN COUNT(*) >= 5 THEN 'MEDIUM_DENSITY'
        ELSE 'LOW_DENSITY'
    END as density_level
FROM restaurant.restaurants
WHERE status = 'active' AND city IS NOT NULL
GROUP BY city
ORDER BY restaurant_count DESC;
