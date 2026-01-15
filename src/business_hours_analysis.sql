-- 4.1 Estructura de horarios
\d+ restaurant.business_hours;

-- 4.2 Distribución de horarios por día de la semana
SELECT 
    day_of_week,
    COUNT(*) as total_entries,
    COUNT(CASE WHEN is_closed = true THEN 1 END) as closed_count,
    COUNT(CASE WHEN is_closed = false THEN 1 END) as open_count,
    COUNT(CASE WHEN is_24_hours = true THEN 1 END) as always_open_count
FROM restaurant.business_hours
GROUP BY day_of_week
ORDER BY day_of_week;

-- 4.3 Restaurantes con horarios configurados vs sin configurar
SELECT 
    'Con horarios configurados' as status,
    COUNT(DISTINCT bh.restaurant_id) as count
FROM restaurant.business_hours bh
JOIN restaurant.restaurants r ON bh.restaurant_id = r.id
WHERE r.status = 'active'

UNION ALL

SELECT 
    'Sin horarios configurados' as status,
    COUNT(r.id) as count
FROM restaurant.restaurants r
LEFT JOIN restaurant.business_hours bh ON r.id = bh.restaurant_id
WHERE r.status = 'active' AND bh.restaurant_id IS NULL;

-- 4.4 Análisis de múltiples turnos por día
SELECT 
    r.name as restaurant_name,
    bh.day_of_week,
    COUNT(*) as shifts_count,
    STRING_AGG(bh.open_time || ' - ' || bh.close_time, ' | ' ORDER BY bh.open_time) as shifts
FROM restaurant.business_hours bh
JOIN restaurant.restaurants r ON bh.restaurant_id = r.id
WHERE r.status = 'active' AND bh.is_closed = false
GROUP BY r.id, r.name, bh.day_of_week
HAVING COUNT(*) > 1
ORDER BY r.name, bh.day_of_week;

-- 4.5 Horarios más comunes de apertura y cierre
SELECT 
    'Apertura' as type,
    open_time as time,
    COUNT(*) as frequency
FROM restaurant.business_hours
WHERE is_closed = false
GROUP BY open_time

UNION ALL

SELECT 
    'Cierre' as type,
    close_time as time,
    COUNT(*) as frequency
FROM restaurant.business_hours
WHERE is_closed = false
GROUP BY close_time
ORDER BY type, frequency DESC;
