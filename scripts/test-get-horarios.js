// Test del endpoint GET para diagnosticar la carga
const http = require('http');

async function testGetHorarios() {
  try {
    console.log('🧪 PROBANDO ENDPOINT GET DE HORARIOS...\n');
    
    const restaurantId = 'ce51f50f-bcd0-4329-9370-14f83b4af3d4';
    const path = `/api/restaurants/${restaurantId}/business-hours`;
    
    console.log('📡 Haciendo petición GET a:', `http://localhost:3001${path}`);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      console.log('\n📊 RESPUESTA:');
      console.log('Status:', res.statusCode);
      console.log('Headers:', res.headers);
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('\n📝 BODY:');
        console.log(data);
        
        if (res.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data);
            console.log('\n✅ DATOS PARSEADOS:');
            console.log(JSON.stringify(jsonData, null, 2));
            
            if (jsonData.horarios) {
              console.log('\n🎯 ESTRUCTURA DE HORARIOS:');
              Object.keys(jsonData.horarios).forEach(dia => {
                const horario = jsonData.horarios[dia];
                console.log(`${dia}: abierto=${horario.abierto}, turnos=${horario.turnos.length}`);
              });
            }
          } catch (e) {
            console.log('❌ Error al parsear JSON:', e.message);
          }
        } else {
          console.log('❌ ERROR EN RESPUESTA');
        }
      });
    });
    
    req.on('error', (e) => {
      console.error('❌ ERROR EN PETICIÓN:', e.message);
    });
    
    req.end();
    
  } catch (error) {
    console.error('❌ ERROR EN TEST:', error.message);
  }
}

testGetHorarios();
