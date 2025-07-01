# Diseño de Base de Datos PostgreSQL para SPOON
## Sistema Operativo para Restaurantes Independientes

### Resumen Ejecutivo
Este documento presenta el diseño completo de la base de datos PostgreSQL para SPOON, basado en el análisis exhaustivo del código fuente y la lógica de negocio del sistema. El diseño está completamente normalizado (3FN), optimizado para escalabilidad y preparado para futuras expansiones del sistema.

---

## Motor de Base de Datos Recomendado

**PostgreSQL 14+** es la elección óptima por:
- **Soporte nativo para UUID** como claves primarias
- **Tipos de datos JSONB** para configuraciones flexibles
- **Triggers y constraints avanzados** para integridad de datos
- **Índices parciales y compuestos** para optimización
- **Extensiones** como pg_crypto para seguridad
- **Escalabilidad horizontal** con particionado
- **Soporte para auditoría** con triggers automáticos

---

## Esquemas de Base de Datos

```sql
-- Creación de esquemas organizacionales
CREATE SCHEMA IF NOT EXISTS auth;           -- Autenticación y usuarios
CREATE SCHEMA IF NOT EXISTS restaurant;     -- Datos del restaurante
CREATE SCHEMA IF NOT EXISTS menu;           -- Gestión de menús
CREATE SCHEMA IF NOT EXISTS sales;          -- Ventas y transacciones
CREATE SCHEMA IF NOT EXISTS audit;          -- Auditoría y logs
CREATE SCHEMA IF NOT EXISTS config;         -- Configuraciones del sistema
```

---

## Diseño Completo de Tablas

### **ESQUEMA: auth (Autenticación y Usuarios)**

#### 1. Tabla: auth.users
```sql
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

-- Enums para roles y estados
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
```

#### 2. Tabla: auth.user_sessions
```sql
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
```

#### 3. Tabla: auth.permissions
```sql
CREATE TABLE auth.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    conditions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. Tabla: auth.role_permissions
```sql
CREATE TABLE auth.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role auth_role_enum NOT NULL,
    permission_id UUID NOT NULL REFERENCES auth.permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID REFERENCES auth.users(id),
    UNIQUE(role, permission_id)
);
```

### **ESQUEMA: restaurant (Datos del Restaurante)**

#### 5. Tabla: restaurant.restaurants
```sql
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

CREATE TYPE price_range_enum AS ENUM ('budget', 'medium', 'expensive', 'luxury');
CREATE TYPE restaurant_status_enum AS ENUM ('active', 'inactive', 'suspended', 'pending_approval');
```

#### 6. Tabla: restaurant.restaurant_users
```sql
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
```

#### 7. Tabla: restaurant.business_hours
```sql
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
```

#### 8. Tabla: restaurant.special_hours
```sql
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
```

### **ESQUEMA: menu (Gestión de Menús)**

#### 9. Tabla: menu.categories
```sql
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
```

#### 10. Tabla: menu.products
```sql
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

CREATE TYPE product_status_enum AS ENUM (
    'active',         -- Producto activo
    'inactive',       -- Producto inactivo
    'draft',          -- Borrador
    'archived',       -- Archivado
    'discontinued',   -- Descontinuado
    'out_of_stock'    -- Sin stock
);
```

#### 11. Tabla: menu.product_versions
```sql
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

CREATE TYPE version_status_enum AS ENUM ('draft', 'published', 'archived');
```

#### 12. Tabla: menu.product_price_history
```sql
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
```

#### 13. Tabla: menu.product_stock
```sql
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
```

#### 14. Tabla: menu.stock_movements
```sql
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
```

#### 15. Tabla: menu.daily_menus
```sql
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

CREATE TYPE daily_menu_status_enum AS ENUM (
    'draft',          -- Borrador
    'published',      -- Publicado
    'archived',       -- Archivado
    'cancelled'       -- Cancelado
);
```

#### 16. Tabla: menu.menu_combinations
```sql
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
```

#### 17. Tabla: menu.combination_sides
```sql
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
```

### **ESQUEMA: sales (Ventas y Transacciones)**

#### 18. Tabla: sales.orders
```sql
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
```

#### 19. Tabla: sales.order_items
```sql
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

CREATE TYPE order_item_status_enum AS ENUM ('pending', 'preparing', 'ready', 'served', 'cancelled');
```

#### 20. Tabla: sales.daily_sales_summary
```sql
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
```

### **ESQUEMA: audit (Auditoría y Logs)**

#### 21. Tabla: audit.activity_logs
```sql
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

CREATE TYPE log_severity_enum AS ENUM ('debug', 'info', 'warning', 'error', 'critical');
```

#### 22. Tabla: audit.menu_publication_logs
```sql
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

CREATE TYPE publication_action_enum AS ENUM ('publish', 'unpublish', 'update', 'schedule');
```

### **ESQUEMA: config (Configuraciones del Sistema)**

#### 23. Tabla: config.system_settings
```sql
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

CREATE TYPE setting_type_enum AS ENUM ('string', 'number', 'boolean', 'json', 'array');
```

---

## Índices Recomendados para Optimización

```sql
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
```

---

## Triggers y Constraints Recomendados

### **Triggers Automáticos**

```sql
-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar a todas las tablas con updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurant.restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para auditoría automática
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

-- Trigger para actualizar stock automáticamente
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

-- Trigger para actualizar resumen diario de ventas
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
        total_orders = daily_sales_summary.total_orders + 1,
        gross_sales = daily_sales_summary.gross_sales + NEW.total_amount,
        net_sales = daily_sales_summary.net_sales + (NEW.total_amount - NEW.tax_amount),
        updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_daily_sales 
    AFTER INSERT ON sales.orders
    FOR EACH ROW EXECUTE FUNCTION update_daily_sales_summary();
```

### **Constraints de Integridad**

```sql
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
```

---

## Vistas para Reporting y Apps Móviles

### **Vista: Menú Público para Apps Móviles**

```sql
CREATE VIEW public_menu_view AS
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
```

### **Vista: Dashboard de Ventas**

```sql
CREATE VIEW sales_dashboard_view AS
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
```

### **Vista: Productos Más Vendidos**

```sql
CREATE VIEW top_selling_products_view AS
SELECT 
    r.id as restaurant_id,
    r.name as restaurant_name,
    p.id as product_id,
    p.name as product_name,
    c.name as category_name,
    COUNT(oi.id) as times_ordered,
    SUM(oi.quantity) as total_quantity_sold,
    SUM(oi.total_price) as total_revenue,
    AVG(oi.unit_price) as average_price,
    RANK() OVER (
        PARTITION BY r.id 
        ORDER BY SUM(oi.quantity) DESC
    ) as sales_rank
FROM restaurant.restaurants r
JOIN sales.orders o ON r.id = o.restaurant_id
JOIN sales.order_items oi ON o.id = oi.order_id
JOIN menu.products p ON oi.product_id = p.id
JOIN menu.categories c ON p.category_id = c.id
WHERE 
    o.status = 'completed'
    AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY r.id, r.name, p.id, p.name, c.name
ORDER BY r.id, total_quantity_sold DESC;
```

### **Vista: Stock Crítico**

```sql
CREATE VIEW critical_stock_view AS
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
    ps.last_updated,
    -- Días de stock restante basado en consumo promedio
    CASE 
        WHEN avg_daily_consumption.daily_avg > 0 THEN
            ROUND(ps.current_quantity / avg_daily_consumption.daily_avg, 1)
        ELSE NULL
    END as days_remaining
FROM restaurant.restaurants r
JOIN menu.products p ON r.id = p.restaurant_id
JOIN menu.categories c ON p.category_id = c.id
JOIN menu.product_stock ps ON p.id = ps.product_id
LEFT JOIN (
    SELECT 
        sm.product_id,
        AVG(sm.quantity) as daily_avg
    FROM menu.stock_movements sm
    WHERE 
        sm.movement_type = 'sale'
        AND sm.created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY sm.product_id
) avg_daily_consumption ON p.id = avg_daily_consumption.product_id
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
```

---

## Migraciones Futuras Recomendadas

### **1. Sistema de Pedidos Online**

```sql
-- Tabla para clientes registrados
CREATE TABLE customers.customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    birth_date DATE,
    preferences JSONB DEFAULT '{}',
    loyalty_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para direcciones de entrega
CREATE TABLE customers.delivery_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers.customer_profiles(id),
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN DEFAULT FALSE,
    delivery_instructions TEXT
);
```

### **2. Sistema de Inventario Avanzado**

```sql
-- Tabla para proveedores
CREATE TABLE inventory.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(200),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    payment_terms JSONB DEFAULT '{}',
    rating DECIMAL(3, 2),
    is_active BOOLEAN DEFAULT TRUE
);

-- Tabla para órdenes de compra
CREATE TABLE inventory.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id),
    supplier_id UUID NOT NULL REFERENCES inventory.suppliers(id),
    order_number VARCHAR(50) NOT NULL,
    status purchase_order_status_enum DEFAULT 'draft',
    subtotal DECIMAL(10, 2),
    tax_amount DECIMAL(10, 2),
    total_amount DECIMAL(10, 2),
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    created_by UUID NOT NULL REFERENCES auth.users(id)
);
```

### **3. Sistema de Fidelización**

```sql
-- Tabla para programas de lealtad
CREATE TABLE loyalty.loyalty_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    points_per_dollar DECIMAL(5, 2) DEFAULT 1.00,
    redemption_rate DECIMAL(5, 2) DEFAULT 0.01,
    is_active BOOLEAN DEFAULT TRUE
);

-- Tabla para transacciones de puntos
CREATE TABLE loyalty.point_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers.customer_profiles(id),
    order_id UUID REFERENCES sales.orders(id),
    transaction_type point_transaction_enum NOT NULL,
    points INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### **4. Sistema de Reportes Avanzados**

```sql
-- Tabla para reportes personalizados
CREATE TABLE reports.custom_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    query_template TEXT NOT NULL,
    parameters JSONB DEFAULT '{}',
    schedule JSONB DEFAULT '{}',
    recipients JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES auth.users(id)
);
```

---

## Consideraciones de Seguridad

### **1. Encriptación de Datos Sensibles**

```sql
-- Extensión para encriptación
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Función para encriptar datos sensibles
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(
        encrypt(data::bytea, 'encryption_key', 'aes'),
        'base64'
    );
END;
$$ LANGUAGE plpgsql;
```

### **2. Row Level Security (RLS)**

```sql
-- Habilitar RLS en tablas sensibles
ALTER TABLE restaurant.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu.daily_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales.orders ENABLE ROW LEVEL SECURITY;

-- Política para acceso por restaurante
CREATE POLICY restaurant_access_policy ON restaurant.restaurants
    FOR ALL TO authenticated_users
    USING (owner_id = current_user_id() OR 
           id IN (SELECT restaurant_id FROM restaurant.restaurant_users 
                  WHERE user_id = current_user_id()));
```

### **3. Auditoría Completa**

```sql
-- Aplicar triggers de auditoría a tablas críticas
CREATE TRIGGER audit_restaurants AFTER INSERT OR UPDATE OR DELETE ON restaurant.restaurants
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_products AFTER INSERT OR UPDATE OR DELETE ON menu.products
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_orders AFTER INSERT OR UPDATE OR DELETE ON sales.orders
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

---

## Optimizaciones de Rendimiento

### **1. Particionado de Tablas**

```sql
-- Particionado por fecha para logs de auditoría
CREATE TABLE audit.activity_logs_y2024m01 PARTITION OF audit.activity_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Particionado por restaurante para órdenes
CREATE TABLE sales.orders_restaurant_1 PARTITION OF sales.orders
    FOR VALUES WITH (modulus 4, remainder 0);
```

### **2. Índices Especializados**

```sql
-- Índice GIN para búsquedas en JSONB
CREATE INDEX idx_products_tags_gin ON menu.products USING GIN (tags);
CREATE INDEX idx_orders_metadata_gin ON sales.orders USING GIN (metadata);

-- Índice para búsquedas de texto completo
CREATE INDEX idx_products_search ON menu.products 
USING GIN (to_tsvector('spanish', name || ' ' || description));
```

---

## Conclusiones y Recomendaciones

### **Fortalezas del Diseño:**

1. **Normalización Completa (3FN)** - Elimina redundancia y asegura integridad
2. **Escalabilidad** - Diseño preparado para millones de registros
3. **Flexibilidad** - Uso de JSONB para configuraciones dinámicas
4. **Seguridad** - RLS, auditoría completa y encriptación
5. **Rendimiento** - Índices optimizados y particionado estratégico
6. **Trazabilidad** - Logs completos de todas las operaciones críticas

### **Próximos Pasos:**

1. **Implementar en etapas** - Comenzar con esquemas core (auth, restaurant, menu)
2. **Pruebas de carga** - Validar rendimiento con datos reales
3. **Monitoreo** - Implementar alertas para métricas críticas
4. **Backup y Recovery** - Estrategia de respaldo automatizada
5. **Documentación** - Mantener documentación actualizada del esquema

### **Métricas de Éxito:**

- **Tiempo de respuesta** < 100ms para consultas frecuentes
- **Disponibilidad** > 99.9% uptime
- **Integridad** 0% pérdida de datos críticos
- **Escalabilidad** Soporte para 1000+ restaurantes simultáneos
- **Seguridad** Cumplimiento con estándares de protección de datos

Este diseño de base de datos proporciona una base sólida y escalable para el crecimiento futuro de SPOON como el sistema operativo líder para restaurantes independientes en Latinoamérica.
