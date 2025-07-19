// Script de prueba para verificar las APIs del dashboard
// Ejecutar con: node test-dashboard-apis.js

console.log('🧪 PRUEBA DE APIs DEL DASHBOARD');
console.log('=====================================');

// Simular datos de prueba
const testData = {
  // Token JWT simulado (reemplazar con token real)
  token: 'tu_token_jwt_aqui',
  
  // ID del restaurante (reemplazar con ID real)
  restaurantId: '4073a4ad-b275-4e17-b197-844881f0319e'
};

async function testConfiguracionAPI() {
  console.log('\n📊 Probando: /api/configuracion/informacion-general');
  
  try {
    const response = await fetch('http://localhost:3000/api/configuracion/informacion-general', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testData.token}`
      }
    });
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Datos recibidos:');
      console.log('  - Nombre:', data.nombreRestaurante || 'N/A');
      console.log('  - Email:', data.email || 'N/A');
      console.log('  - Teléfono:', data.telefono || 'N/A');
      console.log('  - Tipo Comida:', data.tipoComida || 'N/A');
      console.log('  - Ciudad:', data.ciudad || 'N/A');
      console.log('  - Restaurant ID:', data.restaurantId || 'N/A');
      console.log('  - Es nuevo?:', data.isNewRestaurant || false);
    } else {
      const error = await response.json();
      console.log('❌ Error:', error);
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
  }
}

async function testRestaurantAPI() {
  console.log('\n📊 Probando: /api/restaurants/[id]/general-info');
  
  try {
    const response = await fetch(`http://localhost:3000/api/restaurants/${testData.restaurantId}/general-info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testData.token}`
      }
    });
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Datos recibidos:');
      console.log('  - Nombre:', data.nombreRestaurante || 'N/A');
      console.log('  - Email:', data.email || 'N/A');
      console.log('  - Teléfono:', data.telefono || 'N/A');
      console.log('  - Tipo Comida:', data.tipoComida || 'N/A');
      console.log('  - Ciudad:', data.ciudad || 'N/A');
      console.log('  - Dirección:', data.direccion || 'N/A');
    } else {
      const error = await response.json();
      console.log('❌ Error:', error);
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
  }
}

async function compareAPIs() {
  console.log('\n🔍 COMPARACIÓN DE APIs');
  console.log('=====================================');
  
  await testConfiguracionAPI();
  await testRestaurantAPI();
  
  console.log('\n📋 DIAGNÓSTICO:');
  console.log('1. Ambas APIs deberían devolver los mismos datos');
  console.log('2. La API de configuración busca por owner_id del usuario');
  console.log('3. La API de restaurante busca por ID específico del restaurante');
  console.log('4. Si hay diferencias, indica un problema de sincronización');
  
  console.log('\n🛠️ SOLUCIONES POSIBLES:');
  console.log('- Unificar la lógica de ambas APIs');
  console.log('- Asegurar que ambas usen la misma consulta SQL');
  console.log('- Verificar que el mapeo de campos sea consistente');
}

// Ejecutar pruebas
compareAPIs().catch(console.error);

console.log('\n📝 INSTRUCCIONES:');
console.log('1. Reemplaza "tu_token_jwt_aqui" con un token real');
console.log('2. Verifica que el restaurantId sea correcto');
console.log('3. Ejecuta: node test-dashboard-apis.js');
console.log('4. Compara los resultados de ambas APIs');
