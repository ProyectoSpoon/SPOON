/**
 * Script para ejecutar el archivo SQL de creación de tablas
 * usando la configuración existente de conexión a PostgreSQL
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Carga las variables de entorno si existe un archivo .env
try {
  require('dotenv').config();
} catch (e) {
  console.log('dotenv no está disponible, usando valores predeterminados');
}

// Usar la misma configuración que la aplicación
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'spoon_admin',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DATABASE || 'spoon',
  password: process.env.POSTGRES_PASSWORD || 'Carlos0412*',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production'
});

async function ejecutarScript() {
  const client = await pool.connect();
  
  try {
    console.log('Conectado a PostgreSQL. Iniciando creación de tablas...');
    
    // Leer el archivo SQL
    const sqlFilePath = path.join(__dirname, 'crear_tablas_menu.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Ejecutar el script SQL
    await client.query(sqlScript);
    
    console.log('¡Tablas creadas exitosamente!');
    
    // Datos de ejemplo para categorías
    await client.query(`
      INSERT INTO categorias (nombre, orden, restaurante_id) 
      VALUES 
        ('Entradas', 1, 1),
        ('Principios', 2, 1),
        ('Proteinas', 3, 1),
        ('Acompañamientos', 4, 1),
        ('Bebidas', 5, 1)
      ON CONFLICT DO NOTHING;
    `);
    
    console.log('Categorías iniciales creadas.');
    
  } catch (error) {
    console.error('Error durante la ejecución del script:', error);
  } finally {
    client.release();
    await pool.end();
    console.log('Conexión cerrada.');
  }
}

ejecutarScript().catch(console.error);
