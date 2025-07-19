// Restaurar datos de horarios usando el endpoint PUT
const http = require('http');

async function restoreHorariosData() {
  try {
    console.log('🔧 RESTAURANDO DATOS DE HORARIOS...\n');
    
    const restaurantId = 'ce51f50f-bcd0-4329-9370-14f83b4af3d4';
    const path = `/api/restaurants/${restaurantId}/business-hours`;
    
    // Datos de prueba realistas para un restaurante
    const testData = {
      horarioRegular: [
        { dia: 0, abierto: true, horaApertura: '10:00', horaCierre: '20:00' },  // Domingo
        { dia: 1, abierto: true, horaApertura: '08:00', horaCierre: '22:00' },  // Lunes
        { dia: 2, abierto: true, horaApertura: '08:00', horaCierre: '22:00' },  // Martes
        { dia: 3, abierto: true, horaApertura: '08:00', horaCierre: '22:00' },  // Miércoles
        { dia: 4, abierto: true, horaApertura: '08:00', horaCierre: '22:00' },  // Jueves
        { dia: 5, abierto: true, horaApertura: '08:00', horaCierre: '23:00' },  // Viernes
        { dia: 6, abierto: true, horaApertura: '10:00', horaCierre: '23:00' }   // Sábado
      ]
    };
    
    console.log('📤 Enviando datos de restauración:', JSON.stringify(testData, null, 2));
    
    const postData = JSON.stringify(testData);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      console.log('\n📊 RESPUESTA:');
      console.log('Status:', res.statusCode);
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Body:', data);
        
        if (res.statusCode === 200) {
          console.log('\n✅ DATOS RESTAURADOS EXITOSAMENTE');
          
          // Ahora probar la carga
          setTimeout(() => {
            testGetAfterRestore();
          }, 1000);
        } else {
          console.log('\n❌ ERROR AL RESTAURAR DATOS');
        }
      });
    });
    
    req.on('error', (e) => {
      console.error('❌ ERROR EN PETICIÓN:', e.message);
    });
    
    req.write(postData);
    req.end();
    
  } catch (error) {
    console.error('❌ ERROR EN RESTAURACIÓN:', error.message);
  }
}

function testGetAfterRestore() {
  console.log('\n🧪 PROBANDO CARGA DESPUÉS DE RESTAURACIÓN...\n');
  
  const restaurantId = 'ce51f50f-bcd0-4329-9370-14f83b4af3d4';
  const path = `/api/restaurants/${restaurantId}/business-hours`;
  
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
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        try {
          const jsonData = JSON.parse(data);
          console.log('✅ CARGA VERIFICADA:');
          
          if (jsonData.horarios) {
            Object.keys(jsonData.horarios).forEach(dia => {
              const horario = jsonData.horarios[dia];
              if (horario.abierto && horario.turnos.length > 0) {
                console.log(`${dia}: ✅ ABIERTO ${horario.turnos[0].horaApertura}-${horario.turnos[0].horaCierre}`);
              } else {
                console.log(`${dia}: ❌ CERRADO`);
              }
            });
            
            const diasAbiertos = Object.values(jsonData.horarios).filter(h => h.abierto).length;
            console.log(`\n🎯 RESULTADO: ${diasAbiertos}/7 días con horarios configurados`);
            
            if (diasAbiertos > 0) {
              console.log('\n🎉 ¡DATOS RESTAURADOS Y CARGA FUNCIONANDO!');
            } else {
              console.log('\n❌ Los datos no se guardaron correctamente');
            }
          }
        } catch (e) {
          console.log('❌ Error al parsear respuesta:', e.message);
        }
      } else {
        console.log('❌ Error en GET:', res.statusCode);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error('❌ ERROR EN GET:', e.message);
  });
  
  req.end();
}

restoreHorariosData();
