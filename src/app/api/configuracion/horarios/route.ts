// app/api/configuracion/horarios/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuración de PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Spoon_db',
  password: 'spoon', // Cambiar por tu contraseña real
  port: 5432,
});

// ID del restaurante hardcodeado para debug
const RESTAURANT_ID = '4073a4ad-b275-4e17-b197-844881f0319e';

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

const DAYS_REVERSE_MAP = {
  'domingo': 0,
  'lunes': 1,
  'martes': 2, 
  'miercoles': 3,
  'jueves': 4,
  'viernes': 5,
  'sabado': 6
};

/**
 * GET: Obtener horarios comerciales
 */
export async function GET(request: NextRequest) {
  let client;
  
  try {
    console.log('🕐 DEBUG: Obteniendo horarios comerciales...');
    
    client = await pool.connect();
    console.log('✅ DEBUG: Conectado a PostgreSQL');
    
    // Obtener horarios regulares
    const horariosQuery = `
      SELECT 
        day_of_week,
        open_time,
        close_time,
        is_closed,
        is_24_hours,
        break_start_time,
        break_end_time,
        notes
      FROM restaurant.business_hours 
      WHERE restaurant_id = $1
      ORDER BY day_of_week
    `;
    
    const horariosResult = await client.query(horariosQuery, [RESTAURANT_ID]);
    console.log('📊 DEBUG: Horarios encontrados:', horariosResult.rows.length);
    
    // Obtener días festivos/especiales
    const especialesQuery = `
      SELECT 
        date,
        open_time,
        close_time,
        is_closed,
        reason,
        notes
      FROM restaurant.special_hours 
      WHERE restaurant_id = $1
      AND date >= CURRENT_DATE
      ORDER BY date
    `;
    
    const especialesResult = await client.query(especialesQuery, [RESTAURANT_ID]);
    console.log('🎉 DEBUG: Días especiales encontrados:', especialesResult.rows.length);
    
    // Crear estructura por defecto si no hay datos
    const horarioRegular = {
      lunes: { abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
      martes: { abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
      miercoles: { abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
      jueves: { abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
      viernes: { abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
      sabado: { abierto: true, horaApertura: "10:00", horaCierre: "16:00" },
      domingo: { abierto: false, horaApertura: "10:00", horaCierre: "16:00" }
    };
    
    // Sobrescribir con datos de la BD si existen
    horariosResult.rows.forEach(row => {
      const dia = DAYS_MAP[row.day_of_week as keyof typeof DAYS_MAP];
      if (dia) {
        horarioRegular[dia as keyof typeof horarioRegular] = {
          abierto: !row.is_closed,
          horaApertura: row.open_time || "09:00",
          horaCierre: row.close_time || "18:00"
        };
      }
    });
    
    // Mapear días festivos
    const diasFestivos = especialesResult.rows.map(row => ({
      fecha: row.date,
      nombre: row.reason || 'Día especial',
      tipo: row.reason || 'Personalizado'
    }));
    
    // Si no hay días festivos, agregar algunos por defecto
    if (diasFestivos.length === 0) {
      diasFestivos.push(
        { fecha: "2025-01-01", nombre: "Año Nuevo", tipo: "Año Nuevo" },
        { fecha: "2025-05-01", nombre: "Día del Trabajo", tipo: "Día del Trabajo" },
        { fecha: "2025-07-20", nombre: "Día de la Independencia", tipo: "Día de la Independencia" },
        { fecha: "2025-08-07", nombre: "Batalla de Boyacá", tipo: "Batalla de Boyacá" },
        { fecha: "2025-12-25", nombre: "Navidad", tipo: "Navidad" }
      );
    }
    
    const responseData = {
      horarioRegular,
      diasFestivos,
      _debug: {
        horariosEnBD: horariosResult.rows.length,
        especialesEnBD: especialesResult.rows.length,
        restaurantId: RESTAURANT_ID
      }
    };
    
    console.log('✅ DEBUG: Horarios obtenidos correctamente');
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('❌ DEBUG: Error al obtener horarios:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido',
        debug: true
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * POST: Actualizar horarios comerciales
 */
export async function POST(request: NextRequest) {
  let client;
  
  try {
    console.log('💾 DEBUG: Actualizando horarios comerciales...');
    
    const data = await request.json();
    console.log('📝 DEBUG: Datos recibidos:', Object.keys(data));
    
    if (!data.horarioRegular) {
      return NextResponse.json(
        { error: 'Falta el objeto horarioRegular' },
        { status: 400 }
      );
    }
    
    client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      console.log('🔄 DEBUG: Iniciando transacción...');
      
      // Eliminar horarios existentes
      await client.query(
        'DELETE FROM restaurant.business_hours WHERE restaurant_id = $1',
        [RESTAURANT_ID]
      );
      console.log('🗑️ DEBUG: Horarios anteriores eliminados');
      
      // Insertar nuevos horarios
      for (const [dia, horario] of Object.entries(data.horarioRegular)) {
        const dayOfWeek = DAYS_REVERSE_MAP[dia as keyof typeof DAYS_REVERSE_MAP];
        
        if (dayOfWeek !== undefined && horario && typeof horario === 'object') {
          const horarioTyped = horario as { abierto: boolean; horaApertura: string; horaCierre: string };
          
          const insertQuery = `
            INSERT INTO restaurant.business_hours (
              restaurant_id, 
              day_of_week, 
              open_time, 
              close_time, 
              is_closed,
              created_at,
              updated_at
            ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `;
          
          const values = [
            RESTAURANT_ID,
            dayOfWeek,
            horarioTyped.abierto ? horarioTyped.horaApertura : null,
            horarioTyped.abierto ? horarioTyped.horaCierre : null,
            !horarioTyped.abierto
          ];
          
          await client.query(insertQuery, values);
          console.log(`✅ DEBUG: Horario ${dia} guardado`);
        }
      }
      
      // Si hay días festivos, procesarlos también
      if (data.diasFestivos && Array.isArray(data.diasFestivos)) {
        // Eliminar días especiales existentes
        await client.query(
          'DELETE FROM restaurant.special_hours WHERE restaurant_id = $1',
          [RESTAURANT_ID]
        );
        
        // Insertar nuevos días especiales
        for (const festivo of data.diasFestivos) {
          if (festivo.fecha && festivo.nombre) {
            const insertSpecialQuery = `
              INSERT INTO restaurant.special_hours (
                restaurant_id,
                date,
                is_closed,
                reason,
                created_at
              ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
            `;
            
            await client.query(insertSpecialQuery, [
              RESTAURANT_ID,
              festivo.fecha,
              true, // Asumimos que los festivos están cerrados
              festivo.nombre
            ]);
          }
        }
        console.log('🎉 DEBUG: Días festivos guardados');
      }
      
      await client.query('COMMIT');
      console.log('✅ DEBUG: Transacción completada');
      
      return NextResponse.json({ 
        success: true,
        message: 'Horarios actualizados correctamente',
        debug: true
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ DEBUG: Error en transacción, rollback ejecutado');
      throw error;
    }
    
  } catch (error) {
    console.error('❌ DEBUG: Error al actualizar horarios:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido',
        debug: true
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
