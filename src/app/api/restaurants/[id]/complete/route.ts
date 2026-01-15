// src/app/api/restaurants/[id]/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * GET - Obtener todos los datos del restaurante para validar progreso
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log(`🔍 GET /api/restaurants/${id}/complete - Obteniendo datos completos`);

    const supabase = createRouteHandlerClient({ cookies });

    const { data: restaurant, error } = await supabase
      .schema('public')
      .from('restaurants')
      .select(`
        id,
        name,
        slug,
        description,
        address,
        latitude,
        longitude,
        phone,
        email,
        logo_url,
        cover_image_url,
        cuisine_type_id,
        city_id,
        department_id,
        country_id,
        status,
        owner_id,
        created_at,
        updated_at,
        created_by,
        updated_by
      `)
      .eq('id', id)
      .single();

    if (error || !restaurant) {
      console.log(`❌ Restaurante no encontrado: ${id}`, error);
      return NextResponse.json(
        { error: 'Restaurante no encontrado' },
        { status: 404 }
      );
    }

    console.log(`✅ Datos completos obtenidos para: ${restaurant.name}`);
    console.log(`📊 Verificación de campos:`, {
      'Información General': {
        name: !!restaurant.name,
        description: !!restaurant.description,
        phone: !!restaurant.phone,
        email: !!restaurant.email,
        cuisine_type_id: !!restaurant.cuisine_type_id
      },
      'Ubicación': {
        address: !!restaurant.address,
        latitude: !!restaurant.latitude,
        longitude: !!restaurant.longitude,
        city_id: !!restaurant.city_id,
        department_id: !!restaurant.department_id
      },
      'Imágenes': {
        logo_url: !!restaurant.logo_url,
        cover_image_url: !!restaurant.cover_image_url
      }
    });

    return NextResponse.json(restaurant);

  } catch (error) {
    console.error('❌ Error al obtener datos completos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}