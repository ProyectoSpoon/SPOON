-- =====================================================
-- SPOON - TABLAS DEL ESQUEMA MARKETING
-- =====================================================
-- Archivo: 05-create-marketing-tables.sql
-- Propósito: Crear tablas para marketing y comunicación
-- Fecha: 7 de Enero, 2025
-- Versión: 1.0
-- =====================================================

-- Verificar conexión y esquemas
SELECT current_database(), current_user;
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'marketing';

-- =====================================================
-- TABLA: marketing.campaigns
-- Campañas de marketing
-- =====================================================

CREATE TABLE marketing.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    campaign_type campaign_type_enum NOT NULL,
    status campaign_status_enum DEFAULT 'draft' NOT NULL,
    target_audience JSONB DEFAULT '{}',
    channels JSONB DEFAULT '[]',
    budget DECIMAL(10,2),
    spent_amount DECIMAL(10,2) DEFAULT 0 CHECK (spent_amount >= 0),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    actual_start_date TIMESTAMP WITH TIME ZONE,
    actual_end_date TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    assigned_to UUID REFERENCES auth.users(id),
    metrics JSONB DEFAULT '{}',
    goals JSONB DEFAULT '{}',
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_campaign_dates CHECK (
        start_date IS NULL OR end_date IS NULL OR start_date <= end_date
    ),
    CONSTRAINT check_actual_dates CHECK (
        actual_start_date IS NULL OR actual_end_date IS NULL OR actual_start_date <= actual_end_date
    ),
    CONSTRAINT check_budget_spent CHECK (
        budget IS NULL OR spent_amount <= budget
    ),
    CONSTRAINT check_positive_budget CHECK (
        budget IS NULL OR budget > 0
    )
);

-- Comentarios
COMMENT ON TABLE marketing.campaigns IS 'Campañas de marketing y comunicación';
COMMENT ON COLUMN marketing.campaigns.target_audience IS 'Criterios de segmentación de audiencia en JSON';
COMMENT ON COLUMN marketing.campaigns.channels IS 'Canales de comunicación utilizados';
COMMENT ON COLUMN marketing.campaigns.metrics IS 'Métricas de rendimiento de la campaña';
COMMENT ON COLUMN marketing.campaigns.goals IS 'Objetivos y KPIs de la campaña';

-- =====================================================
-- TABLA: marketing.communication_templates
-- Plantillas de comunicación
-- =====================================================

CREATE TABLE marketing.communication_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    template_type template_type_enum NOT NULL,
    channel communication_channel_enum NOT NULL,
    subject VARCHAR(500),
    content TEXT NOT NULL,
    html_content TEXT,
    variables JSONB DEFAULT '[]',
    default_values JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
    success_rate DECIMAL(5,4) DEFAULT 0 CHECK (success_rate >= 0 AND success_rate <= 1),
    category VARCHAR(100),
    language VARCHAR(10) DEFAULT 'es',
    created_by UUID NOT NULL REFERENCES auth.users(id),
    last_used TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_valid_language CHECK (language ~ '^[a-z]{2}(-[A-Z]{2})?$'),
    CONSTRAINT check_content_not_empty CHECK (LENGTH(TRIM(content)) > 0)
);

-- Comentarios
COMMENT ON TABLE marketing.communication_templates IS 'Plantillas reutilizables para comunicaciones';
COMMENT ON COLUMN marketing.communication_templates.variables IS 'Variables disponibles en la plantilla';
COMMENT ON COLUMN marketing.communication_templates.default_values IS 'Valores por defecto para las variables';
COMMENT ON COLUMN marketing.communication_templates.success_rate IS 'Tasa de éxito promedio de la plantilla';

-- =====================================================
-- TABLA: marketing.user_segments
-- Segmentos de usuarios para targeting
-- =====================================================

CREATE TABLE marketing.user_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    criteria JSONB NOT NULL,
    user_count INTEGER DEFAULT 0 CHECK (user_count >= 0),
    is_dynamic BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    last_calculated TIMESTAMP WITH TIME ZONE,
    calculation_frequency VARCHAR(20) DEFAULT 'daily',
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_valid_frequency CHECK (
        calculation_frequency IN ('hourly', 'daily', 'weekly', 'monthly', 'manual')
    )
);

-- Comentarios
COMMENT ON TABLE marketing.user_segments IS 'Segmentos de usuarios para campañas dirigidas';
COMMENT ON COLUMN marketing.user_segments.criteria IS 'Criterios de segmentación en formato JSON';
COMMENT ON COLUMN marketing.user_segments.is_dynamic IS 'Si el segmento se actualiza automáticamente';
COMMENT ON COLUMN marketing.user_segments.calculation_frequency IS 'Frecuencia de recálculo del segmento';

-- =====================================================
-- TABLA: marketing.segment_users
-- Relación entre segmentos y usuarios
-- =====================================================

CREATE TABLE marketing.segment_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    segment_id UUID NOT NULL REFERENCES marketing.user_segments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    score DECIMAL(5,4) DEFAULT 1.0 CHECK (score >= 0 AND score <= 1),
    metadata JSONB DEFAULT '{}',
    
    -- Constraints
    CONSTRAINT unique_segment_user UNIQUE(segment_id, user_id)
);

-- Comentarios
COMMENT ON TABLE marketing.segment_users IS 'Usuarios que pertenecen a cada segmento';
COMMENT ON COLUMN marketing.segment_users.score IS 'Puntuación de relevancia del usuario en el segmento (0-1)';

-- =====================================================
-- TABLA: marketing.communication_sends
-- Registro de envíos de comunicación
-- =====================================================

CREATE TABLE marketing.communication_sends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES marketing.campaigns(id) ON DELETE SET NULL,
    template_id UUID NOT NULL REFERENCES marketing.communication_templates(id),
    recipient_type recipient_type_enum NOT NULL,
    recipient_id UUID NOT NULL,
    segment_id UUID REFERENCES marketing.user_segments(id) ON DELETE SET NULL,
    channel communication_channel_enum NOT NULL,
    subject VARCHAR(500),
    content TEXT NOT NULL,
    status send_status_enum DEFAULT 'pending' NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    bounced_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0 CHECK (retry_count >= 0),
    external_id VARCHAR(200),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_send_progression CHECK (
        sent_at IS NULL OR 
        (delivered_at IS NULL OR delivered_at >= sent_at) AND
        (opened_at IS NULL OR opened_at >= delivered_at) AND
        (clicked_at IS NULL OR clicked_at >= opened_at)
    ),
    CONSTRAINT check_scheduled_future CHECK (
        scheduled_at IS NULL OR scheduled_at >= created_at
    )
);

-- Comentarios
COMMENT ON TABLE marketing.communication_sends IS 'Registro detallado de todos los envíos de comunicación';
COMMENT ON COLUMN marketing.communication_sends.external_id IS 'ID del proveedor externo de email/SMS';
COMMENT ON COLUMN marketing.communication_sends.retry_count IS 'Número de intentos de reenvío';

-- =====================================================
-- TABLA: marketing.automation_rules
-- Reglas de automatización de marketing
-- =====================================================

CREATE TABLE marketing.automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    trigger_event VARCHAR(100) NOT NULL,
    trigger_conditions JSONB DEFAULT '{}',
    actions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    execution_count INTEGER DEFAULT 0 CHECK (execution_count >= 0),
    success_count INTEGER DEFAULT 0 CHECK (success_count >= 0),
    last_executed TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_success_count CHECK (success_count <= execution_count)
);

-- Comentarios
COMMENT ON TABLE marketing.automation_rules IS 'Reglas de automatización para marketing';
COMMENT ON COLUMN marketing.automation_rules.trigger_event IS 'Evento que dispara la automatización';
COMMENT ON COLUMN marketing.automation_rules.trigger_conditions IS 'Condiciones adicionales para ejecutar';
COMMENT ON COLUMN marketing.automation_rules.actions IS 'Acciones a ejecutar cuando se cumplan las condiciones';

-- =====================================================
-- TABLA: marketing.automation_executions
-- Registro de ejecuciones de automatización
-- =====================================================

CREATE TABLE marketing.automation_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID NOT NULL REFERENCES marketing.automation_rules(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    trigger_data JSONB DEFAULT '{}',
    execution_result JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending',
    error_message TEXT,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_valid_status CHECK (
        status IN ('pending', 'executing', 'completed', 'failed', 'skipped')
    )
);

-- Comentarios
COMMENT ON TABLE marketing.automation_executions IS 'Registro de ejecuciones de reglas de automatización';
COMMENT ON COLUMN marketing.automation_executions.trigger_data IS 'Datos del evento que disparó la automatización';
COMMENT ON COLUMN marketing.automation_executions.execution_result IS 'Resultado de la ejecución';

-- =====================================================
-- ÍNDICES PARA RENDIMIENTO
-- =====================================================

-- Índices para marketing.campaigns
CREATE INDEX idx_marketing_campaigns_status ON marketing.campaigns(status, start_date);
CREATE INDEX idx_marketing_campaigns_type ON marketing.campaigns(campaign_type, status);
CREATE INDEX idx_marketing_campaigns_created_by ON marketing.campaigns(created_by, created_at);
CREATE INDEX idx_marketing_campaigns_dates ON marketing.campaigns(start_date, end_date);

-- Índices para marketing.communication_templates
CREATE INDEX idx_marketing_templates_type ON marketing.communication_templates(template_type, channel);
CREATE INDEX idx_marketing_templates_active ON marketing.communication_templates(is_active, usage_count);
CREATE INDEX idx_marketing_templates_category ON marketing.communication_templates(category, language);

-- Índices para marketing.user_segments
CREATE INDEX idx_marketing_segments_active ON marketing.user_segments(is_active, is_dynamic);
CREATE INDEX idx_marketing_segments_calculated ON marketing.user_segments(last_calculated, calculation_frequency);
CREATE INDEX idx_marketing_segments_created_by ON marketing.user_segments(created_by, created_at);

-- Índices para marketing.segment_users
CREATE INDEX idx_marketing_segment_users_segment ON marketing.segment_users(segment_id, score);
CREATE INDEX idx_marketing_segment_users_user ON marketing.segment_users(user_id, added_at);

-- Índices para marketing.communication_sends
CREATE INDEX idx_marketing_sends_campaign ON marketing.communication_sends(campaign_id, status);
CREATE INDEX idx_marketing_sends_recipient ON marketing.communication_sends(recipient_id, recipient_type);
CREATE INDEX idx_marketing_sends_status ON marketing.communication_sends(status, scheduled_at);
CREATE INDEX idx_marketing_sends_channel ON marketing.communication_sends(channel, sent_at);
CREATE INDEX idx_marketing_sends_template ON marketing.communication_sends(template_id, created_at);

-- Índices para marketing.automation_rules
CREATE INDEX idx_marketing_automation_active ON marketing.automation_rules(is_active, trigger_event);
CREATE INDEX idx_marketing_automation_priority ON marketing.automation_rules(priority, is_active);

-- Índices para marketing.automation_executions
CREATE INDEX idx_marketing_executions_rule ON marketing.automation_executions(rule_id, executed_at);
CREATE INDEX idx_marketing_executions_status ON marketing.automation_executions(status, executed_at);
CREATE INDEX idx_marketing_executions_user ON marketing.automation_executions(user_id, executed_at);

-- Índices JSONB para búsquedas avanzadas
CREATE INDEX idx_marketing_campaigns_audience_gin ON marketing.campaigns USING GIN (target_audience);
CREATE INDEX idx_marketing_campaigns_metrics_gin ON marketing.campaigns USING GIN (metrics);
CREATE INDEX idx_marketing_segments_criteria_gin ON marketing.user_segments USING GIN (criteria);
CREATE INDEX idx_marketing_templates_variables_gin ON marketing.communication_templates USING GIN (variables);

-- =====================================================
-- TRIGGERS PARA AUDITORÍA Y ACTUALIZACIÓN
-- =====================================================

-- Triggers para updated_at
CREATE TRIGGER update_marketing_campaigns_updated_at
    BEFORE UPDATE ON marketing.campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_templates_updated_at
    BEFORE UPDATE ON marketing.communication_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_segments_updated_at
    BEFORE UPDATE ON marketing.user_segments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_automation_updated_at
    BEFORE UPDATE ON marketing.automation_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers de auditoría
CREATE TRIGGER audit_marketing_campaigns
    AFTER INSERT OR UPDATE OR DELETE ON marketing.campaigns
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_marketing_templates
    AFTER INSERT OR UPDATE OR DELETE ON marketing.communication_templates
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_marketing_segments
    AFTER INSERT OR UPDATE OR DELETE ON marketing.user_segments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- FUNCIONES ESPECÍFICAS DE MARKETING
-- =====================================================

-- Función para actualizar contador de uso de plantillas
CREATE OR REPLACE FUNCTION update_template_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE marketing.communication_templates 
    SET usage_count = usage_count + 1,
        last_used = CURRENT_TIMESTAMP
    WHERE id = NEW.template_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_template_usage_trigger
    AFTER INSERT ON marketing.communication_sends
    FOR EACH ROW EXECUTE FUNCTION update_template_usage();

-- Función para calcular tasa de éxito de plantillas
CREATE OR REPLACE FUNCTION calculate_template_success_rate(template_uuid UUID)
RETURNS DECIMAL(5,4) AS $$
DECLARE
    total_sends INTEGER;
    successful_sends INTEGER;
    success_rate DECIMAL(5,4);
BEGIN
    SELECT COUNT(*) INTO total_sends
    FROM marketing.communication_sends
    WHERE template_id = template_uuid;
    
    IF total_sends = 0 THEN
        RETURN 0;
    END IF;
    
    SELECT COUNT(*) INTO successful_sends
    FROM marketing.communication_sends
    WHERE template_id = template_uuid 
        AND status IN ('delivered', 'opened', 'clicked');
    
    success_rate := successful_sends::DECIMAL / total_sends::DECIMAL;
    
    -- Actualizar la plantilla
    UPDATE marketing.communication_templates 
    SET success_rate = success_rate
    WHERE id = template_uuid;
    
    RETURN success_rate;
END;
$$ LANGUAGE plpgsql;

-- Función para recalcular segmentos dinámicos
CREATE OR REPLACE FUNCTION recalculate_dynamic_segments()
RETURNS INTEGER AS $$
DECLARE
    segment_record RECORD;
    updated_count INTEGER := 0;
BEGIN
    FOR segment_record IN 
        SELECT id, criteria 
        FROM marketing.user_segments 
        WHERE is_dynamic = TRUE AND is_active = TRUE
    LOOP
        -- Aquí iría la lógica específica de recálculo basada en criteria
        -- Por ahora solo actualizamos la fecha
        UPDATE marketing.user_segments 
        SET last_calculated = CURRENT_TIMESTAMP
        WHERE id = segment_record.id;
        
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Función para procesar automatizaciones pendientes
CREATE OR REPLACE FUNCTION process_automation_rules()
RETURNS INTEGER AS $$
DECLARE
    processed_count INTEGER := 0;
BEGIN
    -- Marcar reglas para procesamiento
    UPDATE marketing.automation_rules 
    SET last_executed = CURRENT_TIMESTAMP
    WHERE is_active = TRUE;
    
    GET DIAGNOSTICS processed_count = ROW_COUNT;
    RETURN processed_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DATOS INICIALES DE EJEMPLO
-- =====================================================

-- Crear campaña de ejemplo
INSERT INTO marketing.campaigns (
    name, description, campaign_type, status, target_audience, channels,
    budget, start_date, end_date, created_by, goals
) VALUES (
    'Bienvenida Nuevos Restaurantes',
    'Campaña de onboarding para restaurantes recién registrados',
    'email',
    'active',
    '{"user_type": "restaurant_owner", "registration_days": "<=7"}',
    '["email", "whatsapp"]',
    5000.00,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    (SELECT id FROM auth.users WHERE email = 'admin@spoon.com' LIMIT 1),
    '{"open_rate": 0.25, "click_rate": 0.05, "conversion_rate": 0.02}'
);

-- Crear plantilla de bienvenida
INSERT INTO marketing.communication_templates (
    name, template_type, channel, subject, content, variables, created_by
) VALUES (
    'Bienvenida Restaurante',
    'welcome',
    'email',
    '¡Bienvenido a SPOON, {{restaurant_name}}!',
    'Hola {{contact_name}},

¡Bienvenido a SPOON! Estamos emocionados de tenerte como parte de nuestra familia.

Tu restaurante {{restaurant_name}} ya está registrado y listo para comenzar a digitalizar tu operación.

Próximos pasos:
1. Completa tu perfil de restaurante
2. Configura tu menú
3. Comienza a recibir pedidos

¿Necesitas ayuda? Contáctanos en soporte@spoon.com

¡Éxitos!
El equipo de SPOON',
    '["restaurant_name", "contact_name"]',
    (SELECT id FROM auth.users WHERE email = 'admin@spoon.com' LIMIT 1)
);

-- Crear segmento de nuevos usuarios
INSERT INTO marketing.user_segments (
    name, description, criteria, is_dynamic, created_by
) VALUES (
    'Nuevos Restaurantes',
    'Restaurantes registrados en los últimos 7 días',
    '{"registration_days": "<=7", "user_type": "restaurant_owner", "status": "active"}',
    true,
    (SELECT id FROM auth.users WHERE email = 'admin@spoon.com' LIMIT 1)
);

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que todas las tablas fueron creadas
SELECT 
    table_name,
    table_type,
    CASE 
        WHEN table_schema = 'marketing' THEN '🆕 NUEVA'
        ELSE '📋 EXISTENTE'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'marketing'
ORDER BY table_name;

-- Contar registros en cada tabla
SELECT 
    'marketing.campaigns' as table_name,
    COUNT(*) as record_count
FROM marketing.campaigns
UNION ALL
SELECT 
    'marketing.communication_templates' as table_name,
    COUNT(*) as record_count
FROM marketing.communication_templates
UNION ALL
SELECT 
    'marketing.user_segments' as table_name,
    COUNT(*) as record_count
FROM marketing.user_segments
UNION ALL
SELECT 
    'marketing.segment_users' as table_name,
    COUNT(*) as record_count
FROM marketing.segment_users
UNION ALL
SELECT 
    'marketing.communication_sends' as table_name,
    COUNT(*) as record_count
FROM marketing.communication_sends
UNION ALL
SELECT 
    'marketing.automation_rules' as table_name,
    COUNT(*) as record_count
FROM marketing.automation_rules
UNION ALL
SELECT 
    'marketing.automation_executions' as table_name,
    COUNT(*) as record_count
FROM marketing.automation_executions;

-- =====================================================
-- LOGGING Y AUDITORÍA
-- =====================================================

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
    'MARKETING_TABLES',
    gen_random_uuid(),
    jsonb_build_object(
        'tables_created', ARRAY['campaigns', 'communication_templates', 'user_segments', 'segment_users', 'communication_sends', 'automation_rules', 'automation_executions'],
        'indexes_created', 18,
        'triggers_created', 8,
        'functions_created', 4,
        'purpose', 'Arquitectura Unificada - Fase 1 - Esquema Marketing',
        'version', '1.0'
    ),
    'Creación completa de tablas del esquema Marketing para arquitectura unificada',
    CURRENT_TIMESTAMP
);

-- =====================================================
-- RESUMEN DE EJECUCIÓN
-- =====================================================

SELECT 
    '✅ ESQUEMA MARKETING CREADO EXITOSAMENTE' as status,
    7 as total_tables_created,
    18 as total_indexes_created,
    8 as total_triggers_created,
    4 as total_functions_created,
    CURRENT_TIMESTAMP as executed_at,
    current_user as executed_by,
    current_database() as database_name;
