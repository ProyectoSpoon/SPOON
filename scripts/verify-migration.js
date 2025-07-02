#!/usr/bin/env node

/**
 * Script de verificación post-migración
 * Verifica que las APIs funcionen correctamente con la nueva estructura
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ID del restaurante demo
const RESTAURANT_ID = 'd3e7dba8-ae9c-4cc4-8414-bde87b0ccf56';

// Endpoints a verificar
const endpoints = [
  { path: '/api/health', method: 'GET', description: 'Health check' },
  { path: `/api/categorias?restauranteId=${RESTAURANT_ID}`, method: 'GET', description: 'Categorías' },
  { path: `/api/productos?restauranteId=${RESTAURANT_ID}`, method: 'GET', description: 'Productos' },
  { path: '/api/menu-dia', method: 'GET', description: 'Menú del día' },
  { path: '/api/combinaciones', method: 'GET', description: 'Combinaciones' }
];

function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const options = {
      method,
      timeout: 5000
    };
    
    const req = lib.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data,
          headers: res.headers
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    req.setTimeout(5000);
    req.end();
  });
}

async function verifyEndpoint(endpoint) {
  const url = `${BASE_URL}${endpoint.path}`;
  
  try {
    console.log(`🔍 Verificando: ${endpoint.description} (${endpoint.method} ${endpoint.path})`);
    
    const response = await makeRequest(url, endpoint.method);
    
    if (response.status >= 200 && response.status < 300) {
      console.log(`✅ ${endpoint.description}: OK (${response.status})`);
      return true;
    } else {
      console.log(`❌ ${endpoint.description}: Error ${response.status}`);
      console.log(`   Response: ${response.data.substring(0, 200)}...`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${endpoint.description}: ${error.message}`);
    return false;
  }
}

async function runVerification() {
  console.log('=== VERIFICACIÓN POST-MIGRACIÓN ===\n');
  console.log(`Base URL: ${BASE_URL}\n`);
  
  let successCount = 0;
  let totalCount = endpoints.length;
  
  for (const endpoint of endpoints) {
    const success = await verifyEndpoint(endpoint);
    if (success) successCount++;
    console.log(''); // Línea en blanco
  }
  
  console.log('=== RESUMEN ===');
  console.log(`Exitosos: ${successCount}/${totalCount}`);
  console.log(`Fallidos: ${totalCount - successCount}/${totalCount}`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 ¡Todas las verificaciones pasaron exitosamente!');
    process.exit(0);
  } else {
    console.log('\n❌ Algunas verificaciones fallaron. Revisar configuración.');
    process.exit(1);
  }
}

// Ejecutar verificación si se llama directamente
if (require.main === module) {
  runVerification().catch(console.error);
}

module.exports = { verifyEndpoint, runVerification };
