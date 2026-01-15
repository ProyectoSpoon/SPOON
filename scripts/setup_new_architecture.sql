-- scripts/setup_new_architecture.sql

-- A. ESQUEMA SYSTEM
CREATE SCHEMA IF NOT EXISTS system;

CREATE TABLE IF NOT EXISTS system.cuisine_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS system.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    category_type VARCHAR(50), -- 'category', 'subcategory'
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS system.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES system.categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- B. ESQUEMA MENU
CREATE SCHEMA IF NOT EXISTS menu;

CREATE TABLE IF NOT EXISTS menu.daily_menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id),
    name VARCHAR(255),
    description TEXT,
    menu_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    created_by UUID, -- Ref a auth.users, pero FK opcional para evitar dependencias circulares complejas ahora
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu.menu_combinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    daily_menu_id UUID NOT NULL REFERENCES menu.daily_menus(id) ON DELETE CASCADE,
    entrada_id UUID, -- Fks a system.products
    principio_id UUID,
    proteina_id UUID,
    bebida_id UUID,
    name VARCHAR(255),
    description TEXT,
    base_price DECIMAL(10, 2) DEFAULT 0,
    current_quantity INTEGER DEFAULT 0
);

-- C. TABLAS FALTANTES EN RESTAURANT (Compatibilidad)
CREATE TABLE IF NOT EXISTS restaurant.menu_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id),
    daily_menu_price DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS restaurant.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id),
    product_id UUID NOT NULL REFERENCES system.products(id),
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS restaurant.business_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id),
    day_of_week INTEGER NOT NULL, -- 0-6
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT FALSE,
    is_24_hours BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS restaurant.restaurant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    role VARCHAR(50) DEFAULT 'employee',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- D. DATOS INICIALES (Seed)
-- 1. Cuisine Types
INSERT INTO system.cuisine_types (name) VALUES ('Colombiana'), ('Internacional'), ('Comida Rápida') ON CONFLICT (name) DO NOTHING;

-- 2. Categorías Básicas (IDs fijos para coincidir con el código si es necesario, o generados)
-- El código usa IDs específicos en el mapa, intentaremos usarlos si es posible, sino insertamos genéricos.
-- El código tiene: '494fbac6-59ed-42af-af24-039298ba16b6': 'entrada_id'
INSERT INTO system.categories (id, name, category_type, sort_order) VALUES
('494fbac6-59ed-42af-af24-039298ba16b6', 'Entradas', 'category', 1),
('de7f4731-3eb3-4d41-b830-d35e5125f4a3', 'Principios', 'category', 2),
('299b1ba0-0678-4e0e-ba53-90e5d95e5543', 'Proteínas', 'category', 3),
('8b0751ae-1332-409e-a710-f229be0b9758', 'Acompañamientos', 'category', 4),
('c77ffc73-b65a-4f03-adb1-810443e61799', 'Bebidas', 'category', 5)
ON CONFLICT (id) DO NOTHING;
