// src/app/api/restaurants/[id]/business-hours/route.ts
import { NextRequest, NextResponse } from 'next/server';
import  pool  from '@/lib/database';

// GET - Obtener horarios del restaurante
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const query = `
      SELECT day_of_week, open_time, close_time, is_closed, is_24_hours
      FROM restaurant.business_hours 
      WHERE restaurant_id = $1
      ORDER BY day_of_week
    `;
    
    const result = await pool.query(query, [id]);
    
    // Convertir a formato esperado por el frontend
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const horarios: any = {};
    
    // Inicializar todos los días
    diasSemana.forEach((dia, index) => {
      if (index === 0) return; // Saltamos domingo (índice 0)
      horarios[dia] = { abierto: false, turnos: [] };
    });
    horarios['domingo'] = { abierto: false, turnos: [] };
    
    // Procesar resultados de BD
    result.rows.forEach(row => {
      const dia = diasSemana[row.day_of_week];
      if (!horarios[dia]) {
        horarios[dia] = { abierto: false, turnos: [] };
      }
      
      if (!row.is_closed && row.open_time && row.close_time) {
        horarios[dia].abierto = true;
        horarios[dia].turnos.push({
          horaApertura: row.open_time,
          horaCierre: row.close_time
        });
      }
    });
    
    return NextResponse.json({ horarios });
    
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar horarios completos
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log('🕐 Actualizando horarios para restaurante:', id);
    
    const body = await request.json();
    console.log('📝 Datos recibidos:', JSON.stringify(body, null, 2));
    
    // El frontend puede enviar 'horarios' (formato objeto) o 'horarioRegular' (formato array)
    const horariosData = body.horarios || body.horarioRegular;
    
    if (!horariosData) {
      console.log('❌ Error: Horarios no proporcionados');
      return NextResponse.json(
        { error: 'Horarios son requeridos' },
        { status: 400 }
      );
    }
    
    console.log('🔄 Formato de datos detectado:', Array.isArray(horariosData) ? 'Array (horarioRegular)' : 'Objeto (horarios)');
    
    // Convertir array a formato objeto si es necesario
    let horarios: any;
    if (Array.isArray(horariosData)) {
      // Formato horarioRegular (array) -> convertir a formato horarios (objeto)
      const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
      horarios = {};
      
      horariosData.forEach((item, index) => {
        const dia = diasSemana[item.dia] || diasSemana[index];
        if (dia) {
          horarios[dia] = {
            abierto: item.abierto,
            turnos: item.abierto ? [{
              horaApertura: item.horaApertura || '08:00',
              horaCierre: item.horaCierre || '18:00'
            }] : []
          };
        }
      });
      console.log('🔄 Datos convertidos de array a objeto:', horarios);
    } else {
      // Ya está en formato objeto
      horarios = horariosData;
    }
    
    console.log('🔄 Iniciando transacción con UPSERT optimizado...');
    // Comenzar transacción
    await pool.query('BEGIN');
    
    try {
      // Mapeo de días
      const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
      
      console.log('📅 Procesando horarios por día con UPSERT...');
      
      // Primero, eliminar horarios existentes para este restaurante
      await pool.query(
        'DELETE FROM restaurant.business_hours WHERE restaurant_id = $1',
        [id]
      );
      console.log('🗑️ Horarios anteriores eliminados');
      
      // Insertar nuevos horarios
      for (const [dia, horarioDia] of Object.entries(horarios) as [string, any][]) {
        const dayOfWeek = diasSemana.indexOf(dia);
        console.log(`📅 Procesando ${dia} (índice ${dayOfWeek}):`, horarioDia);
        
        if (dayOfWeek === -1) {
          console.log(`⚠️ Día ${dia} no reconocido, saltando...`);
          continue;
        }
        
        if (!horarioDia.abierto || !horarioDia.turnos || horarioDia.turnos.length === 0) {
          console.log(`🚫 ${dia}: Día cerrado`);
          // Día cerrado - insertar un registro cerrado
          await pool.query(`
            INSERT INTO restaurant.business_hours 
            (restaurant_id, day_of_week, is_closed, created_at, updated_at)
            VALUES ($1, $2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `, [id, dayOfWeek]);
          console.log(`✅ ${dia}: Insertado como cerrado`);
        } else {
          console.log(`🕐 ${dia}: ${horarioDia.turnos.length} turnos`);
          // Para días abiertos, insertar solo el primer turno (simplificado)
          const primerTurno = horarioDia.turnos[0];
          if (primerTurno && primerTurno.horaApertura && primerTurno.horaCierre) {
            console.log(`⏰ Insertando turno: ${primerTurno.horaApertura} - ${primerTurno.horaCierre}`);
            await pool.query(`
              INSERT INTO restaurant.business_hours 
              (restaurant_id, day_of_week, open_time, close_time, is_closed, created_at, updated_at)
              VALUES ($1, $2, $3, $4, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `, [id, dayOfWeek, primerTurno.horaApertura, primerTurno.horaCierre]);
            console.log(`✅ Turno insertado para ${dia}`);
          } else {
            console.log(`⚠️ ${dia}: Turno inválido, insertando como cerrado`);
            await pool.query(`
              INSERT INTO restaurant.business_hours 
              (restaurant_id, day_of_week, is_closed, created_at, updated_at)
              VALUES ($1, $2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `, [id, dayOfWeek]);
          }
        }
      }
      
      console.log('💾 Confirmando transacción...');
      // Confirmar transacción
      await pool.query('COMMIT');
      console.log('✅ Transacción confirmada exitosamente');
      
      return NextResponse.json({
        success: true,
        message: 'Horarios actualizados correctamente'
      });
      
    } catch (error) {
      // Revertir transacción
      await pool.query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('Error al actualizar horarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
