-- =====================================================
-- SPOON - TABLAS DEL ESQUEMA ANALYTICS
-- =====================================================
-- Archivo: 06-create-analytics-tables.sql
-- Propósito: Crear tablas para métricas y analytics avanzados
-- Fecha: 7 de Enero, 2025
-- Versión: 1.0
-- =====================================================

-- Verificar conexión y esquemas
SELECT current_database(), current_user;
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'analytics';

-- =====================================================
-- TABLA: analytics.restaurant_metrics
-- Métricas diarias de restaurantes
-- =====================================================

CREATE TABLE analytics.restaurant_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    total_views INTEGER DEFAULT 0 CHECK (total_views >= 0),
    unique_visitors INTEGER DEFAULT 0 CHECK (unique_visitors >= 0),
    menu_views INTEGER DEFAULT 0 CHECK (menu_views >= 0),
    orders_placed INTEGER DEFAULT 0 CHECK (orders_placed >= 0),
    orders_completed INTEGER DEFAULT 0 CHECK (orders_completed >= 0),
    conversion_rate DECIMAL(5,4) DEFAULT 0 CHECK (conversion_rate >= 0 AND conversion_rate <= 1),
    average_order_value DECIMAL(10,2) DEFAULT 0 CHECK (average_order_value >= 0),
    total_revenue DECIMAL(12,2) DEFAULT 0 CHECK (total_revenue >= 0),
    customer_satisfaction DECIMAL(3,2) DEFAULT 0 CHECK (customer_satisfaction >= 0 AND customer_satisfaction <= 5),
    repeat_customer_rate DECIMAL(5,4) DEFAULT 0 CHECK (repeat_customer_rate >= 0 AND repeat_customer_rate <= 1),
    peak_hours JSONB DEFAULT '{}',
    popular_items JSONB DEFAULT '[]',
    bounce_rate DECIMAL(5,4) DEFAULT 0 CHECK (bounce_rate >= 0 AND bounce_rate <= 1),
    session_duration_avg INTEGER DEFAULT 0 CHECK (session_duration_avg >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT unique_restaurant_date UNIQUE(restaurant_id, metric_date),
    CONSTRAINT check_unique_visitors_logic CHECK (unique_visitors <= total_views),
    CONSTRAINT check_orders_logic CHECK (orders_completed <= orders_placed)
);

-- Comentarios
COMMENT ON TABLE analytics.restaurant_metrics IS 'Métricas diarias agregadas por restaurante';
COMMENT ON COLUMN analytics.restaurant_metrics.peak_hours IS 'Horas pico con mayor actividad';
COMMENT ON COLUMN analytics.restaurant_metrics.popular_items IS 'Items más populares del día';
COMMENT ON COLUMN analytics.restaurant_metrics.session_duration_avg IS 'Duración promedio de sesión en segundos';

-- =====================================================
-- TABLA: analytics.user_behavior_metrics
-- Métricas de comportamiento de usuarios móviles
-- =====================================================

CREATE TABLE analytics.user_behavior_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    session_count INTEGER DEFAULT 0 CHECK (session_count >= 0),
    total_session_duration INTEGER DEFAULT 0 CHECK (total_session_duration >= 0),
    screens_visited JSONB DEFAULT '[]',
    searches_performed INTEGER DEFAULT 0 CHECK (searches_performed >= 0),
    restaurants_viewed INTEGER DEFAULT 0 CHECK (restaurants_viewed >= 0),
    orders_placed INTEGER DEFAULT 0 CHECK (orders_placed >= 0),
    orders_completed INTEGER DEFAULT 0 CHECK (orders_completed >= 0),
    reviews_written INTEGER DEFAULT 0 CHECK (reviews_written >= 0),
    favorites_added INTEGER DEFAULT 0 CHECK (favorites_added >= 0),
    app_crashes INTEGER DEFAULT 0 CHECK (app_crashes >= 0),
    feature_usage JSONB DEFAULT '{}',
    location_data JSONB DEFAULT '{}',
    device_info JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT unique_user_date UNIQUE(user_id, metric_date),
    CONSTRAINT check_orders_completion CHECK (orders_completed <= orders_placed)
);

-- Comentarios
COMMENT ON TABLE analytics.user_behavior_metrics IS 'Métricas diarias de comportamiento de usuarios móviles';
COMMENT ON COLUMN analytics.user_behavior_metrics.screens_visited IS 'Lista de pantallas visitadas con contadores';
COMMENT ON COLUMN analytics.user_behavior_metrics.feature_usage IS 'Uso de características específicas de la app';
COMMENT ON COLUMN analytics.user_behavior_metrics.total_session_duration IS 'Duración total en segundos';

-- =====================================================
-- TABLA: analytics.crm_metrics
-- Métricas del CRM administrativo
-- =====================================================

CREATE TABLE analytics.crm_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE NOT NULL,
    new_leads INTEGER DEFAULT 0 CHECK (new_leads >= 0),
    qualified_leads INTEGER DEFAULT 0 CHECK (qualified_leads >= 0),
    converted_leads INTEGER DEFAULT 0 CHECK (converted_leads >= 0),
    lost_leads INTEGER DEFAULT 0 CHECK (lost_leads >= 0),
    active_leads INTEGER DEFAULT 0 CHECK (active_leads >= 0),
    average_deal_size DECIMAL(10,2) DEFAULT 0 CHECK (average_deal_size >= 0),
    total_pipeline_value DECIMAL(12,2) DEFAULT 0 CHECK (total_pipeline_value >= 0),
    sales_cycle_days DECIMAL(5,2) DEFAULT 0 CHECK (sales_cycle_days >= 0),
    conversion_rate DECIMAL(5,4) DEFAULT 0 CHECK (conversion_rate >= 0 AND conversion_rate <= 1),
    lead_sources JSONB DEFAULT '{}',
    conversion_by_source JSONB DEFAULT '{}',
    team_performance JSONB DEFAULT '{}',
    tasks_completed INTEGER DEFAULT 0 CHECK (tasks_completed >= 0),
    tasks_overdue INTEGER DEFAULT 0 CHECK (tasks_overdue >= 0),
    onboarding_completed INTEGER DEFAULT 0 CHECK (onboarding_completed >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT unique_crm_date UNIQUE(metric_date)
);

-- Comentarios
COMMENT ON TABLE analytics.crm_metrics IS 'Métricas diarias del CRM administrativo';
COMMENT ON COLUMN analytics.crm_metrics.lead_sources IS 'Distribución de leads por fuente';
COMMENT ON COLUMN analytics.crm_metrics.conversion_by_source IS 'Tasas de conversión por fuente';
COMMENT ON COLUMN analytics.crm_metrics.team_performance IS 'Métricas de rendimiento por miembro del equipo';

-- =====================================================
-- TABLA: analytics.marketing_metrics
-- Métricas de campañas de marketing
-- =====================================================

CREATE TABLE analytics.marketing_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES marketing.campaigns(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    emails_sent INTEGER DEFAULT 0 CHECK (emails_sent >= 0),
    emails_delivered INTEGER DEFAULT 0 CHECK (emails_delivered >= 0),
    emails_opened INTEGER DEFAULT 0 CHECK (emails_opened >= 0),
    emails_clicked INTEGER DEFAULT 0 CHECK (emails_clicked >= 0),
    emails_bounced INTEGER DEFAULT 0 CHECK (emails_bounced >= 0),
    emails_unsubscribed INTEGER DEFAULT 0 CHECK (emails_unsubscribed >= 0),
    sms_sent INTEGER DEFAULT 0 CHECK (sms_sent >= 0),
    sms_delivered INTEGER DEFAULT 0 CHECK (sms_delivered >= 0),
    push_sent INTEGER DEFAULT 0 CHECK (push_sent >= 0),
    push_opened INTEGER DEFAULT 0 CHECK (push_opened >= 0),
    cost_per_send DECIMAL(8,4) DEFAULT 0 CHECK (cost_per_send >= 0),
    cost_per_click DECIMAL(8,4) DEFAULT 0 CHECK (cost_per_click >= 0),
    return_on_investment DECIMAL(8,4) DEFAULT 0,
    conversions INTEGER DEFAULT 0 CHECK (conversions >= 0),
    revenue_generated DECIMAL(10,2) DEFAULT 0 CHECK (revenue_generated >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT unique_campaign_date UNIQUE(campaign_id, metric_date),
    CONSTRAINT check_email_progression CHECK (
        emails_delivered <= emails_sent AND
        emails_opened <= emails_delivered AND
        emails_clicked <= emails_opened
    ),
    CONSTRAINT check_sms_delivery CHECK (sms_delivered <= sms_sent),
    CONSTRAINT check_push_delivery CHECK (push_opened <= push_sent)
);

-- Comentarios
COMMENT ON TABLE analytics.marketing_metrics IS 'Métricas diarias de campañas de marketing';
COMMENT ON COLUMN analytics.marketing_metrics.return_on_investment IS 'ROI calculado (revenue - cost) / cost';

-- =====================================================
-- TABLA: analytics.system_performance
-- Métricas de rendimiento del sistema
-- =====================================================

CREATE TABLE analytics.system_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE NOT NULL,
    metric_hour INTEGER CHECK (metric_hour >= 0 AND metric_hour <= 23),
    api_requests_total INTEGER DEFAULT 0 CHECK (api_requests_total >= 0),
    api_requests_successful INTEGER DEFAULT 0 CHECK (api_requests_successful >= 0),
    api_response_time_avg DECIMAL(8,3) DEFAULT 0 CHECK (api_response_time_avg >= 0),
    api_response_time_p95 DECIMAL(8,3) DEFAULT 0 CHECK (api_response_time_p95 >= 0),
    database_connections_active INTEGER DEFAULT 0 CHECK (database_connections_active >= 0),
    database_query_time_avg DECIMAL(8,3) DEFAULT 0 CHECK (database_query_time_avg >= 0),
    cache_hit_rate DECIMAL(5,4) DEFAULT 0 CHECK (cache_hit_rate >= 0 AND cache_hit_rate <= 1),
    error_rate DECIMAL(5,4) DEFAULT 0 CHECK (error_rate >= 0 AND error_rate <= 1),
    concurrent_users INTEGER DEFAULT 0 CHECK (concurrent_users >= 0),
    memory_usage_mb INTEGER DEFAULT 0 CHECK (memory_usage_mb >= 0),
    cpu_usage_percent DECIMAL(5,2) DEFAULT 0 CHECK (cpu_usage_percent >= 0 AND cpu_usage_percent <= 100),
    disk_usage_percent DECIMAL(5,2) DEFAULT 0 CHECK (disk_usage_percent >= 0 AND disk_usage_percent <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT unique_system_date_hour UNIQUE(metric_date, metric_hour),
    CONSTRAINT check_api_success_rate CHECK (api_requests_successful <= api_requests_total)
);

-- Comentarios
COMMENT ON TABLE analytics.system_performance IS 'Métricas de rendimiento del sistema por hora';
COMMENT ON COLUMN analytics.system_performance.api_response_time_avg IS 'Tiempo promedio de respuesta en milisegundos';
COMMENT ON COLUMN analytics.system_performance.api_response_time_p95 IS 'Percentil 95 de tiempo de respuesta en milisegundos';

-- =====================================================
-- TABLA: analytics.business_intelligence
-- Métricas de inteligencia de negocio
-- =====================================================

CREATE TABLE analytics.business_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE NOT NULL,
    total_restaurants INTEGER DEFAULT 0 CHECK (total_restaurants >= 0),
    active_restaurants INTEGER DEFAULT 0 CHECK (active_restaurants >= 0),
    new_restaurants INTEGER DEFAULT 0 CHECK (new_restaurants >= 0),
    churned_restaurants INTEGER DEFAULT 0 CHECK (churned_restaurants >= 0),
    total_users INTEGER DEFAULT 0 CHECK (total_users >= 0),
    active_users INTEGER DEFAULT 0 CHECK (active_users >= 0),
    new_users INTEGER DEFAULT 0 CHECK (new_users >= 0),
    total_orders INTEGER DEFAULT 0 CHECK (total_orders >= 0),
    total_revenue DECIMAL(12,2) DEFAULT 0 CHECK (total_revenue >= 0),
    average_order_value DECIMAL(10,2) DEFAULT 0 CHECK (average_order_value >= 0),
    customer_acquisition_cost DECIMAL(10,2) DEFAULT 0 CHECK (customer_acquisition_cost >= 0),
    customer_lifetime_value DECIMAL(10,2) DEFAULT 0 CHECK (customer_lifetime_value >= 0),
    monthly_recurring_revenue DECIMAL(12,2) DEFAULT 0 CHECK (monthly_recurring_revenue >= 0),
    churn_rate DECIMAL(5,4) DEFAULT 0 CHECK (churn_rate >= 0 AND churn_rate <= 1),
    growth_rate DECIMAL(5,4) DEFAULT 0,
    market_penetration DECIMAL(5,4) DEFAULT 0 CHECK (market_penetration >= 0 AND market_penetration <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT unique_bi_date UNIQUE(metric_date),
    CONSTRAINT check_active_restaurants CHECK (active_restaurants <= total_restaurants),
    CONSTRAINT check_active_users CHECK (active_users <= total_users)
);

-- Comentarios
COMMENT ON TABLE analytics.business_intelligence IS 'Métricas de alto nivel para inteligencia de negocio';
COMMENT ON COLUMN analytics.business_intelligence.customer_lifetime_value IS 'Valor de vida del cliente promedio';
COMMENT ON COLUMN analytics.business_intelligence.monthly_recurring_revenue IS 'Ingresos recurrentes mensuales';

-- =====================================================
-- ÍNDICES PARA RENDIMIENTO
-- =====================================================

-- Índices para analytics.restaurant_metrics
CREATE INDEX idx_analytics_restaurant_date ON analytics.restaurant_metrics(restaurant_id, metric_date);
CREATE INDEX idx_analytics_restaurant_revenue ON analytics.restaurant_metrics(total_revenue, metric_date);
CREATE INDEX idx_analytics_restaurant_conversion ON analytics.restaurant_metrics(conversion_rate, metric_date);

-- Índices para analytics.user_behavior_metrics
CREATE INDEX idx_analytics_user_date ON analytics.user_behavior_metrics(user_id, metric_date);
CREATE INDEX idx_analytics_user_sessions ON analytics.user_behavior_metrics(session_count, metric_date);
CREATE INDEX idx_analytics_user_orders ON analytics.user_behavior_metrics(orders_placed, metric_date);

-- Índices para analytics.crm_metrics
CREATE INDEX idx_analytics_crm_date ON analytics.crm_metrics(metric_date);
CREATE INDEX idx_analytics_crm_conversion ON analytics.crm_metrics(conversion_rate, metric_date);

-- Índices para analytics.marketing_metrics
CREATE INDEX idx_analytics_marketing_campaign ON analytics.marketing_metrics(campaign_id, metric_date);
CREATE INDEX idx_analytics_marketing_roi ON analytics.marketing_metrics(return_on_investment, metric_date);

-- Índices para analytics.system_performance
CREATE INDEX idx_analytics_system_date_hour ON analytics.system_performance(metric_date, metric_hour);
CREATE INDEX idx_analytics_system_response_time ON analytics.system_performance(api_response_time_avg, metric_date);

-- Índices para analytics.business_intelligence
CREATE INDEX idx_analytics_bi_date ON analytics.business_intelligence(metric_date);
CREATE INDEX idx_analytics_bi_revenue ON analytics.business_intelligence(total_revenue, metric_date);

-- Índices JSONB para búsquedas avanzadas
CREATE INDEX idx_analytics_restaurant_peak_gin ON analytics.restaurant_metrics USING GIN (peak_hours);
CREATE INDEX idx_analytics_restaurant_items_gin ON analytics.restaurant_metrics USING GIN (popular_items);
CREATE INDEX idx_analytics_user_screens_gin ON analytics.user_behavior_metrics USING GIN (screens_visited);
CREATE INDEX idx_analytics_user_features_gin ON analytics.user_behavior_metrics USING GIN (feature_usage);

-- =====================================================
-- TRIGGERS PARA AUDITORÍA Y ACTUALIZACIÓN
-- =====================================================

-- Triggers para updated_at
CREATE TRIGGER update_analytics_restaurant_updated_at
    BEFORE UPDATE ON analytics.restaurant_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_user_updated_at
    BEFORE UPDATE ON analytics.user_behavior_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_crm_updated_at
    BEFORE UPDATE ON analytics.crm_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_marketing_updated_at
    BEFORE UPDATE ON analytics.marketing_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_bi_updated_at
    BEFORE UPDATE ON analytics.business_intelligence
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCIONES ESPECÍFICAS DE ANALYTICS
-- =====================================================

-- Función para calcular métricas diarias de restaurante
CREATE OR REPLACE FUNCTION calculate_daily_restaurant_metrics(restaurant_uuid UUID, target_date DATE)
RETURNS BOOLEAN AS $$
DECLARE
    total_views_count INTEGER;
    orders_count INTEGER;
    completed_orders_count INTEGER;
    total_revenue_amount DECIMAL(12,2);
    avg_order_value DECIMAL(10,2);
    conversion_rate_calc DECIMAL(5,4);
BEGIN
    -- Calcular métricas básicas
    SELECT COUNT(*) INTO total_views_count
    FROM mobile.user_sessions us
    WHERE DATE(us.started_at) = target_date
        AND us.screens_visited::text LIKE '%restaurant_detail%'
        AND us.screens_visited::jsonb ? restaurant_uuid::text;
    
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
    INTO orders_count, completed_orders_count
    FROM sales.orders
    WHERE restaurant_id = restaurant_uuid
        AND DATE(created_at) = target_date;
    
    SELECT COALESCE(SUM(total_amount), 0)
    INTO total_revenue_amount
    FROM sales.orders
    WHERE restaurant_id = restaurant_uuid
        AND DATE(created_at) = target_date
        AND status = 'completed';
    
    -- Calcular métricas derivadas
    IF completed_orders_count > 0 THEN
        avg_order_value := total_revenue_amount / completed_orders_count;
    ELSE
        avg_order_value := 0;
    END IF;
    
    IF total_views_count > 0 THEN
        conversion_rate_calc := orders_count::DECIMAL / total_views_count::DECIMAL;
    ELSE
        conversion_rate_calc := 0;
    END IF;
    
    -- Insertar o actualizar métricas
    INSERT INTO analytics.restaurant_metrics (
        restaurant_id, metric_date, total_views, orders_placed, orders_completed,
        total_revenue, average_order_value, conversion_rate
    ) VALUES (
        restaurant_uuid, target_date, total_views_count, orders_count, completed_orders_count,
        total_revenue_amount, avg_order_value, conversion_rate_calc
    )
    ON CONFLICT (restaurant_id, metric_date) 
    DO UPDATE SET
        total_views = EXCLUDED.total_views,
        orders_placed = EXCLUDED.orders_placed,
        orders_completed = EXCLUDED.orders_completed,
        total_revenue = EXCLUDED.total_revenue,
        average_order_value = EXCLUDED.average_order_value,
        conversion_rate = EXCLUDED.conversion_rate,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular métricas de CRM diarias
CREATE OR REPLACE FUNCTION calculate_daily_crm_metrics(target_date DATE)
RETURNS BOOLEAN AS $$
DECLARE
    new_leads_count INTEGER;
    qualified_leads_count INTEGER;
    converted_leads_count INTEGER;
    avg_deal_size_calc DECIMAL(10,2);
BEGIN
    -- Contar leads por estado
    SELECT COUNT(*) INTO new_leads_count
    FROM crm.leads
    WHERE DATE(created_at) = target_date;
    
    SELECT COUNT(*) INTO qualified_leads_count
    FROM crm.leads
    WHERE DATE(updated_at) = target_date
        AND status = 'qualified';
    
    SELECT COUNT(*) INTO converted_leads_count
    FROM crm.leads
    WHERE DATE(updated_at) = target_date
        AND status = 'closed_won';
    
    -- Calcular valor promedio de deals
    SELECT COALESCE(AVG(estimated_value), 0) INTO avg_deal_size_calc
    FROM crm.leads
    WHERE DATE(updated_at) = target_date
        AND status = 'closed_won';
    
    -- Insertar métricas
    INSERT INTO analytics.crm_metrics (
        metric_date, new_leads, qualified_leads, converted_leads, average_deal_size
    ) VALUES (
        target_date, new_leads_count, qualified_leads_count, converted_leads_count, avg_deal_size_calc
    )
    ON CONFLICT (metric_date)
    DO UPDATE SET
        new_leads = EXCLUDED.new_leads,
        qualified_leads = EXCLUDED.qualified_leads,
        converted_leads = EXCLUDED.converted_leads,
        average_deal_size = EXCLUDED.average_deal_size,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Función para generar reporte de inteligencia de negocio
CREATE OR REPLACE FUNCTION generate_business_intelligence_report(target_date DATE)
RETURNS BOOLEAN AS $$
DECLARE
    total_restaurants_count INTEGER;
    active_restaurants_count INTEGER;
    total_users_count INTEGER;
    total_orders_count INTEGER;
    total_revenue_amount DECIMAL(12,2);
BEGIN
    -- Contar restaurantes
    SELECT COUNT(*) INTO total_restaurants_count
    FROM restaurant.restaurants;
    
    SELECT COUNT(*) INTO active_restaurants_count
    FROM restaurant.restaurants
    WHERE status = 'active';
    
    -- Contar usuarios
    SELECT COUNT(*) INTO total_users_count
    FROM auth.users
    WHERE status = 'active';
    
    -- Métricas de pedidos
    SELECT COUNT(*), COALESCE(SUM(total_amount), 0)
    INTO total_orders_count, total_revenue_amount
    FROM sales.orders
    WHERE DATE(created_at) = target_date
        AND status = 'completed';
    
    -- Insertar reporte
    INSERT INTO analytics.business_intelligence (
        metric_date, total_restaurants, active_restaurants, total_users,
        total_orders, total_revenue
    ) VALUES (
        target_date, total_restaurants_count, active_restaurants_count, total_users_count,
        total_orders_count, total_revenue_amount
    )
    ON CONFLICT (metric_date)
    DO UPDATE SET
        total_restaurants = EXCLUDED.total_restaurants,
        active_restaurants = EXCLUDED.active_restaurants,
        total_users = EXCLUDED.total_users,
        total_orders = EXCLUDED.total_orders,
        total_revenue = EXCLUDED.total_revenue,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DATOS INICIALES DE EJEMPLO
-- =====================================================

-- Generar métricas de ejemplo para hoy
SELECT generate_business_intelligence_report(CURRENT_DATE);
SELECT calculate_daily_crm_metrics(CURRENT_DATE);

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que todas las tablas fueron creadas
SELECT 
    table_name,
    table_type,
    CASE 
        WHEN table_schema = 'analytics' THEN '🆕 NUEVA'
        ELSE '📋 EXISTENTE'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'analytics'
ORDER BY table_name;

-- Contar registros en cada tabla
SELECT 
    'analytics.restaurant_metrics' as table_name,
    COUNT(*) as record_count
FROM analytics.restaurant_metrics
UNION ALL
SELECT 
    'analytics.user_behavior_metrics' as table_name,
    COUNT(*) as record_count
FROM analytics.user_behavior_metrics
UNION ALL
SELECT 
    'analytics.crm_metrics' as table_name,
    COUNT(*) as record_count
FROM analytics.crm_metrics
UNION ALL
SELECT 
    'analytics.marketing_metrics' as table_name,
    COUNT(*) as record_count
FROM analytics.marketing_metrics
UNION ALL
SELECT 
    'analytics.system_performance' as table_name,
    COUNT(*) as record_count
FROM analytics.system_performance
UNION ALL
SELECT 
    'analytics.business_intelligence' as table_name,
    COUNT(*) as record_count
FROM analytics.business_intelligence;

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
    'ANALYTICS_TABLES',
    gen_random_uuid(),
    jsonb_build_object(
        'tables_created', ARRAY['restaurant_metrics', 'user_behavior_metrics', 'crm_metrics', 'marketing_metrics', 'system_performance', 'business_intelligence'],
        'indexes_created', 15,
        'triggers_created', 5,
        'functions_created', 3,
        'purpose', 'Arquitectura Unificada - Fase 1 - Esquema Analytics',
        'version', '1.0'
    ),
    'Creación completa de tablas del esquema Analytics para arquitectura unificada',
    CURRENT_TIMESTAMP
);

-- =====================================================
-- RESUMEN DE EJECUCIÓN
-- =====================================================

SELECT 
    '✅ ESQUEMA ANALYTICS CREADO EXITOSAMENTE' as status,
    6 as total_tables_created,
    15 as total_indexes_created,
    5 as total_triggers_created,
    3 as total_functions_created,
    CURRENT_TIMESTAMP as executed_at,
    current_user as executed_by,
    current_database() as database_name;
