import { Pool } from 'pg';

// Configuración optimizada de la conexión a PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'Spoon_db',
  password: process.env.DB_PASSWORD || (process.env.DB_PASSWORD_FILE ? require('fs').readFileSync(process.env.DB_PASSWORD_FILE, 'utf8').trim() : 'password'),
  port: parseInt(process.env.DB_PORT || '5432'),
  // Optimizaciones de rendimiento
  max: 50, // Aumentado de 20 a 50 conexiones máximas
  min: 5, // Mínimo de conexiones siempre activas
  idleTimeoutMillis: 60000, // Aumentado a 60 segundos
  connectionTimeoutMillis: 10000, // Aumentado a 10 segundos
  // Configuraciones adicionales de PostgreSQL para mejorar rendimiento
  options: '-c statement_timeout=30s -c lock_timeout=10s',
  application_name: 'SPOON_Restaurant_App',
});

// Función para ejecutar queries
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Función para obtener un cliente de la pool
export async function getClient() {
  return pool.connect();
}

// Función para cerrar la pool
export async function end() {
  return pool.end();
}

// Función para verificar la conexión
export async function testConnection() {
  try {
    const result = await query('SELECT NOW()');
    console.log('Database connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export default pool;
