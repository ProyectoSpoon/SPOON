-- scripts/restore_integrity.sql

-- 1. Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Esquemas
CREATE SCHEMA IF NOT EXISTS system;
CREATE SCHEMA IF NOT EXISTS menu;
CREATE SCHEMA IF NOT EXISTS restaurant;

-- 3. Tablas Restaurante (con PostGIS)
CREATE TABLE IF NOT EXISTS restaurant.restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES auth.users(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    -- PostGIS
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    geom GEOGRAPHY(Point, 4326),
    --
    status VARCHAR(50) DEFAULT 'active',
    logo_url TEXT,
    cover_image_url TEXT,
    cuisine_type_id INTEGER,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Colombia',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Asegurar columna geom si la tabla ya existía
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'restaurant' AND table_name = 'restaurants' AND column_name = 'geom') THEN
        ALTER TABLE restaurant.restaurants ADD COLUMN geom GEOGRAPHY(Point, 4326);
    END IF;
END $$;

-- Índice espacial
CREATE INDEX IF NOT EXISTS idx_restaurants_geom ON restaurant.restaurants USING GIST (geom);


-- 4. Tablas System (Categorías y Productos Globales)
CREATE TABLE IF NOT EXISTS system.cuisine_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS system.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    category_type VARCHAR(50), 
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

-- 5. Tablas Menu (Menús Diarios)
CREATE TABLE IF NOT EXISTS menu.daily_menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id),
    name VARCHAR(255),
    description TEXT,
    menu_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    created_by UUID, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu.menu_combinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    daily_menu_id UUID NOT NULL REFERENCES menu.daily_menus(id) ON DELETE CASCADE,
    entrada_id UUID,
    principio_id UUID,
    proteina_id UUID,
    bebida_id UUID,
    name VARCHAR(255),
    description TEXT,
    base_price DECIMAL(10, 2) DEFAULT 0,
    current_quantity INTEGER DEFAULT 0
);

-- 6. Tablas Auxiliares Restaurante
CREATE TABLE IF NOT EXISTS restaurant.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id),
    product_id UUID NOT NULL REFERENCES system.products(id),
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS restaurant.menu_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id),
    daily_menu_price DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS restaurant.business_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurant.restaurants(id),
    day_of_week INTEGER NOT NULL,
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

-- 7. Seed Data (Mínimo Viable)
INSERT INTO system.cuisine_types (name) VALUES ('Colombiana') ON CONFLICT (name) DO NOTHING;

-- Categorías con IDs fijos (compatibilidad)
INSERT INTO system.categories (id, name, category_type, sort_order) VALUES
('494fbac6-59ed-42af-af24-039298ba16b6', 'Entradas', 'category', 1),
('de7f4731-3eb3-4d41-b830-d35e5125f4a3', 'Principios', 'category', 2),
('299b1ba0-0678-4e0e-ba53-90e5d95e5543', 'Proteínas', 'category', 3),
('8b0751ae-1332-409e-a710-f229be0b9758', 'Acompañamientos', 'category', 4),
('c77ffc73-b65a-4f03-adb1-810443e61799', 'Bebidas', 'category', 5)
ON CONFLICT (id) DO NOTHING;

-- Crear restaurante para admin si no existe
DO $$
DECLARE
    v_user_id UUID;
    v_restaurant_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@spoon.com';
    IF v_user_id IS NOT NULL THEN
        SELECT id INTO v_restaurant_id FROM restaurant.restaurants WHERE owner_id = v_user_id;
        IF v_restaurant_id IS NULL THEN
            INSERT INTO restaurant.restaurants (owner_id, name, slug, address, phone, email, status)
            VALUES (v_user_id, 'Spoon HQ', 'spoon-hq', 'Calle 123', '3001234567', 'admin@spoon.com', 'active');
        END IF;
    END IF;
END $$;
