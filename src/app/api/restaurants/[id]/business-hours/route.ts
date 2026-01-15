import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Funciones de validación de servidor
function horaAMinutos(hora: string): number {
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos;
}

function validarTurno(turno: any): { valido: boolean; mensaje?: string } {
  if (!turno.horaApertura || !turno.horaCierre) {
    return { valido: false, mensaje: 'Hora de apertura y cierre son requeridas' };
  }

  const apertura = horaAMinutos(turno.horaApertura);
  const cierre = horaAMinutos(turno.horaCierre);

  if (apertura >= cierre) {
    return {
      valido: false,
      mensaje: `Hora de cierre (${turno.horaCierre}) debe ser posterior a apertura (${turno.horaApertura})`
    };
  }

  if (cierre - apertura < 30) {
    return {
      valido: false,
      mensaje: 'Los turnos deben tener al menos 30 minutos de duración'
    };
  }

  return { valido: true };
}

function validarSuperposicionTurnos(turnos: any[]): { valido: boolean; mensaje?: string } {
  if (turnos.length <= 1) return { valido: true };

  const turnosOrdenados = turnos
    .map((turno, indice) => ({ ...turno, indiceOriginal: indice }))
    .sort((a, b) => horaAMinutos(a.horaApertura) - horaAMinutos(b.horaApertura));

  for (let i = 0; i < turnosOrdenados.length - 1; i++) {
    const turnoActual = turnosOrdenados[i];
    const siguienteTurno = turnosOrdenados[i + 1];

    const finActual = horaAMinutos(turnoActual.horaCierre);
    const inicioSiguiente = horaAMinutos(siguienteTurno.horaApertura);

    if (finActual > inicioSiguiente) {
      return {
        valido: false,
        mensaje: `Los turnos ${turnoActual.indiceOriginal + 1} y ${siguienteTurno.indiceOriginal + 1} se superponen`
      };
    }
  }

  return { valido: true };
}

function validarHorariosDia(dia: string, horarioDia: any): { valido: boolean; errores: string[] } {
  const errores: string[] = [];

  if (!horarioDia.abierto) {
    return { valido: true, errores: [] };
  }

  if (!horarioDia.turnos || horarioDia.turnos.length === 0) {
    errores.push(`${dia}: Día abierto debe tener al menos un turno`);
    return { valido: false, errores };
  }

  if (horarioDia.turnos.length > 3) {
    errores.push(`${dia}: Máximo 3 turnos por día`);
  }

  horarioDia.turnos.forEach((turno: any, indice: number) => {
    const validacionTurno = validarTurno(turno);
    if (!validacionTurno.valido) {
      errores.push(`${dia} - Turno ${indice + 1}: ${validacionTurno.mensaje}`);
    }
  });

  const validacionSuperposicion = validarSuperposicionTurnos(horarioDia.turnos);
  if (!validacionSuperposicion.valido) {
    errores.push(`${dia}: ${validacionSuperposicion.mensaje}`);
  }

  return { valido: errores.length === 0, errores };
}

// GET - Obtener horarios del restaurante
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log('🔍 GET /api/restaurants/[id]/business-hours:', id);

    const supabase = createRouteHandlerClient({ cookies });

    // Verificar sesión
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Si id es 'current', buscar el restaurante del usuario
    let restaurantId = id;
    if (id === 'current') {
      const { data: userRestaurant } = await supabase
        .schema('public')
        .from('restaurants')
        .select('id')
        .eq('owner_id', session.user.id)
        .single();

      if (!userRestaurant) {
        return NextResponse.json(
          { error: 'Usuario no tiene restaurante' },
          { status: 404 }
        );
      }

      restaurantId = userRestaurant.id;
    }

    // CORREGIDO: business_hours está en schema PUBLIC
    // Removed is_24_hours column that doesn't exist
    const { data: rows, error } = await supabase
      .schema('public')
      .from('business_hours')
      .select('day_of_week, open_time, close_time, is_closed')
      .eq('restaurant_id', restaurantId)
      .order('day_of_week', { ascending: true })
      .order('open_time', { ascending: true });

    if (error) {
      console.error('Error fetching business hours:', error);
      return NextResponse.json(
        { error: 'Error al obtener horarios', details: error.message },
        { status: 500 }
      );
    }

    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const horarios: any = {};

    diasSemana.forEach((dia) => {
      horarios[dia] = { abierto: false, turnos: [] };
    });

    rows?.forEach(row => {
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

    console.log('✅ Horarios recuperados');

    return NextResponse.json({ horarios });

  } catch (error) {
    console.error('❌ Error al obtener horarios:', error);
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
    console.log('💾 PUT /api/restaurants/[id]/business-hours:', id);

    const body = await request.json();
    const horariosData = body.horarios || body.horarioRegular;

    if (!horariosData) {
      return NextResponse.json(
        { error: 'Horarios son requeridos' },
        { status: 400 }
      );
    }

    // Validar horarios
    const erroresValidacion: string[] = [];

    for (const [dia, horarioDia] of Object.entries(horariosData) as [string, any][]) {
      const validacion = validarHorariosDia(dia, horarioDia);
      if (!validacion.valido) {
        erroresValidacion.push(...validacion.errores);
      }
    }

    if (erroresValidacion.length > 0) {
      return NextResponse.json(
        {
          error: 'Errores de validación en horarios',
          detalles: erroresValidacion
        },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

    // Timestamp unificado
    const updatedAt = new Date().toISOString();

    // Verificar sesión
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Si id es 'current', buscar el restaurante del usuario
    let restaurantId = id;
    if (id === 'current') {
      const { data: userRestaurant } = await supabase
        .schema('public')
        .from('restaurants')
        .select('id')
        .eq('owner_id', session.user.id)
        .single();

      if (!userRestaurant) {
        return NextResponse.json(
          { error: 'Usuario no tiene restaurante' },
          { status: 404 }
        );
      }

      restaurantId = userRestaurant.id;
    }

    // Eliminar horarios existentes
    const { error: deleteError } = await supabase
      .schema('public')
      .from('business_hours')
      .delete()
      .eq('restaurant_id', restaurantId);

    if (deleteError) {
      console.error('Error deleting existing hours:', deleteError);
      return NextResponse.json(
        { error: 'Error al eliminar horarios existentes' },
        { status: 500 }
      );
    }

    // Insertar nuevos horarios
    const insertData: any[] = [];

    for (const [dia, horarioDia] of Object.entries(horariosData) as [string, any][]) {
      const dayOfWeek = diasSemana.indexOf(dia);

      if (dayOfWeek === -1) continue;

      if (!horarioDia.abierto || !horarioDia.turnos || horarioDia.turnos.length === 0) {
        insertData.push({
          restaurant_id: restaurantId,
          day_of_week: dayOfWeek,
          is_closed: true,
          created_at: updatedAt
        });
      } else {
        for (const turno of horarioDia.turnos) {
          const validacionTurno = validarTurno(turno);
          if (!validacionTurno.valido) {
            return NextResponse.json(
              { error: `${dia}: ${validacionTurno.mensaje}` },
              { status: 400 }
            );
          }

          insertData.push({
            restaurant_id: restaurantId,
            day_of_week: dayOfWeek,
            open_time: turno.horaApertura,
            close_time: turno.horaCierre,
            is_closed: false,
            created_at: updatedAt
          });
        }
      }
    }

    if (insertData.length > 0) {
      const { error: insertError } = await supabase
        .schema('public')
        .from('business_hours')
        .insert(insertData);

      if (insertError) {
        console.error('Error inserting hours:', insertError);
        return NextResponse.json(
          { error: 'Error al guardar horarios', details: insertError.message },
          { status: 500 }
        );
      }
    }

    console.log('✅ Horarios guardados exitosamente');

    return NextResponse.json({
      success: true,
      message: 'Horarios actualizados correctamente'
    });

  } catch (error: any) {
    console.error('❌ Error al actualizar horarios:', error);

    if (error.message && error.message.includes('Turno')) {
      return NextResponse.json(
        {
          error: 'Error de validación de horarios',
          detalles: [error.message]
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}