import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET - Obtener categorías
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');

    const supabase = createRouteHandlerClient({ cookies });

    let query = supabase
      .schema('system')
      .from('categories')
      .select('id, name, category_type, sort_order, created_at');

    if (tipo) {
      query = query.eq('category_type', tipo);
    }

    const { data, error } = await query.order('sort_order').order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        { success: false, error: 'Error al obtener categorías' },
        { status: 500 }
      );
    }

    const categorias = data?.map(row => ({
      id: row.id,
      nombre: row.name,
      tipo: row.category_type,
      orden: row.sort_order || 0,
      activo: true,
      createdAt: new Date(row.created_at)
    })) || [];

    return NextResponse.json({
      success: true,
      data: categorias,
      count: categorias.length
    });

  } catch (error) {
    console.error('❌ Error al obtener categorías:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear categoría
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, tipo = 'categoria', orden = 0 } = body;

    if (!nombre) {
      return NextResponse.json(
        { success: false, error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Verificar duplicados
    const { data: existing } = await supabase
      .schema('system')
      .from('categories')
      .select('id')
      .eq('name', nombre)
      .eq('category_type', tipo)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Categoría duplicada' },
        { status: 409 }
      );
    }

    // Crear categoría
    const { data, error } = await supabase
      .schema('system')
      .from('categories')
      .insert({
        name: nombre,
        category_type: tipo,
        sort_order: orden,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      return NextResponse.json(
        { error: 'Error al crear categoría' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        nombre: data.name,
        tipo: data.category_type
      },
      message: 'Categoría creada exitosamente'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error al crear categoría:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
