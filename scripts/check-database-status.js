const { Pool } = require('pg');

// Configuración de la base de datos
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'Spoon_db',
  password: process.env.DB_PASSWORD || 'spoon',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function checkDatabaseStatus() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    // Verificar esquemas existentes
    const schemasResult = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name IN ('auth', 'restaurant', 'menu', 'sales', 'audit', 'config')
      ORDER BY schema_name;
    `);
    
    console.log('📋 Esquemas existentes:');
    schemasResult.rows.forEach(row => {
      console.log(`  - ${row.schema_name}`);
    });
    
    // Verificar tablas existentes
    const tablesResult = await pool.query(`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE schemaname IN ('auth', 'restaurant', 'menu', 'sales', 'audit', 'config')
      ORDER BY schemaname, tablename;
    `);
    
    console.log('\n📋 Tablas existentes:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.schemaname}.${row.tablename}`);
    });
    
    // Verificar tipos ENUM existentes
    const enumsResult = await pool.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e' 
      AND typname LIKE '%_enum'
      ORDER BY typname;
    `);
    
    console.log('\n📋 Tipos ENUM existentes:');
    enumsResult.rows.forEach(row => {
      console.log(`  - ${row.typname}`);
    });
    
    console.log(`\n📊 Resumen:`);
    console.log(`  - Esquemas: ${schemasResult.rows.length}`);
    console.log(`  - Tablas: ${tablesResult.rows.length}`);
    console.log(`  - Tipos ENUM: ${enumsResult.rows.length}`);
    
    // Verificar específicamente si existe la tabla menu.menus
    const menuTablesResult = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'menu'
      ORDER BY tablename;
    `);
    
    console.log('\n🍽️ Tablas del esquema menu:');
    if (menuTablesResult.rows.length === 0) {
      console.log('  ❌ No hay tablas en el esquema menu');
    } else {
      menuTablesResult.rows.forEach(row => {
        console.log(`  - menu.${row.tablename}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error al verificar el estado de la base de datos:', error.message);
  } finally {
    await pool.end();
  }
}

// Ejecutar la verificación
checkDatabaseStatus();
