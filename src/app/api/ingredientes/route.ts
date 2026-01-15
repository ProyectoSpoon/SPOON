import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET - Obtener ingredientes (productos)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get('categoria');

    const supabase = createRouteHandlerClient({ cookies });

    // Consultar productos que son ingredientes
    let query = supabase
      .schema('system')
      .from('products')
      .select(`
        id,
        name,
        description,
        category_id,
        is_active,
        created_at,
        updated_at,
        categories:category_id (
          name,
          category_type
        )
      `)
      .eq('is_active', true);

    if (categoria) {
      query = query.eq('categories.category_type', categoria);
    }

    const { data, error } = await query.order('name');

    if (error) {
      console.error('Error fetching ingredientes:', error);
      return NextResponse.json(
        { error: 'Error al obtener ingredientes' },
        { status: 500 }
      );
    }

    const ingredientes = data?.map(row => ({
      id: row.id,
      nombre: row.name,
      name: row.name,
      descripcion: row.description || '',
      unidad_medida: 'unidad',
      activo: row.is_active,
      created_at: row.created_at
    })) || [];

    return NextResponse.json({
      success: true,
      ingredientes,
      total: ingredientes.length
    });

  } catch (error) {
    console.error('❌ Error al obtener ingredientes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear ingrediente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, nombre = name, descripcion = '', categoria_tipo = 'ingrediente' } = body;

    if (!nombre) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Buscar o crear categoría
    let categoryId;
    const { data: category } = await supabase
      .schema('system')
      .from('categories')
      .select('id')
      .eq('category_type', categoria_tipo)
      .limit(1)
      .single();

    if (category) {
      categoryId = category.id;
    } else {
      const { data: newCategory } = await supabase
        .schema('system')
        .from('categories')
        .insert({
          name: categoria_tipo.charAt(0).toUpperCase() + categoria_tipo.slice(1) + 's',
          category_type: categoria_tipo,
          sort_order: 100,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      categoryId = newCategory?.id;
    }

    // Crear producto
    const { data: product, error } = await supabase
      .schema('system')
      .from('products')
      .insert({
        name: nombre,
        description: descripcion || `Ingrediente: ${nombre}`,
        category_id: categoryId,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating ingrediente:', error);
      return NextResponse.json(
        { error: 'Error al crear ingrediente' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ingrediente: {
        id: product.id,
        nombre: product.name,
        descripcion: product.description
      },
      message: 'Ingrediente creado exitosamente'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error al crear ingrediente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
