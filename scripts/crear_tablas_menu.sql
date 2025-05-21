-- Script para crear las tablas necesarias para el módulo de Gestión del Menú
-- Base de datos: spoon (PostgreSQL)

-- 1. Tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  orden INTEGER NOT NULL DEFAULT 0,
  restaurante_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de productos (recetas)
CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  categoria_id INTEGER REFERENCES categorias(id),
  tiempo_preparacion INTEGER NOT NULL DEFAULT 0,
  imagen_url VARCHAR(255),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  restaurante_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de ingredientes
CREATE TABLE IF NOT EXISTS ingredientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  unidad_medida VARCHAR(50) NOT NULL,
  stock DECIMAL(10, 3) NOT NULL DEFAULT 0,
  precio_unitario DECIMAL(12, 2) NOT NULL DEFAULT 0,
  restaurante_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de relación producto-ingredientes
CREATE TABLE IF NOT EXISTS producto_ingredientes (
  producto_id INTEGER NOT NULL,
  ingrediente_id INTEGER NOT NULL,
  cantidad DECIMAL(10, 3) NOT NULL DEFAULT 0,
  PRIMARY KEY (producto_id, ingrediente_id),
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  FOREIGN KEY (ingrediente_id) REFERENCES ingredientes(id) ON DELETE RESTRICT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de menú del día
CREATE TABLE IF NOT EXISTS menu_dia (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  restaurante_id INTEGER NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (fecha, restaurante_id)
);

-- 6. Tabla de productos en el menú del día
CREATE TABLE IF NOT EXISTS menu_productos (
  menu_id INTEGER NOT NULL,
  producto_id INTEGER NOT NULL,
  precio_venta DECIMAL(12, 2) NOT NULL DEFAULT 0,
  disponible BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (menu_id, producto_id),
  FOREIGN KEY (menu_id) REFERENCES menu_dia(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabla de combinaciones (paquetes o menús especiales)
CREATE TABLE IF NOT EXISTS combinaciones (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  restaurante_id INTEGER NOT NULL,
  precio DECIMAL(12, 2) NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  especial BOOLEAN NOT NULL DEFAULT FALSE,
  favorito BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabla de productos en combinaciones
CREATE TABLE IF NOT EXISTS combinacion_productos (
  combinacion_id INTEGER NOT NULL,
  producto_id INTEGER NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (combinacion_id, producto_id),
  FOREIGN KEY (combinacion_id) REFERENCES combinaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Tabla de programación semanal
CREATE TABLE IF NOT EXISTS programacion_semanal (
  id SERIAL PRIMARY KEY,
  semana INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  restaurante_id INTEGER NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_por INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (semana, ano, restaurante_id)
);

-- 10. Tabla de programación diaria
CREATE TABLE IF NOT EXISTS programacion_diaria (
  programacion_id INTEGER NOT NULL,
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 1 AND 7),
  producto_id INTEGER NOT NULL,
  disponible BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (programacion_id, dia_semana, producto_id),
  FOREIGN KEY (programacion_id) REFERENCES programacion_semanal(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Tabla de programación de combinaciones
CREATE TABLE IF NOT EXISTS programacion_combinaciones (
  combinacion_id INTEGER NOT NULL,
  fecha DATE NOT NULL,
  cantidad_programada INTEGER NOT NULL DEFAULT 0,
  restaurante_id INTEGER NOT NULL,
  PRIMARY KEY (combinacion_id, fecha, restaurante_id),
  FOREIGN KEY (combinacion_id) REFERENCES combinaciones(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento de consultas comunes
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_restaurante ON productos(restaurante_id);
CREATE INDEX idx_ingredientes_restaurante ON ingredientes(restaurante_id);
CREATE INDEX idx_menu_dia_fecha ON menu_dia(fecha);
CREATE INDEX idx_menu_dia_restaurante ON menu_dia(restaurante_id);
CREATE INDEX idx_combinaciones_restaurante ON combinaciones(restaurante_id);
CREATE INDEX idx_programacion_semanal_semana_ano ON programacion_semanal(semana, ano);
