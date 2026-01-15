-- 1.1 Resumen de todos los schemas y tablas
SELECT 
    schemaname,
    COUNT(*) as table_count,
    STRING_AGG(tablename, ', ' ORDER BY tablename) as tables
FROM pg_tables 
WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
GROUP BY schemaname
ORDER BY schemaname;

-- 1.2 Estadísticas generales de la base de datos
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables
ORDER BY schemaname, n_live_tup DESC;

-- 1.3 Tamaño de tablas más importantes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as bytes
FROM pg_tables
WHERE schemaname IN ('auth', 'restaurant', 'system', 'menu')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
