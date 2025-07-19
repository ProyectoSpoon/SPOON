import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';

// GET - Obtener todos los productos del catálogo global para que el restaurante pueda escoger
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoriaId = searchParams.get('categoriaId');
    const restauranteId = searchParams.get('restauranteId') || 'default';

    console.log('🔍 GET /api/productos - Catálogo global:', { categoriaId, restauranteId });

    // Si es 'default', buscar el primer restaurante activo
    let finalRestaurantId = restauranteId;
    if (restauranteId === 'default') {
      const restaurantQuery = 'SELECT id FROM restaurant.restaurants WHERE status = $1 ORDER BY created_at ASC LIMIT 1';
      const restaurantResult = await query(restaurantQuery, ['active']);
      
      if (restaurantResult.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No hay restaurantes disponibles',
          data: [],
          count: 0
        }, { status: 400 });
      }
      
      finalRestaurantId = restaurantResult.rows[0].id;
      console.log('✅ Usando restaurante por defecto:', finalRestaurantId);
    }

    // ✅ NUEVA CONSULTA: Mostrar TODO el catálogo global (system.products)
    // + información de si ya está en el menú del restaurante + precios del restaurante
    let queryText = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.category_id as "categoriaId",
        p.is_active as status,
        p.created_at as "createdAt",
        p.updated_at as "updatedAt",
        
        -- Información de categoría
        c.name as category_name,
        c.category_type,
        
        -- Verificar si ya está en el menú del restaurante (OPCIONAL)
        CASE WHEN mi.id IS NOT NULL THEN true ELSE false END as "yaEnMenu",
        mi.is_available as "disponibleEnMenu",
        mi.is_featured as "destacadoEnMenu",
        
        -- Precios del restaurante (si los tiene configurados)
        COALESCE(mp.daily_menu_price, 0) as "currentPrice",
        mp.special_menu_price as "specialPrice"
        
      FROM system.products p
      LEFT JOIN system.categories c ON p.category_id = c.id
      LEFT JOIN restaurant.menu_items mi ON (p.id = mi.product_id AND mi.restaurant_id = $1)
      LEFT JOIN restaurant.menu_pricing mp ON mp.restaurant_id = $1
      WHERE p.is_active = true
    `;
    
    const params = [finalRestaurantId];
    let paramIndex = 2;

    // Filtrar por categoría si se especifica
    if (categoriaId) {
      queryText += ` AND p.category_id = $${paramIndex}`;
      params.push(categoriaId);
      paramIndex++;
    }

    queryText += ' ORDER BY c.sort_order ASC, p.name ASC';

    console.log('🗄️ Ejecutando consulta del catálogo global...');
    const result = await query(queryText, params);
    
    console.log(`✅ Productos del catálogo encontrados: ${result.rows.length}`);
    
    // Transformar los datos al formato VersionedProduct
    const productos: VersionedProduct[] = result.rows.map(row => ({
      id: row.id,
      nombre: row.name,
      descripcion: row.description || '',
      currentPrice: parseFloat(row.currentPrice) || 0,
      categoriaId: row.categoriaId,
      imagen: undefined, // TODO: Implementar sistema de imágenes si es necesario
      currentVersion: 1, // Versión por defecto
      priceHistory: [], // Se cargaría por separado si es necesario
      versions: [], // Se cargaría por separado si es necesario
      status: row.status ? 'active' : 'discontinued',
      
      // ✅ Información adicional (sin conflictos de tipos)
      // yaEnMenu, disponibleEnMenu, destacadoEnMenu se pueden agregar después
      
      // ✅ Stock simplificado (sin tabla separada)
      stock: {
        currentQuantity: 100, // Cantidad por defecto - ajustar según necesidades
        minQuantity: 10,
        maxQuantity: 100,
        status: 'in_stock',
        lastUpdated: new Date(),
        alerts: {
          lowStock: false,
          overStock: false,
          thresholds: {
            low: 10,
            high: 90
          }
        }
      },
      
      metadata: {
        createdAt: new Date(row.createdAt),
        createdBy: 'system',
        lastModified: new Date(row.updatedAt),
        lastModifiedBy: 'system'
      }
    }));

    return NextResponse.json({
      success: true,
      data: productos,
      count: productos.length,
      restaurantId: finalRestaurantId,
      architecture: 'global_catalog', // Para debugging
      message: `Catálogo global cargado con ${productos.length} productos disponibles.`
    });

  } catch (error) {
    console.error('❌ Error al obtener catálogo de productos:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// POST - Agregar un producto del catálogo global al menú del restaurante
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId, // ID del producto del catálogo global
      restauranteId = 'default',
      isAvailable = true,
      isFeatured = false
    } = body;

    console.log('🔄 POST /api/productos - Agregando al menú del restaurante:', { productId, restauranteId });

    // Validaciones básicas
    if (!productId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Product ID es requerido',
          message: 'Debe especificar el ID del producto a agregar al menú'
        },
        { status: 400 }
      );
    }

    // Obtener restaurante final
    let finalRestaurantId = restauranteId;
    if (restauranteId === 'default') {
      const restaurantQuery = 'SELECT id FROM restaurant.restaurants WHERE status = $1 ORDER BY created_at ASC LIMIT 1';
      const restaurantResult = await query(restaurantQuery, ['active']);
      
      if (restaurantResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No hay restaurantes disponibles' },
          { status: 400 }
        );
      }
      
      finalRestaurantId = restaurantResult.rows[0].id;
    }

    // ✅ VERIFICAR QUE EL PRODUCTO EXISTE EN EL CATÁLOGO GLOBAL
    const productQuery = 'SELECT id, name, description, category_id FROM system.products WHERE id = $1 AND is_active = true';
    const productResult = await query(productQuery, [productId]);
    
    if (productResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado en el catálogo global' },
        { status: 404 }
      );
    }

    const product = productResult.rows[0];

    // ✅ VERIFICAR SI YA ESTÁ EN EL MENÚ DEL RESTAURANTE
    const menuItemQuery = 'SELECT id FROM restaurant.menu_items WHERE restaurant_id = $1 AND product_id = $2';
    const menuItemResult = await query(menuItemQuery, [finalRestaurantId, productId]);
    
    if (menuItemResult.rows.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'El producto ya está en el menú de este restaurante',
          message: 'Use PUT para actualizar la configuración del producto en el menú'
        },
        { status: 409 }
      );
    }

    // ✅ AGREGAR PRODUCTO AL MENÚ DEL RESTAURANTE
    const addToMenuQuery = `
      INSERT INTO restaurant.menu_items (
        restaurant_id, product_id, is_available, is_featured, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, NOW(), NOW()
      ) RETURNING id
    `;

    const addResult = await query(addToMenuQuery, [finalRestaurantId, productId, isAvailable, isFeatured]);

    console.log('✅ Producto agregado al menú del restaurante exitosamente');

    return NextResponse.json({
      success: true,
      data: {
        menuItemId: addResult.rows[0].id,
        productId: productId,
        productName: product.name,
        restaurantId: finalRestaurantId,
        isAvailable,
        isFeatured
      },
      message: `${product.name} agregado al menú del restaurante exitosamente`,
      architecture: 'global_catalog'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error al agregar producto al menú:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}