import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET - Obtener todas las categorías (ahora globales desde system.categories)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo'); // 'categoria' o 'subcategoria'

    console.log('🔍 GET /api/categorias - Nueva arquitectura (system.categories)');

    // ✅ NUEVA CONSULTA: system.categories (globales, sin restaurant_id)
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
      FROM system.categories c
      WHERE c.is_active = true
    `;

    const params: any[] = [];
    let paramIndex = 1;

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
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }));

    console.log(`✅ Categorías globales encontradas: ${categorias.length}`);

    return NextResponse.json({
      success: true,
      data: categorias,
      count: categorias.length,
      architecture: 'global' // Para debugging
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

// POST - Crear una nueva categoría global
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nombre,
      tipo = 'categoria',
      orden = 0,
      descripcion
    } = body;

    console.log('🔄 POST /api/categorias - Creando categoría global:', nombre);

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

    // ✅ NUEVA INSERCIÓN: system.categories (sin restaurant_id)
    const queryText = `
      INSERT INTO system.categories (
        name, category_type, sort_order, description, is_active, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, true, NOW(), NOW()
      ) RETURNING *
    `;

    const params = [nombre, tipo, orden, descripcion];
    const result = await query(queryText, params);
    const newCategory = result.rows[0];

    const categoria = {
      id: newCategory.id,
      nombre: newCategory.name,
      tipo: newCategory.category_type,
      orden: newCategory.sort_order,
      descripcion: newCategory.description,
      activo: newCategory.is_active,
      createdAt: new Date(newCategory.created_at),
      updatedAt: new Date(newCategory.updated_at)
    };

    console.log('✅ Categoría global creada:', categoria.id);

    return NextResponse.json({
      success: true,
      data: categoria,
      message: 'Categoría global creada exitosamente',
      architecture: 'global'
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