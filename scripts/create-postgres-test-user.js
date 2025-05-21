// Script para crear un usuario de prueba para Spoon Restaurant usando PostgreSQL
// Este script puede ejecutarse directamente desde la línea de comandos

// Importar las dependencias necesarias
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'spoon_admin',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DATABASE || 'spoon',
  password: process.env.POSTGRES_PASSWORD || 'Carlos0412*',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production'
});

// Función para ejecutar consultas a PostgreSQL
const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Error en la consulta a PostgreSQL:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Datos del usuario de prueba
const testUser = {
  email: 'test@spoonrestaurant.com',
  password: 'Test2025!',
  nombre: 'Usuario',
  apellido: 'Prueba',
  role: 'OWNER',
  permissions: ['READ_MENU', 'WRITE_MENU', 'READ_ORDERS', 'WRITE_ORDERS', 'READ_INVENTORY', 'WRITE_INVENTORY']
};

// Función para crear el usuario de prueba
async function createTestUser() {
  try {
    console.log(`Creando usuario de prueba: ${testUser.email}`);
    
    // Verificar si el usuario ya existe
    const userExists = await query('SELECT email FROM dueno_restaurante WHERE email = $1', [testUser.email]);
    
    if (userExists && userExists.rowCount && userExists.rowCount > 0) {
      console.log('\nEl usuario ya existe. Puedes usar las siguientes credenciales:');
      console.log(`Email: ${testUser.email}`);
      console.log(`Contraseña: ${testUser.password}`);
      await pool.end();
      return;
    }
    
    // Generar hash de la contraseña
    const SALT_ROUNDS = 10;
    const passwordHash = await bcrypt.hash(testUser.password, SALT_ROUNDS);
    
    // Generar UID único
    const uid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Insertar usuario en la base de datos
    await query(
      `INSERT INTO dueno_restaurante (
        uid, email, password_hash, nombre, apellido, fecha_registro, 
        ultimo_acceso, role, permissions, email_verified, 
        requires_additional_info, activo, sesiones_total
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 
        $6, $7, $8, $9, $10, $11)`,
      [
        uid, 
        testUser.email, 
        passwordHash, 
        testUser.nombre, 
        testUser.apellido, 
        testUser.role, 
        JSON.stringify(testUser.permissions),
        true, // email_verified
        false, // requires_additional_info
        true, // activo
        1 // sesiones_total
      ]
    );
    
    console.log(`Usuario creado con UID: ${uid}`);
    
    // Crear sesión inicial
    await query(
      `INSERT INTO sessions (uid, email, last_login, token, device_info)
       VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4)`,
      [
        uid, 
        testUser.email, 
        '', // Token vacío
        JSON.stringify({
          userAgent: 'Node.js Script',
          platform: 'Node.js',
          language: 'es'
        })
      ]
    );
    
    console.log('Sesión inicial creada');
    
    console.log('\n===== USUARIO DE PRUEBA CREADO =====');
    console.log(`Email: ${testUser.email}`);
    console.log(`Contraseña: ${testUser.password}`);
    console.log('=====================================\n');
    
    console.log('Puedes usar estas credenciales para iniciar sesión en la aplicación.');
    
    // Cerrar la conexión a la base de datos
    await pool.end();
    
  } catch (error) {
    console.error('Error al crear el usuario de prueba:', error);
    
    // Cerrar la conexión a la base de datos
    await pool.end();
    process.exit(1);
  }
}

// Ejecutar la función
createTestUser();
