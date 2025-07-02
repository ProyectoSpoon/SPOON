-- Script para crear usuario de prueba para autenticación
-- Ejecutar en PostgreSQL Spoon_db

-- Insertar usuario de prueba con contraseña hasheada
DO $$
DECLARE
    admin_user_id UUID;
    hashed_password TEXT := '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrADu.Oe6yvBa6iNu/sLHPgxeUxYvO'; -- Contraseña: admin123
BEGIN
    -- Verificar si el usuario ya existe
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@spoon.com';
    
    IF admin_user_id IS NULL THEN
        -- Crear usuario administrador
        INSERT INTO auth.users (
            email,
            password_hash,
            first_name,
            last_name,
            role,
            status,
            email_verified,
            created_at,
            updated_at
        ) VALUES (
            'admin@spoon.com',
            hashed_password,
            'Admin',
            'SPOON',
            'super_admin',
            'active',
            true,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        ) RETURNING id INTO admin_user_id;
        
        RAISE NOTICE 'Usuario admin@spoon.com creado con ID: %', admin_user_id;
    ELSE
        -- Actualizar contraseña del usuario existente
        UPDATE auth.users 
        SET password_hash = hashed_password,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = admin_user_id;
        
        RAISE NOTICE 'Contraseña actualizada para usuario admin@spoon.com';
    END IF;
    
    -- Crear usuario de prueba adicional
    INSERT INTO auth.users (
        email,
        password_hash,
        first_name,
        last_name,
        role,
        status,
        email_verified,
        created_at,
        updated_at
    ) VALUES (
        'test@spoon.com',
        hashed_password, -- Misma contraseña: admin123
        'Usuario',
        'Prueba',
        'staff',
        'active',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ) ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        updated_at = CURRENT_TIMESTAMP;
    
    RAISE NOTICE 'Usuario test@spoon.com creado/actualizado';
    
    -- Verificar que los permisos existen
    INSERT INTO auth.permissions (name, description, resource, action) VALUES
    ('menu:read', 'Leer menús', 'menu', 'read'),
    ('menu:write', 'Escribir menús', 'menu', 'write'),
    ('settings:read', 'Leer configuraciones', 'settings', 'read'),
    ('settings:write', 'Escribir configuraciones', 'settings', 'write'),
    ('users:read', 'Leer usuarios', 'users', 'read'),
    ('users:write', 'Escribir usuarios', 'users', 'write'),
    ('orders:read', 'Leer órdenes', 'orders', 'read'),
    ('orders:write', 'Escribir órdenes', 'orders', 'write'),
    ('reports:read', 'Leer reportes', 'reports', 'read')
    ON CONFLICT (name) DO NOTHING;
    
    -- Asignar permisos al rol super_admin
    INSERT INTO auth.role_permissions (role, permission_id, granted_by, is_active) 
    SELECT 
        'super_admin',
        p.id,
        admin_user_id,
        true
    FROM auth.permissions p
    ON CONFLICT (role, permission_id) DO UPDATE SET
        is_active = true,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Asignar permisos básicos al rol staff
    INSERT INTO auth.role_permissions (role, permission_id, granted_by, is_active) 
    SELECT 
        'staff',
        p.id,
        admin_user_id,
        true
    FROM auth.permissions p
    WHERE p.name IN ('menu:read', 'orders:read', 'orders:write')
    ON CONFLICT (role, permission_id) DO UPDATE SET
        is_active = true,
        updated_at = CURRENT_TIMESTAMP;
    
    RAISE NOTICE 'Permisos asignados correctamente';
    
END $$;

-- Mostrar usuarios creados
SELECT 
    email,
    first_name,
    last_name,
    role,
    status,
    email_verified,
    created_at
FROM auth.users 
WHERE email IN ('admin@spoon.com', 'test@spoon.com')
ORDER BY email;

-- Mostrar permisos por rol
SELECT 
    rp.role,
    p.name as permission_name,
    p.description,
    rp.is_active
FROM auth.role_permissions rp
JOIN auth.permissions p ON rp.permission_id = p.id
WHERE rp.role IN ('super_admin', 'staff')
ORDER BY rp.role, p.name;
