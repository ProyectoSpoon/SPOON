// test-db.js - Script para verificar la base de datos
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Spoon_db',
  password: 'spoon',
  port: 5432,
});

async function testDatabase() {
  try {
    console.log('🔍 Verificando conexión a la base de datos...');
    
    // Test de conexión
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Conexión exitosa:', result.rows[0].now);
    
    // Verificar esquemas
    console.log('\n📋 Verificando esquemas...');
    const schemas = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name IN ('restaurant', 'system', 'menu', 'auth')
      ORDER BY schema_name
    `);
    console.log('Esquemas encontrados:', schemas.rows.map(r => r.schema_name));
    
    // Verificar tabla restaurants
    console.log('\n🏪 Verificando tabla restaurants...');
    const restaurants = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'restaurant' AND table_name = 'restaurants'
      ORDER BY ordinal_position
    `);
    
    if (restaurants.rows.length > 0) {
      console.log('✅ Tabla restaurant.restaurants existe:');
      restaurants.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
      });
    } else {
      console.log('❌ Tabla restaurant.restaurants NO existe');
    }
    
    // Verificar tabla business_hours
    console.log('\n🕐 Verificando tabla business_hours...');
    const businessHours = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'restaurant' AND table_name = 'business_hours'
      ORDER BY ordinal_position
    `);
    
    if (businessHours.rows.length > 0) {
      console.log('✅ Tabla restaurant.business_hours existe:');
      businessHours.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
      });
    } else {
      console.log('❌ Tabla restaurant.business_hours NO existe');
    }
    
    // Verificar datos existentes
    console.log('\n📊 Verificando datos existentes...');
    const restaurantCount = await pool.query('SELECT COUNT(*) FROM restaurant.restaurants');
    console.log(`Restaurantes en BD: ${restaurantCount.rows[0].count}`);
    
    if (parseInt(restaurantCount.rows[0].count) > 0) {
      const sampleRestaurants = await pool.query('SELECT id, name, email FROM restaurant.restaurants LIMIT 3');
      console.log('Ejemplos de restaurantes:');
      sampleRestaurants.rows.forEach(r => {
        console.log(`  - ${r.id}: ${r.name} (${r.email})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Detalles:', error);
  } finally {
    await pool.end();
  }
}

testDatabase();
