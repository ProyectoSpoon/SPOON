import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET - Obtener todas las categorías
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restauranteId = searchParams.get('restauranteId') || 'default';
    const tipo = searchParams.get('tipo'); // 'categoria' o 'subcategoria'

    let queryText = `
      SELECT 
        c.id,
        c.name,
        c.category_type,
        c.sort_order,
        c.description,
        c.is_active,
        c.created_at as "createdAt",
        c.updated_at as "updatedAt"
      FROM menu.categories c
      WHERE c.restaurant_id = $1
    `;
    
    const params = [restauranteId];
    let paramIndex = 2;

    if (tipo) {
      queryText += ` AND c.category_type = $${paramIndex}`;
      params.push(tipo);
      paramIndex++;
    }

    queryText += ' ORDER BY c.sort_order ASC, c.name ASC';

    const result = await query(queryText, params);
    
    const categorias = result.rows.map(row => ({
      id: row.id,
      nombre: row.name,
      tipo: row.category_type,
      orden: row.sort_order || 0,
      descripcion: row.description,
      activo: row.is_active,
      restauranteId,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }));

    return NextResponse.json({
      success: true,
      data: categorias,
      count: categorias.length
    });

  } catch (error) {
    console.error('Error al obtener categorías:', error);
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
    const {
      nombre,
      tipo = 'categoria',
      orden = 0,
      descripcion,
      restauranteId = 'default'
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

    const queryText = `
      INSERT INTO menu.categories (
        name, category_type, sort_order, description, restaurant_id,
        is_active, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, true, NOW(), NOW()
      ) RETURNING *
    `;

    const params = [
      nombre,
      tipo,
      orden,
      descripcion,
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
    console.error('Error al crear categoría:', error);
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
