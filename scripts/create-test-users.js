const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Configuración de la base de datos
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Spoon_db',
  password: 'spoon',
  port: 5432,
});

async function createTestUsers() {
  const client = await pool.connect();
  
  try {
    console.log('🔐 Creando usuarios de prueba...');
    
    // Hash de la contraseña "admin123"
    const hashedPassword = await bcrypt.hash('admin123', 12);
    console.log('✅ Contraseña hasheada generada');
    
    // Crear usuario administrador
    const adminResult = await client.query(`
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
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, email
    `, [
      'admin@spoon.com',
      hashedPassword,
      'Admin',
      'SPOON',
      'super_admin',
      'active',
      true
    ]);
    
    console.log('✅ Usuario admin creado:', adminResult.rows[0]);
    
    // Crear usuario de prueba
    const testResult = await client.query(`
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
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, email
    `, [
      'test@spoon.com',
      hashedPassword,
      'Usuario',
      'Prueba',
      'staff',
      'active',
      true
    ]);
    
    console.log('✅ Usuario test creado:', testResult.rows[0]);
    
    // Crear permisos básicos
    const permissions = [
      ['menu:read', 'Leer menús', 'menu', 'read'],
      ['menu:write', 'Escribir menús', 'menu', 'write'],
      ['settings:read', 'Leer configuraciones', 'settings', 'read'],
      ['settings:write', 'Escribir configuraciones', 'settings', 'write'],
      ['users:read', 'Leer usuarios', 'users', 'read'],
      ['users:write', 'Escribir usuarios', 'users', 'write'],
      ['orders:read', 'Leer órdenes', 'orders', 'read'],
      ['orders:write', 'Escribir órdenes', 'orders', 'write'],
      ['reports:read', 'Leer reportes', 'reports', 'read']
    ];
    
    for (const [name, description, resource, action] of permissions) {
      await client.query(`
        INSERT INTO auth.permissions (name, description, resource, action)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name) DO NOTHING
      `, [name, description, resource, action]);
    }
    
    console.log('✅ Permisos creados');
    
    // Asignar todos los permisos al super_admin
    await client.query(`
      INSERT INTO auth.role_permissions (role, permission_id, granted_by)
      SELECT 
        'super_admin',
        p.id,
        $1
      FROM auth.permissions p
      ON CONFLICT (role, permission_id) DO NOTHING
    `, [adminResult.rows[0].id]);
    
    // Asignar permisos básicos al staff
    await client.query(`
      INSERT INTO auth.role_permissions (role, permission_id, granted_by)
      SELECT 
        'staff',
        p.id,
        $1
      FROM auth.permissions p
      WHERE p.name IN ('menu:read', 'orders:read', 'orders:write')
      ON CONFLICT (role, permission_id) DO NOTHING
    `, [adminResult.rows[0].id]);
    
    console.log('✅ Permisos asignados');
    
    // Mostrar usuarios creados
    const usersResult = await client.query(`
      SELECT 
        email,
        first_name,
        last_name,
        role,
        status,
        email_verified
      FROM auth.users 
      WHERE email IN ('admin@spoon.com', 'test@spoon.com')
      ORDER BY email
    `);
    
    console.log('\n📋 Usuarios creados:');
    console.table(usersResult.rows);
    
    // Mostrar permisos por rol
    const permissionsResult = await client.query(`
      SELECT 
        rp.role,
        p.name as permission_name,
        p.description
      FROM auth.role_permissions rp
      JOIN auth.permissions p ON rp.permission_id = p.id
      WHERE rp.role IN ('super_admin', 'staff')
      ORDER BY rp.role, p.name
    `);
    
    console.log('\n🔑 Permisos por rol:');
    console.table(permissionsResult.rows);
    
    console.log('\n🎉 ¡Usuarios de prueba creados exitosamente!');
    console.log('\n📝 Credenciales de prueba:');
    console.log('   Email: admin@spoon.com');
    console.log('   Email: test@spoon.com');
    console.log('   Contraseña: admin123');
    
  } catch (error) {
    console.error('❌ Error al crear usuarios:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar el script
createTestUsers();
