-- 7.1 Todos los índices del sistema
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname IN ('auth', 'restaurant', 'system', 'menu')
ORDER BY schemaname, tablename;

-- 7.2 Todas las constraints (FK, UNIQUE, CHECK)
SELECT 
    tc.table_schema,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS referenced_table,
    ccu.column_name AS referenced_column
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema IN ('auth', 'restaurant', 'system', 'menu')
ORDER BY tc.table_schema, tc.table_name, tc.constraint_type;

-- 7.3 Todos los triggers del sistema
SELECT 
    schemaname,
    tablename,
    triggername,
    tgtype
FROM pg_trigger pt
JOIN pg_class pc ON pt.tgrelid = pc.oid
JOIN pg_namespace pn ON pc.relnamespace = pn.oid
WHERE pn.nspname IN ('auth', 'restaurant', 'system', 'menu')
AND tgisinternal = false;

-- 7.4 Enums personalizados del sistema
SELECT 
    n.nspname as schema_name,
    t.typname as enum_name,
    string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE n.nspname IN ('auth', 'restaurant', 'system', 'menu', 'public')
GROUP BY n.nspname, t.typname
ORDER BY schema_name, enum_name;

-- 7.5 Funciones personalizadas
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname IN ('auth', 'restaurant', 'system', 'menu', 'public')
AND p.prokind = 'f'
ORDER BY schema_name, function_name;
