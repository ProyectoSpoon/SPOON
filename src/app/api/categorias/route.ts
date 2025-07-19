import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET - Obtener todas las categorías desde system.categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo'); // 'categoria' o 'subcategoria'

    console.log('🔍 GET /api/categorias - Nueva arquitectura (system.categories)');

    // ✅ CONSULTA SIMPLE: Solo columnas que sabemos que existen
    let queryText = `
      SELECT
        c.id,
        c.name,
        c.category_type,
        c.sort_order,
        c.created_at
      FROM system.categories c
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (tipo) {
      queryText += ` WHERE c.category_type = $${paramIndex}`;
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
      descripcion: '', // Valor por defecto
      activo: true, // Valor por defecto
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.created_at) // Usar created_at como fallback
    }));

    console.log(`✅ Categorías encontradas: ${categorias.length}`);

    return NextResponse.json({
      success: true,
      data: categorias,
      count: categorias.length
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
    const {
      nombre,
      tipo = 'categoria',
      orden = 0
    } = body;

    console.log('🔄 POST /api/categorias - Creando categoría:', nombre);

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

    // Verificar duplicados
    const existsQuery = `
      SELECT id FROM system.categories 
      WHERE name = $1 AND category_type = $2
    `;
    const existsResult = await query(existsQuery, [nombre, tipo]);
    
    if (existsResult.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Categoría duplicada',
          message: `Ya existe una categoría '${nombre}' del tipo '${tipo}'`
        },
        { status: 409 }
      );
    }

    // ✅ INSERCIÓN SIMPLE: Solo columnas que sabemos que existen
    const queryText = `
      INSERT INTO system.categories (
        name, 
        category_type, 
        sort_order, 
        created_at
      ) VALUES (
        $1, $2, $3, NOW()
      ) RETURNING *
    `;

    const params = [nombre, tipo, orden];
    const result = await query(queryText, params);
    const newCategory = result.rows[0];

    const categoria = {
      id: newCategory.id,
      nombre: newCategory.name,
      tipo: newCategory.category_type,
      orden: newCategory.sort_order,
      descripcion: '',
      activo: true,
      createdAt: new Date(newCategory.created_at),
      updatedAt: new Date(newCategory.created_at)
    };

    console.log('✅ Categoría creada:', categoria.id);

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

// PUT - Actualizar una categoría existente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      nombre,
      tipo,
      orden
    } = body;

    console.log('🔄 PUT /api/categorias - Actualizando categoría:', id);

    if (!id || !nombre) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos requeridos faltantes',
          message: 'ID y nombre son requeridos'
        },
        { status: 400 }
      );
    }

    // Verificar que existe
    const existsQuery = `SELECT id FROM system.categories WHERE id = $1`;
    const existsResult = await query(existsQuery, [id]);
    
    if (existsResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Categoría no encontrada',
          message: `No existe una categoría con ID '${id}'`
        },
        { status: 404 }
      );
    }

    // ✅ ACTUALIZACIÓN SIMPLE: Solo columnas que sabemos que existen
    const queryText = `
      UPDATE system.categories 
      SET 
        name = $1,
        category_type = $2,
        sort_order = $3
      WHERE id = $4
      RETURNING *
    `;

    const params = [nombre, tipo, orden || 0, id];
    const result = await query(queryText, params);
    const updatedCategory = result.rows[0];

    const categoria = {
      id: updatedCategory.id,
      nombre: updatedCategory.name,
      tipo: updatedCategory.category_type,
      orden: updatedCategory.sort_order,
      descripcion: '',
      activo: true,
      createdAt: new Date(updatedCategory.created_at),
      updatedAt: new Date(updatedCategory.created_at)
    };

    console.log('✅ Categoría actualizada:', categoria.id);

    return NextResponse.json({
      success: true,
      data: categoria,
      message: 'Categoría actualizada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al actualizar categoría:', error);
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

// DELETE - Eliminar una categoría
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('🗑️ DELETE /api/categorias - Eliminando categoría:', id);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID requerido',
          message: 'Se requiere el ID de la categoría'
        },
        { status: 400 }
      );
    }

    // Verificar que no hay productos usando esta categoría
    const productsQuery = `
      SELECT COUNT(*) as count 
      FROM system.products 
      WHERE category_id = $1
    `;
    const productsResult = await query(productsQuery, [id]);
    const productCount = parseInt(productsResult.rows[0].count);

    if (productCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Categoría en uso',
          message: `No se puede eliminar. La categoría tiene ${productCount} producto(s) asociado(s)`
        },
        { status: 409 }
      );
    }

    // Eliminar categoría
    const deleteQuery = `
      DELETE FROM system.categories 
      WHERE id = $1 
      RETURNING *
    `;
    
    const result = await query(deleteQuery, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Categoría no encontrada',
          message: `No existe una categoría con ID '${id}'`
        },
        { status: 404 }
      );
    }

    console.log('✅ Categoría eliminada:', id);

    return NextResponse.json({
      success: true,
      message: 'Categoría eliminada exitosamente',
      data: { id }
    });

  } catch (error) {
    console.error('❌ Error al eliminar categoría:', error);
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