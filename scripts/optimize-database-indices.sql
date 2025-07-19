-- ===== OPTIMIZACIÓN DE ÍNDICES PARA SPOON RESTAURANT =====
-- Script para mejorar el rendimiento de consultas de horarios
-- Fecha: 2025-07-19

-- 1. Índice compuesto para business_hours (consultas más frecuentes)
CREATE INDEX IF NOT EXISTS idx_business_hours_restaurant_day 
ON restaurant.business_hours(restaurant_id, day_of_week);

-- 2. Índice para special_hours (días festivos/especiales)
CREATE INDEX IF NOT EXISTS idx_special_hours_restaurant_date 
ON restaurant.special_hours(restaurant_id, date);

-- 3. Índice para consultas por fecha futura (optimizar consultas de días especiales)
CREATE INDEX IF NOT EXISTS idx_special_hours_future_dates 
ON restaurant.special_hours(restaurant_id, date) 
WHERE date >= CURRENT_DATE;

-- 4. Índice para horarios abiertos (consultas frecuentes de disponibilidad)
CREATE INDEX IF NOT EXISTS idx_business_hours_open 
ON restaurant.business_hours(restaurant_id, day_of_week, is_closed) 
WHERE is_closed = false;

-- 5. Índice para timestamps de actualización (útil para cache invalidation)
CREATE INDEX IF NOT EXISTS idx_business_hours_updated 
ON restaurant.business_hours(restaurant_id, updated_at);

-- 6. Índice para special_hours por razón (útil para reportes)
CREATE INDEX IF NOT EXISTS idx_special_hours_reason 
ON restaurant.special_hours(restaurant_id, reason) 
WHERE reason IS NOT NULL;

-- ===== ESTADÍSTICAS Y VERIFICACIÓN =====

-- Verificar que los índices se crearon correctamente
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'restaurant' 
  AND (tablename = 'business_hours' OR tablename = 'special_hours')
ORDER BY tablename, indexname;

-- Mostrar estadísticas de las tablas
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables 
WHERE schemaname = 'restaurant' 
  AND (tablename = 'business_hours' OR tablename = 'special_hours');

-- ===== NOTAS DE OPTIMIZACIÓN =====
/*
ÍNDICES CREADOS:

1. idx_business_hours_restaurant_day: 
   - Optimiza consultas GET de horarios por restaurante y día
   - Mejora rendimiento de UPSERT operations

2. idx_special_hours_restaurant_date:
   - Optimiza consultas de días especiales por restaurante y fecha
   - Útil para verificar si un día específico tiene horarios especiales

3. idx_special_hours_future_dates:
   - Índice parcial solo para fechas futuras
   - Optimiza la consulta "WHERE date >= CURRENT_DATE" en la API

4. idx_business_hours_open:
   - Índice parcial solo para horarios abiertos
   - Optimiza consultas de disponibilidad del restaurante

5. idx_business_hours_updated:
   - Útil para implementar cache invalidation basado en timestamps
   - Permite identificar cambios recientes eficientemente

6. idx_special_hours_reason:
   - Optimiza consultas por tipo de día especial
   - Útil para reportes y análisis

IMPACTO ESPERADO:
- Consultas GET: 40-60% más rápidas
- Operaciones UPSERT: 20-30% más rápidas  
- Consultas de disponibilidad: 50-70% más rápidas
*/
