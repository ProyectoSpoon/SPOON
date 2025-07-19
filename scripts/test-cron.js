/**
 * Script de prueba para el cron job de limpieza de menús
 * Ejecutar con: node scripts/test-cron.js
 */

const https = require('https');
const http = require('http');

// Configuración
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET || 'test-secret-123';

console.log('🧪 PROBANDO CRON JOB DE LIMPIEZA DE MENÚS');
console.log('=====================================');
console.log(`URL: ${BASE_URL}`);
console.log(`Secret: ${CRON_SECRET ? '✅ Configurado' : '❌ No configurado'}`);
console.log('');

/**
 * Función para hacer peticiones HTTP
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
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

/**
 * Probar el estado del scheduler
 */
async function testSchedulerStatus() {
  console.log('1️⃣ Probando estado del scheduler...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/scheduler/init`);
    
    if (response.status === 200) {
      console.log('✅ Scheduler activo:', response.data.message);
      console.log('📅 Tareas configuradas:', Object.keys(response.data.tasks || {}));
    } else {
      console.log('⚠️ Respuesta inesperada:', response.status, response.data);
    }
  } catch (error) {
    console.log('❌ Error consultando scheduler:', error.message);
  }
  
  console.log('');
}

/**
 * Probar la limpieza manual
 */
async function testManualCleanup() {
  console.log('2️⃣ Probando limpieza manual...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/cron/limpiar-menus`);
    
    if (response.status === 200) {
      console.log('✅ Limpieza exitosa:', response.data.message);
      console.log('📊 Resultados:', {
        restaurantes: response.data.restaurantes || 0,
        combinaciones: response.data.combinaciones_eliminadas || 0,
        sides: response.data.sides_eliminados || 0,
        menus: response.data.menus_archivados || 0
      });
    } else {
      console.log('⚠️ Respuesta inesperada:', response.status, response.data);
    }
  } catch (error) {
    console.log('❌ Error ejecutando limpieza:', error.message);
  }
  
  console.log('');
}

/**
 * Inicializar scheduler
 */
async function testSchedulerInit() {
  console.log('3️⃣ Inicializando scheduler...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/scheduler/init`, {
      headers: { 'X-HTTP-Method-Override': 'POST' }
    });
    
    if (response.status === 200) {
      console.log('✅ Scheduler inicializado:', response.data.message);
      console.log('⏰ Programación:', response.data.schedule);
    } else {
      console.log('⚠️ Respuesta inesperada:', response.status, response.data);
    }
  } catch (error) {
    console.log('❌ Error inicializando scheduler:', error.message);
  }
  
  console.log('');
}

/**
 * Ejecutar todas las pruebas
 */
async function runTests() {
  console.log('🚀 Iniciando pruebas del cron job...\n');
  
  await testSchedulerStatus();
  await testManualCleanup();
  await testSchedulerInit();
  
  console.log('✅ PRUEBAS COMPLETADAS');
  console.log('====================');
  console.log('');
  console.log('📋 PRÓXIMOS PASOS:');
  console.log('1. Verificar que no hay errores en las pruebas');
  console.log('2. Configurar CRON_SECRET en variables de entorno');
  console.log('3. Elegir una opción de automatización:');
  console.log('   - GitHub Actions (recomendado)');
  console.log('   - Vercel Cron Jobs');
  console.log('   - Scheduler interno (ya configurado)');
  console.log('');
  console.log('🕐 El scheduler se ejecutará automáticamente a las 10:00 PM (Colombia)');
}

// Ejecutar pruebas
runTests().catch(console.error);
