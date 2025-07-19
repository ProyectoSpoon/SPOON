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
    
    const { horarios } = body;
    
    if (!horarios) {
      console.log('❌ Error: Horarios no proporcionados');
      return NextResponse.json(
        { error: 'Horarios son requeridos' },
        { status: 400 }
      );
    }
    
    console.log('🔄 Iniciando transacción...');
    // Comenzar transacción
    await pool.query('BEGIN');
    
    try {
      console.log('🗑️ Eliminando horarios existentes...');
      // Eliminar horarios existentes
      const deleteResult = await pool.query(
        'DELETE FROM restaurant.business_hours WHERE restaurant_id = $1',
        [id]
      );
      console.log('✅ Horarios eliminados:', deleteResult.rowCount);
      
      // Mapeo de días
      const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
      
      console.log('📅 Procesando horarios por día...');
      // Insertar nuevos horarios
      for (const [dia, horarioDia] of Object.entries(horarios) as [string, any][]) {
        const dayOfWeek = diasSemana.indexOf(dia);
        console.log(`📅 Procesando ${dia} (índice ${dayOfWeek}):`, horarioDia);
        
        if (dayOfWeek === -1) {
          console.log(`⚠️ Día ${dia} no reconocido, saltando...`);
          continue;
        }
        
        if (!horarioDia.abierto || horarioDia.turnos.length === 0) {
          console.log(`🚫 ${dia}: Día cerrado`);
          // Día cerrado
          const insertResult = await pool.query(`
            INSERT INTO restaurant.business_hours 
            (restaurant_id, day_of_week, is_closed, created_at, updated_at)
            VALUES ($1, $2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `, [id, dayOfWeek]);
          console.log(`✅ ${dia}: Insertado como cerrado`);
        } else {
          console.log(`🕐 ${dia}: ${horarioDia.turnos.length} turnos`);
          // Insertar cada turno
          for (const turno of horarioDia.turnos) {
            console.log(`⏰ Insertando turno: ${turno.horaApertura} - ${turno.horaCierre}`);
            const insertResult = await pool.query(`
              INSERT INTO restaurant.business_hours 
              (restaurant_id, day_of_week, open_time, close_time, is_closed, created_at, updated_at)
              VALUES ($1, $2, $3, $4, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `, [id, dayOfWeek, turno.horaApertura, turno.horaCierre]);
            console.log(`✅ Turno insertado para ${dia}`);
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
