import { NextResponse } from 'next/server';
import { query } from '@/lib/database';
import jwt from 'jsonwebtoken';

// GET - Obtener combinaciones especiales
export async function GET(request: Request) {
  try {
    console.log('⭐ [DEBUG] Iniciando API de especiales...');
    
    // Obtener token de autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [DEBUG] No hay token de autorización');
      return NextResponse.json({ error: 'Token de autenticación requerido' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    console.log('🔑 [DEBUG] Token extraído, longitud:', token.length);
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      console.log('✅ [DEBUG] Token verificado, userId:', decoded.userId);
    } catch (error) {
      console.log('❌ [DEBUG] Error verificando token:', error);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Obtener restaurantId del usuario autenticado
    console.log('🔍 [DEBUG] Buscando restaurante para usuario:', decoded.userId);
    
    // Verificar la estructura de auth.users
    const userCheckQuery = 'SELECT * FROM auth.users WHERE id = $1 LIMIT 1';
    const userCheck = await query(userCheckQuery, [decoded.userId]);
    
    if (userCheck.rows.length === 0) {
      console.log('❌ [DEBUG] Usuario no encontrado en auth.users');
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    
    const userData = userCheck.rows[0];
    console.log('🔍 [DEBUG] Estructura usuario:', Object.keys(userData));
    console.log('🔍 [DEBUG] Datos del usuario:', {
      id: userData.id,
      email: userData.email,
      restaurant_id: userData.restaurant_id || 'NO TIENE',
      role: userData.role || 'NO DEFINIDO',
      status: userData.status || 'NO DEFINIDO'
    });
    
    // Intentar diferentes formas de obtener el restaurant_id
    let restaurantId = null;
    const user = userCheck.rows[0];
    
    // Opción 1: Directo desde auth.users
    if (user.restaurant_id) {
      restaurantId = user.restaurant_id;
      console.log('🏪 [DEBUG] RestaurantId desde auth.users:', restaurantId);
    }
    // Opción 2: Desde restaurant.restaurant_users
    else {
      console.log('🔍 [DEBUG] Buscando en restaurant.restaurant_users...');
      const restaurantUserQuery = `
        SELECT ru.restaurant_id 
        FROM restaurant.restaurant_users ru
        WHERE ru.user_id = $1
      `;
      const restaurantUserResult = await query(restaurantUserQuery, [decoded.userId]);
      
      if (restaurantUserResult.rows.length > 0) {
        restaurantId = restaurantUserResult.rows[0].restaurant_id;
        console.log('🏪 [DEBUG] RestaurantId desde restaurant_users:', restaurantId);
      }
    }
    
    // Manejar caso especial para super_admin
    if (!restaurantId) {
      if (userData.role === 'super_admin') {
        console.log('🔧 [DEBUG] Super admin detectado, buscando primer restaurante disponible...');
        const firstRestaurantQuery = 'SELECT id FROM restaurant.restaurants ORDER BY created_at ASC LIMIT 1';
        const firstRestaurant = await query(firstRestaurantQuery, []);
        
        if (firstRestaurant.rows.length > 0) {
          restaurantId = firstRestaurant.rows[0].id;
          console.log('🏪 [DEBUG] Usando restaurante por defecto para super_admin:', restaurantId);
        } else {
          console.log('❌ [DEBUG] No hay restaurantes disponibles en el sistema');
          return NextResponse.json({ 
            error: 'No hay restaurantes disponibles', 
            especiales: [],
            message: 'No se encontraron restaurantes en el sistema'
          }, { status: 200 });
        }
      } else {
        console.log('❌ [DEBUG] Usuario regular sin restaurant_id asignado');
        return NextResponse.json({ error: 'No autorizado - Usuario sin restaurante asignado' }, { status: 403 });
      }
    }
    
    console.log('🏪 [DEBUG] RestaurantId final obtenido:', restaurantId);
    
    // Verificar si existen productos especiales
    console.log('🔍 [DEBUG] Verificando productos especiales para restaurante:', restaurantId);
    
    const countQuery = 'SELECT COUNT(*) FROM restaurant.favorite_products WHERE restaurant_id = $1';
    const countResult = await query(countQuery, [restaurantId]);
    console.log('📊 [DEBUG] Productos especiales encontrados:', countResult.rows[0].count);
    
    if (parseInt(countResult.rows[0].count) === 0) {
      console.log('ℹ️ [DEBUG] No hay productos especiales configurados');
      return NextResponse.json({
        success: true,
        especiales: [],
        total: 0,
        message: 'No hay productos especiales configurados'
      });
    }
    
    // Consulta simplificada para obtener productos especiales
    console.log('🔍 [DEBUG] Obteniendo detalles de productos especiales...');
    const especialesQuery = `
      SELECT 
        fp.id,
        fp.product_id,
        fp.created_at,
        p.name,
        p.description,
        p.base_price,
        p.is_available
      FROM restaurant.favorite_products fp
      JOIN system.products p ON fp.product_id = p.id
      WHERE fp.restaurant_id = $1
      ORDER BY fp.created_at DESC;
    `;
    
    console.log('🔍 [DEBUG] Ejecutando consulta SQL...');
    const result = await query(especialesQuery, [restaurantId]);
    console.log('✅ [DEBUG] Consulta exitosa, filas:', result.rows.length);
    
    return NextResponse.json({
      success: true,
      especiales: result.rows,
      total: result.rows.length,
      message: `${result.rows.length} productos especiales encontrados`
    });
    
  } catch (error) {
    console.error('❌ Error al obtener especiales:', error);
    return NextResponse.json(
      { error: 'Error al obtener combinaciones especiales', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

// POST - Marcar/desmarcar combinación como especial
export async function POST(request: Request) {
  try {
    const { combinacionId, esEspecial, precioEspecial } = await request.json();
    
    console.log(`⭐ ${esEspecial ? 'Marcando' : 'Desmarcando'} combinación como especial:`, combinacionId);
    
    if (!combinacionId) {
      return NextResponse.json({ error: 'ID de combinación requerido' }, { status: 400 });
    }
    
    let updateQuery;
    let params;
    
    if (esEspecial) {
      // Marcar como especial con precio especial
      if (!precioEspecial || precioEspecial <= 0) {
        return NextResponse.json({ error: 'Precio especial requerido y debe ser mayor a 0' }, { status: 400 });
      }
      
      updateQuery = `
        UPDATE menu.menu_combinations 
        SET special_price = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, name, base_price, special_price;
      `;
      params = [precioEspecial, combinacionId];
    } else {
      // Desmarcar como especial (quitar precio especial)
      updateQuery = `
        UPDATE menu.menu_combinations 
        SET special_price = NULL, updated_at = NOW()
        WHERE id = $1
        RETURNING id, name, base_price, special_price;
      `;
      params = [combinacionId];
    }
    
    const result = await query(updateQuery, params);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Combinación no encontrada' }, { status: 404 });
    }
    
    const combinacion = result.rows[0];
    
    console.log(`✅ Combinación ${esEspecial ? 'marcada' : 'desmarcada'} como especial:`, combinacion.name);
    
    return NextResponse.json({
      success: true,
      message: `Combinación ${esEspecial ? 'marcada' : 'desmarcada'} como especial`,
      combinacion: {
        id: combinacion.id,
        nombre: combinacion.name,
        precioBase: combinacion.base_price,
        precioEspecial: combinacion.special_price,
        esEspecial: combinacion.special_price !== null
      }
    });
    
  } catch (error) {
    console.error('❌ Error al actualizar especial:', error);
    return NextResponse.json(
      { error: 'Error al actualizar especial', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}


