// src/app/api/restaurants/[id]/location/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { DateTime } from 'luxon';

// Validación de coordenadas
const isValidCoordinate = (lat: number | null, lng: number | null): boolean => {
  if (lat === null || lng === null) return true; // Permitir null si se está borrando
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

// GET - Obtener ubicación del restaurante
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Inicializar cliente Supabase
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

    const { data: restaurant, error } = await supabase
      .schema('public')
      .from('restaurants')
      .select('address, latitude, longitude, city_id, department_id, country_id')
      .eq('id', restaurantId)
      .single();

    if (error || !restaurant) {
      console.error('Error fetching location:', error);
      return NextResponse.json(
        { error: 'Restaurante no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      address: restaurant.address || '',
      latitude: restaurant.latitude || null,
      longitude: restaurant.longitude || null,
      city_id: restaurant.city_id || null,
      department_id: restaurant.department_id || null,
      country_id: restaurant.country_id || null
    });

  } catch (error) {
    console.error(`[LOCATION_API] Error fetching location:`, error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar ubicación completa
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const { address, latitude, longitude, city_id, department_id, country_id } = body;

    // Validación de requeridos
    if (!address) {
      return NextResponse.json(
        { error: 'Dirección es requerida' },
        { status: 400 }
      );
    }

    // Validación de rangos geográficos
    if (latitude !== null && longitude !== null) {
      if (!isValidCoordinate(latitude, longitude)) {
        console.warn(`[LOCATION_API] Invalid coordinates blocked: RestaurantID=${id} -> {${latitude}, ${longitude}}`);
        return NextResponse.json(
          { error: 'Coordenadas inválidas. Latitud debe estar entre -90 y 90, Longitud entre -180 y 180.' },
          { status: 400 }
        );
      }
    }

    // Timestamp unificado con Luxon
    const updatedAt = DateTime.now().setZone('America/Bogota').toISO();

    // Inicializar cliente Supabase
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

    // Actualización con todos los campos
    const { data: updated, error } = await supabase
      .schema('public')
      .from('restaurants')
      .update({
        address: address,
        latitude: latitude,
        longitude: longitude,
        city_id: city_id || null,
        department_id: department_id || null,
        country_id: country_id || null,
        updated_at: updatedAt
      })
      .eq('id', restaurantId)
      .select('address, latitude, longitude, city_id, department_id, country_id, updated_at')
      .single();

    if (error || !updated) {
      console.error('Error updating location:', error);
      return NextResponse.json(
        { error: 'Restaurante no encontrado' },
        { status: 404 }
      );
    }

    console.log(`[LOCATION_API] Update success: RestaurantID=${id} -> {${updated.latitude}, ${updated.longitude}}`);

    return NextResponse.json({
      success: true,
      message: 'Ubicación actualizada correctamente',
      data: {
        address: updated.address,
        latitude: updated.latitude,
        longitude: updated.longitude,
        city_id: updated.city_id,
        department_id: updated.department_id,
        country_id: updated.country_id,
        updated_at: updated.updated_at
      }
    });

  } catch (error) {
    console.error(`[LOCATION_API] Update error:`, error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
