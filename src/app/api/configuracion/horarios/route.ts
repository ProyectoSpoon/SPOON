// app/api/configuracion/horarios/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Mapeo de días de la semana
const DAYS_MAP: Record<number, string> = {
  0: 'domingo',
  1: 'lunes',
  2: 'martes',
  3: 'miercoles',
  4: 'jueves',
  5: 'viernes',
  6: 'sabado'
};

const DAYS_REVERSE_MAP: Record<string, number> = {
  'domingo': 0,
  'lunes': 1,
  'martes': 2,
  'miercoles': 3,
  'jueves': 4,
  'viernes': 5,
  'sabado': 6
};

/**
 * GET: Obtener horarios comerciales del restaurante del usuario
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🕐 Obteniendo horarios comerciales...');

    const supabase = createRouteHandlerClient({ cookies });

    // Verificar sesión
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener restaurante del usuario
    const { data: restaurants } = await supabase
      .schema('public')
      .from('restaurants')
      .select('id')
      .eq('owner_id', session.user.id)
      .eq('status', 'active')
      .limit(1)
      .single();

    if (!restaurants) {
      return NextResponse.json(
        { error: 'Restaurante no encontrado' },
        { status: 404 }
      );
    }

    const restaurantId = restaurants.id;

    // Obtener horarios regulares
    const { data: horarios } = await supabase
      .schema('restaurant')
      .from('business_hours')
      .select('day_of_week, open_time, close_time, is_closed')
      .eq('restaurant_id', restaurantId)
      .order('day_of_week');

    // Obtener días especiales
    const { data: especiales } = await supabase
      .schema('restaurant')
      .from('special_hours')
      .select('date, open_time, close_time, is_closed, reason, notes')
      .eq('restaurant_id', restaurantId)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date');

    // Crear estructura por defecto
    const horarioRegular: Record<string, any> = {
      lunes: { abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
      martes: { abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
      miercoles: { abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
      jueves: { abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
      viernes: { abierto: true, horaApertura: "09:00", horaCierre: "18:00" },
      sabado: { abierto: true, horaApertura: "10:00", horaCierre: "16:00" },
      domingo: { abierto: false, horaApertura: "10:00", horaCierre: "16:00" }
    };

    // Sobrescribir con datos de la BD
    horarios?.forEach(row => {
      const dia = DAYS_MAP[row.day_of_week];
      if (dia) {
        horarioRegular[dia] = {
          abierto: !row.is_closed,
          horaApertura: row.open_time || "09:00",
          horaCierre: row.close_time || "18:00"
        };
      }
    });

    // Mapear días festivos
    const diasFestivos = especiales?.map(row => ({
      fecha: row.date,
      nombre: row.reason || 'Día especial',
      tipo: row.reason || 'Personalizado'
    })) || [];

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

    console.log('✅ Horarios obtenidos correctamente');

    return NextResponse.json({
      horarioRegular,
      diasFestivos
    });

  } catch (error) {
    console.error('❌ Error al obtener horarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST: Actualizar horarios comerciales
 */
export async function POST(request: NextRequest) {
  try {
    console.log('💾 Actualizando horarios comerciales...');

    const supabase = createRouteHandlerClient({ cookies });

    // Verificar sesión
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener restaurante
    const { data: restaurants } = await supabase
      .schema('public')
      .from('restaurants')
      .select('id')
      .eq('owner_id', session.user.id)
      .eq('status', 'active')
      .limit(1)
      .single();

    if (!restaurants) {
      return NextResponse.json(
        { error: 'Restaurante no encontrado' },
        { status: 404 }
      );
    }

    const restaurantId = restaurants.id;
    const data = await request.json();

    if (!data.horarioRegular) {
      return NextResponse.json(
        { error: 'Falta el objeto horarioRegular' },
        { status: 400 }
      );
    }

    // Eliminar horarios existentes
    await supabase
      .schema('restaurant')
      .from('business_hours')
      .delete()
      .eq('restaurant_id', restaurantId);

    // Insertar nuevos horarios
    const horariosToInsert = [];
    for (const [dia, horario] of Object.entries(data.horarioRegular)) {
      const dayOfWeek = DAYS_REVERSE_MAP[dia];

      if (dayOfWeek !== undefined && horario && typeof horario === 'object') {
        const h = horario as { abierto: boolean; horaApertura: string; horaCierre: string };

        horariosToInsert.push({
          restaurant_id: restaurantId,
          day_of_week: dayOfWeek,
          open_time: h.abierto ? h.horaApertura : null,
          close_time: h.abierto ? h.horaCierre : null,
          is_closed: !h.abierto,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }

    if (horariosToInsert.length > 0) {
      const { error: insertError } = await supabase
        .schema('restaurant')
        .from('business_hours')
        .insert(horariosToInsert);

      if (insertError) {
        console.error('Error insertando horarios:', insertError);
        return NextResponse.json(
          { error: 'Error al guardar horarios' },
          { status: 500 }
        );
      }
    }

    // Procesar días festivos si existen
    if (data.diasFestivos && Array.isArray(data.diasFestivos)) {
      // Eliminar días especiales existentes
      await supabase
        .schema('restaurant')
        .from('special_hours')
        .delete()
        .eq('restaurant_id', restaurantId);

      // Insertar nuevos
      const festivosToInsert = data.diasFestivos
        .filter((f: any) => f.fecha && f.nombre)
        .map((f: any) => ({
          restaurant_id: restaurantId,
          date: f.fecha,
          is_closed: true,
          reason: f.nombre,
          created_at: new Date().toISOString()
        }));

      if (festivosToInsert.length > 0) {
        await supabase
          .schema('restaurant')
          .from('special_hours')
          .insert(festivosToInsert);
      }
    }

    console.log('✅ Horarios actualizados correctamente');

    return NextResponse.json({
      success: true,
      message: 'Horarios actualizados correctamente'
    });

  } catch (error) {
    console.error('❌ Error al actualizar horarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
