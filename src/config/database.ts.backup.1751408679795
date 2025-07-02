'use client';

import { Pool } from 'pg';

// Disable native bindings to avoid the pg-native error
const pg = require('pg');
pg.defaults.ssl = false;
pg.defaults.parseInt8 = true;
delete pg.native;

// Configuración de la conexión real a PostgreSQL
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'spoon_admin',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DATABASE || 'spoon',
  password: process.env.POSTGRES_PASSWORD || 'Carlos0412*',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production'
});

// Función para ejecutar consultas reales a PostgreSQL
export const query = async (text: string, params?: any[]) => {
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

// Exportar el pool para usar en otros archivos
export default pool;
