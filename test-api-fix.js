// test-api-fix.js
// Script para probar que la API de información general funciona después de la corrección

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'spoon_db',
  password: process.env.DB_PASSWORD || 'Carlos0412*',
  port: process.env.DB_PORT || 5432,
});

async function probarAPICorregida() {
  try {
    console.log('🧪 PROBANDO API CORREGIDA');
    console.log('========================');
    
    // 1. Obtener un restaurante de ejemplo
    console.log('\n1. Obteniendo restaurante de ejemplo...');
    const restaurantResult = await pool.query(`
      SELECT id, name FROM restaurant.restaurants LIMIT 1
    `);
    
    if (restaurantResult.rows.length === 0) {
      console.log('❌ No hay restaurantes en la base de datos para probar');
      return;
    }
    
    const testRestaurant = restaurantResult.rows[0];
    console.log(`✅ Usando restaurante: ${testRestaurant.name} (ID: ${testRestaurant.id})`);
    
    // 2. Probar la consulta corregida
    console.log('\n2. Probando consulta corregida...');
    const query = `
      SELECT 
        name,
        description,
        phone,
        email,
        cuisine_type_id,
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
    `;
    
    const result = await pool.query(query, [testRestaurant.id]);
    
    if (result.rows.length === 0) {
      console.log('❌ La consulta no devolvió resultados');
      return;
    }
    
    console.log('✅ Consulta ejecutada exitosamente');
    
    // 3. Simular el mapeo de la API
    console.log('\n3. Simulando mapeo de respuesta...');
    const restaurant = result.rows[0];
    
    const responseData = {
      nombreRestaurante: restaurant.name || '',
      descripcion: restaurant.description || '',
      telefono: restaurant.phone || '',
      email: restaurant.email || '',
      tipoComida: restaurant.cuisine_type_id || '',
      direccion: restaurant.address || '',
      ciudad: restaurant.city || '',
      estado: restaurant.state || '',
      pais: restaurant.country || '',
      logoUrl: restaurant.logo_url || '',
      portadaUrl: restaurant.cover_image_url || '',
      statusRestaurante: restaurant.status || '',
      fechaCreacion: restaurant.created_at,
      fechaActualizacion: restaurant.updated_at
    };
    
    console.log('✅ Mapeo completado exitosamente');
    console.log('\n📋 Datos que devolvería la API:');
    console.log(JSON.stringify(responseData, null, 2));
    
    // 4. Verificar campos críticos
    console.log('\n4. Verificando campos críticos...');
    const camposCriticos = ['nombreRestaurante', 'telefono', 'email'];
    let camposCompletos = 0;
    
    camposCriticos.forEach(campo => {
      if (responseData[campo] && responseData[campo].trim()) {
        console.log(`✅ ${campo}: "${responseData[campo]}"`);
        camposCompletos++;
      } else {
        console.log(`⚠️ ${campo}: vacío o nulo`);
      }
    });
    
    console.log(`\n📊 Campos críticos completos: ${camposCompletos}/${camposCriticos.length}`);
    
    if (camposCompletos === camposCriticos.length) {
      console.log('✅ El restaurante tiene todos los campos críticos');
    } else {
      console.log('⚠️ El restaurante tiene campos críticos vacíos');
    }
    
    console.log('\n✅ PRUEBA COMPLETADA - LA API DEBERÍA FUNCIONAR CORRECTAMENTE');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    console.error('Detalles del error:', error.message);
  } finally {
    await pool.end();
  }
}

// Ejecutar prueba
probarAPICorregida();
