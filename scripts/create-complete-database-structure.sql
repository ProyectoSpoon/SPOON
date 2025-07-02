-- ===================================================================
-- SPOON - Sistema Operativo para Restaurantes Independientes
-- Script de Creación Completa de Base de Datos PostgreSQL
-- Versión: 2.0 - Migración completa con esquemas y UUIDs
-- ===================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===================================================================
-- CREACIÓN DE ESQUEMAS ORGANIZACIONALES
-- ===================================================================

CREATE SCHEMA IF NOT EXISTS auth;           -- Autenticación y usuarios
CREATE SCHEMA IF NOT EXISTS restaurant;     -- Datos del restaurante
CREATE SCHEMA IF NOT EXISTS menu;           -- Gestión de menús
CREATE SCHEMA IF NOT EXISTS sales;          -- Ventas y transacciones
CREATE SCHEMA IF NOT EXISTS audit;          -- Auditoría y logs
CREATE SCHEMA IF NOT EXISTS config;         -- Configuraciones del sistema

-- ===================================================================
-- CREACIÓN DE TIPOS ENUM
-- ===================================================================

-- Enums para autenticación
CREATE TYPE auth_role_enum AS ENUM (
    'super_admin',    -- Administrador del sistema SPOON
    'admin',          -- Administrador del restaurante
    'owner',          -- Dueño del restaurante
    'manager',        -- Gerente del restaurante
    'staff',          -- Personal del restaurante
    'waiter',         -- Mesero
    'kitchen',        -- Personal de cocina
    'cashier'         -- Cajero
);

CREATE TYPE user_status_enum AS ENUM (
    'active',         -- Usuario activo
    'inactive',       -- Usuario inactivo
    
    'suspended',      -- Usuario suspendido
    'pending',        -- Pendiente de verificación
    'locked'          -- Cuenta bloqueada
);

-- Enums para restaurantes
CREATE TYPE price_range_enum AS ENUM ('budget', 'medium', 'expensive', 'luxury');
CREATE TYPE restaurant_status_enum AS ENUM ('active', 'inactive', 'suspended', 'pending_approval');

-- Enums para menús
CREATE TYPE category_type_enum AS ENUM (
    'entrada',        -- CAT_001
    'principio',      -- CAT_002  
    'proteina',       -- CAT_003
    'acompanamiento', -- CAT_004
    'bebida',         -- CAT_005
    'postre',
    'aperitivo',
    'especial'
);

CREATE TYPE product_status_enum AS ENUM (
    'active',         -- Producto activo
    'inactive',       -- Producto inactivo
    'draft',          -- Borrador
    'archived',       -- Archivado
    'discontinued',   -- Descontinuado
    'out_of_stock'    -- Sin stock
);

CREATE TYPE version_status_enum AS ENUM ('draft', 'published', 'archived');

CREATE TYPE stock_movement_enum AS ENUM (
    'purchase',       -- Compra
    'sale',          -- Venta
    'adjustment',    -- Ajuste
    'waste',         -- Desperdicio
    'transfer',      -- Transferencia
    'return',        -- Devolución
    'production',    -- Producción
    'consumption'    -- Consumo
);

CREATE TYPE daily_menu_status_enum AS ENUM (
    'draft',          -- Borrador
    'published',      -- Publicado
    'archived',       -- Archivado
    'cancelled'       -- Cancelado
);

-- Enums para ventas
CREATE TYPE order_type_enum AS ENUM ('dine_in', 'takeout', 'delivery', 'pickup');
CREATE TYPE order_status_enum AS ENUM (
    'pending',        -- Pendiente
    'confirmed',      -- Confirmado
    'preparing',      -- En preparación
    'ready',          -- Listo
    'served',         -- Servido
    'completed',      -- Completado
    'cancelled'       -- Cancelado
);
CREATE TYPE payment_method_enum AS ENUM (
    'cash',           -- Efectivo
    'card',           -- Tarjeta
    'transfer',       -- Transferencia
    'digital_wallet', -- Billetera digital
    'credit'          -- Crédito
);
CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'partial', 'refunded', 'failed');
CREATE TYPE order_item_status_enum AS ENUM ('pending', 'preparing', 'ready', 'served', 'cancelled');

-- Enums para auditoría
CREATE TYPE log_severity_enum AS ENUM ('debug', 'info', 'warning', 'error', 'critical');
CREATE TYPE publication_action_enum AS ENUM ('publish', 'unpublish', 'update', 'schedule');

-- Enums para configuración
CREATE TYPE setting_type_enum AS ENUM ('string', 'number', 'boolean', 'json', 'array');

-- ===================================================================
-- ESQUEMA: auth (Autenticación y Usuarios)
-- ===================================================================

-- Tabla: auth.users
CREATE TABLE auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role auth_role_enum NOT NULL DEFAULT 'staff',
    status user_status_enum NOT NULL DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(32),
    failed_login_attempts INTEGER DEFAULT 0,
    last_failed_login TIMESTAMP WITH TIME ZONE,
    account_locked_until TIMESTAMP WITH TIME ZONE,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    preferences JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Tabla: auth.user_sessions
CREATE TABLE auth.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token VARCHAR(500) NOT NULL UNIQUE,
    refresh_token VARCHAR(500),
    device_info JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    location_info JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: auth.permissions
CREATE TABLE auth.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    conditions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: auth.role_permissions
CREATE TABLE auth.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role auth_role_enum NOT NULL,
    permission_id UUID NOT NULL REFERENCES auth.permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID REFERENCES auth.users(id),
    UNIQUE(role, permission_id)
);

-- ===================================================================
-- ESQUEMA: restaurant (Datos del Restaurante)
-- ===================================================================

-- Tabla: restaurant.restaurants
CREATE TABLE restaurant.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Colombia',
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    logo_url VARCHAR(500),
    cover_image_url VARCHAR(500),
    cuisine_type VARCHAR(100),
    price_range price_range_enum DEFAULT 'medium',
    capacity INTEGER,
    owner_id UUID NOT NULL REFERENCES auth.users(id),
    status restaurant_status_enum DEFAULT 'active',
    tax_id VARCHAR(50),
    business_license VARCHAR(100),
    health_permit VARCHAR(100),
    settings JSONB DEFAULT '{}',
    social_media JSONB DEFAULT '{}',
    delivery_settings JSONB DEFAULT '{}',
    payment_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Tabla: restaurant.restaurant_users
CREATE TABLE restaurant.restaurant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role auth_role_enum NOT NULL,
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    hired_date DATE,
    salary DECIMAL(10, 2),
    commission_rate DECIMAL(5, 2),
    schedule JSONB DEFAULT '{}',
    emergency_contact JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(restaurant_id, user_id)
);

-- Tabla: restaurant.business_hours
CREATE TABLE restaurant.business_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Domingo, 6=Sábado
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT FALSE,
    is_24_hours BOOLEAN DEFAULT FALSE,
    break_start_time TIME,
    break_end_time TIME,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, day_of_week)
);

-- Tabla: restaurant.special_hours
CREATE TABLE restaurant.special_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT FALSE,
    reason VARCHAR(200),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, date)
);

-- ===================================================================
-- ESQUEMA: menu (Gestión de Menús)
-- ===================================================================

-- Tabla: menu.categories
CREATE TABLE menu.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    slug VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES menu.categories(id),
    category_type category_type_enum NOT NULL,
    icon VARCHAR(100),
    color VARCHAR(7), -- Código hexadecimal
    image_url VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    availability_schedule JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(restaurant_id, slug)
);

-- Tabla: menu.products
CREATE TABLE menu.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES menu.categories(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    slug VARCHAR(200) NOT NULL,
    current_version INTEGER DEFAULT 1,
    base_price DECIMAL(10, 2) NOT NULL,
    current_price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2),
    profit_margin DECIMAL(5, 2),
    sku VARCHAR(100),
    barcode VARCHAR(100),
    image_url VARCHAR(500),
    gallery_images JSONB DEFAULT '[]',
    preparation_time INTEGER, -- en minutos
    cooking_instructions TEXT,
    allergens JSONB DEFAULT '[]',
    nutritional_info JSONB DEFAULT '{}',
    ingredients JSONB DEFAULT '[]',
    customization_options JSONB DEFAULT '{}',
    tags JSONB DEFAULT '[]',
    status product_status_enum DEFAULT 'active',
    is_featured BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_special BOOLEAN DEFAULT FALSE,
    is_seasonal BOOLEAN DEFAULT FALSE,
    seasonal_start DATE,
    seasonal_end DATE,
    availability_schedule JSONB DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(restaurant_id, slug)
);

-- Tabla: menu.product_versions
CREATE TABLE menu.product_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES menu.products(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    changes JSONB NOT NULL,
    change_reason TEXT,
    status version_status_enum DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(product_id, version_number)
);

-- Tabla: menu.product_price_history
CREATE TABLE menu.product_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES menu.products(id) ON DELETE CASCADE,
    old_price DECIMAL(10, 2),
    new_price DECIMAL(10, 2) NOT NULL,
    change_reason TEXT,
    effective_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expiration_date TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: menu.product_stock
CREATE TABLE menu.product_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES menu.products(id) ON DELETE CASCADE,
    current_quantity DECIMAL(10, 2) DEFAULT 0,
    reserved_quantity DECIMAL(10, 2) DEFAULT 0,
    available_quantity DECIMAL(10, 2) GENERATED ALWAYS AS (current_quantity - reserved_quantity) STORED,
    min_quantity DECIMAL(10, 2) DEFAULT 0,
    max_quantity DECIMAL(10, 2) DEFAULT 1000,
    reorder_point DECIMAL(10, 2) DEFAULT 0,
    unit_of_measure VARCHAR(20) DEFAULT 'unit',
    location VARCHAR(100),
    batch_number VARCHAR(100),
    expiration_date DATE,
    supplier_info JSONB DEFAULT '{}',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(product_id)
);

-- Tabla: menu.stock_movements
CREATE TABLE menu.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES menu.products(id) ON DELETE CASCADE,
    movement_type stock_movement_enum NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_cost DECIMAL(10, 2),
    total_cost DECIMAL(10, 2),
    reason TEXT,
    reference_number VARCHAR(100),
    supplier_id UUID,
    batch_number VARCHAR(100),
    expiration_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Tabla: menu.daily_menus
CREATE TABLE menu.daily_menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id) ON DELETE CASCADE,
    menu_date DATE NOT NULL,
    name VARCHAR(200),
    description TEXT,
    status daily_menu_status_enum DEFAULT 'draft',
    total_combinations INTEGER DEFAULT 0,
    estimated_cost DECIMAL(10, 2),
    target_profit_margin DECIMAL(5, 2),
    published_at TIMESTAMP WITH TIME ZONE,
    published_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(restaurant_id, menu_date)
);

-- Tabla: menu.menu_combinations
CREATE TABLE menu.menu_combinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_menu_id UUID NOT NULL REFERENCES menu.daily_menus(id) ON DELETE CASCADE,
    name VARCHAR(200),
    description TEXT,
    entrada_id UUID REFERENCES menu.products(id),
    principio_id UUID REFERENCES menu.products(id),
    proteina_id UUID NOT NULL REFERENCES menu.products(id),
    bebida_id UUID REFERENCES menu.products(id),
    base_price DECIMAL(10, 2) NOT NULL,
    special_price DECIMAL(10, 2),
    estimated_cost DECIMAL(10, 2),
    profit_margin DECIMAL(5, 2),
    max_daily_quantity INTEGER,
    current_quantity INTEGER DEFAULT 0,
    sold_quantity INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    availability_start TIME,
    availability_end TIME,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: menu.combination_sides
CREATE TABLE menu.combination_sides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    combination_id UUID NOT NULL REFERENCES menu.menu_combinations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES menu.products(id),
    quantity DECIMAL(10, 2) DEFAULT 1,
    is_required BOOLEAN DEFAULT FALSE,
    additional_cost DECIMAL(10, 2) DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    UNIQUE(combination_id, product_id)
);

-- ===================================================================
-- ESQUEMA: sales (Ventas y Transacciones)
-- ===================================================================

-- Tabla: sales.orders
CREATE TABLE sales.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id),
    order_number VARCHAR(50) NOT NULL,
    customer_name VARCHAR(200),
    customer_phone VARCHAR(20),
    customer_email VARCHAR(255),
    table_number VARCHAR(20),
    order_type order_type_enum NOT NULL,
    status order_status_enum DEFAULT 'pending',
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tip_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method payment_method_enum,
    payment_status payment_status_enum DEFAULT 'pending',
    payment_reference VARCHAR(100),
    notes TEXT,
    special_instructions TEXT,
    estimated_preparation_time INTEGER,
    actual_preparation_time INTEGER,
    delivery_address TEXT,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    delivery_time TIMESTAMP WITH TIME ZONE,
    served_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(restaurant_id, order_number)
);

-- Tabla: sales.order_items
CREATE TABLE sales.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES sales.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES menu.products(id),
    combination_id UUID REFERENCES menu.menu_combinations(id),
    item_name VARCHAR(200) NOT NULL,
    item_description TEXT,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    customizations JSONB DEFAULT '{}',
    special_instructions TEXT,
    status order_item_status_enum DEFAULT 'pending',
    prepared_at TIMESTAMP WITH TIME ZONE,
    served_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_product_or_combination CHECK (
        (product_id IS NOT NULL AND combination_id IS NULL) OR
        (product_id IS NULL AND combination_id IS NOT NULL)
    )
);

-- Tabla: sales.daily_sales_summary
CREATE TABLE sales.daily_sales_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id),
    sales_date DATE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_items INTEGER DEFAULT 0,
    gross_sales DECIMAL(12, 2) DEFAULT 0,
    net_sales DECIMAL(12, 2) DEFAULT 0,
    tax_collected DECIMAL(10, 2) DEFAULT 0,
    tips_collected DECIMAL(10, 2) DEFAULT 0,
    discounts_given DECIMAL(10, 2) DEFAULT 0,
    refunds_given DECIMAL(10, 2) DEFAULT 0,
    cash_sales DECIMAL(10, 2) DEFAULT 0,
    card_sales DECIMAL(10, 2) DEFAULT 0,
    digital_sales DECIMAL(10, 2) DEFAULT 0,
    average_order_value DECIMAL(10, 2) DEFAULT 0,
    peak_hour_start TIME,
    peak_hour_end TIME,
    top_selling_items JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, sales_date)
);

-- ===================================================================
-- ESQUEMA: audit (Auditoría y Logs)
-- ===================================================================

-- Tabla: audit.activity_logs
CREATE TABLE audit.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurant.restaurants(id),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    severity log_severity_enum DEFAULT 'info',
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: audit.menu_publication_logs
CREATE TABLE audit.menu_publication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id),
    daily_menu_id UUID NOT NULL REFERENCES menu.daily_menus(id),
    action publication_action_enum NOT NULL,
    published_by UUID NOT NULL REFERENCES auth.users(id),
    publication_channel VARCHAR(50),
    total_combinations INTEGER,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================================
-- ESQUEMA: config (Configuraciones del Sistema)
-- ===================================================================

-- Tabla: config.system_settings
CREATE TABLE config.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurant.restaurants(id),
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB NOT NULL,
    setting_type setting_type_enum NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    is_encrypted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(restaurant_id, setting_key)
);

-- ===================================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ===================================================================

-- Índices para autenticación y sesiones
CREATE INDEX idx_users_email ON auth.users(email);
CREATE INDEX idx_users_role_status ON auth.users(role, status);
CREATE INDEX idx_sessions_user_active ON auth.user_sessions(user_id, is_active);
CREATE INDEX idx_sessions_token ON auth.user_sessions(session_token);
CREATE INDEX idx_sessions_expires ON auth.user_sessions(expires_at);

-- Índices para restaurantes
CREATE INDEX idx_restaurants_owner ON restaurant.restaurants(owner_id);
CREATE INDEX idx_restaurants_status ON restaurant.restaurants(status);
CREATE INDEX idx_restaurants_location ON restaurant.restaurants(latitude, longitude);
CREATE INDEX idx_restaurant_users_restaurant ON restaurant.restaurant_users(restaurant_id);
CREATE INDEX idx_business_hours_restaurant ON restaurant.business_hours(restaurant_id);

-- Índices para menús y productos
CREATE INDEX idx_categories_restaurant ON menu.categories(restaurant_id, is_active);
CREATE INDEX idx_products_restaurant_category ON menu.products(restaurant_id, category_id);
CREATE INDEX idx_products_status ON menu.products(status, is_active);
CREATE INDEX idx_products_featured ON menu.products(is_featured, is_special);
CREATE INDEX idx_daily_menus_restaurant_date ON menu.daily_menus(restaurant_id, menu_date);
CREATE INDEX idx_combinations_daily_menu ON menu.menu_combinations(daily_menu_id);
CREATE INDEX idx_stock_product ON menu.product_stock(product_id);

-- Índices para ventas
CREATE INDEX idx_orders_restaurant_date ON sales.orders(restaurant_id, created_at);
CREATE INDEX idx_orders_status ON sales.orders(status, payment_status);
CREATE INDEX idx_order_items_order ON sales.order_items(order_id);
CREATE INDEX idx_daily_sales_restaurant_date ON sales.daily_sales_summary(restaurant_id, sales_date);

-- Índices para auditoría
CREATE INDEX idx_activity_logs_restaurant_date ON audit.activity_logs(restaurant_id, created_at);
CREATE INDEX idx_activity_logs_user_action ON audit.activity_logs(user_id, action);
CREATE INDEX idx_publication_logs_restaurant ON audit.menu_publication_logs(restaurant_id, created_at);

-- Índices parciales para optimización específica
CREATE INDEX idx_active_products ON menu.products(restaurant_id, category_id) 
WHERE status = 'active';

CREATE INDEX idx_published_menus ON menu.daily_menus(restaurant_id, menu_date) 
WHERE status = 'published';

CREATE INDEX idx_pending_orders ON sales.orders(restaurant_id, created_at) 
WHERE status IN ('pending', 'confirmed', 'preparing');

-- ===================================================================
-- TRIGGERS Y FUNCIONES
-- ===================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers a todas las tablas con updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurant.restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurant_users_updated_at BEFORE UPDATE ON restaurant.restaurant_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_hours_updated_at BEFORE UPDATE ON restaurant.business_hours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON menu.categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON menu.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_menus_updated_at BEFORE UPDATE ON menu.daily_menus
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_combinations_updated_at BEFORE UPDATE ON menu.menu_combinations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON sales.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_sales_summary_updated_at BEFORE UPDATE ON sales.daily_sales_summary
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON config.system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para auditoría automática
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit.activity_logs (
        user_id, action, resource_type, resource_id, 
        old_values, new_values, created_at
    ) VALUES (
        COALESCE(NEW.updated_by, NEW.created_by),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
        CURRENT_TIMESTAMP
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar stock automáticamente
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE menu.product_stock 
        SET current_quantity = current_quantity - NEW.quantity
        WHERE product_id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar resumen diario de ventas
CREATE OR REPLACE FUNCTION update_daily_sales_summary()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO sales.daily_sales_summary (
        restaurant_id, sales_date, total_orders, gross_sales, net_sales
    ) VALUES (
        NEW.restaurant_id, 
        NEW.created_at::date,
        1,
        NEW.total_amount,
        NEW.total_amount - NEW.tax_amount
    )
    ON CONFLICT (restaurant_id, sales_date) 
    DO UPDATE SET
        total_orders = sales.daily_sales_summary.total_orders + 1,
        gross_sales = sales.daily_sales_summary.gross_sales + NEW.total_amount,
        net_sales = sales.daily_sales_summary.net_sales + (NEW.total_amount - NEW.tax_amount),
        updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger para actualizar resumen diario de ventas
CREATE TRIGGER trigger_update_daily_sales 
    AFTER INSERT ON sales.orders
    FOR EACH ROW EXECUTE FUNCTION update_daily_sales_summary();

-- ===================================================================
-- CONSTRAINTS DE INTEGRIDAD
-- ===================================================================

-- Constraint para validar horarios de negocio
ALTER TABLE restaurant.business_hours 
ADD CONSTRAINT check_valid_hours 
CHECK (
    (is_closed = TRUE) OR 
    (open_time IS NOT NULL AND close_time IS NOT NULL AND open_time < close_time)
);

-- Constraint para validar precios positivos
ALTER TABLE menu.products 
ADD CONSTRAINT check_positive_prices 
CHECK (base_price > 0 AND current_price > 0);

-- Constraint para validar stock no negativo
ALTER TABLE menu.product_stock 
ADD CONSTRAINT check_non_negative_stock 
CHECK (current_quantity >= 0 AND reserved_quantity >= 0);

-- Constraint para validar fechas de menú
ALTER TABLE menu.daily_menus 
ADD CONSTRAINT check_future_menu_date 
CHECK (menu_date >= CURRENT_DATE);

-- Constraint para validar total de órdenes
ALTER TABLE sales.orders 
ADD CONSTRAINT check_positive_total 
CHECK (total_amount > 0 AND subtotal > 0);

-- ===================================================================
-- DATOS INICIALES
-- ===================================================================

-- Insertar usuario administrador inicial
INSERT INTO auth.users (
    id, email, password_hash, first_name, last_name, role, status, email_verified
) VALUES (
    gen_random_uuid(),
    'admin@spoon.com',
    '$2b$10$example_hash_here', -- Cambiar por hash real
    'Admin',
    'SPOON',
    'super_admin',
    'active',
    true
) ON CONFLICT (email) DO NOTHING;

-- Insertar restaurante por defecto
INSERT INTO restaurant.restaurants (
    id, name, slug, description, address, phone, email, owner_id, status
) VALUES (
    gen_random_uuid(),
    'SPOON Restaurant Demo',
    'spoon-demo',
    'Restaurante de demostración del sistema SPOON',
    'Calle Principal 123, Bogotá',
    '+57 300 123 4567',
    'demo@spoon.com',
    (SELECT id FROM auth.users WHERE email = 'admin@spoon.com' LIMIT 1),
    'active'
) ON CONFLICT (slug) DO NOTHING;

-- Insertar categorías iniciales
WITH restaurant_data AS (
    SELECT id as restaurant_id FROM restaurant.restaurants WHERE slug = 'spoon-demo' LIMIT 1
)
INSERT INTO menu.categories (restaurant_id, name, slug, category_type, sort_order, description) 
SELECT 
    restaurant_id,
    name,
    slug,
    category_type::category_type_enum,
    sort_order,
    description
FROM restaurant_data, (VALUES
    ('Entradas', 'entradas', 'entrada', 1, 'Sopas y entradas'),
    ('Principios', 'principios', 'principio', 2, 'Platos principales'),
    ('Proteínas', 'proteinas', 'proteina', 3, 'Carnes y proteínas'),
    ('Acompañamientos', 'acompanamientos', 'acompanamiento', 4, 'Guarniciones y acompañamientos'),
    ('Bebidas', 'bebidas', 'bebida', 5, 'Bebidas y jugos')
) AS categories(name, slug, category_type, sort_order, description)
ON CONFLICT (restaurant_id, slug) DO NOTHING;

-- Insertar productos de ejemplo
WITH restaurant_data AS (
    SELECT id as restaurant_id FROM restaurant.restaurants WHERE slug = 'spoon-demo' LIMIT 1
),
category_data AS (
    SELECT 
        c.id as category_id,
        c.category_type,
        r.restaurant_id
    FROM menu.categories c
    CROSS JOIN restaurant_data r
    WHERE c.restaurant_id = r.restaurant_id
)
INSERT INTO menu.products (
    restaurant_id, category_id, name, slug, description, base_price, current_price, status
)
SELECT 
    cd.restaurant_id,
    cd.category_id,
    p.name,
    p.slug,
    p.description,
    p.base_price,
    p.current_price,
    'active'::product_status_enum
FROM category_data cd
JOIN (VALUES
    ('entrada', 'Sopa de Guineo', 'sopa-guineo', 'Sopa tradicional con plátano verde', 8500, 8500),
    ('entrada', 'Ajiaco', 'ajiaco', 'Sopa típica con tres tipos de papa, pollo y guascas', 12000, 12000),
    ('principio', 'Frijoles', 'frijoles', 'Frijoles rojos cocinados con plátano y costilla', 15000, 15000),
    ('proteina', 'Pechuga a la Plancha', 'pechuga-plancha', 'Pechuga de pollo a la plancha con especias', 18000, 18000),
    ('acompanamiento', 'Arroz Blanco', 'arroz-blanco', 'Arroz blanco cocido al vapor', 5000, 5000),
    ('bebida', 'Jugo de Mora', 'jugo-mora', 'Jugo en agua de mora', 4000, 4000)
) AS p(category_type, name, slug, description, base_price, current_price) 
ON cd.category_type = p.category_type::category_type_enum
ON CONFLICT (restaurant_id, slug) DO NOTHING;

-- Insertar stock inicial para productos
INSERT INTO menu.product_stock (product_id, current_quantity, min_quantity, max_quantity)
SELECT 
    p.id,
    CASE 
        WHEN c.category_type = 'acompanamiento' THEN 50
        WHEN c.category_type = 'bebida' THEN 45
        WHEN c.category_type = 'proteina' THEN 25
        ELSE 20
    END as current_quantity,
    CASE 
        WHEN c.category_type = 'acompanamiento' THEN 20
        WHEN c.category_type = 'bebida' THEN 15
        WHEN c.category_type = 'proteina' THEN 8
        ELSE 5
    END as min_quantity,
    CASE 
        WHEN c.category_type = 'acompanamiento' THEN 200
        WHEN c.category_type = 'bebida' THEN 150
        WHEN c.category_type = 'proteina' THEN 100
        ELSE 50
    END as max_quantity
FROM menu.products p
JOIN menu.categories c ON p.category_id = c.id
WHERE p.restaurant_id = (SELECT id FROM restaurant.restaurants WHERE slug = 'spoon-demo' LIMIT 1)
ON CONFLICT (product_id) DO NOTHING;

-- ===================================================================
-- VISTAS PARA REPORTING Y APPS MÓVILES
-- ===================================================================

-- Vista: Menú Público para Apps Móviles
CREATE OR REPLACE VIEW public_menu_view AS
SELECT 
    r.id as restaurant_id,
    r.name as restaurant_name,
    r.slug as restaurant_slug,
    dm.id as daily_menu_id,
    dm.menu_date,
    dm.name as menu_name,
    dm.description as menu_description,
    mc.id as combination_id,
    mc.name as combination_name,
    mc.description as combination_description,
    mc.base_price,
    mc.special_price,
    mc.is_available,
    mc.availability_start,
    mc.availability_end,
    -- Productos de la combinación
    pe.name as entrada_name,
    pe.description as entrada_description,
    pe.image_url as entrada_image,
    pp.name as principio_name,
    pp.description as principio_description,
    pp.image_url as principio_image,
    ppr.name as proteina_name,
    ppr.description as proteina_description,
    ppr.image_url as proteina_image,
    pb.name as bebida_name,
    pb.description as bebida_description,
    pb.image_url as bebida_image,
    -- Acompañamientos
    COALESCE(
        json_agg(
            json_build_object(
                'id', ps.id,
                'name', ps.name,
                'description', ps.description,
                'image_url', ps.image_url,
                'quantity', cs.quantity,
                'additional_cost', cs.additional_cost
            )
        ) FILTER (WHERE ps.id IS NOT NULL), 
        '[]'::json
    ) as acompañamientos
FROM restaurant.restaurants r
JOIN menu.daily_menus dm ON r.id = dm.restaurant_id
JOIN menu.menu_combinations mc ON dm.id = mc.daily_menu_id
LEFT JOIN menu.products pe ON mc.entrada_id = pe.id
LEFT JOIN menu.products pp ON mc.principio_id = pp.id
JOIN menu.products ppr ON mc.proteina_id = ppr.id
LEFT JOIN menu.products pb ON mc.bebida_id = pb.id
LEFT JOIN menu.combination_sides cs ON mc.id = cs.combination_id
LEFT JOIN menu.products ps ON cs.product_id = ps.id
WHERE 
    dm.status = 'published' 
    AND dm.menu_date = CURRENT_DATE
    AND mc.is_available = TRUE
    AND r.status = 'active'
GROUP BY 
    r.id, r.name, r.slug, dm.id, dm.menu_date, dm.name, dm.description,
    mc.id, mc.name, mc.description, mc.base_price, mc.special_price,
    mc.is_available, mc.availability_start, mc.availability_end,
    pe.name, pe.description, pe.image_url,
    pp.name, pp.description, pp.image_url,
    ppr.name, ppr.description, ppr.image_url,
    pb.name, pb.description, pb.image_url;

-- Vista: Dashboard de Ventas
CREATE OR REPLACE VIEW sales_dashboard_view AS
SELECT 
    r.id as restaurant_id,
    r.name as restaurant_name,
    dss.sales_date,
    dss.total_orders,
    dss.gross_sales,
    dss.net_sales,
    dss.average_order_value,
    dss.cash_sales,
    dss.card_sales,
    dss.digital_sales,
    -- Comparación con día anterior
    LAG(dss.gross_sales) OVER (
        PARTITION BY r.id ORDER BY dss.sales_date
    ) as previous_day_sales,
    -- Cálculo de crecimiento
    CASE 
        WHEN LAG(dss.gross_sales) OVER (
            PARTITION BY r.id ORDER BY dss.sales_date
        ) > 0 THEN
            ROUND(
                ((dss.gross_sales - LAG(dss.gross_sales) OVER (
                    PARTITION BY r.id ORDER BY dss.sales_date
                )) / LAG(dss.gross_sales) OVER (
                    PARTITION BY r.id ORDER BY dss.sales_date
                )) * 100, 2
            )
        ELSE 0
    END as growth_percentage,
    -- Promedio semanal
    AVG(dss.gross_sales) OVER (
        PARTITION BY r.id 
        ORDER BY dss.sales_date 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as weekly_average
FROM restaurant.restaurants r
JOIN sales.daily_sales_summary dss ON r.id = dss.restaurant_id
WHERE r.status = 'active'
ORDER BY r.id, dss.sales_date DESC;

-- Vista: Stock Crítico
CREATE OR REPLACE VIEW critical_stock_view AS
SELECT 
    r.id as restaurant_id,
    r.name as restaurant_name,
    p.id as product_id,
    p.name as product_name,
    c.name as category_name,
    ps.current_quantity,
    ps.min_quantity,
    ps.max_quantity,
    ps.available_quantity,
    ps.reserved_quantity,
    CASE 
        WHEN ps.current_quantity <= 0 THEN 'OUT_OF_STOCK'
        WHEN ps.current_quantity <= ps.min_quantity THEN 'LOW_STOCK'
        WHEN ps.current_quantity >= ps.max_quantity THEN 'OVERSTOCK'
        ELSE 'NORMAL'
    END as stock_status,
    ps.last_updated
FROM restaurant.restaurants r
JOIN menu.products p ON r.id = p.restaurant_id
JOIN menu.categories c ON p.category_id = c.id
JOIN menu.product_stock ps ON p.id = ps.product_id
WHERE 
    r.status = 'active'
    AND p.status = 'active'
    AND (
        ps.current_quantity <= ps.min_quantity 
        OR ps.current_quantity <= 0
        OR ps.current_quantity >= ps.max_quantity
    )
ORDER BY 
    r.id, 
    CASE 
        WHEN ps.current_quantity <= 0 THEN 1
        WHEN ps.current_quantity <= ps.min_quantity THEN 2
        ELSE 3
    END,
    ps.current_quantity ASC;

-- ===================================================================
-- FINALIZACIÓN
-- ===================================================================

COMMIT;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Base de datos SPOON creada exitosamente con esquemas: auth, restaurant, menu, sales, audit, config';
    RAISE NOTICE 'Total de tablas creadas: 23';
    RAISE NOTICE 'Total de índices creados: 15+';
    RAISE NOTICE 'Total de vistas creadas: 3';
    RAISE NOTICE 'Sistema listo para usar con datos de ejemplo';
END $$;
