const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de la base de datos
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'Spoon_db',
  password: process.env.DB_PASSWORD || 'spoon',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function executeDatabaseStructure() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'create-complete-database-structure.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Archivo SQL leído exitosamente');
    console.log('🚀 Ejecutando script de creación de base de datos...');
    
    // Ejecutar el script SQL
    await pool.query(sqlContent);
    
    console.log('✅ Base de datos creada exitosamente');
    console.log('📊 Verificando tablas creadas...');
    
    // Verificar que las tablas se crearon
    const result = await pool.query(`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE schemaname IN ('auth', 'restaurant', 'menu', 'sales', 'audit', 'config')
      ORDER BY schemaname, tablename;
    `);
    
    console.log('📋 Tablas creadas:');
    result.rows.forEach(row => {
      console.log(`  - ${row.schemaname}.${row.tablename}`);
    });
    
    console.log(`\n🎉 Total de tablas creadas: ${result.rows.length}`);
    
  } catch (error) {
    console.error('❌ Error al ejecutar el script:', error.message);
    console.error('📝 Detalles del error:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar el script
executeDatabaseStructure();
