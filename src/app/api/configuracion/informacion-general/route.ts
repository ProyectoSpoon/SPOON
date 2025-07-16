// src/app/api/configuracion/informacion-general/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
  restaurantId?: string;
  restaurant?: {
    id: string;
    nombre?: string;
  };
}

interface RestaurantInfo {
  nombreRestaurante: string;
  descripcion: string;
  telefono: string;
  email: string;
  tipoComida: string;
}

/**
 * Obtiene el ID del restaurante desde el token JWT o usa fallback
 */
async function getRestaurantId(request: NextRequest): Promise<string | null> {
  // Primero intentar obtener desde el token
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const JWT_SECRET = process.env.JWT_SECRET;
      
      if (JWT_SECRET) {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        const restaurantId = decoded.restaurantId || decoded.restaurant?.id;
        
        if (restaurantId) {
          console.log('✅ RestaurantId extraído del token:', restaurantId);
          return restaurantId;
        }
      }
    }
  } catch (error) {
    console.log('⚠️ Error decodificando token, usando fallback:', error);
  }

  // Intentar obtener desde query parameters
  const url = new URL(request.url);
  const queryRestaurantId = url.searchParams.get('restaurantId');
  if (queryRestaurantId) {
    console.log('✅ RestaurantId extraído de query params:', queryRestaurantId);
    return queryRestaurantId;
  }

  // Fallback: ID hardcodeado (temporal para desarrollo)
  const FALLBACK_RESTAURANT_ID = "4073a4ad-b275-4e17-b197-844881f0319e";
  console.log('⚠️ Usando restaurantId fallback:', FALLBACK_RESTAURANT_ID);
  return FALLBACK_RESTAURANT_ID;
}

/**
 * GET - Obtener información general del restaurante
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/configuracion/informacion-general');
    
    // Obtener restaurantId (desde token, query params, o fallback)
    const restaurantId = await getRestaurantId(request);
    if (!restaurantId) {
      return NextResponse.json(
        { error: 'No se pudo determinar el restaurante' },
        { status: 400 }
      );
    }
    
    const query = `
      SELECT 
        name,
        description,
        phone,
        email,
        cuisine_type,
        address,
        city,
        state,
        country,
        logo_url,
        cover_image_url,
        status,
        created_at,
        updated_at
      FROM restaurant.restaurants 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [restaurantId]);
    
    if (result.rows.length === 0) {
      console.log('❌ Restaurante no encontrado:', restaurantId);
      return NextResponse.json(
        { error: 'Restaurante no encontrado' },
        { status: 404 }
      );
    }
    
    const restaurant = result.rows[0];
    
    // Mapear campos de BD a formato esperado por el frontend
    const responseData = {
      nombreRestaurante: restaurant.name || '',
      descripcion: restaurant.description || '',
      telefono: restaurant.phone || '',
      email: restaurant.email || '',
      tipoComida: restaurant.cuisine_type || '',
      direccion: restaurant.address || '',
      ciudad: restaurant.city || '',
      estado: restaurant.state || '',
      pais: restaurant.country || '',
      logoUrl: restaurant.logo_url || '',
      portadaUrl: restaurant.cover_image_url || '',
      statusRestaurante: restaurant.status || '',
      fechaCreacion: restaurant.created_at,
      fechaActualizacion: restaurant.updated_at
    };
    
    console.log('✅ Información general obtenida correctamente para:', restaurant.name);
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('❌ Error obteniendo información general:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST - Actualizar información general del restaurante
 */
export async function POST(request: NextRequest) {
  try {
    console.log('💾 POST /api/configuracion/informacion-general');
    
    // Obtener restaurantId (desde token, query params, o fallback)
    const restaurantId = await getRestaurantId(request);
    if (!restaurantId) {
      return NextResponse.json(
        { error: 'No se pudo determinar el restaurante' },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    console.log('📝 Datos recibidos:', Object.keys(data));
    
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
    
    const updateQuery = `
      UPDATE restaurant.restaurants 
      SET 
        name = $1,
        description = $2,
        phone = $3,
        email = $4,
        cuisine_type = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING id, name, email, phone, cuisine_type, updated_at
    `;
    
    const values = [
      data.nombreRestaurante.trim(),
      data.descripcion?.trim() || null,
      data.telefono.trim(),
      data.email.toLowerCase().trim(),
      data.tipoComida?.trim() || null,
      restaurantId
    ];
    
    const result = await pool.query(updateQuery, values);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Restaurante no encontrado' },
        { status: 404 }
      );
    }
    
    const updatedRestaurant = result.rows[0];
    console.log('✅ Información general actualizada:', updatedRestaurant.name);
    
    return NextResponse.json({
      success: true,
      message: 'Información general actualizada correctamente',
      data: {
        id: updatedRestaurant.id,
        name: updatedRestaurant.name,
        email: updatedRestaurant.email,
        phone: updatedRestaurant.phone,
        cuisineType: updatedRestaurant.cuisine_type,
        updatedAt: updatedRestaurant.updated_at
      }
    });
    
  } catch (error: any) {
    console.error('❌ Error actualizando información general:', error);
    
    // Manejar errores específicos de PostgreSQL
    if (error?.code === '23505') { // Unique constraint violation
      return NextResponse.json(
        { error: 'El email ya está en uso por otro restaurante' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Actualizar información completa (alternativa a POST)
 */
export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 PUT /api/configuracion/informacion-general');
    
    // Obtener restaurantId (desde token, query params, o fallback)
    const restaurantId = await getRestaurantId(request);
    if (!restaurantId) {
      return NextResponse.json(
        { error: 'No se pudo determinar el restaurante' },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    
    // Preparar campos para actualizar
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    if (data.nombreRestaurante !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(data.nombreRestaurante.trim());
      paramIndex++;
    }
    
    if (data.descripcion !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(data.descripcion?.trim() || null);
      paramIndex++;
    }
    
    if (data.telefono !== undefined) {
      updates.push(`phone = $${paramIndex}`);
      values.push(data.telefono.trim());
      paramIndex++;
    }
    
    if (data.email !== undefined) {
      updates.push(`email = $${paramIndex}`);
      values.push(data.email.toLowerCase().trim());
      paramIndex++;
    }
    
    if (data.tipoComida !== undefined) {
      updates.push(`cuisine_type = $${paramIndex}`);
      values.push(data.tipoComida?.trim() || null);
      paramIndex++;
    }
    
    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No hay datos para actualizar' },
        { status: 400 }
      );
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(restaurantId);
    
    const query = `
      UPDATE restaurant.restaurants 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, description, phone, email, cuisine_type, updated_at
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Restaurante no encontrado' },
        { status: 404 }
      );
    }
    
    console.log('✅ Información completa actualizada correctamente');
    
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error: any) {
    console.error('❌ Error actualizando información completa:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}