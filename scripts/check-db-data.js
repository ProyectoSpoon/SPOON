// Verificar datos en la base de datos
const { Pool } = require('pg');

async function checkDatabaseData() {
  // Usar variables de entorno del docker-compose
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'spoon_db',
    password: 'postgres',
    port: 5432,
  });

  try {
    console.log('🔍 VERIFICANDO DATOS EN LA BASE DE DATOS...\n');
    
    const restaurantId = 'ce51f50f-bcd0-4329-9370-14f83b4af3d4';
    
    console.log('1. 📊 Contando registros en business_hours...');
    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM restaurant.business_hours WHERE restaurant_id = $1',
      [restaurantId]
    );
    console.log('Total de registros:', countResult.rows[0].total);
    
    console.log('\n2. 📋 Listando todos los registros...');
    const allResult = await pool.query(
      'SELECT * FROM restaurant.business_hours WHERE restaurant_id = $1 ORDER BY day_of_week',
      [restaurantId]
    );
    
    if (allResult.rows.length === 0) {
      console.log('❌ NO HAY DATOS EN LA TABLA para este restaurante');
      
      console.log('\n3. 🔍 Verificando si existen datos para otros restaurantes...');
      const otherResult = await pool.query(
        'SELECT restaurant_id, COUNT(*) as count FROM restaurant.business_hours GROUP BY restaurant_id'
      );
      
      if (otherResult.rows.length > 0) {
        console.log('📊 Datos encontrados para otros restaurantes:');
        otherResult.rows.forEach(row => {
          console.log(`- Restaurant ID: ${row.restaurant_id}, Registros: ${row.count}`);
        });
      } else {
        console.log('❌ NO HAY DATOS EN TODA LA TABLA business_hours');
      }
    } else {
      console.log('✅ DATOS ENCONTRADOS:');
      allResult.rows.forEach(row => {
        console.log(`Día ${row.day_of_week}: ${row.is_closed ? 'CERRADO' : `ABIERTO ${row.open_time}-${row.close_time}`}`);
      });
    }
    
    console.log('\n4. 🏪 Verificando si el restaurante existe...');
    const restaurantCheck = await pool.query(
      'SELECT id, name FROM restaurant.restaurants WHERE id = $1',
      [restaurantId]
    );
    
    if (restaurantCheck.rows.length > 0) {
      console.log('✅ Restaurante encontrado:', restaurantCheck.rows[0]);
    } else {
      console.log('❌ RESTAURANTE NO ENCONTRADO con ID:', restaurantId);
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    if (error.code === '28P01') {
      console.log('\n💡 SUGERENCIA: Error de autenticación. Verifica que el servidor PostgreSQL esté corriendo.');
    }
  } finally {
    await pool.end();
  }
}

checkDatabaseData();
