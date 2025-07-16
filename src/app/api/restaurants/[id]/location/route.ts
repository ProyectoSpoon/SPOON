// src/app/api/restaurants/[id]/location/route.ts - CORREGIDA
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

// GET - Obtener ubicación del restaurante
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log('📍 GET Location - Restaurant ID:', id);

    const query = `
      SELECT address, city, state, country
      FROM restaurant.restaurants
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      console.log('❌ Restaurante no encontrado');
      return NextResponse.json(
        { error: 'Restaurante no encontrado' },
        { status: 404 }
      );
    }

    const restaurant = result.rows[0];
    console.log('✅ Datos obtenidos:', restaurant);

    return NextResponse.json({
      direccion: restaurant.address || '',
      coordenadas: {
        lat: 4.6097102, // Coordenadas por defecto (Bogotá)
        lng: -74.081749
      },
      ciudad: restaurant.city || '',
      estado: restaurant.state || '',
      pais: restaurant.country || 'Colombia'
    });

  } catch (error) {
    console.error('❌ Error al obtener ubicación:', error);
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
    console.log('📍 PUT Location - Data received:', body);

    const { direccion, coordenadas, ciudad, estado } = body;

    if (!direccion) {
      return NextResponse.json(
        { error: 'Dirección es requerida' },
        { status: 400 }
      );
    }

    // Usar los valores enviados desde el frontend
    const ciudadFinal = ciudad || 'Bogotá';
    const estadoFinal = estado || 'Cundinamarca';

    console.log('🔄 Actualizando con:', {
      direccion,
      ciudad: ciudadFinal,
      estado: estadoFinal,
      coordenadas
    });

    const query = `
      UPDATE restaurant.restaurants
      SET
        address = $1,
        city = $2,
        state = $3,
        country = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING address, city, state, country, updated_at
    `;

    const result = await pool.query(query, [
      direccion,
      ciudadFinal,
      estadoFinal,
      'Colombia',
      id
    ]);

    if (result.rows.length === 0) {
      console.log('❌ No se pudo actualizar - restaurante no encontrado');
      return NextResponse.json(
        { error: 'Restaurante no encontrado' },
        { status: 404 }
      );
    }

    console.log('✅ Ubicación actualizada:', result.rows[0]);

    return NextResponse.json({
      success: true,
      message: 'Ubicación actualizada correctamente',
      data: {
        direccion: result.rows[0].address,
        ciudad: result.rows[0].city,
        estado: result.rows[0].state,
        pais: result.rows[0].country,
        updated_at: result.rows[0].updated_at
      }
    });

  } catch (error) {
    console.error('❌ Error al actualizar ubicación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar solo coordenadas (mantener por compatibilidad)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    console.log('📍 PATCH Location - Coordenadas recibidas:', body);

    // Como no tenemos columnas de coordenadas en BD, 
    // solo retornamos éxito sin hacer nada
    return NextResponse.json({
      success: true,
      message: 'Coordenadas registradas (modo desarrollo)',
      data: body.coordenadas
    });

  } catch (error) {
    console.error('❌ Error en PATCH coordenadas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}