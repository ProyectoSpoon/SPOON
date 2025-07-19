/**
 * Script para verificar productos reales via API
 */

const http = require('http');

console.log('🔍 VERIFICANDO PRODUCTOS VIA API');
console.log('================================');

// Función para hacer peticiones GET
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

async function checkProductsAndCategories() {
  try {
    console.log('1️⃣ Verificando productos...');
    const productsResponse = await makeRequest('/api/productos');
    
    console.log(`📊 Status: ${productsResponse.status}`);
    
    if (productsResponse.status === 200) {
      const products = productsResponse.data.data || productsResponse.data;
      console.log(`✅ Productos encontrados: ${products.length}`);
      
      if (products.length > 0) {
        console.log('\n📋 PRIMEROS 10 PRODUCTOS:');
        console.log('========================');
        
        products.slice(0, 10).forEach((product, index) => {
          console.log(`${index + 1}. ${product.nombre || product.name}`);
          console.log(`   ID: ${product.id}`);
          console.log(`   Categoría ID: ${product.categoriaId || product.category_id}`);
          console.log(`   Precio: ${product.precio || product.price || 'N/A'}`);
          console.log('');
        });
      }
    } else {
      console.log('❌ Error al obtener productos:', productsResponse.data);
    }
    
    console.log('\n2️⃣ Verificando categorías...');
    const categoriesResponse = await makeRequest('/api/categorias');
    
    console.log(`📊 Status: ${categoriesResponse.status}`);
    
    if (categoriesResponse.status === 200) {
      const categories = categoriesResponse.data.data || categoriesResponse.data;
      console.log(`✅ Categorías encontradas: ${categories.length}`);
      
      if (categories.length > 0) {
        console.log('\n📂 CATEGORÍAS DISPONIBLES:');
        console.log('==========================');
        
        categories.forEach((category, index) => {
          console.log(`${index + 1}. ${category.nombre || category.name}`);
          console.log(`   ID: ${category.id}`);
          console.log(`   Tipo: ${category.tipo || category.category_type || 'N/A'}`);
          console.log('');
        });
      }
    } else {
      console.log('❌ Error al obtener categorías:', categoriesResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error.message);
  }
}

checkProductsAndCategories();
