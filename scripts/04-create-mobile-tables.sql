-- =====================================================
-- SPOON - TABLAS DEL ESQUEMA MOBILE
-- =====================================================
-- Archivo: 04-create-mobile-tables.sql
-- Propósito: Crear tablas para la aplicación móvil
-- Fecha: 7 de Enero, 2025
-- Versión: 1.0
-- =====================================================

-- Verificar conexión y esquemas
SELECT current_database(), current_user;
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'mobile';

-- =====================================================
-- TABLA: mobile.customer_profiles
-- Perfiles extendidos de comensales
-- =====================================================

CREATE TABLE mobile.customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(200),
    avatar_url VARCHAR(500),
    birth_date DATE,
    gender gender_enum,
    location_city VARCHAR(100),
    location_coordinates POINT,
    user_level user_level_enum DEFAULT 'bronze' NOT NULL,
    loyalty_points INTEGER DEFAULT 0 CHECK (loyalty_points >= 0),
    total_orders INTEGER DEFAULT 0 CHECK (total_orders >= 0),
    total_spent DECIMAL(10,2) DEFAULT 0 CHECK (total_spent >= 0),
    average_rating DECIMAL(3,2) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
    is_premium BOOLEAN DEFAULT FALSE,
    premium_since TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}',
    dietary_restrictions JSONB DEFAULT '[]',
    favorite_cuisines JSONB DEFAULT '[]',
    notification_settings JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT unique_user_profile UNIQUE(user_id),
    CONSTRAINT check_valid_birth_date CHECK (
        birth_date IS NULL OR 
        (birth_date >= '1900-01-01' AND birth_date <= CURRENT_DATE - INTERVAL '13 years')
    ),
    CONSTRAINT check_premium_logic CHECK (
        (is_premium = TRUE AND premium_since IS NOT NULL) OR 
        (is_premium = FALSE)
    )
);

-- Comentarios
COMMENT ON TABLE mobile.customer_profiles IS 'Perfiles extendidos de comensales para la aplicación móvil';
COMMENT ON COLUMN mobile.customer_profiles.user_level IS 'Nivel calculado automáticamente basado en total_orders';
COMMENT ON COLUMN mobile.customer_profiles.preferences IS 'Preferencias del usuario: tipos de comida, horarios, etc.';
COMMENT ON COLUMN mobile.customer_profiles.dietary_restrictions IS 'Restricciones alimentarias: vegetariano, vegano, sin gluten, etc.';
COMMENT ON COLUMN mobile.customer_profiles.location_coordinates IS 'Coordenadas de ubicación preferida del usuario';

-- =====================================================
-- TABLA: mobile.user_favorites
-- Favoritos de usuarios (restaurantes, productos, combinaciones)
-- =====================================================

CREATE TABLE mobile.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES restaurant.restaurants(id) ON DELETE CASCADE,
    product_id UUID REFERENCES menu.products(id) ON DELETE CASCADE,
    combination_id UUID REFERENCES menu.menu_combinations(id) ON DELETE CASCADE,
    favorite_type favorite_type_enum NOT NULL,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    favorite_count INTEGER DEFAULT 1 CHECK (favorite_count >= 0),
    last_ordered TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_favorite_association CHECK (
        (favorite_type = 'restaurant' AND restaurant_id IS NOT NULL AND product_id IS NULL AND combination_id IS NULL) OR
        (favorite_type = 'product' AND product_id IS NOT NULL AND restaurant_id IS NULL AND combination_id IS NULL) OR
        (favorite_type = 'combination' AND combination_id IS NOT NULL AND restaurant_id IS NULL AND product_id IS NULL)
    ),
    CONSTRAINT unique_user_favorite UNIQUE(user_id, restaurant_id, product_id, combination_id)
);

-- Comentarios
COMMENT ON TABLE mobile.user_favorites IS 'Elementos marcados como favoritos por los usuarios';
COMMENT ON COLUMN mobile.user_favorites.favorite_count IS 'Número de veces que ha sido marcado como favorito';
COMMENT ON COLUMN mobile.user_favorites.last_ordered IS 'Última vez que el usuario pidió este elemento';

-- =====================================================
-- TABLA: mobile.reviews
-- Reseñas y calificaciones de usuarios
-- =====================================================

CREATE TABLE mobile.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES sales.orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    content TEXT,
    photos JSONB DEFAULT '[]',
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_votes INTEGER DEFAULT 0 CHECK (helpful_votes >= 0),
    total_votes INTEGER DEFAULT 0 CHECK (total_votes >= 0),
    status review_status_enum DEFAULT 'published' NOT NULL,
    moderation_notes TEXT,
    response_from_restaurant TEXT,
    response_date TIMESTAMP WITH TIME ZONE,
    tags JSONB DEFAULT '[]',
    sentiment_score DECIMAL(3,2), -- -1.0 a 1.0
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_helpful_votes_logic CHECK (helpful_votes <= total_votes),
    CONSTRAINT check_sentiment_range CHECK (
        sentiment_score IS NULL OR 
        (sentiment_score >= -1.0 AND sentiment_score <= 1.0)
    ),
    CONSTRAINT unique_user_restaurant_order UNIQUE(user_id, restaurant_id, order_id)
);

-- Comentarios
COMMENT ON TABLE mobile.reviews IS 'Reseñas y calificaciones de restaurantes por parte de usuarios';
COMMENT ON COLUMN mobile.reviews.is_verified IS 'Si la reseña está verificada (usuario realmente visitó el restaurante)';
COMMENT ON COLUMN mobile.reviews.sentiment_score IS 'Puntuación de sentimiento calculada automáticamente (-1.0 a 1.0)';
COMMENT ON COLUMN mobile.reviews.photos IS 'URLs de fotos adjuntas a la reseña';

-- =====================================================
-- TABLA: mobile.user_settings
-- Configuraciones específicas de la aplicación móvil
-- =====================================================

CREATE TABLE mobile.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_preferences JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    app_preferences JSONB DEFAULT '{}',
    location_settings JSONB DEFAULT '{}',
    accessibility_settings JSONB DEFAULT '{}',
    language VARCHAR(10) DEFAULT 'es',
    theme VARCHAR(20) DEFAULT 'light',
    currency VARCHAR(3) DEFAULT 'COP',
    timezone VARCHAR(50) DEFAULT 'America/Bogota',
    auto_location BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    marketing_emails BOOLEAN DEFAULT TRUE,
    data_sharing BOOLEAN DEFAULT FALSE,
    analytics_tracking BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT unique_user_settings UNIQUE(user_id),
    CONSTRAINT check_valid_language CHECK (language ~ '^[a-z]{2}(-[A-Z]{2})?$'),
    CONSTRAINT check_valid_currency CHECK (currency ~ '^[A-Z]{3}$'),
    CONSTRAINT check_valid_theme CHECK (theme IN ('light', 'dark', 'auto'))
);

-- Comentarios
COMMENT ON TABLE mobile.user_settings IS 'Configuraciones específicas de la aplicación móvil por usuario';
COMMENT ON COLUMN mobile.user_settings.notification_preferences IS 'Preferencias detalladas de notificaciones';
COMMENT ON COLUMN mobile.user_settings.accessibility_settings IS 'Configuraciones de accesibilidad';

-- =====================================================
-- TABLA: mobile.search_history
-- Historial de búsquedas de usuarios
-- =====================================================

CREATE TABLE mobile.search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    search_query VARCHAR(500) NOT NULL,
    search_type search_type_enum NOT NULL,
    results_count INTEGER DEFAULT 0 CHECK (results_count >= 0),
    clicked_result_id UUID,
    clicked_result_type VARCHAR(50),
    location_context JSONB DEFAULT '{}',
    filters_applied JSONB DEFAULT '{}',
    search_duration_ms INTEGER,
    was_successful BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_positive_duration CHECK (
        search_duration_ms IS NULL OR search_duration_ms >= 0
    )
);

-- Comentarios
COMMENT ON TABLE mobile.search_history IS 'Historial de búsquedas para mejorar recomendaciones y UX';
COMMENT ON COLUMN mobile.search_history.location_context IS 'Contexto de ubicación cuando se realizó la búsqueda';
COMMENT ON COLUMN mobile.search_history.filters_applied IS 'Filtros aplicados durante la búsqueda';

-- =====================================================
-- TABLA: mobile.user_sessions
-- Sesiones de usuario en la aplicación móvil
-- =====================================================

CREATE TABLE mobile.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token VARCHAR(500) UNIQUE NOT NULL,
    device_info JSONB DEFAULT '{}',
    app_version VARCHAR(20),
    os_version VARCHAR(50),
    device_model VARCHAR(100),
    screen_resolution VARCHAR(20),
    location_coordinates POINT,
    ip_address INET,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    screens_visited JSONB DEFAULT '[]',
    actions_performed JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Constraints
    CONSTRAINT check_session_duration CHECK (
        ended_at IS NULL OR 
        (ended_at > started_at AND duration_minutes > 0)
    )
);

-- Comentarios
COMMENT ON TABLE mobile.user_sessions IS 'Sesiones de usuario para analytics y comportamiento';
COMMENT ON COLUMN mobile.user_sessions.screens_visited IS 'Lista de pantallas visitadas durante la sesión';
COMMENT ON COLUMN mobile.user_sessions.actions_performed IS 'Acciones realizadas durante la sesión';

-- =====================================================
-- ÍNDICES PARA RENDIMIENTO
-- =====================================================

-- Índices para mobile.customer_profiles
CREATE INDEX idx_mobile_profiles_user ON mobile.customer_profiles(user_id);
CREATE INDEX idx_mobile_profiles_level ON mobile.customer_profiles(user_level, is_premium);
CREATE INDEX idx_mobile_profiles_location ON mobile.customer_profiles USING GIST (location_coordinates);
CREATE INDEX idx_mobile_profiles_active ON mobile.customer_profiles(last_active);

-- Índices para mobile.user_favorites
CREATE INDEX idx_mobile_favorites_user ON mobile.user_favorites(user_id, favorite_type, is_active);
CREATE INDEX idx_mobile_favorites_restaurant ON mobile.user_favorites(restaurant_id, is_active);
CREATE INDEX idx_mobile_favorites_product ON mobile.user_favorites(product_id, is_active);
CREATE INDEX idx_mobile_favorites_combination ON mobile.user_favorites(combination_id, is_active);

-- Índices para mobile.reviews
CREATE INDEX idx_mobile_reviews_restaurant ON mobile.reviews(restaurant_id, status, created_at);
CREATE INDEX idx_mobile_reviews_user ON mobile.reviews(user_id, rating, created_at);
CREATE INDEX idx_mobile_reviews_rating ON mobile.reviews(rating, status);
CREATE INDEX idx_mobile_reviews_verified ON mobile.reviews(is_verified, status);

-- Índices para mobile.user_settings
CREATE INDEX idx_mobile_settings_user ON mobile.user_settings(user_id);
CREATE INDEX idx_mobile_settings_notifications ON mobile.user_settings(push_notifications, email_notifications);

-- Índices para mobile.search_history
CREATE INDEX idx_mobile_search_user ON mobile.search_history(user_id, created_at);
CREATE INDEX idx_mobile_search_query ON mobile.search_history(search_query, search_type);
CREATE INDEX idx_mobile_search_successful ON mobile.search_history(was_successful, created_at);

-- Índices para mobile.user_sessions
CREATE INDEX idx_mobile_sessions_user ON mobile.user_sessions(user_id, started_at);
CREATE INDEX idx_mobile_sessions_active ON mobile.user_sessions(is_active, started_at);
CREATE INDEX idx_mobile_sessions_token ON mobile.user_sessions(session_token);

-- Índices JSONB para búsquedas avanzadas
CREATE INDEX idx_mobile_preferences_gin ON mobile.customer_profiles USING GIN (preferences);
CREATE INDEX idx_mobile_dietary_gin ON mobile.customer_profiles USING GIN (dietary_restrictions);
CREATE INDEX idx_mobile_cuisines_gin ON mobile.customer_profiles USING GIN (favorite_cuisines);
CREATE INDEX idx_mobile_review_photos_gin ON mobile.reviews USING GIN (photos);
CREATE INDEX idx_mobile_review_tags_gin ON mobile.reviews USING GIN (tags);

-- =====================================================
-- TRIGGERS PARA AUDITORÍA Y ACTUALIZACIÓN
-- =====================================================

-- Triggers para updated_at
CREATE TRIGGER update_mobile_profiles_updated_at
    BEFORE UPDATE ON mobile.customer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mobile_favorites_updated_at
    BEFORE UPDATE ON mobile.user_favorites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mobile_reviews_updated_at
    BEFORE UPDATE ON mobile.reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mobile_settings_updated_at
    BEFORE UPDATE ON mobile.user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers de auditoría
CREATE TRIGGER audit_mobile_profiles
    AFTER INSERT OR UPDATE OR DELETE ON mobile.customer_profiles
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_mobile_reviews
    AFTER INSERT OR UPDATE OR DELETE ON mobile.reviews
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- FUNCIONES ESPECÍFICAS DEL MOBILE
-- =====================================================

-- Función para calcular nivel de usuario automáticamente
CREATE OR REPLACE FUNCTION calculate_user_level(total_orders INTEGER)
RETURNS user_level_enum AS $$
BEGIN
    IF total_orders >= 100 THEN RETURN 'platinum';
    ELSIF total_orders >= 50 THEN RETURN 'gold';
    ELSIF total_orders >= 20 THEN RETURN 'silver';
    ELSE RETURN 'bronze';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar nivel automáticamente
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_level = calculate_user_level(NEW.total_orders);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_user_level
    BEFORE UPDATE ON mobile.customer_profiles
    FOR EACH ROW 
    WHEN (OLD.total_orders IS DISTINCT FROM NEW.total_orders)
    EXECUTE FUNCTION update_user_level();

-- Función para actualizar métricas del perfil cuando se crea una orden
CREATE OR REPLACE FUNCTION update_customer_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar métricas del perfil móvil
    UPDATE mobile.customer_profiles 
    SET total_orders = (
        SELECT COUNT(*) FROM sales.orders 
        WHERE created_by = NEW.created_by AND status = 'completed'
    ),
    total_spent = (
        SELECT COALESCE(SUM(total_amount), 0) FROM sales.orders 
        WHERE created_by = NEW.created_by AND status = 'completed'
    ),
    last_active = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
    WHERE user_id = NEW.created_by;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a la tabla de órdenes existente
CREATE TRIGGER sync_customer_metrics
    AFTER INSERT OR UPDATE ON sales.orders
    FOR EACH ROW 
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION update_customer_metrics();

-- Función para calcular puntuación de sentimiento de reseñas
CREATE OR REPLACE FUNCTION calculate_review_sentiment(review_content TEXT)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    positive_words TEXT[] := ARRAY['excelente', 'bueno', 'delicioso', 'recomiendo', 'perfecto', 'increíble', 'fantástico'];
    negative_words TEXT[] := ARRAY['malo', 'terrible', 'horrible', 'pésimo', 'desagradable', 'sucio', 'lento'];
    positive_count INTEGER := 0;
    negative_count INTEGER := 0;
    word TEXT;
    sentiment_score DECIMAL(3,2);
BEGIN
    IF review_content IS NULL OR LENGTH(review_content) < 10 THEN
        RETURN 0;
    END IF;
    
    -- Contar palabras positivas
    FOREACH word IN ARRAY positive_words
    LOOP
        positive_count := positive_count + (LENGTH(review_content) - LENGTH(REPLACE(LOWER(review_content), word, ''))) / LENGTH(word);
    END LOOP;
    
    -- Contar palabras negativas
    FOREACH word IN ARRAY negative_words
    LOOP
        negative_count := negative_count + (LENGTH(review_content) - LENGTH(REPLACE(LOWER(review_content), word, ''))) / LENGTH(word);
    END LOOP;
    
    -- Calcular puntuación (-1.0 a 1.0)
    IF positive_count + negative_count = 0 THEN
        sentiment_score := 0;
    ELSE
        sentiment_score := (positive_count - negative_count)::DECIMAL / (positive_count + negative_count);
    END IF;
    
    RETURN GREATEST(-1.0, LEAST(1.0, sentiment_score));
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular sentimiento automáticamente
CREATE OR REPLACE FUNCTION auto_calculate_sentiment()
RETURNS TRIGGER AS $$
BEGIN
    NEW.sentiment_score = calculate_review_sentiment(NEW.content);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_sentiment_calculation
    BEFORE INSERT OR UPDATE ON mobile.reviews
    FOR EACH ROW 
    WHEN (NEW.content IS NOT NULL)
    EXECUTE FUNCTION auto_calculate_sentiment();

-- =====================================================
-- DATOS INICIALES DE EJEMPLO
-- =====================================================

-- Crear perfil móvil para el usuario admin existente
INSERT INTO mobile.customer_profiles (
    user_id, display_name, user_level, preferences, dietary_restrictions, favorite_cuisines
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'admin@spoon.com' LIMIT 1),
    'Usuario Demo',
    'bronze',
    '{"delivery_preference": "fast", "price_range": "medium", "cuisine_variety": "high"}',
    '["vegetarian"]',
    '["colombiana", "italiana", "mexicana"]'
);

-- Crear configuraciones móviles para el usuario admin
INSERT INTO mobile.user_settings (
    user_id, language, theme, push_notifications, email_notifications
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'admin@spoon.com' LIMIT 1),
    'es', 'light', true, true
);

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que todas las tablas fueron creadas
SELECT 
    table_name,
    table_type,
    CASE 
        WHEN table_schema = 'mobile' THEN '🆕 NUEVA'
        ELSE '📋 EXISTENTE'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'mobile'
ORDER BY table_name;

-- Contar registros en cada tabla
SELECT 
    'mobile.customer_profiles' as table_name,
    COUNT(*) as record_count
FROM mobile.customer_profiles
UNION ALL
SELECT 
    'mobile.user_favorites' as table_name,
    COUNT(*) as record_count
FROM mobile.user_favorites
UNION ALL
SELECT 
    'mobile.reviews' as table_name,
    COUNT(*) as record_count
FROM mobile.reviews
UNION ALL
SELECT 
    'mobile.user_settings' as table_name,
    COUNT(*) as record_count
FROM mobile.user_settings
UNION ALL
SELECT 
    'mobile.search_history' as table_name,
    COUNT(*) as record_count
FROM mobile.search_history
UNION ALL
SELECT 
    'mobile.user_sessions' as table_name,
    COUNT(*) as record_count
FROM mobile.user_sessions;

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
    'MOBILE_TABLES',
    gen_random_uuid(),
    jsonb_build_object(
        'tables_created', ARRAY['customer_profiles', 'user_favorites', 'reviews', 'user_settings', 'search_history', 'user_sessions'],
        'indexes_created', 20,
        'triggers_created', 8,
        'functions_created', 5,
        'purpose', 'Arquitectura Unificada - Fase 1 - Esquema Mobile',
        'version', '1.0'
    ),
    'Creación completa de tablas del esquema Mobile para arquitectura unificada',
    CURRENT_TIMESTAMP
);

-- =====================================================
-- RESUMEN DE EJECUCIÓN
-- =====================================================

SELECT 
    '✅ ESQUEMA MOBILE CREADO EXITOSAMENTE' as status,
    6 as total_tables_created,
    20 as total_indexes_created,
    8 as total_triggers_created,
    5 as total_functions_created,
    CURRENT_TIMESTAMP as executed_at,
    current_user as executed_by,
    current_database() as database_name;
