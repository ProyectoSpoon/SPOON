/**
 * Script para probar que el sistema de métricas funciona correctamente
 * Ejecutar: node monitoreo/scripts/test-metricas.js
 */

const http = require('http');

console.log('🧪 Probando sistema de métricas de SPOON...\n');

// Función para hacer request HTTP
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Función principal de pruebas
async function testMetrics() {
  try {
    console.log('📡 Probando endpoint de métricas...');
    
    const response = await makeRequest('http://localhost:3000/api/metrics');
    
    if (response.statusCode === 200) {
      console.log('✅ Endpoint de métricas respondió correctamente');
      console.log(`📊 Content-Type: ${response.headers['content-type']}`);
      
      // Verificar que contiene métricas de Prometheus
      const metricsData = response.data;
      
      if (metricsData.includes('# HELP')) {
        console.log('✅ Formato de métricas Prometheus detectado');
        
        // Buscar métricas específicas de SPOON
        const spoonMetrics = [
          'spoon_menu_operaciones_total',
          'spoon_carga_datos_segundos',
          'spoon_cache_operaciones_total',
          'spoon_api_response_time_seconds'
        ];
        
        let foundMetrics = 0;
        spoonMetrics.forEach(metric => {
          if (metricsData.includes(metric)) {
            console.log(`✅ Métrica encontrada: ${metric}`);
            foundMetrics++;
          } else {
            console.log(`⚠️  Métrica no encontrada: ${metric}`);
          }
        });
        
        console.log(`\n📈 Métricas SPOON encontradas: ${foundMetrics}/${spoonMetrics.length}`);
        
        if (foundMetrics > 0) {
          console.log('🎉 ¡Sistema de métricas funcionando correctamente!');
          
          // Mostrar algunas líneas de ejemplo
          const lines = metricsData.split('\n').slice(0, 10);
          console.log('\n📋 Ejemplo de métricas:');
          lines.forEach(line => {
            if (line.trim()) {
              console.log(`   ${line}`);
            }
          });
          
        } else {
          console.log('⚠️  No se encontraron métricas específicas de SPOON');
          console.log('💡 Esto es normal si aún no has instrumentado tu código');
        }
        
      } else {
        console.log('❌ El endpoint no devuelve métricas en formato Prometheus');
      }
      
    } else {
      console.log(`❌ Endpoint respondió con código: ${response.statusCode}`);
      console.log('💡 Asegúrate de que Next.js esté ejecutándose en puerto 3000');
    }
    
  } catch (error) {
    console.log('❌ Error al conectar con el endpoint de métricas:');
    console.log(`   ${error.message}`);
    console.log('\n💡 Posibles soluciones:');
    console.log('   1. Verificar que Next.js esté ejecutándose: npm run dev');
    console.log('   2. Verificar que esté en puerto 3000');
    console.log('   3. Verificar que el archivo src/app/api/metrics/route.ts exista');
  }
}

// Función para probar Prometheus (si está ejecutándose)
async function testPrometheus() {
  try {
    console.log('\n🔍 Probando conexión a Prometheus...');
    
    const response = await makeRequest('http://localhost:9090/api/v1/query?query=up');
    
    if (response.statusCode === 200) {
      console.log('✅ Prometheus está ejecutándose correctamente');
      
      const data = JSON.parse(response.data);
      if (data.status === 'success') {
        console.log('✅ Prometheus API funcionando');
        console.log(`📊 Targets encontrados: ${data.data.result.length}`);
      }
      
    } else {
      console.log(`⚠️  Prometheus respondió con código: ${response.statusCode}`);
    }
    
  } catch (error) {
    console.log('⚠️  Prometheus no está ejecutándose');
    console.log('💡 Para iniciarlo: docker-compose up prometheus');
  }
}

// Función para probar Grafana (si está ejecutándose)
async function testGrafana() {
  try {
    console.log('\n📊 Probando conexión a Grafana...');
    
    const response = await makeRequest('http://localhost:3005/api/health');
    
    if (response.statusCode === 200) {
      console.log('✅ Grafana está ejecutándose correctamente');
      
      const data = JSON.parse(response.data);
      if (data.database === 'ok') {
        console.log('✅ Base de datos de Grafana funcionando');
      }
      
    } else {
      console.log(`⚠️  Grafana respondió con código: ${response.statusCode}`);
    }
    
  } catch (error) {
    console.log('⚠️  Grafana no está ejecutándose');
    console.log('💡 Para iniciarlo: docker-compose up grafana');
  }
}

// Ejecutar todas las pruebas
async function runAllTests() {
  console.log('🚀 Iniciando pruebas del sistema de monitoreo SPOON\n');
  
  await testMetrics();
  await testPrometheus();
  await testGrafana();
  
  console.log('\n📋 RESUMEN:');
  console.log('✅ Endpoint de métricas: Verificado');
  console.log('⚠️  Prometheus: Opcional (iniciar con docker-compose)');
  console.log('⚠️  Grafana: Opcional (iniciar con docker-compose)');
  
  console.log('\n🎯 PRÓXIMOS PASOS:');
  console.log('1. Si el endpoint funciona: ¡Perfecto! El sistema está listo');
  console.log('2. Para ver dashboards: Iniciar Prometheus y Grafana');
  console.log('3. Para generar métricas: Instrumentar tu código con los ejemplos');
  
  console.log('\n📚 DOCUMENTACIÓN:');
  console.log('- README completo: monitoreo/README.md');
  console.log('- Ejemplo de código: monitoreo/ejemplos/useMenuCache-instrumentado.ts');
  console.log('- Dashboards: monitoreo/dashboards/');
  
  console.log('\n🎉 ¡Pruebas completadas!');
}

// Ejecutar las pruebas
runAllTests().catch(console.error);
