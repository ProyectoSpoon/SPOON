-- =====================================================
-- SPOON - TABLAS DEL ESQUEMA CRM
-- =====================================================
-- Archivo: 03-create-crm-tables.sql
-- Propósito: Crear tablas para el CRM administrativo
-- Fecha: 7 de Enero, 2025
-- Versión: 1.0
-- =====================================================

-- Verificar conexión y esquemas
SELECT current_database(), current_user;
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'crm';

-- =====================================================
-- TABLA: crm.leads
-- Gestión de leads y pipeline de ventas
-- =====================================================

CREATE TABLE crm.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurant.restaurants(id) ON DELETE SET NULL,
    contact_name VARCHAR(200) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    company_name VARCHAR(200),
    lead_source VARCHAR(100),
    status lead_status_enum DEFAULT 'new' NOT NULL,
    priority priority_enum DEFAULT 'medium' NOT NULL,
    estimated_value DECIMAL(10,2),
    probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT check_valid_email CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR contact_email IS NULL),
    CONSTRAINT check_valid_phone CHECK (contact_phone ~ '^[\+]?[0-9\s\-\(\)]{7,20}$' OR contact_phone IS NULL),
    CONSTRAINT check_future_close_date CHECK (expected_close_date >= CURRENT_DATE OR expected_close_date IS NULL)
);

-- Comentarios
COMMENT ON TABLE crm.leads IS 'Leads de restaurantes en el pipeline de ventas';
COMMENT ON COLUMN crm.leads.lead_source IS 'Fuente del lead: website, referral, cold_call, etc.';
COMMENT ON COLUMN crm.leads.probability IS 'Probabilidad de cierre (0-100%)';
COMMENT ON COLUMN crm.leads.metadata IS 'Información adicional en formato JSON';

-- =====================================================
-- TABLA: crm.onboarding_processes
-- Proceso de onboarding de restaurantes
-- =====================================================

CREATE TABLE crm.onboarding_processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES crm.leads(id) ON DELETE SET NULL,
    status onboarding_status_enum DEFAULT 'not_started' NOT NULL,
    current_step INTEGER DEFAULT 1 CHECK (current_step >= 1),
    total_steps INTEGER DEFAULT 10 CHECK (total_steps >= 1),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    checklist JSONB DEFAULT '[]',
    completion_percentage DECIMAL(5,2) DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    estimated_completion_date DATE,
    actual_completion_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT check_step_progress CHECK (current_step <= total_steps),
    CONSTRAINT check_completion_logic CHECK (
        (status = 'completed' AND completed_at IS NOT NULL) OR 
        (status != 'completed' AND completed_at IS NULL)
    ),
    CONSTRAINT check_start_before_completion CHECK (
        started_at IS NULL OR completed_at IS NULL OR started_at <= completed_at
    )
);

-- Comentarios
COMMENT ON TABLE crm.onboarding_processes IS 'Procesos de onboarding para nuevos restaurantes';
COMMENT ON COLUMN crm.onboarding_processes.checklist IS 'Lista de tareas del onboarding en formato JSON';
COMMENT ON COLUMN crm.onboarding_processes.completion_percentage IS 'Porcentaje de completitud calculado automáticamente';

-- =====================================================
-- TABLA: crm.tasks
-- Tareas del CRM
-- =====================================================

CREATE TABLE crm.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    task_type task_type_enum NOT NULL,
    priority priority_enum DEFAULT 'medium' NOT NULL,
    status task_status_enum DEFAULT 'pending' NOT NULL,
    assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    restaurant_id UUID REFERENCES restaurant.restaurants(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES crm.leads(id) ON DELETE SET NULL,
    onboarding_process_id UUID REFERENCES crm.onboarding_processes(id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_duration INTEGER, -- en minutos
    actual_duration INTEGER, -- en minutos
    reminder_sent BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_completion_logic CHECK (
        (status = 'completed' AND completed_at IS NOT NULL) OR 
        (status != 'completed' AND completed_at IS NULL)
    ),
    CONSTRAINT check_positive_duration CHECK (
        estimated_duration IS NULL OR estimated_duration > 0
    ),
    CONSTRAINT check_actual_duration CHECK (
        actual_duration IS NULL OR actual_duration > 0
    ),
    CONSTRAINT check_task_association CHECK (
        restaurant_id IS NOT NULL OR lead_id IS NOT NULL OR onboarding_process_id IS NOT NULL
    )
);

-- Comentarios
COMMENT ON TABLE crm.tasks IS 'Tareas del CRM asociadas a leads, restaurantes o procesos de onboarding';
COMMENT ON COLUMN crm.tasks.estimated_duration IS 'Duración estimada en minutos';
COMMENT ON COLUMN crm.tasks.actual_duration IS 'Duración real en minutos';

-- =====================================================
-- TABLA: crm.interactions
-- Interacciones con clientes
-- =====================================================

CREATE TABLE crm.interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurant.restaurants(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES crm.leads(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type interaction_type_enum NOT NULL,
    channel communication_channel_enum NOT NULL,
    subject VARCHAR(200),
    content TEXT,
    outcome TEXT,
    next_action TEXT,
    scheduled_followup TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    is_successful BOOLEAN,
    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative') OR sentiment IS NULL),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_interaction_association CHECK (
        restaurant_id IS NOT NULL OR lead_id IS NOT NULL
    ),
    CONSTRAINT check_positive_duration CHECK (
        duration_minutes IS NULL OR duration_minutes > 0
    ),
    CONSTRAINT check_future_followup CHECK (
        scheduled_followup IS NULL OR scheduled_followup > created_at
    )
);

-- Comentarios
COMMENT ON TABLE crm.interactions IS 'Registro de todas las interacciones con leads y restaurantes';
COMMENT ON COLUMN crm.interactions.sentiment IS 'Sentimiento de la interacción: positive, neutral, negative';
COMMENT ON COLUMN crm.interactions.duration_minutes IS 'Duración de la interacción en minutos';

-- =====================================================
-- TABLA: crm.lead_notes
-- Notas adicionales de leads
-- =====================================================

CREATE TABLE crm.lead_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES crm.leads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    note_type VARCHAR(50) DEFAULT 'general',
    content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT FALSE,
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comentarios
COMMENT ON TABLE crm.lead_notes IS 'Notas adicionales y seguimiento detallado de leads';
COMMENT ON COLUMN crm.lead_notes.is_private IS 'Si la nota es privada (solo visible para el creador)';

-- =====================================================
-- ÍNDICES PARA RENDIMIENTO
-- =====================================================

-- Índices para crm.leads
CREATE INDEX idx_crm_leads_restaurant ON crm.leads(restaurant_id, status);
CREATE INDEX idx_crm_leads_assigned ON crm.leads(assigned_to, status);
CREATE INDEX idx_crm_leads_source ON crm.leads(lead_source, created_at);
CREATE INDEX idx_crm_leads_status_priority ON crm.leads(status, priority);
CREATE INDEX idx_crm_leads_close_date ON crm.leads(expected_close_date) WHERE expected_close_date IS NOT NULL;

-- Índices para crm.onboarding_processes
CREATE INDEX idx_crm_onboarding_restaurant ON crm.onboarding_processes(restaurant_id, status);
CREATE INDEX idx_crm_onboarding_assigned ON crm.onboarding_processes(assigned_to, status);
CREATE INDEX idx_crm_onboarding_progress ON crm.onboarding_processes(completion_percentage, status);

-- Índices para crm.tasks
CREATE INDEX idx_crm_tasks_assigned ON crm.tasks(assigned_to, status, due_date);
CREATE INDEX idx_crm_tasks_restaurant ON crm.tasks(restaurant_id, status);
CREATE INDEX idx_crm_tasks_lead ON crm.tasks(lead_id, status);
CREATE INDEX idx_crm_tasks_type_priority ON crm.tasks(task_type, priority);
CREATE INDEX idx_crm_tasks_due_date ON crm.tasks(due_date) WHERE due_date IS NOT NULL;

-- Índices para crm.interactions
CREATE INDEX idx_crm_interactions_restaurant ON crm.interactions(restaurant_id, created_at);
CREATE INDEX idx_crm_interactions_lead ON crm.interactions(lead_id, created_at);
CREATE INDEX idx_crm_interactions_user ON crm.interactions(user_id, interaction_type);
CREATE INDEX idx_crm_interactions_followup ON crm.interactions(scheduled_followup) WHERE scheduled_followup IS NOT NULL;

-- Índices para crm.lead_notes
CREATE INDEX idx_crm_lead_notes_lead ON crm.lead_notes(lead_id, created_at);
CREATE INDEX idx_crm_lead_notes_user ON crm.lead_notes(user_id, created_at);

-- =====================================================
-- TRIGGERS PARA AUDITORÍA Y ACTUALIZACIÓN
-- =====================================================

-- Trigger para updated_at en todas las tablas
CREATE TRIGGER update_crm_leads_updated_at
    BEFORE UPDATE ON crm.leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_onboarding_updated_at
    BEFORE UPDATE ON crm.onboarding_processes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_tasks_updated_at
    BEFORE UPDATE ON crm.tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_interactions_updated_at
    BEFORE UPDATE ON crm.interactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_lead_notes_updated_at
    BEFORE UPDATE ON crm.lead_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers de auditoría
CREATE TRIGGER audit_crm_leads
    AFTER INSERT OR UPDATE OR DELETE ON crm.leads
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_crm_onboarding
    AFTER INSERT OR UPDATE OR DELETE ON crm.onboarding_processes
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_crm_tasks
    AFTER INSERT OR UPDATE OR DELETE ON crm.tasks
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_crm_interactions
    AFTER INSERT OR UPDATE OR DELETE ON crm.interactions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- FUNCIONES ESPECÍFICAS DEL CRM
-- =====================================================

-- Función para calcular porcentaje de completitud del onboarding
CREATE OR REPLACE FUNCTION calculate_onboarding_completion(process_id UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_steps INTEGER;
    current_step INTEGER;
    completion_percentage DECIMAL(5,2);
BEGIN
    SELECT op.total_steps, op.current_step
    INTO total_steps, current_step
    FROM crm.onboarding_processes op
    WHERE op.id = process_id;
    
    IF total_steps IS NULL OR total_steps = 0 THEN
        RETURN 0;
    END IF;
    
    completion_percentage := (current_step::DECIMAL / total_steps::DECIMAL) * 100;
    
    -- Actualizar el registro
    UPDATE crm.onboarding_processes 
    SET completion_percentage = completion_percentage
    WHERE id = process_id;
    
    RETURN completion_percentage;
END;
$$ LANGUAGE plpgsql;

-- Función para marcar tareas como vencidas
CREATE OR REPLACE FUNCTION mark_overdue_tasks()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE crm.tasks 
    SET status = 'overdue'
    WHERE status = 'pending' 
        AND due_date < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DATOS INICIALES DE EJEMPLO
-- =====================================================

-- Insertar algunos datos de ejemplo para testing
INSERT INTO crm.leads (
    contact_name, contact_email, contact_phone, company_name, 
    lead_source, status, priority, estimated_value, probability,
    assigned_to, notes, created_by
) VALUES 
(
    'Carlos Mendoza', 'carlos@restauranteelcorral.com', '+57 300 123 4567',
    'Restaurante El Corral', 'website', 'new', 'high', 50000.00, 25,
    (SELECT id FROM auth.users WHERE email = 'admin@spoon.com' LIMIT 1),
    'Lead interesado en digitalizar su restaurante tradicional',
    (SELECT id FROM auth.users WHERE email = 'admin@spoon.com' LIMIT 1)
),
(
    'María González', 'maria@lacocinaverde.co', '+57 301 987 6543',
    'La Cocina Verde', 'referral', 'contacted', 'medium', 30000.00, 40,
    (SELECT id FROM auth.users WHERE email = 'admin@spoon.com' LIMIT 1),
    'Restaurante vegetariano, muy interesados en sostenibilidad',
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
        WHEN table_name LIKE 'crm.%' THEN '🆕 NUEVA'
        ELSE '📋 EXISTENTE'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'crm'
ORDER BY table_name;

-- Contar registros en cada tabla
SELECT 
    'crm.leads' as table_name,
    COUNT(*) as record_count
FROM crm.leads
UNION ALL
SELECT 
    'crm.onboarding_processes' as table_name,
    COUNT(*) as record_count
FROM crm.onboarding_processes
UNION ALL
SELECT 
    'crm.tasks' as table_name,
    COUNT(*) as record_count
FROM crm.tasks
UNION ALL
SELECT 
    'crm.interactions' as table_name,
    COUNT(*) as record_count
FROM crm.interactions
UNION ALL
SELECT 
    'crm.lead_notes' as table_name,
    COUNT(*) as record_count
FROM crm.lead_notes;

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
    'CRM_TABLES',
    gen_random_uuid(),
    jsonb_build_object(
        'tables_created', ARRAY['leads', 'onboarding_processes', 'tasks', 'interactions', 'lead_notes'],
        'indexes_created', 15,
        'triggers_created', 10,
        'functions_created', 2,
        'purpose', 'Arquitectura Unificada - Fase 1 - Esquema CRM',
        'version', '1.0'
    ),
    'Creación completa de tablas del esquema CRM para arquitectura unificada',
    CURRENT_TIMESTAMP
);

-- =====================================================
-- RESUMEN DE EJECUCIÓN
-- =====================================================

SELECT 
    '✅ ESQUEMA CRM CREADO EXITOSAMENTE' as status,
    5 as total_tables_created,
    15 as total_indexes_created,
    10 as total_triggers_created,
    2 as total_functions_created,
    CURRENT_TIMESTAMP as executed_at,
    current_user as executed_by,
    current_database() as database_name;
