// Test del endpoint PUT que está fallando
const fetch = require('node-fetch');

async function testPutHorarios() {
  try {
    console.log('🧪 PROBANDO ENDPOINT PUT DE HORARIOS...\n');
    
    const restaurantId = 'ce51f50f-bcd0-4329-9370-14f83b4af3d4';
    const url = `http://localhost:3001/api/restaurants/${restaurantId}/business-hours`;
    
    // Datos de prueba similares a los que envía el frontend
    const testData = {
      horarios: {
        lunes: {
          abierto: true,
          turnos: [
            { horaApertura: '08:00', horaCierre: '14:00' },
            { horaApertura: '18:00', horaCierre: '22:00' }
          ]
        },
        martes: {
          abierto: true,
          turnos: [
            { horaApertura: '08:00', horaCierre: '22:00' }
          ]
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
          abierto: false,
          turnos: []
        },
        sabado: {
          abierto: false,
          turnos: []
        },
        domingo: {
          abierto: true,
          turnos: [
            { horaApertura: '08:00', horaCierre: '18:00' }
          ]
        }
      }
    };
    
    console.log('📤 Enviando datos:', JSON.stringify(testData, null, 2));
    
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
      console.log('\n✅ ÉXITO');
    }
    
  } catch (error) {
    console.error('❌ ERROR EN TEST:', error);
  }
}

testPutHorarios();
