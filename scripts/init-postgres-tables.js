// Script para inicializar las tablas necesarias en PostgreSQL
// Este script puede ejecutarse directamente desde la línea de comandos

// Importar las dependencias necesarias
const { Pool } = require('pg');

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

// Función para inicializar las tablas
async function initTables() {
  try {
    console.log('Inicializando tablas en PostgreSQL...');
    
    // Tabla de usuarios
    await query(`
      CREATE TABLE IF NOT EXISTS dueno_restaurante (
        uid VARCHAR(50) PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(100),
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
        metodos_auth JSONB DEFAULT '["email"]',
        sesiones_total INTEGER DEFAULT 0
      )
    `);
    
    console.log('Tabla dueno_restaurante creada o ya existente');
    
    // Tabla de sesiones
    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        uid VARCHAR(50) PRIMARY KEY,
        email VARCHAR(100) NOT NULL,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_logout TIMESTAMP,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        token VARCHAR(500),
        device_info JSONB,
        FOREIGN KEY (uid) REFERENCES dueno_restaurante(uid)
      )
    `);
    
    console.log('Tabla sessions creada o ya existente');
    
    console.log('Tablas inicializadas correctamente');
    
    // Cerrar la conexión a la base de datos
    await pool.end();
    
  } catch (error) {
    console.error('Error al inicializar tablas:', error);
    
    // Cerrar la conexión a la base de datos
    await pool.end();
    process.exit(1);
  }
}

// Ejecutar la función
initTables();
