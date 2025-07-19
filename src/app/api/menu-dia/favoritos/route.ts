import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET - Obtener favoritos del restaurante
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const restaurantId = searchParams.get('restaurantId');
    
    console.log('🔍 Obteniendo favoritos del restaurante:', { userId, restaurantId });

    // Si no hay restaurantId, buscar el restaurante por defecto del usuario
    let finalRestaurantId = restaurantId;
    
    if (!finalRestaurantId) {
      console.log('🔍 Buscando restaurante por defecto...');
      const restaurantQuery = 'SELECT id FROM restaurant.restaurants WHERE status = $1 ORDER BY created_at ASC LIMIT 1';
      const restaurantResult = await query(restaurantQuery, ['active']);
      
      if (restaurantResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'No hay restaurantes disponibles' },
          { status: 400 }
        );
      }
      
      finalRestaurantId = restaurantResult.rows[0].id;
      console.log('✅ Usando restaurante por defecto:', finalRestaurantId);
    }

    // ✅ CONSULTA CORREGIDA: Obtener favoritos con información del producto
    try {
      const favoritosQuery = `
        SELECT 
          rf.id,
          rf.restaurant_id,
          rf.product_id,
          rf.created_by,
          rf.created_at,
          rf.updated_at,
          p.name as product_name,
          p.description as product_description,
          NULL as product_image,
          p.current_price as product_price,
          p.category_id,
          c.name as category_name,
          COALESCE(u.first_name || ' ' || u.last_name, 'Usuario desconocido') as created_by_name
        FROM restaurant.favorite_products rf
        JOIN system.products p ON rf.product_id = p.id
        LEFT JOIN system.categories c ON p.category_id = c.id
        LEFT JOIN auth.users u ON rf.created_by = u.id
        WHERE rf.restaurant_id = $1
          AND p.status = 'active'
        ORDER BY rf.created_at DESC;
      `;
      
      const result = await query(favoritosQuery, [finalRestaurantId]);
      
      const favoritos = result.rows.map(row => ({
        id: row.id,
        restaurant_id: row.restaurant_id,
        product_id: row.product_id,
        product_name: row.product_name,
        product_description: row.product_description,
        product_image: row.product_image,
        product_price: row.product_price,
        category_id: row.category_id,
        category_name: row.category_name,
        created_by: row.created_by,
        created_by_name: row.created_by_name,
        created_at: row.created_at,
        updated_at: row.updated_at,
        favorite_type: 'product', // Para compatibilidad con el código existente
        is_active: true
      }));

      console.log('✅ Favoritos obtenidos:', {
        restaurantId: finalRestaurantId,
        total: favoritos.length,
        productos: favoritos.map(f => f.product_name)
      });

      return NextResponse.json({
        favoritos,
        total: favoritos.length,
        restaurant_id: finalRestaurantId
      });
      
    } catch (queryError) {
      console.error('❌ Error en consulta de favoritos:', queryError);
      
      // Si hay error en la consulta, devolver array vacío en lugar de error
      return NextResponse.json({
        favoritos: [],
        total: 0,
        restaurant_id: finalRestaurantId,
        warning: 'No se pudieron cargar los favoritos'
      });
    }

  } catch (error) {
    console.error('❌ Error al obtener favoritos:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener favoritos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// POST - Agregar producto a favoritos
export async function POST(request: Request) {
  try {
    const { userId, productId, restaurantId } = await request.json();
    
    console.log('➕ Agregando favorito:', { userId, productId, restaurantId });

    if (!productId) {
      return NextResponse.json(
        { error: 'productId es requerido' },
        { status: 400 }
      );
    }

    // Buscar restaurante si no se proporciona
    let finalRestaurantId = restaurantId;
    
    if (!finalRestaurantId) {
      const restaurantQuery = 'SELECT id FROM restaurant.restaurants WHERE status = $1 ORDER BY created_at ASC LIMIT 1';
      const restaurantResult = await query(restaurantQuery, ['active']);
      
      if (restaurantResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'No hay restaurantes disponibles' },
          { status: 400 }
        );
      }
      
      finalRestaurantId = restaurantResult.rows[0].id;
    }

    // ✅ VERIFICAR QUE EL PRODUCTO EXISTE (consulta simplificada)
    const productQuery = 'SELECT id, name FROM system.products WHERE id = $1 AND status = $2';
    const productResult = await query(productQuery, [productId, 'active']);
    
    if (productResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Producto no encontrado o no activo' },
        { status: 404 }
      );
    }

    // ✅ INSERTAR FAVORITO (usar UPSERT para evitar duplicados)
    const insertQuery = `
      INSERT INTO restaurant.favorite_products (restaurant_id, product_id, created_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (restaurant_id, product_id) DO NOTHING
      RETURNING id;
    `;
    
    const insertResult = await query(insertQuery, [finalRestaurantId, productId, userId]);
    
    if (insertResult.rows.length === 0) {
      // Ya existía como favorito
      return NextResponse.json({
        message: 'El producto ya está marcado como favorito',
        isNowFavorite: true,
        alreadyExists: true
      });
    }

    console.log('✅ Favorito agregado exitosamente');

    return NextResponse.json({
      message: 'Producto agregado a favoritos',
      isNowFavorite: true,
      favorito: {
        id: insertResult.rows[0].id,
        restaurant_id: finalRestaurantId,
        product_id: productId,
        created_by: userId
      }
    });

  } catch (error) {
    console.error('❌ Error al agregar favorito:', error);
    return NextResponse.json(
      { 
        error: 'Error al agregar favorito',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar producto de favoritos
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const restaurantId = searchParams.get('restaurantId');
    
    console.log('➖ Eliminando favorito:', { productId, restaurantId });

    if (!productId) {
      return NextResponse.json(
        { error: 'productId es requerido' },
        { status: 400 }
      );
    }

    // Buscar restaurante si no se proporciona
    let finalRestaurantId = restaurantId;
    
    if (!finalRestaurantId) {
      const restaurantQuery = 'SELECT id FROM restaurant.restaurants WHERE status = $1 ORDER BY created_at ASC LIMIT 1';
      const restaurantResult = await query(restaurantQuery, ['active']);
      
      if (restaurantResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'No hay restaurantes disponibles' },
          { status: 400 }
        );
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
      return NextResponse.json(
        { error: 'Favorito no encontrado' },
        { status: 404 }
      );
    }

    console.log('✅ Favorito eliminado exitosamente');

    return NextResponse.json({
      message: 'Producto eliminado de favoritos',
      isNowFavorite: false
    });

  } catch (error) {
    console.error('❌ Error al eliminar favorito:', error);
    return NextResponse.json(
      { 
        error: 'Error al eliminar favorito',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}



