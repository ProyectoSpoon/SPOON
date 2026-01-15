// src/app/api/configuracion/informacion-general/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * GET - Obtener información general del restaurante del usuario autenticado
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/configuracion/informacion-general');

    const supabase = createRouteHandlerClient({ cookies });

    // Verificar sesión
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Buscar restaurante del usuario
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('id, name, description, contact_phone, contact_email, cuisine_type_id, address, latitude, longitude, city_id, department_id, country_id, logo_url, cover_image_url, status, created_at, updated_at')
      .eq('owner_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching restaurant:', error);
      return NextResponse.json(
        { error: 'Error al obtener restaurante' },
        { status: 500 }
      );
    }

    if (restaurants && restaurants.length > 0) {
      // Usuario tiene restaurante
      const restaurant = restaurants[0];

      const responseData = {
        nombreRestaurante: restaurant.name || '',
        descripcion: restaurant.description || '',
        telefono: restaurant.contact_phone || '',
        email: restaurant.contact_email || '',
        tipoComida: restaurant.cuisine_type_id || '',
        direccion: restaurant.address || '',
        ciudad: restaurant.city_id || '',
        estado: restaurant.department_id || '',
        pais: restaurant.country_id || '',
        logoUrl: restaurant.logo_url || '',
        portadaUrl: restaurant.cover_image_url || '',
        statusRestaurante: restaurant.status || '',
        fechaCreacion: restaurant.created_at,
        fechaActualizacion: restaurant.updated_at,
        restaurantId: restaurant.id
      };

      console.log('✅ Restaurante existente encontrado:', restaurant.name);
      return NextResponse.json(responseData);
    } else {
      // Usuario sin restaurante - devolver formulario vacío
      console.log('📝 Usuario sin restaurante');
      return NextResponse.json({
        nombreRestaurante: '',
        descripcion: '',
        telefono: '',
        email: session.user.email || '',
        tipoComida: '',
        direccion: '',
        ciudad: '',
        estado: '',
        pais: '1', // Colombia por defecto (ID en tabla countries)
        logoUrl: '',
        portadaUrl: '',
        statusRestaurante: 'draft',
        fechaCreacion: null,
        fechaActualizacion: null,
        restaurantId: null,
        isNewRestaurant: true
      });
    }

  } catch (error) {
    console.error('❌ Error obteniendo información general:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST - Crear o actualizar información general del restaurante
 */
export async function POST(request: NextRequest) {
  try {
    console.log('💾 POST /api/configuracion/informacion-general');

    const data = await request.json();

    // Validar datos obligatorios
    if (!data.nombreRestaurante || !data.telefono || !data.email) {
      return NextResponse.json(
        { error: 'Campos obligatorios: nombreRestaurante, telefono, email' },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Verificar sesión
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Verificar si ya tiene restaurante
    const { data: existing } = await supabase
      .from('restaurants')
      .select('id')
      .eq('owner_id', userId)
      .eq('status', 'active')
      .limit(1)
      .single();

    if (existing) {
      // ACTUALIZAR restaurante existente
      const { data: updated, error: updateError } = await supabase
        .from('restaurants')
        .update({
          name: data.nombreRestaurante.trim(),
          description: data.descripcion?.trim() || null,
          contact_phone: data.telefono.trim(),
          contact_email: data.email.toLowerCase().trim(),
          cuisine_type_id: data.tipoComida?.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select('id, name, contact_email, contact_phone, cuisine_type_id, updated_at')
        .single();

      if (updateError) {
        console.error('Error updating restaurant:', updateError);
        return NextResponse.json(
          { error: 'Error al actualizar restaurante' },
          { status: 500 }
        );
      }

      console.log('✅ Restaurante actualizado:', updated.name);

      return NextResponse.json({
        success: true,
        message: 'Información del restaurante actualizada correctamente',
        data: {
          id: updated.id,
          name: updated.name,
          email: updated.contact_email,
          phone: updated.contact_phone,
          cuisineType: updated.cuisine_type_id,
          updatedAt: updated.updated_at,
          isNew: false
        }
      });

    } else {
      // CREAR nuevo restaurante
      const { data: newRestaurant, error: createError } = await supabase
        .from('restaurants')
        .insert({
          name: data.nombreRestaurante.trim(),
          description: data.descripcion?.trim() || null,
          contact_phone: data.telefono.trim(),
          contact_email: data.email.toLowerCase().trim(),
          cuisine_type_id: data.tipoComida?.trim() || null,
          address: data.direccion?.trim() || null,
          city_id: data.ciudad?.trim() || null,
          department_id: data.estado?.trim() || null,
          country_id: data.pais?.trim() || '1',
          status: 'active',
          owner_id: userId,
          created_by: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id, name, contact_email, contact_phone, cuisine_type_id, created_at, updated_at')
        .single();

      if (createError) {
        console.error('Error creating restaurant:', createError);

        if (createError.code === '23505') {
          return NextResponse.json(
            { error: 'El email ya está en uso por otro restaurante' },
            { status: 409 }
          );
        }

        return NextResponse.json(
          { error: 'Error al crear restaurante' },
          { status: 500 }
        );
      }

      console.log('✅ Nuevo restaurante creado:', newRestaurant.name);

      return NextResponse.json({
        success: true,
        message: 'Restaurante creado correctamente',
        data: {
          id: newRestaurant.id,
          name: newRestaurant.name,
          email: newRestaurant.contact_email,
          phone: newRestaurant.contact_phone,
          cuisineType: newRestaurant.cuisine_type_id,
          createdAt: newRestaurant.created_at,
          updatedAt: newRestaurant.updated_at,
          isNew: true
        }
      });
    }

  } catch (error: any) {
    console.error('❌ Error procesando información general:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Actualizar información parcial (legacy support)
 */
export async function PUT(request: NextRequest) {
  // Redirigir a POST para simplificar
  return POST(request);
}
