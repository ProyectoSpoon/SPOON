import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// ✅ REDISEÑO COMPLETO: Usar products como ingredientes base
// En la nueva arquitectura, los "ingredientes" son productos del sistema
// que pueden ser utilizados como componentes de otros productos

// GET - Obtener productos que pueden usarse como ingredientes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let restauranteId = searchParams.get('restauranteId');
    const categoria = searchParams.get('categoria'); // Para filtrar por tipo de ingrediente
    
    console.log('🔍 GET /api/ingredientes - Nueva arquitectura (productos como ingredientes)');

    // Si no hay restaurantId, usar el primer restaurante
    if (!restauranteId) {
      const restaurantQuery = 'SELECT id FROM restaurant.restaurants WHERE status = $1 ORDER BY created_at ASC LIMIT 1';
      const restaurantResult = await query(restaurantQuery, ['active']);
      
      if (restaurantResult.rows.length === 0) {
        return NextResponse.json({
          error: 'No hay restaurantes disponibles'
        }, { status: 400 });
      }
      
      restauranteId = restaurantResult.rows[0].id;
    }

    // ✅ NUEVA CONSULTA: Productos disponibles como ingredientes
    let queryText = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.category_id,
        p.is_active,
        p.created_at,
        p.updated_at,
        
        -- Información de categoría
        c.name as category_name,
        c.category_type,
        
        -- Disponibilidad en el restaurante
        mi.is_available,
        mi.is_featured,
        
        -- Precios del restaurante (como costo del ingrediente)
        COALESCE(mp.daily_menu_price, 0) as unit_cost
        
      FROM system.products p
      LEFT JOIN system.categories c ON p.category_id = c.id
      LEFT JOIN restaurant.menu_items mi ON p.id = mi.product_id AND mi.restaurant_id = $1
      LEFT JOIN restaurant.menu_pricing mp ON mp.restaurant_id = $1
      WHERE p.is_active = true
    `;

    const params = [restauranteId];
    let paramIndex = 2;

    // Filtrar por categoría si se especifica
    if (categoria) {
      queryText += ` AND c.category_type = $${paramIndex}`;
      params.push(categoria);
      paramIndex++;
    }

    // Solo mostrar productos que pueden ser ingredientes (ej: no incluir menús complejos)
    queryText += ` AND c.category_type IN ('ingrediente', 'base', 'condimento', 'proteina', 'vegetal', 'lacteo', 'grano')`;
    queryText += ' ORDER BY c.category_type ASC, p.name ASC';

    const result = await query(queryText, params);
    
    console.log(`✅ Ingredientes (productos) encontrados: ${result.rows.length}`);

    // Transformar a formato de ingredientes
    const ingredientes = result.rows.map(row => ({
      id: row.id,
      nombre: row.name,
      name: row.name, // Para compatibilidad
      descripcion: '' || '',
      description: '' || '',
      
      // Información como ingrediente
      unidad_medida: 'unidad', // Por defecto, se puede extender
      categoria_ingrediente: row.category_type || 'general',
      precio_unitario: parseFloat(row.unit_cost) || 0,
      
      // Stock simulado (se puede implementar una tabla separada si es necesario)
      stock_actual: 100, // Valor por defecto
      stock_minimo: 10,
      stock_maximo: 200,
      
      // Disponibilidad en el restaurante
      disponible_restaurante: row.is_available || false,
      es_destacado: row.is_featured || false,
      
      // Metadatos
      category_id: row.category_id,
      category_name: row.category_name || 'Sin categoría',
      restaurant_id: restauranteId,
      activo: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    return NextResponse.json({
      success: true,
      ingredientes,
      total: ingredientes.length,
      restaurant_id: restauranteId,
      architecture: 'products_as_ingredients'
    });

  } catch (error) {
    console.error('❌ Error al obtener ingredientes:', error);
    return NextResponse.json({
      error: 'Error al obtener ingredientes',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// POST - Crear un nuevo ingrediente (producto en categoría de ingrediente)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      nombre = name, // Aceptar ambos formatos
      descripcion = '',
      description = descripcion,
      unidad_medida = 'unidad',
      precio_unitario = 0,
      categoria_tipo = 'ingrediente',
      restaurant_id
    } = body;

    console.log('🔄 POST /api/ingredientes - Creando ingrediente como producto:', nombre);

    // Validar campos requeridos
    if (!nombre) {
      return NextResponse.json({
        error: 'El nombre es requerido'
      }, { status: 400 });
    }

    // Obtener restaurante final
    let finalRestaurantId = restaurant_id;
    if (!finalRestaurantId) {
      const restaurantQuery = 'SELECT id FROM restaurant.restaurants WHERE status = $1 ORDER BY created_at ASC LIMIT 1';
      const restaurantResult = await query(restaurantQuery, ['active']);
      
      if (finalRestaurantId.rows.length === 0) {
        return NextResponse.json({
          error: 'No hay restaurantes disponibles'
        }, { status: 400 });
      }
      
      finalRestaurantId = restaurantResult.rows[0].id;
    }

    // ✅ PASO 1: Buscar o crear categoría de ingredientes
    let categoryId;
    const categoryQuery = `
      SELECT id FROM system.categories 
      WHERE category_type = $1 AND is_active = true
      LIMIT 1
    `;
    
    const categoryResult = await query(categoryQuery, [categoria_tipo]);
    
    if (categoryResult.rows.length === 0) {
      // Crear categoría de ingredientes si no existe
      const createCategoryQuery = `
        INSERT INTO system.categories (name, category_type, description, sort_order, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, 100, true, NOW(), NOW())
        RETURNING id
      `;
      
      const newCategoryResult = await query(createCategoryQuery, [
        categoria_tipo.charAt(0).toUpperCase() + categoria_tipo.slice(1) + 's',
        categoria_tipo,
        `Categoría para ${categoria_tipo}s del sistema`
      ]);
      
      categoryId = newCategoryResult.rows[0].id;
      console.log('✅ Categoría creada:', categoryId);
    } else {
      categoryId = categoryResult.rows[0].id;
    }

    // ✅ PASO 2: Crear producto en system.products
    const createProductQuery = `
      INSERT INTO system.products (
        name, description, category_id, is_active, created_at, updated_at
      ) VALUES (
        $1, $2, $3, true, NOW(), NOW()
      ) RETURNING id, name, description, category_id, created_at
    `;

    const productResult = await query(createProductQuery, [
      nombre,
      description || descripcion || `Ingrediente: ${nombre}`,
      categoryId
    ]);

    const newProduct = productResult.rows[0];

    // ✅ PASO 3: Agregar al menú del restaurante si se especifica
    if (finalRestaurantId) {
      const addToMenuQuery = `
        INSERT INTO restaurant.menu_items (
          restaurant_id, product_id, is_available, is_featured, created_at, updated_at
        ) VALUES (
          $1, $2, true, false, NOW(), NOW()
        )
      `;

      await query(addToMenuQuery, [finalRestaurantId, newProduct.id]);

      // ✅ PASO 4: Configurar precio como costo del ingrediente
      if (precio_unitario > 0) {
        const updatePricingQuery = `
          INSERT INTO restaurant.menu_pricing (restaurant_id, daily_menu_price, created_at, updated_at)
          VALUES ($1, $2, NOW(), NOW())
          ON CONFLICT (restaurant_id) 
          DO UPDATE SET daily_menu_price = GREATEST(restaurant.menu_pricing.daily_menu_price, $2), updated_at = NOW()
        `;
        
        await query(updatePricingQuery, [finalRestaurantId, precio_unitario]);
      }
    }

    // Respuesta en formato de ingrediente
    const ingrediente = {
      id: newProduct.id,
      nombre: newProduct.name,
      name: newProduct.name,
      descripcion: newProduct.description,
      description: newProduct.description,
      unidad_medida: unidad_medida,
      precio_unitario: precio_unitario,
      categoria_tipo: categoria_tipo,
      category_id: categoryId,
      restaurant_id: finalRestaurantId,
      stock_actual: 100, // Valor por defecto
      activo: true,
      created_at: newProduct.created_at
    };

    console.log('✅ Ingrediente (producto) creado exitosamente');

    return NextResponse.json({
      success: true,
      ingrediente,
      message: 'Ingrediente creado exitosamente como producto del sistema',
      architecture: 'products_as_ingredients'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error al crear ingrediente:', error);
    return NextResponse.json({
      error: 'Error al crear ingrediente',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// PUT - Actualizar ingrediente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nombre, descripcion, precio_unitario, unidad_medida } = body;

    if (!id) {
      return NextResponse.json({
        error: 'ID del ingrediente es requerido'
      }, { status: 400 });
    }

    console.log('🔄 PUT /api/ingredientes - Actualizando ingrediente:', id);

    // Actualizar en system.products
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (nombre) {
      updates.push(`name = $${paramIndex}`);
      values.push(nombre);
      paramIndex++;
    }

    if (descripcion) {
      updates.push(`description = $${paramIndex}`);
      values.push(descripcion);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json({
        error: 'No hay datos para actualizar'
      }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const updateQuery = `
      UPDATE system.products 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex} AND is_active = true
      RETURNING id, name, description, updated_at
    `;

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json({
        error: 'Ingrediente no encontrado'
      }, { status: 404 });
    }

    console.log('✅ Ingrediente actualizado exitosamente');

    return NextResponse.json({
      success: true,
      ingrediente: result.rows[0],
      message: 'Ingrediente actualizado exitosamente',
      architecture: 'products_as_ingredients'
    });

  } catch (error) {
    console.error('❌ Error al actualizar ingrediente:', error);
    return NextResponse.json({
      error: 'Error al actualizar ingrediente',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// DELETE - Eliminar ingrediente (marcar como inactivo)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        error: 'ID del ingrediente es requerido'
      }, { status: 400 });
    }

    console.log('🗑️ DELETE /api/ingredientes - Eliminando ingrediente:', id);

    // Marcar como inactivo en system.products
    const deleteQuery = `
      UPDATE system.products 
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING id, name
    `;

    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({
        error: 'Ingrediente no encontrado'
      }, { status: 404 });
    }

    console.log('✅ Ingrediente eliminado (marcado como inactivo)');

    return NextResponse.json({
      success: true,
      message: 'Ingrediente eliminado exitosamente',
      architecture: 'products_as_ingredients'
    });

  } catch (error) {
    console.error('❌ Error al eliminar ingrediente:', error);
    return NextResponse.json({
      error: 'Error al eliminar ingrediente',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
