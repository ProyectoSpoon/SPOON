-- =====================================================
-- SPOON DATABASE COMPLETE INITIALIZATION SCRIPT
-- Base de datos PostgreSQL para Sistema Operativo de Restaurantes
-- =====================================================

-- Limpiar estructura existente si es necesario
DROP SCHEMA IF EXISTS sales CASCADE;
DROP SCHEMA IF EXISTS audit CASCADE;
DROP SCHEMA IF EXISTS config CASCADE;

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. CREACIÓN DE ESQUEMAS ADICIONALES
-- =====================================================

CREATE SCHEMA IF NOT EXISTS sales;          -- Ventas y transacciones
CREATE SCHEMA IF NOT EXISTS audit;          -- Auditoría y logs
CREATE SCHEMA IF NOT EXISTS config;         -- Configuraciones del sistema

-- =====================================================
-- 2. CREACIÓN DE TIPOS ENUM
-- =====================================================

-- Tipos para autenticación
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

-- Tipos para restaurantes
CREATE TYPE price_range_enum AS ENUM ('budget', 'medium', 'expensive', 'luxury');
CREATE TYPE restaurant_status_enum AS ENUM ('active', 'inactive', 'suspended', 'pending_approval');

-- Tipos para menús
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

-- Tipos para ventas
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

-- Tipos para auditoría
CREATE TYPE log_severity_enum AS ENUM ('debug', 'info', 'warning', 'error', 'critical');
CREATE TYPE publication_action_enum AS ENUM ('publish', 'unpublish', 'update', 'schedule');

-- Tipos para configuración
CREATE TYPE setting_type_enum AS ENUM ('string', 'number', 'boolean', 'json', 'array');

-- =====================================================
-- 3. FUNCIONES AUXILIARES
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 4. NUEVAS TABLAS DEL ESQUEMA AUTH
-- =====================================================

-- Tabla: auth.users (estructura completa)
CREATE TABLE IF NOT EXISTS auth.users (
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
CREATE TABLE IF NOT EXISTS auth.user_sessions (
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

-- =====================================================
-- 5. NUEVAS TABLAS DEL ESQUEMA RESTAURANT
-- =====================================================

-- Actualizar tabla restaurants
CREATE TABLE IF NOT EXISTS restaurant.restaurants_new (
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
CREATE TABLE IF NOT EXISTS restaurant.restaurant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants_new(id) ON DELETE CASCADE,
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

-- =====================================================
-- 6. NUEVAS TABLAS DEL ESQUEMA MENU
-- =====================================================

-- Tabla: menu.categories (estructura mejorada)
CREATE TABLE IF NOT EXISTS menu.categories_new (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants_new(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    slug VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES menu.categories_new(id),
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
CREATE TABLE IF NOT EXISTS menu.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants_new(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES menu.categories_new(id),
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

-- Tabla: menu.daily_menus
CREATE TABLE IF NOT EXISTS menu.daily_menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants_new(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS menu.menu_combinations (
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

-- =====================================================
-- 7. ESQUEMA SALES (VENTAS Y TRANSACCIONES)
-- =====================================================

-- Tabla: sales.orders
CREATE TABLE sales.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants_new(id),
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

-- =====================================================
-- 8. ESQUEMA AUDIT (AUDITORÍA Y LOGS)
-- =====================================================

-- Tabla: audit.activity_logs
CREATE TABLE audit.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurant.restaurants_new(id),
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

-- =====================================================
-- 9. ESQUEMA CONFIG (CONFIGURACIONES)
-- =====================================================

-- Tabla: config.system_settings
CREATE TABLE config.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurant.restaurants_new(id),
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

-- =====================================================
-- 10. ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para autenticación y sesiones
CREATE INDEX IF NOT EXISTS idx_users_email ON auth.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_status ON auth.users(role, status);
CREATE INDEX IF NOT EXISTS idx_sessions_user_active ON auth.user_sessions(user_id, is_active);

-- Índices para restaurantes
CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON restaurant.restaurants_new(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_status ON restaurant.restaurants_new(status);

-- Índices para menús y productos
CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON menu.categories_new(restaurant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_restaurant_category ON menu.products(restaurant_id, category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON menu.products(status);

-- Índices para ventas
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_date ON sales.orders(restaurant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON sales.orders(status, payment_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON sales.order_items(order_id);

SELECT 'Estructura completa de base de datos SPOON creada exitosamente' as status;
