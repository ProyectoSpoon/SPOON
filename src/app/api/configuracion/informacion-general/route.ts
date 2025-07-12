// app/api/configuracion/informacion-general/route.ts - VERSION DEBUG
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuración de PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Spoon_db',
  password: 'spoon', // Cambiar por tu contraseña real
  port: 5432,
});

// ID del restaurante hardcodeado para debug
const RESTAURANT_ID = '4073a4ad-b275-4e17-b197-844881f0319e';

/**
 * GET: Obtener la información general del restaurante (sin autenticación para debug)
 */
export async function GET(request: NextRequest) {
  let client;
  
  try {
    console.log('🔍 DEBUG: Obteniendo información general del restaurante...');
    console.log('🏪 DEBUG: Restaurant ID:', RESTAURANT_ID);
    
    // Conectar a PostgreSQL
    client = await pool.connect();
    console.log('✅ DEBUG: Conectado a PostgreSQL');
    
    // Obtener información del restaurante
    const query = `
      SELECT 
        name,
        description,
        address,
        phone,
        email,
        website,
        logo_url,
        cover_image_url,
        city,
        state,
        country,
        postal_code,
        cuisine_type,
        status,
        created_at,
        updated_at
      FROM restaurant.restaurants 
      WHERE id = $1
    `;
    
    const result = await client.query(query, [RESTAURANT_ID]);
    console.log('📊 DEBUG: Filas encontradas:', result.rows.length);
    
    if (result.rows.length === 0) {
      console.log('❌ DEBUG: Restaurante no encontrado');
      return NextResponse.json(
        { error: 'Restaurante no encontrado' },
        { status: 404 }
      );
    }
    
    const restaurant = result.rows[0];
    console.log('🎯 DEBUG: Datos del restaurante:', restaurant.name);
    
    // Mapear campos de BD a formato del frontend
    const responseData = {
      nombreRestaurante: restaurant.name || '',
      direccion: restaurant.address || '',
      telefono: restaurant.phone || '',
      email: restaurant.email || '',
      descripcion: restaurant.description || '',
      logoUrl: restaurant.logo_url || '',
      sitioWeb: restaurant.website || '',
      // Campos adicionales disponibles
      _debug: {
        city: restaurant.city,
        state: restaurant.state,
        country: restaurant.country,
        postalCode: restaurant.postal_code,
        cuisineType: restaurant.cuisine_type,
        status: restaurant.status,
        coverImageUrl: restaurant.cover_image_url,
        lastUpdated: restaurant.updated_at
      }
    };
    
    console.log('✅ DEBUG: Información del restaurante obtenida correctamente');
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('❌ DEBUG: Error al obtener información general:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido',
        debug: true
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * POST: Actualizar la información general del restaurante (sin autenticación para debug)
 */
export async function POST(request: NextRequest) {
  let client;
  
  try {
    console.log('💾 DEBUG: Actualizando información general del restaurante...');
    
    // Obtener datos del request
    const data = await request.json();
    console.log('📝 DEBUG: Datos recibidos:', Object.keys(data));
    
    // Validar datos obligatorios
    if (!data.nombreRestaurante || !data.direccion || !data.telefono || !data.email) {
      console.log('❌ DEBUG: Faltan campos obligatorios');
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: nombreRestaurante, direccion, telefono, email' },
        { status: 400 }
      );
    }
    
    // Conectar a PostgreSQL
    client = await pool.connect();
    console.log('✅ DEBUG: Conectado a PostgreSQL para actualización');
    
    // Actualizar información del restaurante
    const updateQuery = `
      UPDATE restaurant.restaurants 
      SET 
        name = $1,
        description = $2,
        address = $3,
        phone = $4,
        email = $5,
        website = $6,
        logo_url = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING id, name, updated_at
    `;
    
    const values = [
      data.nombreRestaurante,
      data.descripcion || null,
      data.direccion,
      data.telefono,
      data.email,
      data.sitioWeb || null,
      data.logoUrl || null,
      RESTAURANT_ID
    ];
    
    console.log('🔄 DEBUG: Ejecutando actualización...');
    const result = await client.query(updateQuery, values);
    
    if (result.rows.length === 0) {
      console.log('❌ DEBUG: No se pudo actualizar el restaurante');
      return NextResponse.json(
        { error: 'No se pudo actualizar el restaurante' },
        { status: 404 }
      );
    }
    
    const updatedRestaurant = result.rows[0];
    console.log('✅ DEBUG: Restaurante actualizado:', updatedRestaurant.name);
    
    return NextResponse.json({ 
      success: true,
      message: 'Información general actualizada correctamente',
      data: {
        id: updatedRestaurant.id,
        name: updatedRestaurant.name,
        updatedAt: updatedRestaurant.updated_at
      },
      debug: true
    });
    
  } catch (error) {
    console.error('❌ DEBUG: Error al actualizar información general:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido',
        debug: true
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
