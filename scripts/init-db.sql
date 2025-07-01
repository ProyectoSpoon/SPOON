-- Inicialización de la base de datos SPOON
-- Este script crea las tablas necesarias para el sistema

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de restaurantes
CREATE TABLE IF NOT EXISTS restaurantes (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de categorías (incluye categorías y subcategorías)
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('categoria', 'subcategoria')),
    orden INTEGER DEFAULT 0,
    descripcion TEXT,
    restaurante_id VARCHAR(50) NOT NULL REFERENCES restaurantes(id),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio_actual DECIMAL(10,2) DEFAULT 0,
    categoria_id UUID REFERENCES categorias(id),
    subcategoria_id UUID REFERENCES categorias(id),
    imagen TEXT,
    version_actual INTEGER DEFAULT 1,
    estado VARCHAR(20) DEFAULT 'active' CHECK (estado IN ('active', 'inactive', 'draft')),
    stock_actual INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 0,
    stock_maximo INTEGER DEFAULT 100,
    restaurante_id VARCHAR(50) NOT NULL REFERENCES restaurantes(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255) DEFAULT 'system',
    updated_by VARCHAR(255) DEFAULT 'system'
);

-- Tabla de historial de precios
CREATE TABLE IF NOT EXISTS precio_historial (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    precio_anterior DECIMAL(10,2),
    precio_nuevo DECIMAL(10,2) NOT NULL,
    razon TEXT,
    fecha_efectiva TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255) DEFAULT 'system',
    restaurante_id VARCHAR(50) NOT NULL REFERENCES restaurantes(id)
);

-- Tabla de versiones de productos
CREATE TABLE IF NOT EXISTS producto_versiones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    cambios JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255) DEFAULT 'system',
    restaurante_id VARCHAR(50) NOT NULL REFERENCES restaurantes(id)
);

-- Tabla de actualizaciones de stock
CREATE TABLE IF NOT EXISTS stock_actualizaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('increment', 'decrement', 'set')),
    razon TEXT,
    timestamp TIMESTAMP DEFAULT NOW(),
    updated_by VARCHAR(255) DEFAULT 'system',
    restaurante_id VARCHAR(50) NOT NULL REFERENCES restaurantes(id)
);

-- Tabla de menús
CREATE TABLE IF NOT EXISTS menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    activo BOOLEAN DEFAULT true,
    restaurante_id VARCHAR(50) NOT NULL REFERENCES restaurantes(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de productos en menús
CREATE TABLE IF NOT EXISTS menu_productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    precio_menu DECIMAL(10,2),
    disponible BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de combinaciones de productos
CREATE TABLE IF NOT EXISTS combinaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio_total DECIMAL(10,2) DEFAULT 0,
    es_favorito BOOLEAN DEFAULT false,
    es_especial BOOLEAN DEFAULT false,
    cantidad INTEGER DEFAULT 1,
    restaurante_id VARCHAR(50) NOT NULL REFERENCES restaurantes(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de productos en combinaciones
CREATE TABLE IF NOT EXISTS combinacion_productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    combinacion_id UUID NOT NULL REFERENCES combinaciones(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    cantidad INTEGER DEFAULT 1,
    precio_unitario DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insertar datos iniciales

-- Insertar restaurante por defecto
INSERT INTO restaurantes (id, nombre, descripcion, direccion, telefono, email) 
VALUES ('default', 'SPOON Restaurant', 'Restaurante de comida tradicional', 'Calle Principal 123', '+57 300 123 4567', 'info@spoon.com')
ON CONFLICT (id) DO NOTHING;

-- Insertar categorías iniciales
INSERT INTO categorias (id, nombre, tipo, orden, descripcion, restaurante_id) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Entradas', 'categoria', 1, 'Sopas y entradas', 'default'),
    ('22222222-2222-2222-2222-222222222222', 'Principios', 'categoria', 2, 'Platos principales', 'default'),
    ('33333333-3333-3333-3333-333333333333', 'Proteínas', 'categoria', 3, 'Carnes y proteínas', 'default'),
    ('44444444-4444-4444-4444-444444444444', 'Acompañamientos', 'categoria', 4, 'Guarniciones y acompañamientos', 'default'),
    ('55555555-5555-5555-5555-555555555555', 'Bebidas', 'categoria', 5, 'Bebidas y jugos', 'default')
ON CONFLICT (id) DO NOTHING;

-- Insertar subcategorías
INSERT INTO categorias (id, nombre, tipo, orden, descripcion, restaurante_id) VALUES
    ('a1111111-1111-1111-1111-111111111111', 'entrada', 'subcategoria', 1, 'Sopas y entradas', 'default'),
    ('a2222222-2222-2222-2222-222222222222', 'principio', 'subcategoria', 2, 'Platos principales', 'default'),
    ('a3333333-3333-3333-3333-333333333333', 'proteina', 'subcategoria', 3, 'Carnes y proteínas', 'default'),
    ('a4444444-4444-4444-4444-444444444444', 'acompanamiento', 'subcategoria', 4, 'Guarniciones y acompañamientos', 'default'),
    ('a5555555-5555-5555-5555-555555555555', 'bebida', 'subcategoria', 5, 'Bebidas y jugos', 'default')
ON CONFLICT (id) DO NOTHING;

-- Insertar productos de ejemplo
INSERT INTO productos (id, nombre, descripcion, precio_actual, categoria_id, subcategoria_id, stock_actual, stock_minimo, stock_maximo, restaurante_id) VALUES
    ('p1111111-1111-1111-1111-111111111111', 'Sopa de Guineo', 'Sopa tradicional con plátano verde', 8500, '11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 10, 5, 50, 'default'),
    ('p2222222-2222-2222-2222-222222222222', 'Ajiaco', 'Sopa típica con tres tipos de papa, pollo y guascas', 12000, '11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 15, 5, 50, 'default'),
    ('p3333333-3333-3333-3333-333333333333', 'Frijoles', 'Frijoles rojos cocinados con plátano y costilla', 15000, '22222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 20, 5, 100, 'default'),
    ('p4444444-4444-4444-4444-444444444444', 'Pechuga a la Plancha', 'Pechuga de pollo a la plancha con especias', 18000, '33333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 25, 8, 100, 'default'),
    ('p5555555-5555-5555-5555-555555555555', 'Arroz Blanco', 'Arroz blanco cocido al vapor', 5000, '44444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 50, 20, 200, 'default'),
    ('p6666666-6666-6666-6666-666666666666', 'Jugo de Mora', 'Jugo en agua de mora', 4000, '55555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 45, 15, 150, 'default')
ON CONFLICT (id) DO NOTHING;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_restaurante ON productos(restaurante_id);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_subcategoria ON productos(subcategoria_id);
CREATE INDEX IF NOT EXISTS idx_categorias_restaurante ON categorias(restaurante_id);
CREATE INDEX IF NOT EXISTS idx_categorias_tipo ON categorias(tipo);
CREATE INDEX IF NOT EXISTS idx_precio_historial_producto ON precio_historial(producto_id);
CREATE INDEX IF NOT EXISTS idx_stock_actualizaciones_producto ON stock_actualizaciones(producto_id);

-- Crear triggers para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_restaurantes_updated_at BEFORE UPDATE ON restaurantes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON menus FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_combinaciones_updated_at BEFORE UPDATE ON combinaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
