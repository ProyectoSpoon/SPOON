// Test final del endpoint PUT corregido
const fetch = require('node-fetch');

async function testPutFinal() {
  try {
    console.log('🧪 PROBANDO ENDPOINT PUT CORREGIDO...\n');
    
    const restaurantId = 'ce51f50f-bcd0-4329-9370-14f83b4af3d4';
    const url = `http://localhost:3001/api/restaurants/${restaurantId}/business-hours`;
    
    // Formato que envía el frontend (horarioRegular - array)
    const testData = {
      horarioRegular: [
        { dia: 0, abierto: true, horaApertura: '08:00', horaCierre: '18:00' },  // Domingo
        { dia: 1, abierto: true, horaApertura: '08:00', horaCierre: '22:00' },  // Lunes
        { dia: 2, abierto: true, horaApertura: '08:00', horaCierre: '22:00' },  // Martes
        { dia: 3, abierto: false, horaApertura: '08:00', horaCierre: '18:00' }, // Miércoles
        { dia: 4, abierto: false, horaApertura: '08:00', horaCierre: '18:00' }, // Jueves
        { dia: 5, abierto: true, horaApertura: '08:00', horaCierre: '23:00' },  // Viernes
        { dia: 6, abierto: true, horaApertura: '10:00', horaCierre: '20:00' }   // Sábado
      ]
    };
    
    console.log('📤 Enviando datos (formato horarioRegular):', JSON.stringify(testData, null, 2));
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('\n📊 RESPUESTA:');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const responseText = await response.text();
    console.log('Body:', responseText);
    
    if (!response.ok) {
      console.log('\n❌ ERROR DETECTADO');
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error JSON:', errorData);
      } catch (e) {
        console.log('Error no es JSON válido');
      }
    } else {
      console.log('\n✅ ÉXITO - El endpoint PUT funciona correctamente');
      try {
        const successData = JSON.parse(responseText);
        console.log('Respuesta exitosa:', successData);
      } catch (e) {
        console.log('Respuesta exitosa (no JSON)');
      }
    }
    
  } catch (error) {
    console.error('❌ ERROR EN TEST:', error.message);
  }
}

// También probar formato objeto (horarios)
async function testPutFormatoObjeto() {
  try {
    console.log('\n\n🧪 PROBANDO FORMATO OBJETO (horarios)...\n');
    
    const restaurantId = 'ce51f50f-bcd0-4329-9370-14f83b4af3d4';
    const url = `http://localhost:3001/api/restaurants/${restaurantId}/business-hours`;
    
    // Formato objeto (horarios)
    const testData = {
      horarios: {
        lunes: {
          abierto: true,
          turnos: [{ horaApertura: '09:00', horaCierre: '21:00' }]
        },
        martes: {
          abierto: true,
          turnos: [{ horaApertura: '09:00', horaCierre: '21:00' }]
        },
        miercoles: {
          abierto: false,
          turnos: []
        },
        jueves: {
          abierto: false,
          turnos: []
        },
        viernes: {
          abierto: true,
          turnos: [{ horaApertura: '09:00', horaCierre: '23:00' }]
        },
        sabado: {
          abierto: true,
          turnos: [{ horaApertura: '10:00', horaCierre: '22:00' }]
        },
        domingo: {
          abierto: true,
          turnos: [{ horaApertura: '10:00', horaCierre: '20:00' }]
        }
      }
    };
    
    console.log('📤 Enviando datos (formato horarios):', JSON.stringify(testData, null, 2));
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('\n📊 RESPUESTA:');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const responseText = await response.text();
    console.log('Body:', responseText);
    
    if (!response.ok) {
      console.log('\n❌ ERROR DETECTADO');
    } else {
      console.log('\n✅ ÉXITO - Ambos formatos funcionan correctamente');
    }
    
  } catch (error) {
    console.error('❌ ERROR EN TEST:', error.message);
  }
}

async function runAllTests() {
  await testPutFinal();
  await testPutFormatoObjeto();
  console.log('\n🎯 TESTS COMPLETADOS');
}

runAllTests();
