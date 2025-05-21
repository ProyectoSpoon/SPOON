-- Script de inicialización para la base de datos PostgreSQL de Spoon Restaurant

-- Creación de esquemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS restaurant;
CREATE SCHEMA IF NOT EXISTS menu;

-- Tabla: auth.dueno_restaurante
CREATE TABLE IF NOT EXISTS auth.dueno_restaurante (
    uid VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP,
    restaurante_id VARCHAR(50),
    is_2fa_enabled BOOLEAN DEFAULT FALSE,
    failed_attempts INTEGER DEFAULT 0,
    last_failed_attempt TIMESTAMP,
    requires_additional_info BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    role VARCHAR(20) DEFAULT 'OWNER',
    permissions JSONB,
    activo BOOLEAN DEFAULT TRUE,
    metodos_auth JSONB,
    sesiones_total INTEGER DEFAULT 0
);

-- Tabla: auth.sessions
CREATE TABLE IF NOT EXISTS auth.sessions (
    uid VARCHAR(50) REFERENCES auth.dueno_restaurante(uid),
    email VARCHAR(100) NOT NULL,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_logout TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    token VARCHAR(500) NOT NULL,
    device_info JSONB,
    PRIMARY KEY (uid, token)
);

-- Tabla: restaurant.restaurantes
CREATE TABLE IF NOT EXISTS restaurant.restaurantes (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(200),
    telefono VARCHAR(20),
    email VARCHAR(100),
    categoria VARCHAR(50),
    horario_id INTEGER,
    dueno_id VARCHAR(50) REFERENCES auth.dueno_restaurante(uid),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logotipo_url VARCHAR(255),
    configuracion JSONB,
    estado VARCHAR(20) DEFAULT 'Activo'
);

-- Tabla: restaurant.horarios
CREATE TABLE IF NOT EXISTS restaurant.horarios (
    id SERIAL PRIMARY KEY,
    restaurante_id VARCHAR(50) REFERENCES restaurant.restaurantes(id),
    dia_semana INTEGER CHECK (dia_semana BETWEEN 0 AND 6),
    hora_apertura TIME,
    hora_cierre TIME,
    es_cerrado BOOLEAN DEFAULT FALSE,
    es_especial BOOLEAN DEFAULT FALSE,
    fecha_especial DATE,
    nota VARCHAR(200)
);

-- Tabla: menu.menus
CREATE TABLE IF NOT EXISTS menu.menus (
    id VARCHAR(50) PRIMARY KEY,
    restaurante_id VARCHAR(50) REFERENCES restaurant.restaurantes(id),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    orden INTEGER DEFAULT 0,
    disponibilidad JSONB
);

-- Tabla: menu.menu_categories
CREATE TABLE IF NOT EXISTS menu.menu_categories (
    id VARCHAR(50) PRIMARY KEY,
    menu_id VARCHAR(50) REFERENCES menu.menus(id),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    imagen_url VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    orden INTEGER DEFAULT 0
);

-- Tabla: menu.menu_items
CREATE TABLE IF NOT EXISTS menu.menu_items (
    id VARCHAR(50) PRIMARY KEY,
    categoria_id VARCHAR(50) REFERENCES menu.menu_categories(id),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    precio_descuento DECIMAL(10,2),
    imagen_url VARCHAR(255),
    tiempo_preparacion INTEGER,
    calorias INTEGER,
    alergenos JSONB,
    opciones_personalizacion JSONB,
    activo BOOLEAN DEFAULT TRUE,
    destacado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    disponibilidad JSONB
);

-- Insertar datos de ejemplo: usuario administrador
INSERT INTO auth.dueno_restaurante (uid, email, password_hash, nombre, apellido, role, permissions, email_verified)
VALUES 
('admin123', 'admin@spoon-restaurant.com', 
'$2a$10$XgPGQpmqy9Yx5S5KSXL.EOZuGQA9Yx1bKrn7dLEHt3P7r3UfUz8hK', -- hash para 'admin123'
'Admin', 'Spoon', 'ADMIN', 
'["MENU_READ", "MENU_WRITE", "USERS_READ", "USERS_WRITE", "SETTINGS_READ", "SETTINGS_WRITE", "ORDERS_READ", "ORDERS_WRITE", "REPORTS_READ"]'::jsonb,
TRUE)
ON CONFLICT (uid) DO NOTHING;

-- Insertar datos de ejemplo: restaurante
INSERT INTO restaurant.restaurantes (id, nombre, direccion, telefono, email, categoria, dueno_id)
VALUES 
('rest123', 'Spoon Demo Restaurant', 'Calle Principal 123, Bogotá', 
'555-1234', 'contacto@spoon-restaurant.com', 'Internacional', 'admin123')
ON CONFLICT (id) DO NOTHING;

-- Insertar datos de ejemplo: horarios
INSERT INTO restaurant.horarios (restaurante_id, dia_semana, hora_apertura, hora_cierre, es_cerrado)
VALUES 
('rest123', 1, '08:00', '22:00', FALSE),
('rest123', 2, '08:00', '22:00', FALSE),
('rest123', 3, '08:00', '22:00', FALSE),
('rest123', 4, '08:00', '22:00', FALSE),
('rest123', 5, '08:00', '23:00', FALSE),
('rest123', 6, '09:00', '23:00', FALSE),
('rest123', 0, '09:00', '20:00', FALSE);

-- Insertar datos de ejemplo: menú
INSERT INTO menu.menus (id, restaurante_id, nombre, descripcion)
VALUES 
('menu123', 'rest123', 'Menú Principal', 'Nuestra carta completa con todas las especialidades')
ON CONFLICT (id) DO NOTHING;

-- Insertar datos de ejemplo: categorías de menú
INSERT INTO menu.menu_categories (id, menu_id, nombre, descripcion, orden)
VALUES 
('cat1', 'menu123', 'Entradas', 'Para abrir el apetito', 1),
('cat2', 'menu123', 'Platos Principales', 'Nuestras especialidades', 2),
('cat3', 'menu123', 'Postres', 'Final dulce para tu comida', 3),
('cat4', 'menu123', 'Bebidas', 'Refrescantes opciones', 4)
ON CONFLICT (id) DO NOTHING;

-- Insertar datos de ejemplo: items de menú
INSERT INTO menu.menu_items (id, categoria_id, nombre, descripcion, precio, imagen_url)
VALUES 
('item1', 'cat1', 'Ensalada César', 'Lechuga romana, crutones, queso parmesano y aderezo césar', 15000, '/images/placeholder.jpg'),
('item2', 'cat2', 'Lomo Saltado', 'Tradicional plato peruano con carne de res, cebolla, tomate y papas fritas', 28000, '/images/placeholder.jpg'),
('item3', 'cat3', 'Flan de Caramelo', 'Suave flan con caramelo y frutas de temporada', 12000, '/images/placeholder.jpg'),
('item4', 'cat4', 'Limonada Natural', 'Refrescante limonada hecha con limones frescos', 8000, '/images/placeholder.jpg')
ON CONFLICT (id) DO NOTHING;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_restaurante_dueno ON restaurant.restaurantes(dueno_id);
CREATE INDEX IF NOT EXISTS idx_menu_restaurante ON menu.menus(restaurante_id);
CREATE INDEX IF NOT EXISTS idx_category_menu ON menu.menu_categories(menu_id);
CREATE INDEX IF NOT EXISTS idx_item_category ON menu.menu_items(categoria_id);
