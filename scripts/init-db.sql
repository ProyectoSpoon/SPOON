-- Database Initialization Script for SPOON System
-- Converted to ENGLISH to match Source Code and Schema Reference
-- Schema: 'restaurant'

-- 1. Create Extensions (Public)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Create Schema (Clean Slate)
DROP SCHEMA IF EXISTS restaurant CASCADE;
CREATE SCHEMA IF NOT EXISTS restaurant;

-- 3. Define Tables (restaurant schema)

-- Table: restaurants
CREATE TABLE IF NOT EXISTS restaurant.restaurants (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    geom GEOGRAPHY(Point, 4326),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Colombia',
    slug VARCHAR(200) UNIQUE, -- Added from docs
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Spatial Index
CREATE INDEX IF NOT EXISTS idx_restaurants_geom ON restaurant.restaurants USING GIST (geom);

-- Table: categories
CREATE TABLE IF NOT EXISTS restaurant.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('category', 'subcategory')), -- 'tipo' -> 'type'
    sort_order INTEGER DEFAULT 0, -- 'orden' -> 'sort_order'
    description TEXT,
    restaurant_id VARCHAR(50) NOT NULL REFERENCES restaurant.restaurants(id),
    is_active BOOLEAN DEFAULT true, -- 'activo' -> 'is_active'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: products
CREATE TABLE IF NOT EXISTS restaurant.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL, -- 'nombre' -> 'name'
    description TEXT,
    current_price DECIMAL(10,2) DEFAULT 0, -- 'precio_actual' -> 'current_price'
    category_id UUID REFERENCES restaurant.categories(id),
    subcategory_id UUID REFERENCES restaurant.categories(id),
    image_url TEXT, -- 'imagen' -> 'image_url'
    current_version INTEGER DEFAULT 1, -- 'version_actual' -> 'current_version'
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')), -- 'estado' -> 'status'
    current_stock INTEGER DEFAULT 0, -- 'stock_actual' -> 'current_stock'
    min_stock INTEGER DEFAULT 0, -- 'stock_minimo' -> 'min_stock'
    max_stock INTEGER DEFAULT 100, -- 'stock_maximo' -> 'max_stock'
    restaurant_id VARCHAR(50) NOT NULL REFERENCES restaurant.restaurants(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255) DEFAULT 'system',
    updated_by VARCHAR(255) DEFAULT 'system'
);

-- Table: price_history ('precio_historial')
CREATE TABLE IF NOT EXISTS restaurant.price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES restaurant.products(id) ON DELETE CASCADE,
    old_price DECIMAL(10,2), -- 'precio_anterior'
    new_price DECIMAL(10,2) NOT NULL, -- 'precio_nuevo'
    reason TEXT, -- 'razon'
    effective_date TIMESTAMP DEFAULT NOW(), -- 'fecha_efectiva'
    created_by VARCHAR(255) DEFAULT 'system',
    restaurant_id VARCHAR(50) NOT NULL REFERENCES restaurant.restaurants(id)
);

-- Table: product_versions ('producto_versiones')
CREATE TABLE IF NOT EXISTS restaurant.product_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES restaurant.products(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    changes JSONB, -- 'cambios'
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255) DEFAULT 'system',
    restaurant_id VARCHAR(50) NOT NULL REFERENCES restaurant.restaurants(id)
);

-- Table: stock_updates ('stock_actualizaciones')
CREATE TABLE IF NOT EXISTS restaurant.stock_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES restaurant.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL, -- 'cantidad'
    type VARCHAR(20) NOT NULL CHECK (type IN ('increment', 'decrement', 'set')),
    reason TEXT,
    timestamp TIMESTAMP DEFAULT NOW(),
    updated_by VARCHAR(255) DEFAULT 'system',
    restaurant_id VARCHAR(50) NOT NULL REFERENCES restaurant.restaurants(id)
);

-- Table: menus
CREATE TABLE IF NOT EXISTS restaurant.menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE, -- 'fecha_inicio'
    end_date DATE, -- 'fecha_fin'
    is_active BOOLEAN DEFAULT true, -- 'activo'
    restaurant_id VARCHAR(50) NOT NULL REFERENCES restaurant.restaurants(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: menu_products
CREATE TABLE IF NOT EXISTS restaurant.menu_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_id UUID NOT NULL REFERENCES restaurant.menus(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES restaurant.products(id) ON DELETE CASCADE,
    menu_price DECIMAL(10,2), -- 'precio_menu'
    is_available BOOLEAN DEFAULT true, -- 'disponible'
    sort_order INTEGER DEFAULT 0, -- 'orden'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: combinations ('combinaciones')
CREATE TABLE IF NOT EXISTS restaurant.combinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    total_price DECIMAL(10,2) DEFAULT 0, -- 'precio_total'
    is_favorite BOOLEAN DEFAULT false, -- 'es_favorito'
    is_special BOOLEAN DEFAULT false, -- 'es_especial'
    quantity INTEGER DEFAULT 1, -- 'cantidad'
    restaurant_id VARCHAR(50) NOT NULL REFERENCES restaurant.restaurants(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: combination_products
CREATE TABLE IF NOT EXISTS restaurant.combination_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    combination_id UUID NOT NULL REFERENCES restaurant.combinations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES restaurant.products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2), -- 'precio_unitario'
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Initial Data Insertion

-- Insert Default Restaurant
INSERT INTO restaurant.restaurants (id, name, description, address, phone, email, slug) 
VALUES ('default', 'SPOON Restaurant', 'Traditional Food Restaurant', 'Main Street 123', '+57 300 123 4567', 'info@spoon.com', 'spoon-demo')
ON CONFLICT (id) DO NOTHING;

-- Insert Categories
INSERT INTO restaurant.categories (id, name, type, sort_order, description, restaurant_id) VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Starters', 'category', 1, 'Soups and starters', 'default'),
    ('c2222222-2222-2222-2222-222222222222', 'Mains', 'category', 2, 'Main courses', 'default'),
    ('c3333333-3333-3333-3333-333333333333', 'Proteins', 'category', 3, 'Meats and proteins', 'default'),
    ('c4444444-4444-4444-4444-444444444444', 'Sides', 'category', 4, 'Side dishes', 'default'),
    ('c5555555-5555-5555-5555-555555555555', 'Drinks', 'category', 5, 'Beverages', 'default')
ON CONFLICT (id) DO NOTHING;

-- Insert Subcategories
INSERT INTO restaurant.categories (id, name, type, sort_order, description, restaurant_id) VALUES
    ('d1111111-1111-1111-1111-111111111111', 'entrada', 'subcategory', 1, 'Soups and starters', 'default'),
    ('d2222222-2222-2222-2222-222222222222', 'principio', 'subcategory', 2, 'Main courses', 'default'),
    ('d3333333-3333-3333-3333-333333333333', 'proteina', 'subcategory', 3, 'Meats and proteins', 'default'),
    ('d4444444-4444-4444-4444-444444444444', 'acompanamiento', 'subcategory', 4, 'Side dishes', 'default'),
    ('d5555555-5555-5555-5555-555555555555', 'bebida', 'subcategory', 5, 'Beverages', 'default')
ON CONFLICT (id) DO NOTHING;

-- Insert Products
INSERT INTO restaurant.products (id, name, description, current_price, category_id, subcategory_id, current_stock, min_stock, max_stock, restaurant_id) VALUES
    ('f1111111-1111-1111-1111-111111111111', 'Banana Soup', 'Traditional soup with green plantain', 8500, 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 10, 5, 50, 'default'),
    ('f2222222-2222-2222-2222-222222222222', 'Ajiaco', 'Typical soup with chicken and potato', 12000, 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 15, 5, 50, 'default'),
    ('f3333333-3333-3333-3333-333333333333', 'Beans', 'Red beans with pork', 15000, 'c2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 20, 5, 100, 'default'),
    ('f4444444-4444-4444-4444-444444444444', 'Grilled Chicken', 'Grilled chicken breast with spices', 18000, 'c3333333-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', 25, 8, 100, 'default'),
    ('f5555555-5555-5555-5555-555555555555', 'White Rice', 'Steamed white rice', 5000, 'c4444444-4444-4444-4444-444444444444', 'd4444444-4444-4444-4444-444444444444', 50, 20, 200, 'default'),
    ('f6666666-6666-6666-6666-666666666666', 'Blackberry Juice', 'Fresh blackberry juice', 4000, 'c5555555-5555-5555-5555-555555555555', 'd5555555-5555-5555-5555-555555555555', 45, 15, 150, 'default')
ON CONFLICT (id) DO NOTHING;

-- 5. Triggers for updated_at

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurant.restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON restaurant.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON restaurant.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON restaurant.menus FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_combinations_updated_at BEFORE UPDATE ON restaurant.combinations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;