/**
 * Script para verificar productos reales en system.products
 */

const { Client } = require('pg');

// Configuración de la base de datos (ajustar según tu configuración)
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'spoon_db',
  user: 'postgres',
  password: 'postgres', // Ajustar según tu configuración
});

async function checkProducts() {
  try {
    console.log('🔍 VERIFICANDO PRODUCTOS EN SYSTEM.PRODUCTS');
    console.log('============================================');
    
    await client.connect();
    console.log('✅ Conectado a la base de datos');
    
    // Obtener todos los productos activos
    const query = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.category_id,
        c.name as category_name,
        p.is_active,
        p.created_at
      FROM system.products p
      LEFT JOIN system.categories c ON p.category_id = c.id
      WHERE p.is_active = true
      ORDER BY c.name, p.name
      LIMIT 20;
    `;
    
    const result = await client.query(query);
    
    console.log(`📊 Productos encontrados: ${result.rows.length}`);
    console.log('');
    
    if (result.rows.length === 0) {
      console.log('❌ No hay productos en system.products');
      console.log('💡 Necesitas insertar productos primero');
    } else {
      console.log('📋 PRODUCTOS DISPONIBLES:');
      console.log('========================');
      
      result.rows.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   Categoría: ${product.category_name || 'Sin categoría'}`);
        console.log(`   Descripción: ${product.description || 'Sin descripción'}`);
        console.log('');
      });
    }
    
    // También verificar categorías
    const categoriesQuery = `
      SELECT id, name, category_type, sort_order
      FROM system.categories
      ORDER BY sort_order, name
    `;
    
    const categoriesResult = await client.query(categoriesQuery);
    
    console.log('📂 CATEGORÍAS DISPONIBLES:');
    console.log('==========================');
    
    categoriesResult.rows.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name} (${category.category_type})`);
      console.log(`   ID: ${category.id}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Solución: Asegúrate de que PostgreSQL esté corriendo');
    } else if (error.code === '3D000') {
      console.log('💡 Solución: La base de datos "spoon_db" no existe');
    } else if (error.code === '28P01') {
      console.log('💡 Solución: Credenciales incorrectas');
    }
  } finally {
    await client.end();
    console.log('🔌 Conexión cerrada');
  }
}

checkProducts();
