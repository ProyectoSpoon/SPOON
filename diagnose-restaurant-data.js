// diagnose-restaurant-data.js
// Script para diagnosticar si los datos del restaurante existen en PostgreSQL

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'spoon_db',
  password: process.env.DB_PASSWORD || 'Carlos0412*',
  port: process.env.DB_PORT || 5432,
});

async function diagnosticarDatos() {
  try {
    console.log('🔍 DIAGNÓSTICO DE DATOS DEL RESTAURANTE');
    console.log('=====================================');
    
    // 1. Verificar conexión a la base de datos
    console.log('\n1. Verificando conexión a PostgreSQL...');
    await pool.query('SELECT NOW()');
    console.log('✅ Conexión exitosa a PostgreSQL');
    
    // 2. Verificar si existe el esquema restaurant
    console.log('\n2. Verificando esquema restaurant...');
    const schemaResult = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'restaurant'
    `);
    
    if (schemaResult.rows.length > 0) {
      console.log('✅ Esquema restaurant existe');
    } else {
      console.log('❌ Esquema restaurant NO existe');
      return;
    }
    
    // 3. Verificar si existe la tabla restaurants
    console.log('\n3. Verificando tabla restaurants...');
    const tableResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'restaurant' AND table_name = 'restaurants'
    `);
    
    if (tableResult.rows.length > 0) {
      console.log('✅ Tabla restaurant.restaurants existe');
    } else {
      console.log('❌ Tabla restaurant.restaurants NO existe');
      
      // Mostrar tablas disponibles
      const tablesResult = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'restaurant'
      `);
      
      console.log('📋 Tablas disponibles en esquema restaurant:');
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
      return;
    }
    
    // 4. Verificar estructura de la tabla
    console.log('\n4. Verificando estructura de la tabla...');
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'restaurant' AND table_name = 'restaurants'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Columnas de restaurant.restaurants:');
    columnsResult.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // 5. Contar registros existentes
    console.log('\n5. Contando registros existentes...');
    const countResult = await pool.query('SELECT COUNT(*) FROM restaurant.restaurants');
    const totalRestaurants = parseInt(countResult.rows[0].count);
    
    console.log(`📊 Total de restaurantes: ${totalRestaurants}`);
    
    if (totalRestaurants > 0) {
      // 6. Mostrar datos de ejemplo
      console.log('\n6. Mostrando datos de ejemplo...');
      const sampleResult = await pool.query(`
        SELECT id, name, email, phone, cuisine_type, created_at
        FROM restaurant.restaurants 
        LIMIT 3
      `);
      
      console.log('📋 Restaurantes existentes:');
      sampleResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ID: ${row.id}`);
        console.log(`      Nombre: ${row.name || 'N/A'}`);
        console.log(`      Email: ${row.email || 'N/A'}`);
        console.log(`      Teléfono: ${row.phone || 'N/A'}`);
        console.log(`      Tipo: ${row.cuisine_type || 'N/A'}`);
        console.log(`      Creado: ${row.created_at || 'N/A'}`);
        console.log('');
      });
      
      // 7. Probar consulta específica de la API
      console.log('\n7. Probando consulta de la API...');
      const firstRestaurant = sampleResult.rows[0];
      if (firstRestaurant) {
        const apiResult = await pool.query(`
          SELECT 
            name,
            description,
            phone,
            email,
            cuisine_type,
            address,
            city,
            state,
            country,
            logo_url,
            cover_image_url,
            status,
            created_at,
            updated_at
          FROM restaurant.restaurants 
          WHERE id = $1
        `, [firstRestaurant.id]);
        
        if (apiResult.rows.length > 0) {
          console.log('✅ Consulta de API funciona correctamente');
          console.log('📋 Datos devueltos por la consulta:');
          const data = apiResult.rows[0];
          Object.keys(data).forEach(key => {
            console.log(`   ${key}: ${data[key] || 'NULL'}`);
          });
        } else {
          console.log('❌ Consulta de API no devuelve datos');
        }
      }
    } else {
      console.log('ℹ️ No hay restaurantes en la base de datos');
    }
    
    console.log('\n✅ DIAGNÓSTICO COMPLETADO');
    
  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
    console.error('Detalles del error:', error.message);
  } finally {
    await pool.end();
  }
}

// Ejecutar diagnóstico
diagnosticarDatos();
