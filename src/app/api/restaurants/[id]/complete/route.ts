// src/app/api/restaurants/[id]/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

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
    
    // Query con TODAS las columnas reales de la tabla
    const query = `
      SELECT 
        id,
        name,
        slug,
        description,
        address,
        city,
        state,
        country,
        latitude,
        longitude,
        phone,
        email,
        logo_url,
        cover_image_url,
        cuisine_type,
        price_range,
        capacity,
        owner_id,
        status,
        created_at,
        updated_at,
        created_by,
        updated_by
      FROM restaurant.restaurants 
      WHERE id = $1
    `;
    
    console.log(`🗄️ Ejecutando query para restaurant_id: ${id}`);
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      console.log(`❌ Restaurante no encontrado: ${id}`);
      return NextResponse.json(
        { error: 'Restaurante no encontrado' },
        { status: 404 }
      );
    }
    
    const restaurant = result.rows[0];
    
    console.log(`✅ Datos completos obtenidos para: ${restaurant.name}`);
    console.log(`📊 Verificación de campos:`, {
      'Información General': {
        name: !!restaurant.name,
        description: !!restaurant.description,
        phone: !!restaurant.phone,
        email: !!restaurant.email,
        cuisine_type: !!restaurant.cuisine_type
      },
      'Ubicación': {
        address: !!restaurant.address,
        city: !!restaurant.city,
        state: !!restaurant.state,
        country: !!restaurant.country
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