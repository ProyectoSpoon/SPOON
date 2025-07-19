import { NextResponse } from 'next/server';
import { query } from '@/lib/database';
import jwt from 'jsonwebtoken';

// GET - Obtener combinaciones favoritas
export async function GET(request: Request) {
  try {
    console.log('🌟 Obteniendo combinaciones favoritas...');
    
    // Obtener token de autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autenticación requerido' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Obtener información del usuario y restaurantId
    console.log('🔍 [DEBUG] Buscando usuario:', decoded.userId);
    const userCheckQuery = 'SELECT * FROM auth.users WHERE id = $1 LIMIT 1';
    const userCheck = await query(userCheckQuery, [decoded.userId]);
    
    if (userCheck.rows.length === 0) {
      console.log('❌ [DEBUG] Usuario no encontrado');
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    
    const userData = userCheck.rows[0];
    console.log('🔍 [DEBUG] Usuario encontrado:', {
      email: userData.email,
      role: userData.role,
      restaurant_id: userData.restaurant_id || 'NO TIENE'
    });
    
    // Intentar obtener restaurant_id
    let restaurantId = userData.restaurant_id;
    
    // Si no tiene restaurant_id directo, buscar en restaurant_users
    if (!restaurantId) {
      console.log('🔍 [DEBUG] Buscando en restaurant.restaurant_users...');
      const relationQuery = `
        SELECT ru.restaurant_id 
        FROM restaurant.restaurant_users ru
        WHERE ru.user_id = $1
      `;
      const relationResult = await query(relationQuery, [decoded.userId]);
      
      if (relationResult.rows.length > 0) {
        restaurantId = relationResult.rows[0].restaurant_id;
        console.log('🏪 [DEBUG] RestaurantId desde relación:', restaurantId);
      }
    }
    
    // Manejar caso especial para super_admin
    if (!restaurantId) {
      if (userData.role === 'super_admin') {
        console.log('🔧 [DEBUG] Super admin detectado, buscando primer restaurante disponible...');
        const firstRestaurantQuery = 'SELECT id FROM restaurant.restaurants WHERE status = \'active\' ORDER BY created_at ASC LIMIT 1';
        const firstRestaurant = await query(firstRestaurantQuery, []);
        
        if (firstRestaurant.rows.length > 0) {
          restaurantId = firstRestaurant.rows[0].id;
          console.log('🏪 [DEBUG] Usando restaurante por defecto para super_admin:', restaurantId);
        } else {
          console.log('❌ [DEBUG] No hay restaurantes activos en el sistema');
          return NextResponse.json({ 
            success: true,
            favoritos: [],
            total: 0,
            message: 'No hay restaurantes activos en el sistema',
            tipos: { productos: 0, combinaciones: 0, restaurantes: 0 }
          }, { status: 200 });
        }
      } else {
        console.log('❌ [DEBUG] Usuario regular sin restaurant_id asignado');
        return NextResponse.json({ error: 'Usuario no autorizado o restaurante inactivo' }, { status: 403 });
      }
    }
    
    console.log('📊 [DEBUG] Consultando favoritos para restaurante:', restaurantId);
    
    // Verificar si hay favoritos en la tabla (tabla nueva, probablemente vacía)
    const countQuery = 'SELECT COUNT(*) as total FROM mobile.user_favorites WHERE is_active = true';
    const countResult = await query(countQuery, []);
    const totalFavoritos = parseInt(countResult.rows[0].total);
    
    console.log('📊 [DEBUG] Total de favoritos en sistema:', totalFavoritos);
    
    if (totalFavoritos === 0) {
      console.log('ℹ️ [DEBUG] No hay favoritos configurados en el sistema');
      return NextResponse.json({
        success: true,
        favoritos: [],
        total: 0,
        message: 'No hay favoritos configurados',
        tipos: {
          productos: 0,
          combinaciones: 0,
          restaurantes: 0
        }
      });
    }
    
    // Obtener favoritos simplificado (sin columnas problemáticas)
    const favoritosQuery = `
      SELECT 
        uf.id,
        uf.favorite_type,
        uf.notes,
        uf.favorite_count,
        uf.last_ordered,
        uf.created_at,
        -- Datos del producto (si es favorito de producto)
        CASE WHEN uf.favorite_type = 'product' THEN p.id END as product_id,
        CASE WHEN uf.favorite_type = 'product' THEN p.name END as product_name,
        CASE WHEN uf.favorite_type = 'product' THEN p.description END as product_description,
        CASE WHEN uf.favorite_type = 'product' THEN c.name END as categoria_nombre,
        -- Datos de la combinación (si es favorito de combinación)
        CASE WHEN uf.favorite_type = 'combination' THEN mc.id END as combination_id,
        CASE WHEN uf.favorite_type = 'combination' THEN mc.name END as combination_name,
        CASE WHEN uf.favorite_type = 'combination' THEN mc.description END as combination_description,
        -- Datos del restaurante (si es favorito de restaurante)
        CASE WHEN uf.favorite_type = 'restaurant' THEN r.id END as restaurant_id,
        CASE WHEN uf.favorite_type = 'restaurant' THEN r.name END as restaurant_name
      FROM mobile.user_favorites uf
      LEFT JOIN system.products p ON uf.product_id = p.id AND uf.favorite_type = 'product'
      LEFT JOIN system.categories c ON p.category_id = c.id
      LEFT JOIN menu.menu_combinations mc ON uf.combination_id = mc.id AND uf.favorite_type = 'combination'
      LEFT JOIN restaurant.restaurants r ON uf.restaurant_id = r.id AND uf.favorite_type = 'restaurant'
      WHERE uf.is_active = true
        AND (
          (uf.favorite_type = 'restaurant' AND uf.restaurant_id = $1) OR
          (uf.favorite_type = 'product' AND p.id IS NOT NULL) OR
          (uf.favorite_type = 'combination' AND mc.id IS NOT NULL)
        )
      ORDER BY uf.favorite_count DESC, uf.created_at DESC;
    `;
    
    const result = await query(favoritosQuery, [restaurantId]);
    
    console.log(`✅ Favoritos encontrados: ${result.rows.length}`);
    
    // Formatear datos para el frontend
    const favoritos = result.rows.map(row => {
      const baseData = {
        id: row.id,
        tipo: row.favorite_type,
        notas: row.notes || '',
        veces_favorito: row.favorite_count || 1,
        ultimo_pedido: row.last_ordered,
        fecha_agregado: row.created_at
      };

      // Formatear según el tipo de favorito
      switch (row.favorite_type) {
        case 'product':
          return {
            ...baseData,
            product_id: row.product_id,
            nombre: row.product_name || 'Producto sin nombre',
            descripcion: row.product_description || 'Producto favorito',
            imagen: '/images/placeholder-dish.jpg',
            precio: 0,
            precio_formateado: '$0',
            categoria: {
              nombre: row.categoria_nombre || 'Sin categoría',
              color: '#6B7280'
            }
          };
        
        case 'combination':
          return {
            ...baseData,
            combination_id: row.combination_id,
            nombre: row.combination_name || 'Combinación sin nombre',
            descripcion: row.combination_description || 'Combinación favorita',
            imagen: '/images/placeholder-combo.jpg',
            tipo_item: 'Combinación'
          };
        
        case 'restaurant':
          return {
            ...baseData,
            restaurant_id: row.restaurant_id,
            nombre: row.restaurant_name || 'Restaurante',
            descripcion: 'Restaurante favorito',
            imagen: '/images/placeholder-restaurant.jpg',
            tipo_item: 'Restaurante'
          };
        
        default:
          return baseData;
      }
    });
    
    return NextResponse.json({
      success: true,
      favoritos: favoritos,
      total: favoritos.length,
      message: favoritos.length === 0 ? 'No hay favoritos configurados' : `${favoritos.length} favoritos encontrados`,
      tipos: {
        productos: favoritos.filter(f => f.tipo === 'product').length,
        combinaciones: favoritos.filter(f => f.tipo === 'combination').length,
        restaurantes: favoritos.filter(f => f.tipo === 'restaurant').length
      }
    });
    
  } catch (error) {
    console.error('❌ Error al obtener favoritos:', error);
    return NextResponse.json(
      { error: 'Error al obtener combinaciones favoritas', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

// POST - Marcar/desmarcar combinación como favorita
export async function POST(request: Request) {
  try {
    const { combinacionId, esFavorito } = await request.json();
    
    console.log(`🌟 ${esFavorito ? 'Marcando' : 'Desmarcando'} combinación como favorita:`, combinacionId);
    
    if (!combinacionId) {
      return NextResponse.json({ error: 'ID de combinación requerido' }, { status: 400 });
    }
    
    // Actualizar el estado de favorito
    const updateQuery = `
      UPDATE menu.menu_combinations 
      SET is_featured = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, is_featured;
    `;
    
    const result = await query(updateQuery, [esFavorito, combinacionId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Combinación no encontrada' }, { status: 404 });
    }
    
    const combinacion = result.rows[0];
    
    console.log(`✅ Combinación ${esFavorito ? 'marcada' : 'desmarcada'} como favorita:`, combinacion.name);
    
    return NextResponse.json({
      success: true,
      message: `Combinación ${esFavorito ? 'agregada a' : 'removida de'} favoritos`,
      combinacion: {
        id: combinacion.id,
        nombre: combinacion.name,
        esFavorito: combinacion.is_featured
      }
    });
    
  } catch (error) {
    console.error('❌ Error al actualizar favorito:', error);
    return NextResponse.json(
      { error: 'Error al actualizar favorito', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}


