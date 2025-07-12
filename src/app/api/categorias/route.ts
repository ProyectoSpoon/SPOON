import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET - Obtener todas las categorías
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let restauranteId = searchParams.get('restauranteId');
    const tipo = searchParams.get('tipo'); // 'categoria' o 'subcategoria'

    // Si no se proporciona restauranteId o es 'default', usar el primer restaurante
    if (!restauranteId || restauranteId === 'default') {
      console.log('🔍 Buscando restaurante por defecto...');
      
      const restaurantQuery = 'SELECT id FROM restaurant.restaurants WHERE status = $1 ORDER BY created_at ASC LIMIT 1';
      const restaurantResult = await query(restaurantQuery, ['active']);
      
      if (restaurantResult.rows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'No hay restaurantes disponibles',
            message: 'Debe existir al menos un restaurante activo'
          },
          { status: 400 }
        );
      }
      
      restauranteId = restaurantResult.rows[0].id;
      console.log('✅ Usando restaurante por defecto:', restauranteId);
    }

    let queryText = `
      SELECT
        c.id,
        c.name,
        c.category_type,
        c.sort_order,
        c.description,
        c.parent_id,
        c.is_active,
        c.created_at as "createdAt",
        c.updated_at as "updatedAt"
      FROM menu.categories c
      WHERE c.restaurant_id = $1
        AND c.is_active = true
    `;

    const params = [restauranteId];
    let paramIndex = 2;

    if (tipo) {
      queryText += ` AND c.category_type = $${paramIndex}`;
      params.push(tipo);
      paramIndex++;
    }

    queryText += ' ORDER BY c.parent_id NULLS FIRST, c.sort_order ASC, c.name ASC';

    console.log('🔍 Ejecutando query para categorías...');
    const result = await query(queryText, params);
    console.log(`✅ Encontradas ${result.rows.length} categorías`);

    const categorias = result.rows.map(row => ({
      id: row.id,
      nombre: row.name,
      tipo: row.category_type,
      orden: row.sort_order || 0,
      descripcion: row.description,
      parentId: row.parent_id || undefined, // NUEVO: incluir parent_id
      activo: row.is_active,
      restauranteId,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }));

    // Log para debug de la estructura jerárquica
    const principales = categorias.filter(c => !c.parentId);
    const subcategorias = categorias.filter(c => c.parentId);
    console.log(`📊 Estructura: ${principales.length} principales, ${subcategorias.length} subcategorías`);

    return NextResponse.json({
      success: true,
      data: categorias,
      count: categorias.length,
      restauranteId: restauranteId
    });

  } catch (error) {
    console.error('❌ Error al obtener categorías:', error);
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

// POST - Crear una nueva categoría
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let {
      nombre,
      tipo = 'categoria',
      orden = 0,
      descripcion,
      parentId, // NUEVO: soporte para parent_id
      restauranteId
    } = body;

    // Validaciones básicas
    if (!nombre) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos requeridos faltantes',
          message: 'El nombre es requerido'
        },
        { status: 400 }
      );
    }

    // Si no se proporciona restauranteId, usar el primer restaurante
    if (!restauranteId) {
      const restaurantQuery = 'SELECT id FROM restaurant.restaurants WHERE status = $1 ORDER BY created_at ASC LIMIT 1';
      const restaurantResult = await query(restaurantQuery, ['active']);
      
      if (restaurantResult.rows.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'No hay restaurantes disponibles',
            message: 'Debe existir al menos un restaurante activo'
          },
          { status: 400 }
        );
      }
      
      restauranteId = restaurantResult.rows[0].id;
    }

    const queryText = `
      INSERT INTO menu.categories (
        name, category_type, sort_order, description, parent_id, restaurant_id,
        is_active, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, true, NOW(), NOW()
      ) RETURNING *
    `;

    const params = [
      nombre,
      tipo,
      orden,
      descripcion,
      parentId || null, // NUEVO: incluir parent_id
      restauranteId
    ];

    const result = await query(queryText, params);
    const newCategory = result.rows[0];

    const categoria = {
      id: newCategory.id,
      nombre: newCategory.name,
      tipo: newCategory.category_type,
      orden: newCategory.sort_order,
      descripcion: newCategory.description,
      parentId: newCategory.parent_id || undefined, // NUEVO: incluir parent_id
      activo: newCategory.is_active,
      restauranteId: newCategory.restaurant_id,
      createdAt: new Date(newCategory.created_at),
      updatedAt: new Date(newCategory.updated_at)
    };

    return NextResponse.json({
      success: true,
      data: categoria,
      message: 'Categoría creada exitosamente'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error al crear categoría:', error);
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
