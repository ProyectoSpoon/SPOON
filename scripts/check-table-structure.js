// Script para verificar estructura de tabla business_hours
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'Spoon_db',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function checkTableStructure() {
  let client;
  
  try {
    console.log('🔍 VERIFICANDO ESTRUCTURA DE TABLA business_hours...\n');
    
    client = await pool.connect();
    
    // Verificar columnas de la tabla
    const columnsQuery = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'restaurant' 
        AND table_name = 'business_hours'
      ORDER BY ordinal_position;
    `;
    
    const result = await client.query(columnsQuery);
    
    console.log('📋 COLUMNAS EN business_hours:');
    result.rows.forEach(row => {
      console.log(`   ${row.column_name} (${row.data_type}) - ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    console.log('\n🔍 COLUMNAS QUE LA API ESTÁ BUSCANDO:');
    const expectedColumns = [
      'day_of_week',
      'open_time', 
      'close_time',
      'is_closed',
      'is_24_hours',      // ← Posible problema
      'break_start_time', // ← Posible problema  
      'break_end_time',   // ← Posible problema
      'notes'             // ← Posible problema
    ];
    
    const existingColumns = result.rows.map(row => row.column_name);
    
    expectedColumns.forEach(col => {
      const exists = existingColumns.includes(col);
      console.log(`   ${exists ? '✅' : '❌'} ${col}`);
    });
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

checkTableStructure();
