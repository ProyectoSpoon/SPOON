-- =====================================================
-- SPOON - EXTENSIÓN DE ESQUEMAS PARA ARQUITECTURA UNIFICADA
-- =====================================================
-- Archivo: 01-create-schemas.sql
-- Propósito: Crear nuevos esquemas para integración de módulos
-- Fecha: 7 de Enero, 2025
-- Versión: 1.0
-- =====================================================

-- Verificar conexión y permisos
SELECT current_database(), current_user, version();

-- =====================================================
-- CREAR NUEVOS ESQUEMAS
-- =====================================================

-- Esquema para CRM Administrativo
CREATE SCHEMA IF NOT EXISTS crm;
COMMENT ON SCHEMA crm IS 'Gestión de leads, pipeline de ventas y onboarding de restaurantes';

-- Esquema para App Móvil
CREATE SCHEMA IF NOT EXISTS mobile;
COMMENT ON SCHEMA mobile IS 'Perfiles de comensales, favoritos, reseñas y configuraciones móviles';

-- Esquema para Marketing y Comunicación
CREATE SCHEMA IF NOT EXISTS marketing;
COMMENT ON SCHEMA marketing IS 'Campañas de marketing, segmentación y comunicación automatizada';

-- Esquema para Analytics Avanzados
CREATE SCHEMA IF NOT EXISTS analytics;
COMMENT ON SCHEMA analytics IS 'Métricas avanzadas, reportes y dashboards de negocio';

-- =====================================================
-- VERIFICAR CREACIÓN DE ESQUEMAS
-- =====================================================

-- Listar todos los esquemas existentes
SELECT 
    schema_name,
    schema_owner,
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

-- =====================================================
-- CONFIGURAR PERMISOS BÁSICOS
-- =====================================================

-- Otorgar permisos de uso en los nuevos esquemas
GRANT USAGE ON SCHEMA crm TO postgres;
GRANT USAGE ON SCHEMA mobile TO postgres;
GRANT USAGE ON SCHEMA marketing TO postgres;
GRANT USAGE ON SCHEMA analytics TO postgres;

-- Otorgar permisos para crear objetos
GRANT CREATE ON SCHEMA crm TO postgres;
GRANT CREATE ON SCHEMA mobile TO postgres;
GRANT CREATE ON SCHEMA marketing TO postgres;
GRANT CREATE ON SCHEMA analytics TO postgres;

-- =====================================================
-- LOGGING Y AUDITORÍA
-- =====================================================

-- Registrar la creación de esquemas en audit
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
    'CREATE',
    'SCHEMA',
    gen_random_uuid(),
    jsonb_build_object(
        'schemas_created', ARRAY['crm', 'mobile', 'marketing', 'analytics'],
        'purpose', 'Arquitectura Unificada - Fase 1',
        'version', '1.0'
    ),
    'Creación de nuevos esquemas para arquitectura unificada del proyecto SPOON',
    CURRENT_TIMESTAMP
);

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Confirmar que todos los esquemas fueron creados
DO $$
DECLARE
    schema_count INTEGER;
    expected_schemas TEXT[] := ARRAY['crm', 'mobile', 'marketing', 'analytics'];
    schema_name TEXT;
BEGIN
    -- Verificar cada esquema
    FOREACH schema_name IN ARRAY expected_schemas
    LOOP
        SELECT COUNT(*) INTO schema_count
        FROM information_schema.schemata 
        WHERE schema_name = schema_name;
        
        IF schema_count = 0 THEN
            RAISE EXCEPTION 'Error: Esquema % no fue creado correctamente', schema_name;
        ELSE
            RAISE NOTICE '✅ Esquema % creado exitosamente', schema_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '🎉 Todos los esquemas fueron creados correctamente';
END $$;

-- =====================================================
-- RESUMEN DE EJECUCIÓN
-- =====================================================

SELECT 
    '✅ ESQUEMAS CREADOS EXITOSAMENTE' as status,
    CURRENT_TIMESTAMP as executed_at,
    current_user as executed_by,
    current_database() as database_name;
