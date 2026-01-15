-- 8.1 Índices no utilizados (potencial para cleanup)
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_tup_read = 0 AND idx_tup_fetch = 0
ORDER BY schemaname, tablename;

-- 8.2 Tablas que necesitan VACUUM/ANALYZE
SELECT 
    schemaname,
    tablename,
    n_dead_tup,
    n_live_tup,
    ROUND((n_dead_tup * 100.0 / GREATEST(n_live_tup + n_dead_tup, 1)), 2) as dead_percentage,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname IN ('auth', 'restaurant', 'system', 'menu')
ORDER BY dead_percentage DESC;

-- 8.3 Queries más lentas (si pg_stat_statements está habilitado)
-- SELECT 
--     query,
--     calls,
--     total_time,
--     mean_time,
--     stddev_time
-- FROM pg_stat_statements
-- WHERE query NOT LIKE '%pg_stat_statements%'
-- ORDER BY mean_time DESC
-- LIMIT 10;
