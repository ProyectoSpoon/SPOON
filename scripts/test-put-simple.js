// Test simplificado del endpoint PUT
const { Pool } = require('pg');

async function testPutSimple() {
  console.log('🧪 TEST SIMPLIFICADO DEL ENDPOINT PUT');
  
  // Configuración de la base de datos
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'spoon_db',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
  });

  try {
    const restaurantId = 'ce51f50f-bcd0-4329-9370-14f83b4af3d4';
    
    console.log('1. 🔍 Verificando estructura de datos actual...');
    const currentData = await pool.query(
      'SELECT * FROM restaurant.business_hours WHERE restaurant_id = $1 ORDER BY day_of_week',
      [restaurantId]
    );
    console.log('Datos actuales:', currentData.rows);
    
    console.log('\n2. 🧹 Limpiando datos existentes...');
    await pool.query('BEGIN');
    
    const deleteResult = await pool.query(
      'DELETE FROM restaurant.business_hours WHERE restaurant_id = $1',
      [restaurantId]
    );
    console.log('Filas eliminadas:', deleteResult.rowCount);
    
    console.log('\n3. ➕ Insertando datos de prueba...');
    
    // Insertar lunes abierto
    await pool.query(`
      INSERT INTO restaurant.business_hours 
      (restaurant_id, day_of_week, open_time, close_time, is_closed, created_at, updated_at)
      VALUES ($1, $2, $3, $4, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [restaurantId, 1, '08:00', '22:00']);
    console.log('✅ Lunes insertado');
    
    // Insertar martes cerrado
    await pool.query(`
      INSERT INTO restaurant.business_hours 
      (restaurant_id, day_of_week, is_closed, created_at, updated_at)
      VALUES ($1, $2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [restaurantId, 2]);
    console.log('✅ Martes insertado (cerrado)');
    
    await pool.query('COMMIT');
    console.log('\n4. ✅ TRANSACCIÓN COMPLETADA EXITOSAMENTE');
    
    // Verificar resultado
    const newData = await pool.query(
      'SELECT * FROM restaurant.business_hours WHERE restaurant_id = $1 ORDER BY day_of_week',
      [restaurantId]
    );
    console.log('\nDatos finales:', newData.rows);
    
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

testPutSimple();
