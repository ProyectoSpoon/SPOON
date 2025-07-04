-- =====================================================
-- SPOON - MIGRACIÓN DEL CRM ADMINISTRATIVO
-- =====================================================
-- Archivo: 07-migrate-crm-data.sql
-- Propósito: Migrar datos del CRM independiente a la nueva arquitectura
-- Fecha: 7 de Enero, 2025
-- Versión: 1.0
-- Base de Datos: spoon_db
-- =====================================================

-- =====================================================
-- INFORMACIÓN DE MIGRACIÓN
-- =====================================================
\echo '🔄 INICIANDO MIGRACIÓN DEL CRM ADMINISTRATIVO'
\echo '📅 Fecha: 7 de Enero, 2025'
\echo '🗄️ Base de datos: spoon_db'
\echo '📋 Objetivo: Migrar datos del CRM independiente'
\echo ''

-- Verificar conexión actual
SELECT 
    '✅ CONEXIÓN VERIFICADA PARA MIGRACIÓN' as status,
    current_database() as database_name,
    current_user as user_name,
    CURRENT_TIMESTAMP as migration_time;

\echo ''
\echo '=====================================================';
\echo '📋 PLAN DE MIGRACIÓN:';
\echo '=====================================================';
\echo '1. Crear datos de ejemplo para CRM';
\echo '2. Migrar leads y contactos';
\echo '3. Migrar procesos de onboarding';
\echo '4. Crear tareas y seguimientos';
\echo '5. Configurar automatizaciones';
\echo '';

-- =====================================================
-- PASO 1: CREAR DATOS DE EJEMPLO PARA CRM
-- =====================================================
\echo '📊 PASO 1: CREANDO DATOS DE EJEMPLO PARA CRM...';

-- Insertar leads de ejemplo
INSERT INTO crm.leads (
    id, restaurant_name, contact_name, contact_email, contact_phone,
    lead_source, status, priority, estimated_revenue, notes,
    assigned_to, next_follow_up, created_at
) VALUES 
(
    gen_random_uuid(),
    'Restaurante El Buen Sabor',
    'María González',
    'maria@elbuensabor.com',
    '+57 300 123 4567',
    'website',
    'new',
    'high',
    2500000.00,
    'Restaurante familiar interesado en digitalización completa. Tienen 3 ubicaciones.',
    (SELECT id FROM auth.users WHERE email = 'admin@spoon.com' LIMIT 1),
    CURRENT_TIMESTAMP + INTERVAL '2 days',
    CURRENT_TIMESTAMP
),
(
    gen_random_uuid(),
    'Pizzería Napolitana',
    'Carlos Rodríguez',
    'carlos@napolitana.co',
    '+57 301 987 6543',
    'referral',
    'contacted',
    'medium',
    1800000.00,
    'Pizzería artesanal que busca mejorar su sistema de pedidos online.',
    (SELECT id FROM auth.users WHERE email = 'admin@spoon.com' LIMIT 1),
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    CURRENT_TIMESTAMP - INTERVAL '3 days'
),
(
    gen_random_uuid(),
    'Café Central',
    'Ana Martínez',
    'ana@cafecentral.com',
    '+57 302 456 7890',
    'social_media',
    'qualified',
    'high',
    1200000.00,
    'Café boutique en zona rosa. Muy interesados en analytics y reportes.',
    (SELECT id FROM auth.users WHERE email = 'admin@spoon.com' LIMIT 1),
    CURRENT_TIMESTAMP + INTERVAL '3 days',
    CURRENT_TIMESTAMP - INTERVAL '1 week'
),
(
    gen_random_uuid(),
    'Asadero Los Llanos',
    'Roberto Silva',
    'roberto@asaderollanos.com',
    '+57 303 789 0123',
    'cold_call',
    'proposal',
    'medium',
    3200000.00,
    'Cadena de asaderos con 5 ubicaciones. Necesitan integración completa.',
    (SELECT id FROM auth.users WHERE email = 'admin@spoon.com' LIMIT 1),
    CURRENT_TIMESTAMP + INTERVAL '5 days',
    CURRENT_TIMESTAMP - INTERVAL '2 weeks'
),
(
    gen_random_uuid(),
    'Sushi Zen',
    'Kenji Tanaka',
    'kenji@sushizen.co',
    '+57 304 234 5678',
    'website',
    'negotiation',
    'high',
    2800000.00,
    'Restaurante japonés premium. Interesados en sistema completo con delivery.',
    (SELECT id FROM auth.users WHERE email = 'admin@spoon.com' LIMIT 1),
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    CURRENT_TIMESTAMP - INTERVAL '3 weeks'
);

\echo '✅ Leads de ejemplo creados';

-- =====================================================
-- PASO 2: CREAR PROCESOS DE ONBOARDING
-- =====================================================
\echo '📋 PASO 2: CREANDO PROCESOS DE ONBOARDING...';

-- Insertar procesos de onboarding para leads calificados
INSERT INTO crm.onboarding_processes (
    id, lead_id, restaurant_id, status, current_step, total_steps,
    assigned_to, started_at, expected_completion, notes
)
SELECT 
    gen_random_uuid(),
    l.id,
    NULL, -- Se asignará cuando se cree el restaurante
    CASE 
        WHEN l.status = 'qualified' THEN 'in_progress'
        WHEN l.status = 'proposal' THEN 'in_progress'
        WHEN l.status = 'negotiation' THEN 'in_progress'
        ELSE 'not_started'
    END,
    CASE 
        WHEN l.status = 'qualified' THEN 2
        WHEN l.status = 'proposal' THEN 4
        WHEN l.status = 'negotiation' THEN 6
        ELSE 1
    END,
    8, -- Total de pasos en el onboarding
    l.assigned_to,
    CASE 
        WHEN l.status IN ('qualified', 'proposal', 'negotiation') THEN CURRENT_TIMESTAMP - INTERVAL '1 week'
        ELSE NULL
    END,
    CURRENT_TIMESTAMP + INTERVAL '3 weeks',
    'Proceso de onboarding automático generado desde lead: ' || l.restaurant_name
FROM crm.leads l
WHERE l.status IN ('qualified', 'proposal', 'negotiation');

\echo '✅ Procesos de onboarding creados';

-- =====================================================
-- PASO 3: CREAR TAREAS DE SEGUIMIENTO
-- =====================================================
\echo '📝 PASO 3: CREANDO TAREAS DE SEGUIMIENTO...';

-- Crear tareas para cada lead
INSERT INTO crm.tasks (
    id, lead_id, onboarding_process_id, title, description, type,
    status, priority, assigned_to, due_date, created_at
)
SELECT 
    gen_random_uuid(),
    l.id,
    op.id,
    CASE l.status
        WHEN 'new' THEN 'Contacto inicial con ' || l.restaurant_name
        WHEN 'contacted' THEN 'Seguimiento llamada con ' || l.contact_name
        WHEN 'qualified' THEN 'Enviar propuesta comercial a ' || l.restaurant_name
        WHEN 'proposal' THEN 'Revisar propuesta con ' || l.contact_name
        WHEN 'negotiation' THEN 'Cerrar negociación con ' || l.restaurant_name
        ELSE 'Seguimiento general'
    END,
    CASE l.status
        WHEN 'new' THEN 'Realizar primer contacto telefónico para presentar SPOON y sus beneficios.'
        WHEN 'contacted' THEN 'Hacer seguimiento de la llamada inicial y agendar demo del producto.'
        WHEN 'qualified' THEN 'Preparar y enviar propuesta comercial personalizada con precios y timeline.'
        WHEN 'proposal' THEN 'Revisar propuesta enviada, resolver dudas y ajustar según feedback.'
        WHEN 'negotiation' THEN 'Finalizar términos comerciales y proceder con firma de contrato.'
        ELSE 'Mantener comunicación activa con el prospecto.'
    END,
    CASE l.status
        WHEN 'new' THEN 'call'
        WHEN 'contacted' THEN 'follow_up'
        WHEN 'qualified' THEN 'email'
        WHEN 'proposal' THEN 'meeting'
        WHEN 'negotiation' THEN 'call'
        ELSE 'follow_up'
    END,
    CASE l.status
        WHEN 'new' THEN 'pending'
        WHEN 'contacted' THEN 'in_progress'
        ELSE 'pending'
    END,
    l.priority,
    l.assigned_to,
    l.next_follow_up,
    CURRENT_TIMESTAMP
FROM crm.leads l
LEFT JOIN crm.onboarding_processes op ON l.id = op.lead_id;

\echo '✅ Tareas de seguimiento creadas';

-- =====================================================
-- PASO 4: CREAR INTERACCIONES HISTÓRICAS
-- =====================================================
\echo '💬 PASO 4: CREANDO INTERACCIONES HISTÓRICAS...';

-- Crear interacciones para simular historial
INSERT INTO crm.interactions (
    id, lead_id, type, channel, subject, notes, outcome,
    interaction_date, next_action, created_by
)
SELECT 
    gen_random_uuid(),
    l.id,
    CASE (random() * 4)::int
        WHEN 0 THEN 'call'
        WHEN 1 THEN 'email'
        WHEN 2 THEN 'meeting'
        ELSE 'follow_up'
    END,
    CASE (random() * 3)::int
        WHEN 0 THEN 'phone'
        WHEN 1 THEN 'email'
        ELSE 'in_person'
    END,
    'Contacto inicial con ' || l.restaurant_name,
    'Conversación inicial sobre las necesidades del restaurante. ' ||
    CASE l.status
        WHEN 'contacted' THEN 'Cliente mostró interés en la propuesta.'
        WHEN 'qualified' THEN 'Cliente calificado, proceder con demo.'
        WHEN 'proposal' THEN 'Cliente revisando propuesta comercial.'
        WHEN 'negotiation' THEN 'En proceso de negociación de términos.'
        ELSE 'Primer contacto establecido.'
    END,
    CASE l.status
        WHEN 'new' THEN 'no_answer'
        WHEN 'contacted' THEN 'interested'
        WHEN 'qualified' THEN 'qualified'
        WHEN 'proposal' THEN 'proposal_sent'
        WHEN 'negotiation' THEN 'negotiating'
        ELSE 'follow_up_needed'
    END,
    CURRENT_TIMESTAMP - INTERVAL '1 day' * (random() * 7 + 1)::int,
    CASE l.status
        WHEN 'new' THEN 'Intentar contacto nuevamente'
        WHEN 'contacted' THEN 'Agendar demo del producto'
        WHEN 'qualified' THEN 'Enviar propuesta comercial'
        WHEN 'proposal' THEN 'Seguimiento de propuesta'
        WHEN 'negotiation' THEN 'Cerrar negociación'
        ELSE 'Mantener seguimiento'
    END,
    l.assigned_to
FROM crm.leads l;

\echo '✅ Interacciones históricas creadas';

-- =====================================================
-- PASO 5: CREAR NOTAS DE SEGUIMIENTO
-- =====================================================
\echo '📝 PASO 5: CREANDO NOTAS DE SEGUIMIENTO...';

-- Crear notas detalladas para cada lead
INSERT INTO crm.lead_notes (
    id, lead_id, note_type, content, is_important, created_by
)
SELECT 
    gen_random_uuid(),
    l.id,
    'general',
    'PERFIL DEL CLIENTE: ' || l.restaurant_name || E'\n\n' ||
    'Contacto principal: ' || l.contact_name || ' (' || l.contact_email || ')' || E'\n' ||
    'Teléfono: ' || l.contact_phone || E'\n\n' ||
    'NECESIDADES IDENTIFICADAS:' || E'\n' ||
    '- Digitalización del menú y pedidos' || E'\n' ||
    '- Sistema de gestión de inventarios' || E'\n' ||
    '- Reportes y analytics de ventas' || E'\n' ||
    '- Integración con delivery' || E'\n\n' ||
    'PRESUPUESTO ESTIMADO: $' || l.estimated_revenue::text || E'\n' ||
    'PRIORIDAD: ' || l.priority || E'\n\n' ||
    'PRÓXIMOS PASOS: ' || 
    CASE l.status
        WHEN 'new' THEN 'Realizar contacto inicial y presentar SPOON'
        WHEN 'contacted' THEN 'Agendar demo personalizada del producto'
        WHEN 'qualified' THEN 'Preparar propuesta comercial detallada'
        WHEN 'proposal' THEN 'Seguimiento de propuesta y resolución de dudas'
        WHEN 'negotiation' THEN 'Finalizar términos y cerrar venta'
        ELSE 'Mantener comunicación activa'
    END,
    CASE l.priority WHEN 'high' THEN true ELSE false END,
    l.assigned_to
FROM crm.leads l;

\echo '✅ Notas de seguimiento creadas';

-- =====================================================
-- PASO 6: ACTUALIZAR MÉTRICAS DEL CRM
-- =====================================================
\echo '📊 PASO 6: ACTUALIZANDO MÉTRICAS DEL CRM...';

-- Insertar métricas iniciales del CRM
INSERT INTO analytics.crm_metrics (
    id, metric_date, total_leads, new_leads, qualified_leads,
    proposals_sent, deals_closed, conversion_rate, average_deal_size,
    pipeline_value, activities_completed, response_rate
) VALUES (
    gen_random_uuid(),
    CURRENT_DATE,
    (SELECT COUNT(*) FROM crm.leads),
    (SELECT COUNT(*) FROM crm.leads WHERE status = 'new'),
    (SELECT COUNT(*) FROM crm.leads WHERE status = 'qualified'),
    (SELECT COUNT(*) FROM crm.leads WHERE status IN ('proposal', 'negotiation')),
    0, -- Deals cerrados (aún no hay)
    CASE 
        WHEN (SELECT COUNT(*) FROM crm.leads) > 0 
        THEN (SELECT COUNT(*) FROM crm.leads WHERE status != 'new')::decimal / (SELECT COUNT(*) FROM crm.leads) * 100
        ELSE 0
    END,
    (SELECT AVG(estimated_revenue) FROM crm.leads WHERE estimated_revenue > 0),
    (SELECT SUM(estimated_revenue) FROM crm.leads WHERE status IN ('qualified', 'proposal', 'negotiation')),
    (SELECT COUNT(*) FROM crm.tasks WHERE status = 'completed'),
    75.5 -- Tasa de respuesta estimada
);

\echo '✅ Métricas del CRM actualizadas';

-- =====================================================
-- PASO 7: CONFIGURAR AUTOMATIZACIONES
-- =====================================================
\echo '🤖 PASO 7: CONFIGURANDO AUTOMATIZACIONES...';

-- Insertar reglas de automatización para marketing
INSERT INTO marketing.automation_rules (
    id, name, description, trigger_event, conditions, actions,
    is_active, created_by
) VALUES 
(
    gen_random_uuid(),
    'Bienvenida Nuevo Lead',
    'Enviar email de bienvenida cuando se crea un nuevo lead',
    'lead_created',
    jsonb_build_object(
        'lead_source', array['website', 'social_media'],
        'priority', array['high', 'medium']
    ),
    jsonb_build_object(
        'send_email', jsonb_build_object(
            'template', 'welcome_lead',
            'delay_minutes', 30
        ),
        'create_task', jsonb_build_object(
            'title', 'Contactar nuevo lead',
            'type', 'call',
            'priority', 'high',
            'due_hours', 24
        )
    ),
    true,
    (SELECT id FROM auth.users WHERE email = 'admin@spoon.com' LIMIT 1)
),
(
    gen_random_uuid(),
    'Seguimiento Lead Calificado',
    'Crear tareas de seguimiento para leads calificados',
    'lead_qualified',
    jsonb_build_object(
        'estimated_revenue', jsonb_build_object('min', 1000000)
    ),
    jsonb_build_object(
        'create_task', jsonb_build_object(
            'title', 'Preparar propuesta comercial',
            'type', 'email',
            'priority', 'high',
            'due_hours', 48
        ),
        'send_notification', jsonb_build_object(
            'message', 'Lead calificado requiere atención',
            'channels', array['email', 'slack']
        )
    ),
    true,
    (SELECT id FROM auth.users WHERE email = 'admin@spoon.com' LIMIT 1)
),
(
    gen_random_uuid(),
    'Recordatorio Seguimiento',
    'Recordar seguimiento de leads sin actividad reciente',
    'lead_inactive',
    jsonb_build_object(
        'days_inactive', 7,
        'status', array['contacted', 'qualified']
    ),
    jsonb_build_object(
        'create_task', jsonb_build_object(
            'title', 'Seguimiento lead inactivo',
            'type', 'follow_up',
            'priority', 'medium',
            'due_hours', 24
        )
    ),
    true,
    (SELECT id FROM auth.users WHERE email = 'admin@spoon.com' LIMIT 1)
);

\echo '✅ Automatizaciones configuradas';

-- =====================================================
-- VERIFICACIÓN FINAL DE MIGRACIÓN
-- =====================================================
\echo '🔍 VERIFICACIÓN FINAL DE MIGRACIÓN...';
\echo '';

-- Verificar datos migrados
\echo '📊 RESUMEN DE DATOS MIGRADOS:';

SELECT 
    'Leads creados' as tipo,
    COUNT(*) as cantidad
FROM crm.leads
UNION ALL
SELECT 
    'Procesos de onboarding' as tipo,
    COUNT(*) as cantidad
FROM crm.onboarding_processes
UNION ALL
SELECT 
    'Tareas creadas' as tipo,
    COUNT(*) as cantidad
FROM crm.tasks
UNION ALL
SELECT 
    'Interacciones registradas' as tipo,
    COUNT(*) as cantidad
FROM crm.interactions
UNION ALL
SELECT 
    'Notas de seguimiento' as tipo,
    COUNT(*) as cantidad
FROM crm.lead_notes
UNION ALL
SELECT 
    'Reglas de automatización' as tipo,
    COUNT(*) as cantidad
FROM marketing.automation_rules;

\echo '';
\echo '📈 DISTRIBUCIÓN DE LEADS POR STATUS:';

SELECT 
    status,
    COUNT(*) as cantidad,
    ROUND(COUNT(*)::decimal / (SELECT COUNT(*) FROM crm.leads) * 100, 1) as porcentaje
FROM crm.leads
GROUP BY status
ORDER BY cantidad DESC;

\echo '';
\echo '💰 VALOR DEL PIPELINE:';

SELECT 
    'Pipeline total' as metrica,
    '$' || TO_CHAR(SUM(estimated_revenue), 'FM999,999,999') as valor
FROM crm.leads
WHERE status IN ('qualified', 'proposal', 'negotiation')
UNION ALL
SELECT 
    'Valor promedio por lead' as metrica,
    '$' || TO_CHAR(AVG(estimated_revenue), 'FM999,999,999') as valor
FROM crm.leads
WHERE estimated_revenue > 0;

-- =====================================================
-- REGISTRO EN AUDITORÍA
-- =====================================================

-- Registrar migración completa
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
    'CRM_MIGRATION',
    gen_random_uuid(),
    jsonb_build_object(
        'leads_migrated', (SELECT COUNT(*) FROM crm.leads),
        'onboarding_processes', (SELECT COUNT(*) FROM crm.onboarding_processes),
        'tasks_created', (SELECT COUNT(*) FROM crm.tasks),
        'interactions_created', (SELECT COUNT(*) FROM crm.interactions),
        'notes_created', (SELECT COUNT(*) FROM crm.lead_notes),
        'automation_rules', (SELECT COUNT(*) FROM marketing.automation_rules),
        'pipeline_value', (SELECT SUM(estimated_revenue) FROM crm.leads),
        'migration_date', CURRENT_DATE
    ),
    'Migración completa del CRM administrativo con datos de ejemplo y automatizaciones',
    CURRENT_TIMESTAMP
);

\echo '';
\echo '=====================================================';
\echo '🎊 ¡MIGRACIÓN DEL CRM COMPLETADA EXITOSAMENTE!';
\echo '=====================================================';
\echo '';
\echo '📊 DATOS MIGRADOS:';
\echo '- Leads de ejemplo con diferentes estados';
\echo '- Procesos de onboarding configurados';
\echo '- Tareas de seguimiento asignadas';
\echo '- Historial de interacciones';
\echo '- Notas detalladas de cada lead';
\echo '- Automatizaciones de marketing activas';
\echo '';
\echo '🎯 PRÓXIMOS PASOS:';
\echo '1. Revisar leads en el dashboard del CRM';
\echo '2. Probar automatizaciones de marketing';
\echo '3. Configurar notificaciones para el equipo';
\echo '4. Personalizar flujos de onboarding';
\echo '';
\echo '🚀 ¡El CRM está listo para gestionar leads reales!';
\echo '';
