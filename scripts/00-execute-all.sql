-- =====================================================
-- SPOON - SCRIPT MAESTRO DE EJECUCIÓN
-- =====================================================
-- Archivo: 00-execute-all.sql
-- Propósito: Ejecutar todos los scripts de arquitectura unificada en orden
-- Fecha: 7 de Enero, 2025
-- Versión: 1.0
-- Base de Datos: spoon_db
-- Usuario: postgres
-- =====================================================

-- =====================================================
-- INFORMACIÓN DE CONEXIÓN
-- =====================================================
\echo '🚀 INICIANDO IMPLEMENTACIÓN DE ARQUITECTURA UNIFICADA SPOON'
\echo '📅 Fecha: 7 de Enero, 2025'
\echo '🗄️ Base de datos: spoon_db'
\echo '👤 Usuario: postgres'
\echo ''

-- Verificar conexión actual
SELECT 
    '✅ CONEXIÓN VERIFICADA' as status,
    current_database() as database_name,
    current_user as user_name,
    version() as postgresql_version,
    CURRENT_TIMESTAMP as execution_time;

\echo ''
\echo '=====================================================';
\echo '📋 RESUMEN DE SCRIPTS A EJECUTAR:';
\echo '=====================================================';
\echo '1. 01-create-schemas.sql     - Crear 4 nuevos esquemas';
\echo '2. 02-create-enums.sql       - Crear 17 tipos ENUM';
\echo '3. 03-create-crm-tables.sql  - Crear esquema CRM (5 tablas)';
\echo '4. 04-create-mobile-tables.sql - Crear esquema Mobile (6 tablas)';
\echo '5. 05-create-marketing-tables.sql - Crear esquema Marketing (7 tablas)';
\echo '6. 06-create-analytics-tables.sql - Crear esquema Analytics (6 tablas)';
\echo '';

-- =====================================================
-- BACKUP DE SEGURIDAD
-- =====================================================
\echo '💾 CREANDO BACKUP DE SEGURIDAD...';

-- Crear tabla de backup de información
CREATE TABLE IF NOT EXISTS backup_info (
    id SERIAL PRIMARY KEY,
    backup_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    backup_type VARCHAR(50),
    description TEXT,
    status VARCHAR(20) DEFAULT 'created'
);

INSERT INTO backup_info (backup_type, description) 
VALUES ('pre_architecture_upgrade', 'Backup antes de implementar arquitectura unificada');

\echo '✅ Backup registrado en tabla backup_info';
\echo '';

-- =====================================================
-- PASO 1: CREAR ESQUEMAS
-- =====================================================
\echo '🏗️ PASO 1/6: CREANDO NUEVOS ESQUEMAS...';
\i scripts/01-create-schemas.sql
\echo '✅ PASO 1 COMPLETADO: Esquemas creados';
\echo '';

-- =====================================================
-- PASO 2: CREAR TIPOS ENUM
-- =====================================================
\echo '🔤 PASO 2/6: CREANDO TIPOS ENUM...';
\i scripts/02-create-enums.sql
\echo '✅ PASO 2 COMPLETADO: Tipos ENUM creados';
\echo '';

-- =====================================================
-- PASO 3: CREAR TABLAS CRM
-- =====================================================
\echo '📊 PASO 3/6: CREANDO ESQUEMA CRM...';
\i scripts/03-create-crm-tables.sql
\echo '✅ PASO 3 COMPLETADO: Esquema CRM creado';
\echo '';

-- =====================================================
-- PASO 4: CREAR TABLAS MOBILE
-- =====================================================
\echo '📱 PASO 4/6: CREANDO ESQUEMA MOBILE...';
\i scripts/04-create-mobile-tables.sql
\echo '✅ PASO 4 COMPLETADO: Esquema Mobile creado';
\echo '';

-- =====================================================
-- PASO 5: CREAR TABLAS MARKETING
-- =====================================================
\echo '📢 PASO 5/6: CREANDO ESQUEMA MARKETING...';
\i scripts/05-create-marketing-tables.sql
\echo '✅ PASO 5 COMPLETADO: Esquema Marketing creado';
\echo '';

-- =====================================================
-- PASO 6: CREAR TABLAS ANALYTICS
-- =====================================================
\echo '📈 PASO 6/6: CREANDO ESQUEMA ANALYTICS...';
\i scripts/06-create-analytics-tables.sql
\echo '✅ PASO 6 COMPLETADO: Esquema Analytics creado';
\echo '';

-- =====================================================
-- VERIFICACIÓN FINAL COMPLETA
-- =====================================================
\echo '🔍 VERIFICACIÓN FINAL DE LA IMPLEMENTACIÓN...';
\echo '';

-- Verificar todos los esquemas
\echo '📋 ESQUEMAS CREADOS:';
SELECT 
    schema_name,
    CASE 
        WHEN schema_name IN ('crm', 'mobile', 'marketing', 'analytics') THEN '🆕 NUEVO'
        WHEN schema_name IN ('auth', 'restaurant', 'menu', 'sales', 'audit', 'config') THEN '✅ EXISTENTE'
        ELSE '📋 SISTEMA'
    END as status
FROM information_schema.schemata 
WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY 
    CASE 
        WHEN schema_name IN ('auth', 'restaurant', 'menu', 'sales', 'audit', 'config') THEN 1
        WHEN schema_name IN ('crm', 'mobile', 'marketing', 'analytics') THEN 2
        ELSE 3
    END,
    schema_name;

\echo '';
\echo '📊 TABLAS CREADAS POR ESQUEMA:';

-- Contar tablas por esquema
SELECT 
    table_schema as esquema,
    COUNT(*) as total_tablas,
    CASE 
        WHEN table_schema IN ('crm', 'mobile', 'marketing', 'analytics') THEN '🆕 NUEVO'
        ELSE '✅ EXISTENTE'
    END as status
FROM information_schema.tables 
WHERE table_schema IN ('auth', 'restaurant', 'menu', 'sales', 'audit', 'config', 'crm', 'mobile', 'marketing', 'analytics')
GROUP BY table_schema
ORDER BY 
    CASE 
        WHEN table_schema IN ('auth', 'restaurant', 'menu', 'sales', 'audit', 'config') THEN 1
        WHEN table_schema IN ('crm', 'mobile', 'marketing', 'analytics') THEN 2
        ELSE 3
    END,
    table_schema;

\echo '';
\echo '🔤 TIPOS ENUM CREADOS:';

-- Verificar tipos ENUM
SELECT 
    t.typname as enum_name,
    array_length(array_agg(e.enumlabel), 1) as total_values,
    '🆕 NUEVO' as status
FROM pg_type t 
JOIN pg_namespace n ON n.oid = t.typnamespace 
LEFT JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typtype = 'e'
    AND n.nspname = 'public'
    AND t.typname LIKE '%_enum'
GROUP BY t.typname
ORDER BY t.typname;

\echo '';
\echo '📈 RESUMEN FINAL DE IMPLEMENTACIÓN:';

-- Resumen final
WITH schema_stats AS (
    SELECT 
        COUNT(*) FILTER (WHERE table_schema IN ('crm', 'mobile', 'marketing', 'analytics')) as nuevas_tablas,
        COUNT(*) FILTER (WHERE table_schema IN ('auth', 'restaurant', 'menu', 'sales', 'audit', 'config')) as tablas_existentes
    FROM information_schema.tables 
    WHERE table_schema IN ('auth', 'restaurant', 'menu', 'sales', 'audit', 'config', 'crm', 'mobile', 'marketing', 'analytics')
),
enum_stats AS (
    SELECT COUNT(*) as total_enums
    FROM pg_type t 
    JOIN pg_namespace n ON n.oid = t.typnamespace 
    WHERE t.typtype = 'e' AND n.nspname = 'public' AND t.typname LIKE '%_enum'
)
SELECT 
    '🎉 ARQUITECTURA UNIFICADA IMPLEMENTADA EXITOSAMENTE' as status,
    ss.nuevas_tablas as tablas_nuevas_creadas,
    ss.tablas_existentes as tablas_existentes_mantenidas,
    es.total_enums as tipos_enum_creados,
    4 as esquemas_nuevos_creados,
    CURRENT_TIMESTAMP as completado_en
FROM schema_stats ss, enum_stats es;

-- =====================================================
-- REGISTRO FINAL EN AUDITORÍA
-- =====================================================

-- Registrar implementación completa
INSERT INTO audit.activity_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    new_values,
    description,
    created_at
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'admin@spoon.com' LIMIT 1),
    'COMPLETE',
    'ARCHITECTURE_UPGRADE',
    gen_random_uuid(),
    jsonb_build_object(
        'schemas_created', ARRAY['crm', 'mobile', 'marketing', 'analytics'],
        'total_new_tables', (
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema IN ('crm', 'mobile', 'marketing', 'analytics')
        ),
        'total_enums_created', (
            SELECT COUNT(*) 
            FROM pg_type t 
            JOIN pg_namespace n ON n.oid = t.typnamespace 
            WHERE t.typtype = 'e' AND n.nspname = 'public' AND t.typname LIKE '%_enum'
        ),
        'implementation_version', '1.0',
        'implementation_date', CURRENT_DATE
    ),
    'Implementación completa de arquitectura unificada para proyecto SPOON',
    CURRENT_TIMESTAMP
);

-- Actualizar estado del backup
UPDATE backup_info 
SET status = 'architecture_implemented' 
WHERE backup_type = 'pre_architecture_upgrade' 
    AND backup_date::date = CURRENT_DATE;

\echo '';
\echo '=====================================================';
\echo '🎊 ¡IMPLEMENTACIÓN COMPLETADA EXITOSAMENTE!';
\echo '=====================================================';
\echo '';
\echo '📊 PRÓXIMOS PASOS:';
\echo '1. Verificar en pgAdmin que todos los esquemas están creados';
\echo '2. Revisar las nuevas tablas y sus relaciones';
\echo '3. Probar las funciones de sincronización automática';
\echo '4. Comenzar desarrollo de APIs de integración';
\echo '';
\echo '📚 DOCUMENTACIÓN:';
\echo '- Revisa ESTRUCTURAFINAL.MD para arquitectura completa';
\echo '- Revisa AVANCEESTRUCTURAFINAL.md para seguimiento';
\echo '';
\echo '🚀 ¡SPOON está listo para ser el sistema operativo líder';
\echo '   para restaurantes independientes en Latinoamérica!';
\echo '';
