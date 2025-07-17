import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET - Obtener favoritos del restaurante usando nueva arquitectura
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const restaurantId = searchParams.get('restaurantId');
    
    console.log('🔍 GET /api/favoritos - Nueva arquitectura:', { userId, restaurantId });

    // Si no hay restaurantId, buscar el restaurante por defecto
    let finalRestaurantId = restaurantId;
    
    if (!finalRestaurantId) {
      const restaurantQuery = 'SELECT id FROM restaurant.restaurants WHERE status = $1 ORDER BY created_at ASC LIMIT 1';
      const restaurantResult = await query(restaurantQuery, ['active']);
      
      if (restaurantResult.rows.length === 0) {
        return NextResponse.json({
          error: 'No hay restaurantes disponibles'
        }, { status: 400 });
      }
      
      finalRestaurantId = restaurantResult.rows[0].id;
      console.log('✅ Usando restaurante por defecto:', finalRestaurantId);
    }

    // ✅ CONSULTA CORREGIDA: usar system.products + system.categories
    try {
      const favoritosQuery = `
        SELECT 
          rf.id,
          rf.restaurant_id,
          rf.product_id,
          rf.created_by,
          rf.created_at,
          rf.updated_at,
          
          -- ✅ Información del producto desde system.products
          p.name as product_name,
          p.description as product_description,
          p.is_active as product_active,
          
          -- ✅ Información de categoría desde system.categories
          c.id as category_id,
          c.name as category_name,
          c.category_type,
          
          -- ✅ Precios del restaurante
          COALESCE(mp.daily_menu_price, 0) as product_price,
          mp.special_menu_price as special_price,
          
          -- ✅ Disponibilidad en el restaurante
          mi.is_available,
          mi.is_featured,
          
          -- Usuario que lo marcó como favorito
          COALESCE(u.first_name || ' ' || u.last_name, 'Usuario desconocido') as created_by_name
          
        FROM restaurant.favorite_products rf
        JOIN system.products p ON rf.product_id = p.id
        LEFT JOIN system.categories c ON p.category_id = c.id
        LEFT JOIN restaurant.menu_items mi ON (rf.restaurant_id = mi.restaurant_id AND rf.product_id = mi.product_id)
        LEFT JOIN restaurant.menu_pricing mp ON rf.restaurant_id = mp.restaurant_id
        LEFT JOIN auth.users u ON rf.created_by = u.id
        WHERE rf.restaurant_id = $1
          AND p.is_active = true
        ORDER BY rf.created_at DESC;
      `;
      
      const result = await query(favoritosQuery, [finalRestaurantId]);
      
      const favoritos = result.rows.map(row => ({
        id: row.id,
        restaurant_id: row.restaurant_id,
        product_id: row.product_id,
        product_name: row.product_name,
        product_description: row.product_description || '',
        product_image: null, // TODO: Implementar sistema de imágenes
        product_price: parseFloat(row.product_price) || 0,
        special_price: row.special_price ? parseFloat(row.special_price) : null,
        category_id: row.category_id,
        category_name: row.category_name || 'Sin categoría',
        category_type: row.category_type,
        is_available: row.is_available || false,
        is_featured: row.is_featured || false,
        created_by: row.created_by,
        created_by_name: row.created_by_name,
        created_at: row.created_at,
        updated_at: row.updated_at,
        favorite_type: 'product',
        is_active: true
      }));

      console.log('✅ Favoritos obtenidos (nueva arquitectura):', {
        restaurantId: finalRestaurantId,
        total: favoritos.length
      });

      return NextResponse.json({
        favoritos,
        total: favoritos.length,
        restaurant_id: finalRestaurantId,
        architecture: 'new'
      });
      
    } catch (queryError) {
      console.error('❌ Error en consulta de favoritos:', queryError);
      
      return NextResponse.json({
        favoritos: [],
        total: 0,
        restaurant_id: finalRestaurantId,
        warning: 'No se pudieron cargar los favoritos',
        error: queryError instanceof Error ? queryError.message : 'Error desconocido'
      });
    }

  } catch (error) {
    console.error('❌ Error al obtener favoritos:', error);
    return NextResponse.json({
      error: 'Error al obtener favoritos',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// POST - Agregar producto a favoritos
export async function POST(request: Request) {
  try {
    const { userId, productId, restaurantId } = await request.json();
    
    console.log('➕ POST /api/favoritos - Nueva arquitectura:', { userId, productId, restaurantId });

    if (!productId) {
      return NextResponse.json({
        error: 'productId es requerido'
      }, { status: 400 });
    }

    // Buscar restaurante si no se proporciona
    let finalRestaurantId = restaurantId;
    
    if (!finalRestaurantId) {
      const restaurantQuery = 'SELECT id FROM restaurant.restaurants WHERE status = $1 ORDER BY created_at ASC LIMIT 1';
      const restaurantResult = await query(restaurantQuery, ['active']);
      
      if (restaurantResult.rows.length === 0) {
        return NextResponse.json({
          error: 'No hay restaurantes disponibles'
        }, { status: 400 });
      }
      
      finalRestaurantId = restaurantResult.rows[0].id;
    }

    // ✅ VERIFICAR que el producto existe en system.products
    const productQuery = 'SELECT id, name FROM system.products WHERE id = $1 AND is_active = true';
    const productResult = await query(productQuery, [productId]);
    
    if (productResult.rows.length === 0) {
      return NextResponse.json({
        error: 'Producto no encontrado en el catálogo global'
      }, { status: 404 });
    }

    // ✅ VERIFICAR que el producto está en el menú del restaurante
    const menuItemQuery = `
      SELECT id FROM restaurant.menu_items 
      WHERE restaurant_id = $1 AND product_id = $2 AND is_available = true
    `;
    
    const menuItemResult = await query(menuItemQuery, [finalRestaurantId, productId]);
    
    if (menuItemResult.rows.length === 0) {
      return NextResponse.json({
        error: 'El producto no está disponible en el menú de este restaurante'
      }, { status: 404 });
    }

    // ✅ INSERTAR favorito
    const insertQuery = `
      INSERT INTO restaurant.favorite_products (restaurant_id, product_id, created_by, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      ON CONFLICT (restaurant_id, product_id) DO NOTHING
      RETURNING id;
    `;
    
    const insertResult = await query(insertQuery, [finalRestaurantId, productId, userId]);
    
    if (insertResult.rows.length === 0) {
      return NextResponse.json({
        message: 'El producto ya está marcado como favorito',
        isNowFavorite: true,
        alreadyExists: true
      });
    }

    console.log('✅ Favorito agregado exitosamente (nueva arquitectura)');

    return NextResponse.json({
      message: 'Producto agregado a favoritos',
      isNowFavorite: true,
      favorito: {
        id: insertResult.rows[0].id,
        restaurant_id: finalRestaurantId,
        product_id: productId,
        created_by: userId
      },
      architecture: 'new'
    });

  } catch (error) {
    console.error('❌ Error al agregar favorito:', error);
    return NextResponse.json({
      error: 'Error al agregar favorito',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// DELETE - Eliminar producto de favoritos
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const restaurantId = searchParams.get('restaurantId');
    
    console.log('➖ DELETE /api/favoritos - Nueva arquitectura:', { productId, restaurantId });

    if (!productId) {
      return NextResponse.json({
        error: 'productId es requerido'
      }, { status: 400 });
    }

    // Buscar restaurante si no se proporciona
    let finalRestaurantId = restaurantId;
    
    if (!finalRestaurantId) {
      const restaurantQuery = 'SELECT id FROM restaurant.restaurants WHERE status = $1 ORDER BY created_at ASC LIMIT 1';
      const restaurantResult = await query(restaurantQuery, ['active']);
      
      if (restaurantResult.rows.length === 0) {
        return NextResponse.json({
          error: 'No hay restaurantes disponibles'
        }, { status: 400 });
      }
      
      finalRestaurantId = restaurantResult.rows[0].id;
    }

    // Eliminar favorito
    const deleteQuery = `
      DELETE FROM restaurant.favorite_products 
      WHERE restaurant_id = $1 AND product_id = $2
      RETURNING id;
    `;
    
    const deleteResult = await query(deleteQuery, [finalRestaurantId, productId]);
    
    if (deleteResult.rows.length === 0) {
      return NextResponse.json({
        error: 'Favorito no encontrado'
      }, { status: 404 });
    }

    console.log('✅ Favorito eliminado exitosamente (nueva arquitectura)');

    return NextResponse.json({
      message: 'Producto eliminado de favoritos',
      isNowFavorite: false,
      architecture: 'new'
    });

  } catch (error) {
    console.error('❌ Error al eliminar favorito:', error);
    return NextResponse.json({
      error: 'Error al eliminar favorito',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}