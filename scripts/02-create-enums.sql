-- =====================================================
-- SPOON - TIPOS ENUM PARA ARQUITECTURA UNIFICADA
-- =====================================================
-- Archivo: 02-create-enums.sql
-- Propósito: Crear nuevos tipos ENUM para módulos integrados
-- Fecha: 7 de Enero, 2025
-- Versión: 1.0
-- =====================================================

-- Verificar conexión
SELECT current_database(), current_user;

-- =====================================================
-- ENUMS PARA ESQUEMA CRM
-- =====================================================

-- Estados de leads en el pipeline de ventas
CREATE TYPE lead_status_enum AS ENUM (
    'new',              -- Lead nuevo, sin contactar
    'contacted',        -- Contactado inicialmente
    'qualified',        -- Lead calificado como prospecto
    'proposal',         -- Propuesta enviada
    'negotiation',      -- En negociación
    'closed_won',       -- Cerrado ganado (convertido)
    'closed_lost',      -- Cerrado perdido
    'on_hold'          -- En pausa temporal
);
COMMENT ON TYPE lead_status_enum IS 'Estados del pipeline de ventas para leads de restaurantes';

-- Estados del proceso de onboarding
CREATE TYPE onboarding_status_enum AS ENUM (
    'not_started',      -- No iniciado
    'in_progress',      -- En progreso
    'completed',        -- Completado exitosamente
    'paused',          -- Pausado temporalmente
    'cancelled'        -- Cancelado
);
COMMENT ON TYPE onboarding_status_enum IS 'Estados del proceso de onboarding de restaurantes';

-- Tipos de tareas del CRM
CREATE TYPE task_type_enum AS ENUM (
    'call',            -- Llamada telefónica
    'email',           -- Envío de email
    'meeting',         -- Reunión presencial/virtual
    'follow_up',       -- Seguimiento
    'demo',            -- Demostración del producto
    'onboarding',      -- Tarea de onboarding
    'support'          -- Soporte técnico
);
COMMENT ON TYPE task_type_enum IS 'Tipos de tareas en el CRM administrativo';

-- Estados de tareas
CREATE TYPE task_status_enum AS ENUM (
    'pending',         -- Pendiente
    'in_progress',     -- En progreso
    'completed',       -- Completada
    'cancelled',       -- Cancelada
    'overdue'          -- Vencida
);
COMMENT ON TYPE task_status_enum IS 'Estados de las tareas del CRM';

-- Niveles de prioridad
CREATE TYPE priority_enum AS ENUM (
    'low',             -- Baja prioridad
    'medium',          -- Prioridad media
    'high',            -- Alta prioridad
    'urgent'           -- Urgente
);
COMMENT ON TYPE priority_enum IS 'Niveles de prioridad para tareas y leads';

-- Tipos de interacciones con clientes
CREATE TYPE interaction_type_enum AS ENUM (
    'call',            -- Llamada
    'email',           -- Email
    'meeting',         -- Reunión
    'demo',            -- Demostración
    'support',         -- Soporte
    'follow_up'        -- Seguimiento
);
COMMENT ON TYPE interaction_type_enum IS 'Tipos de interacciones con restaurantes y leads';

-- Canales de comunicación
CREATE TYPE communication_channel_enum AS ENUM (
    'email',           -- Correo electrónico
    'phone',           -- Teléfono
    'whatsapp',        -- WhatsApp
    'sms',             -- SMS
    'in_person',       -- Presencial
    'video_call'       -- Videollamada
);
COMMENT ON TYPE communication_channel_enum IS 'Canales de comunicación disponibles';

-- =====================================================
-- ENUMS PARA ESQUEMA MOBILE
-- =====================================================

-- Niveles de usuario basados en actividad
CREATE TYPE user_level_enum AS ENUM (
    'bronze',          -- Nivel bronce (0-19 pedidos)
    'silver',          -- Nivel plata (20-49 pedidos)
    'gold',            -- Nivel oro (50-99 pedidos)
    'platinum'         -- Nivel platino (100+ pedidos)
);
COMMENT ON TYPE user_level_enum IS 'Niveles de usuario basados en cantidad de pedidos';

-- Géneros para perfiles de usuario
CREATE TYPE gender_enum AS ENUM (
    'male',            -- Masculino
    'female',          -- Femenino
    'other',           -- Otro
    'prefer_not_to_say' -- Prefiere no decir
);
COMMENT ON TYPE gender_enum IS 'Opciones de género para perfiles de usuario';

-- Tipos de favoritos
CREATE TYPE favorite_type_enum AS ENUM (
    'restaurant',      -- Restaurante favorito
    'product',         -- Producto favorito
    'combination'      -- Combinación favorita
);
COMMENT ON TYPE favorite_type_enum IS 'Tipos de elementos que pueden ser marcados como favoritos';

-- Estados de reseñas
CREATE TYPE review_status_enum AS ENUM (
    'draft',           -- Borrador
    'published',       -- Publicada
    'hidden',          -- Oculta
    'flagged'          -- Marcada para revisión
);
COMMENT ON TYPE review_status_enum IS 'Estados de las reseñas de usuarios';

-- Tipos de búsqueda
CREATE TYPE search_type_enum AS ENUM (
    'restaurant',      -- Búsqueda de restaurantes
    'food',            -- Búsqueda de comida/platos
    'location',        -- Búsqueda por ubicación
    'cuisine'          -- Búsqueda por tipo de cocina
);
COMMENT ON TYPE search_type_enum IS 'Tipos de búsqueda en la aplicación móvil';

-- =====================================================
-- ENUMS PARA ESQUEMA MARKETING
-- =====================================================

-- Tipos de campañas de marketing
CREATE TYPE campaign_type_enum AS ENUM (
    'email',           -- Campaña por email
    'sms',             -- Campaña por SMS
    'push_notification', -- Notificaciones push
    'social_media',    -- Redes sociales
    'display',         -- Publicidad display
    'mixed'            -- Campaña mixta
);
COMMENT ON TYPE campaign_type_enum IS 'Tipos de campañas de marketing';

-- Estados de campañas
CREATE TYPE campaign_status_enum AS ENUM (
    'draft',           -- Borrador
    'scheduled',       -- Programada
    'active',          -- Activa
    'paused',          -- Pausada
    'completed',       -- Completada
    'cancelled'        -- Cancelada
);
COMMENT ON TYPE campaign_status_enum IS 'Estados de las campañas de marketing';

-- Tipos de plantillas de comunicación
CREATE TYPE template_type_enum AS ENUM (
    'welcome',         -- Bienvenida
    'promotional',     -- Promocional
    'transactional',   -- Transaccional
    'reminder',        -- Recordatorio
    'survey'           -- Encuesta
);
COMMENT ON TYPE template_type_enum IS 'Tipos de plantillas de comunicación';

-- Tipos de destinatarios
CREATE TYPE recipient_type_enum AS ENUM (
    'customer',        -- Cliente/comensal
    'restaurant',      -- Restaurante
    'lead'             -- Lead/prospecto
);
COMMENT ON TYPE recipient_type_enum IS 'Tipos de destinatarios para comunicaciones';

-- Estados de envío de comunicaciones
CREATE TYPE send_status_enum AS ENUM (
    'pending',         -- Pendiente de envío
    'sent',            -- Enviado
    'delivered',       -- Entregado
    'opened',          -- Abierto
    'clicked',         -- Click realizado
    'failed',          -- Falló el envío
    'bounced'          -- Rebotó
);
COMMENT ON TYPE send_status_enum IS 'Estados de envío de comunicaciones';

-- =====================================================
-- VERIFICACIÓN DE TIPOS CREADOS
-- =====================================================

-- Listar todos los tipos ENUM creados
SELECT 
    t.typname as enum_name,
    n.nspname as schema_name,
    CASE 
        WHEN t.typname LIKE '%_enum' THEN '🆕 NUEVO'
        ELSE '📋 EXISTENTE'
    END as status,
    array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_namespace n ON n.oid = t.typnamespace 
LEFT JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typtype = 'e'
    AND n.nspname = 'public'
    AND t.typname IN (
        'lead_status_enum', 'onboarding_status_enum', 'task_type_enum', 
        'task_status_enum', 'priority_enum', 'interaction_type_enum',
        'communication_channel_enum', 'user_level_enum', 'gender_enum',
        'favorite_type_enum', 'review_status_enum', 'search_type_enum',
        'campaign_type_enum', 'campaign_status_enum', 'template_type_enum',
        'recipient_type_enum', 'send_status_enum'
    )
GROUP BY t.typname, n.nspname
ORDER BY t.typname;

-- =====================================================
-- LOGGING Y AUDITORÍA
-- =====================================================

-- Registrar la creación de tipos ENUM en audit
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
    'ENUM_TYPES',
    gen_random_uuid(),
    jsonb_build_object(
        'enums_created', ARRAY[
            'lead_status_enum', 'onboarding_status_enum', 'task_type_enum',
            'task_status_enum', 'priority_enum', 'interaction_type_enum',
            'communication_channel_enum', 'user_level_enum', 'gender_enum',
            'favorite_type_enum', 'review_status_enum', 'search_type_enum',
            'campaign_type_enum', 'campaign_status_enum', 'template_type_enum',
            'recipient_type_enum', 'send_status_enum'
        ],
        'purpose', 'Arquitectura Unificada - Fase 1',
        'version', '1.0'
    ),
    'Creación de tipos ENUM para arquitectura unificada del proyecto SPOON',
    CURRENT_TIMESTAMP
);

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Confirmar que todos los tipos ENUM fueron creados
DO $$
DECLARE
    enum_count INTEGER;
    expected_enums TEXT[] := ARRAY[
        'lead_status_enum', 'onboarding_status_enum', 'task_type_enum',
        'task_status_enum', 'priority_enum', 'interaction_type_enum',
        'communication_channel_enum', 'user_level_enum', 'gender_enum',
        'favorite_type_enum', 'review_status_enum', 'search_type_enum',
        'campaign_type_enum', 'campaign_status_enum', 'template_type_enum',
        'recipient_type_enum', 'send_status_enum'
    ];
    enum_name TEXT;
BEGIN
    -- Verificar cada tipo ENUM
    FOREACH enum_name IN ARRAY expected_enums
    LOOP
        SELECT COUNT(*) INTO enum_count
        FROM pg_type t 
        JOIN pg_namespace n ON n.oid = t.typnamespace 
        WHERE t.typname = enum_name AND n.nspname = 'public';
        
        IF enum_count = 0 THEN
            RAISE EXCEPTION 'Error: Tipo ENUM % no fue creado correctamente', enum_name;
        ELSE
            RAISE NOTICE '✅ Tipo ENUM % creado exitosamente', enum_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '🎉 Todos los tipos ENUM fueron creados correctamente';
END $$;

-- =====================================================
-- RESUMEN DE EJECUCIÓN
-- =====================================================

SELECT 
    '✅ TIPOS ENUM CREADOS EXITOSAMENTE' as status,
    17 as total_enums_created,
    CURRENT_TIMESTAMP as executed_at,
    current_user as executed_by,
    current_database() as database_name;
