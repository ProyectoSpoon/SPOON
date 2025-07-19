import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';

// GET - Obtener todos los productos usando la nueva arquitectura
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoriaId = searchParams.get('categoriaId');
    const restauranteId = searchParams.get('restauranteId') || 'default';

    console.log('🔍 GET /api/productos - Nueva arquitectura:', { categoriaId, restauranteId });

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

    // ✅ NUEVA CONSULTA: Usar system.products + restaurant.menu_items + restaurant.menu_pricing
    let queryText = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.category_id as "categoriaId",
        p.is_active as status,
        p.created_at as "createdAt",
        p.updated_at as "updatedAt",
        
        -- Información del menú del restaurante
        mi.is_available,
        mi.is_featured,
        mi.created_at as menu_item_created_at,
        
        -- Precios del restaurante
        COALESCE(mp.daily_menu_price, 0) as "currentPrice",
        mp.special_menu_price as "specialPrice",
        
        -- Información de categoría
        c.name as category_name,
        c.category_type
        
      FROM system.products p
      JOIN restaurant.menu_items mi ON p.id = mi.product_id
      LEFT JOIN restaurant.menu_pricing mp ON mi.restaurant_id = mp.restaurant_id
      LEFT JOIN system.categories c ON p.category_id = c.id
      WHERE mi.restaurant_id = $1
        AND p.is_active = true
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

    console.log('🗄️ Ejecutando consulta con nueva arquitectura...');
    const result = await query(queryText, params);
    
    console.log(`✅ Productos encontrados: ${result.rows.length}`);
    
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
      
      // ✅ NUEVO: Stock simplificado (sin tabla separada)
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
      architecture: 'new' // Para debugging
    });

  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
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

// POST - Crear un nuevo producto usando la nueva arquitectura
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nombre,
      descripcion,
      precio,
      categoriaId,
      imagen,
      restauranteId = 'default'
    } = body;

    console.log('🔄 POST /api/productos - Nueva arquitectura:', { nombre, categoriaId, precio });

    // Validaciones básicas
    if (!nombre || !descripcion || !categoriaId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Datos requeridos faltantes',
          message: 'Nombre, descripción y categoría son requeridos'
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

    // ✅ PASO 1: Verificar si el producto ya existe en system.products
    const existingProductQuery = `
      SELECT id FROM system.products 
      WHERE name = $1 AND category_id = $2 AND is_active = true
    `;
    
    const existingResult = await query(existingProductQuery, [nombre, categoriaId]);
    
    let productId;
    
    if (existingResult.rows.length > 0) {
      // El producto ya existe globalmente
      productId = existingResult.rows[0].id;
      console.log('✅ Producto ya existe en catálogo global:', productId);
    } else {
      // ✅ PASO 2: Crear nuevo producto en system.products
      const createProductQuery = `
        INSERT INTO system.products (
          name, description, category_id, is_active, created_at, updated_at
        ) VALUES (
          $1, $2, $3, true, NOW(), NOW()
        ) RETURNING id
      `;

      const productResult = await query(createProductQuery, [nombre, descripcion, categoriaId]);
      productId = productResult.rows[0].id;
      console.log('✅ Nuevo producto creado en catálogo global:', productId);
    }

    // ✅ PASO 3: Verificar si ya está en el menú del restaurante
    const menuItemQuery = `
      SELECT id FROM restaurant.menu_items 
      WHERE restaurant_id = $1 AND product_id = $2
    `;
    
    const menuItemResult = await query(menuItemQuery, [finalRestaurantId, productId]);
    
    if (menuItemResult.rows.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'El producto ya está en el menú de este restaurante' 
        },
        { status: 409 }
      );
    }

    // ✅ PASO 4: Agregar producto al menú del restaurante
    const addToMenuQuery = `
      INSERT INTO restaurant.menu_items (
        restaurant_id, product_id, is_available, is_featured, created_at, updated_at
      ) VALUES (
        $1, $2, true, false, NOW(), NOW()
      ) RETURNING id
    `;

    await query(addToMenuQuery, [finalRestaurantId, productId]);

    // ✅ PASO 5: Actualizar precios del restaurante si se especifica
    if (precio && precio > 0) {
      const updatePricingQuery = `
        INSERT INTO restaurant.menu_pricing (restaurant_id, daily_menu_price, created_at, updated_at)
        VALUES ($1, $2, NOW(), NOW())
        ON CONFLICT (restaurant_id) 
        DO UPDATE SET daily_menu_price = $2, updated_at = NOW()
      `;
      
      await query(updatePricingQuery, [finalRestaurantId, precio]);
    }

    // ✅ PASO 6: Obtener el producto completo creado
    const completProductQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.category_id,
        p.created_at,
        p.updated_at,
        mp.daily_menu_price
      FROM system.products p
      LEFT JOIN restaurant.menu_pricing mp ON mp.restaurant_id = $2
      WHERE p.id = $1
    `;

    const completeResult = await query(completProductQuery, [productId, finalRestaurantId]);
    const newProduct = completeResult.rows[0];

    // Transformar al formato VersionedProduct
    const producto: VersionedProduct = {
      id: newProduct.id,
      nombre: newProduct.name,
      descripcion: newProduct.description,
      currentPrice: parseFloat(newProduct.daily_menu_price) || 0,
      categoriaId: newProduct.category_id,
      imagen: imagen || undefined,
      currentVersion: 1,
      priceHistory: [],
      versions: [],
      status: 'active',
      stock: {
        currentQuantity: 100,
        minQuantity: 10,
        maxQuantity: 100,
        status: 'in_stock',
        lastUpdated: new Date(),
        alerts: {
          lowStock: false,
          overStock: false,
          thresholds: { low: 10, high: 90 }
        }
      },
      metadata: {
        createdAt: new Date(newProduct.created_at),
        createdBy: 'api',
        lastModified: new Date(newProduct.updated_at),
        lastModifiedBy: 'api'
      }
    };

    console.log('✅ Producto creado y agregado al menú exitosamente');

    return NextResponse.json({
      success: true,
      data: producto,
      message: 'Producto creado exitosamente en el catálogo global y agregado al menú del restaurante',
      architecture: 'new'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error al crear producto:', error);
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