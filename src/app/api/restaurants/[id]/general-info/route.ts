import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET - Obtener información general del restaurante
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = createRouteHandlerClient({ cookies });

    // Verificar sesión
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    console.log('🔍 GET /api/restaurants/[id]/general-info:', id);

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

    // SCHEMA CORRECTO: public.restaurants
    const { data: restaurant, error } = await supabase
      .schema('public')
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single();

    if (error) {
      console.error('Error fetching:', error);
      return NextResponse.json(
        { error: 'Error al obtener información del restaurante', details: error.message },
        { status: 500 }
      );
    }

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurante no encontrado' },
        { status: 404 }
      );
    }

    // Mapear a formato frontend - Campos reales en public.restaurants
    const responseData = {
      restaurantId: restaurant.id,
      nombreRestaurante: restaurant.name || '',
      descripcion: restaurant.description || '',
      telefono: restaurant.contact_phone || '',
      email: restaurant.contact_email || '',
      tipoComida: restaurant.cuisine_type || '',
      direccion: restaurant.address || '',
      statusRestaurante: restaurant.status || 'active',
      fechaCreacion: restaurant.created_at,
      fechaActualizacion: restaurant.updated_at
    };

    console.log('✅ Información general obtenida');

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST/PUT - Crear o Actualizar
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();
    const supabase = createRouteHandlerClient({ cookies });

    // Verificar sesión
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    console.log('💾 POST /api/restaurants/[id]/general-info:', id);

    // Preparar payload - Campos reales en public.restaurants
    const payload: any = {
      name: data.nombreRestaurante?.trim(),
      contact_phone: data.telefono?.trim(),
      description: data.descripcion?.trim() || null,
      contact_email: session.user.email,
      cuisine_type: data.tipoComida?.trim() || null,
      status: 'active',
      updated_at: new Date().toISOString()
    };
    // NOTA: address se actualiza en el paso de ubicación

    // CREAR NUEVO
    if (id === 'new' || !id) {
      // Primero verificar si el usuario ya tiene un restaurante
      const { data: existingRestaurant } = await supabase
        .schema('public')
        .from('restaurants')
        .select('id')
        .eq('owner_id', session.user.id)
        .single();

      // Si ya tiene restaurante, actualizar ese en lugar de crear uno nuevo
      if (existingRestaurant) {
        console.log('✅ Usuario ya tiene restaurante, actualizando:', existingRestaurant.id);

        const { data: updated, error: updateError } = await supabase
          .schema('public')
          .from('restaurants')
          .update(payload)
          .eq('id', existingRestaurant.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating:', updateError);
          throw updateError;
        }

        return NextResponse.json({
          success: true,
          message: 'Restaurante actualizado',
          isNew: false,
          restaurantId: existingRestaurant.id,
          data: updated
        });
      }

      // Si no tiene restaurante, crear uno nuevo
      payload.owner_id = session.user.id;
      payload.created_at = new Date().toISOString();

      const { data: newRest, error: createError } = await supabase
        .schema('public')
        .from('restaurants')
        .insert(payload)
        .select()
        .single();

      if (createError) {
        console.error('Error creating:', createError);
        throw createError;
      }

      console.log('✅ Restaurante creado:', newRest.id);

      return NextResponse.json({
        success: true,
        message: 'Restaurante creado',
        isNew: true,
        restaurantId: newRest.id,
        data: newRest
      });
    } else {
      // ACTUALIZAR EXISTENTE
      delete payload.created_at;
      delete payload.owner_id;

      const { data: updated, error: updateError } = await supabase
        .schema('public')
        .from('restaurants')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating:', updateError);
        throw updateError;
      }

      console.log('✅ Restaurante actualizado:', updated.id);

      return NextResponse.json({
        success: true,
        message: 'Restaurante actualizado',
        isNew: false,
        restaurantId: updated.id,
        data: updated
      });
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}

export { POST as PUT };