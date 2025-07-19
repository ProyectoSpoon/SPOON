// Script de diagnóstico para la API de horarios
// Fecha: 2025-07-19

const { Pool } = require('pg');

// Configuración de la base de datos
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'Spoon_db',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Mapeo de días de la semana
const DAYS_MAP = {
  0: 'domingo',
  1: 'lunes', 
  2: 'martes',
  3: 'miercoles',
  4: 'jueves',
  5: 'viernes',
  6: 'sabado'
};

async function diagnosticarHorarios() {
  let client;
  
  try {
    console.log('🔍 DIAGNÓSTICO DE HORARIOS - INICIANDO...\n');
    
    // 1. Probar conexión a la base de datos
    console.log('1. Probando conexión a PostgreSQL...');
    client = await pool.connect();
    console.log('✅ Conexión exitosa\n');
    
    // 2. Verificar datos en business_hours
    console.log('2. Consultando datos en business_hours...');
    const restaurantId = '4073a4ad-b275-4e17-b197-844881f0319e';
    
    const horariosQuery = `
      SELECT 
        restaurant_id,
        day_of_week,
        open_time,
        close_time,
        is_closed,
        created_at,
        updated_at
      FROM restaurant.business_hours 
      WHERE restaurant_id = $1
      ORDER BY day_of_week
    `;
    
    const horariosResult = await client.query(horariosQuery, [restaurantId]);
    console.log(`📊 Registros encontrados: ${horariosResult.rows.length}`);
    
    if (horariosResult.rows.length > 0) {
      console.log('\n📋 DATOS EN LA BASE DE DATOS:');
      horariosResult.rows.forEach(row => {
        const dia = DAYS_MAP[row.day_of_week];
        console.log(`   ${dia}: ${row.is_closed ? 'CERRADO' : `${row.open_time} - ${row.close_time}`}`);
      });
    } else {
      console.log('⚠️  NO HAY DATOS EN business_hours para este restaurante');
    }
    
    // 3. Simular la lógica de la API
    console.log('\n3. Simulando lógica de la API...');
    
    const horarioRegular = {
      lunes: { abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
      martes: { abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
      miercoles: { abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
      jueves: { abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
      viernes: { abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
      sabado: { abierto: true, horaApertura: "10:00", horaCierre: "16:00" },
      domingo: { abierto: false, horaApertura: "10:00", horaCierre: "16:00" }
    };
    
    // Sobrescribir con datos de la BD
    horariosResult.rows.forEach(row => {
      const dia = DAYS_MAP[row.day_of_week];
      if (dia) {
        horarioRegular[dia] = {
          abierto: !row.is_closed,
          horaApertura: row.open_time || "09:00",
          horaCierre: row.close_time || "18:00"
        };
      }
    });
    
    console.log('\n📋 HORARIO REGULAR PROCESADO:');
    Object.entries(horarioRegular).forEach(([dia, horario]) => {
      console.log(`   ${dia}: ${horario.abierto ? `${horario.horaApertura} - ${horario.horaCierre}` : 'CERRADO'}`);
    });
    
    // 4. Probar serialización JSON
    console.log('\n4. Probando serialización JSON...');
    const responseData = {
      horarioRegular,
      diasFestivos: [],
      _debug: {
        horariosEnBD: horariosResult.rows.length,
        especialesEnBD: 0,
        restaurantId: restaurantId
      }
    };
    
    const jsonString = JSON.stringify(responseData, null, 2);
    console.log(`✅ JSON serializado correctamente (${jsonString.length} caracteres)`);
    console.log('\n📄 JSON RESULTADO:');
    console.log(jsonString);
    
    // 5. Verificar índices
    console.log('\n5. Verificando índices creados...');
    const indexQuery = `
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE schemaname = 'restaurant' 
        AND tablename = 'business_hours'
        AND indexname LIKE 'idx_%'
    `;
    
    const indexResult = await client.query(indexQuery);
    console.log(`📊 Índices encontrados: ${indexResult.rows.length}`);
    indexResult.rows.forEach(row => {
      console.log(`   ✅ ${row.indexname}`);
    });
    
  } catch (error) {
    console.error('❌ ERROR EN DIAGNÓSTICO:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Ejecutar diagnóstico
diagnosticarHorarios().then(() => {
  console.log('\n🎯 DIAGNÓSTICO COMPLETADO');
  process.exit(0);
}).catch(error => {
  console.error('❌ ERROR FATAL:', error);
  process.exit(1);
});
