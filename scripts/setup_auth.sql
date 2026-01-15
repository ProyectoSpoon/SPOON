-- scripts/setup_auth.sql
-- 1. Asegurar la extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Esquema de seguridad
CREATE SCHEMA IF NOT EXISTS auth;

-- 3. Tabla de usuarios
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    email_verified BOOLEAN DEFAULT FALSE,
    role VARCHAR(50) DEFAULT 'user',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Usuario administrador (admin123)
INSERT INTO auth.users (email, password_hash, role, status)
VALUES ('admin@spoon.com', '$2b$10$6uC.S6zK8/PnxWp.J.6uO.G8m8Wn8E9E8E8E8E8E8E8E8E8E8E8E8', 'super_admin', 'active')
ON CONFLICT (email) DO NOTHING;