-- scripts/setup_restaurant.sql

-- 1. Asegurar esquema restaurant
CREATE SCHEMA IF NOT EXISTS restaurant;

-- 2. Asegurar tabla restaurants
CREATE TABLE IF NOT EXISTS restaurant.restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Crear restaurante por defecto para admin@spoon.com si no tiene uno
DO $$
DECLARE
    v_user_id UUID;
    v_restaurant_id UUID;
BEGIN
    -- Obtener ID del admin
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@spoon.com';
    
    IF v_user_id IS NOT NULL THEN
        -- Verificar si ya tiene restaurante
        SELECT id INTO v_restaurant_id FROM restaurant.restaurants WHERE owner_id = v_user_id;
        
        IF v_restaurant_id IS NULL THEN
            INSERT INTO restaurant.restaurants (owner_id, name, slug, address, phone, email)
            VALUES (v_user_id, 'Spoon HQ', 'spoon-hq', 'Calle 123 # 45-67', '3001234567', 'contact@spoon.com')
            RETURNING id INTO v_restaurant_id;
            
            RAISE NOTICE 'Restaurante "Spoon HQ" creado para admin@spoon.com';
        ELSE
            RAISE NOTICE 'El usuario admin@spoon.com ya tiene un restaurante asignado.';
        END IF;
    ELSE
        RAISE NOTICE 'Usuario admin@spoon.com no encontrado.';
    END IF;
END $$;
