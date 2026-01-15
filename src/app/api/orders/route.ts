// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 GET /api/orders - Iniciando...");

    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Construir query
    let query = supabase
      .from('ordenes_mesa')
      .select(`
        id,
        numero_mesa,
        monto_total,
        estado,
        nombre_mesero,
        observaciones,
        fecha_creacion,
        fecha_actualizacion,
        pagada_at,
        restaurant_id
      `)
      .order('fecha_creacion', { ascending: false });

    // Filtrar por estado si se proporciona
    if (status) {
      const statusArray = status.split(',');
      query = query.in('estado', statusArray);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener órdenes:', error);
      return NextResponse.json(
        { error: 'Error al obtener órdenes' },
        { status: 500 }
      );
    }

    console.log(`✅ ${data?.length || 0} órdenes encontradas`);
    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('❌ Error al obtener órdenes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 POST /api/orders - Iniciando creación...");

    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    const {
      table_number,
      customer_name,
      items,
      notes,
      restaurant_id
    } = body;

    // Validaciones
    if (!table_number) {
      return NextResponse.json(
        { error: 'table_number es requerido' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'items es requerido y debe ser un array no vacío' },
        { status: 400 }
      );
    }

    // Calcular total
    const monto_total = items.reduce((sum: number, item: any) =>
      sum + (parseFloat(item.unit_price || item.precio || 0) * parseInt(item.quantity || item.cantidad || 1)), 0
    );

    // Crear orden
    const { data: orden, error: ordenError } = await supabase
      .from('ordenes_mesa')
      .insert({
        restaurant_id: restaurant_id,
        numero_mesa: table_number,
        monto_total: monto_total,
        estado: 'activa',
        nombre_mesero: customer_name || '',
        observaciones: notes || '',
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
      })
      .select()
      .single();

    if (ordenError) {
      console.error('Error al crear orden:', ordenError);
      return NextResponse.json(
        { error: 'Error al crear orden' },
        { status: 500 }
      );
    }

    console.log("✅ Orden creada con ID:", orden.id);

    // Crear items de la orden
    const itemsToInsert = items.map((item: any) => ({
      orden_id: orden.id,
      producto_id: item.product_id || null,
      nombre: item.nombre || item.item_name || 'Producto',
      cantidad: parseInt(item.quantity || item.cantidad || 1),
      precio_unitario: parseFloat(item.unit_price || item.precio || 0),
      precio_total: parseFloat(item.unit_price || item.precio || 0) * parseInt(item.quantity || item.cantidad || 1),
      notas: item.special_instructions || item.notes || ''
    }));

    const { error: itemsError } = await supabase
      .from('items_orden_mesa')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error('Error al crear items:', itemsError);
      // Intentar eliminar la orden si falló la creación de items
      await supabase.from('ordenes_mesa').delete().eq('id', orden.id);
      return NextResponse.json(
        { error: 'Error al crear items de la orden' },
        { status: 500 }
      );
    }

    console.log(`✅ ${items.length} items insertados`);

    // Obtener orden completa con items
    const { data: ordenCompleta } = await supabase
      .from('ordenes_mesa')
      .select(`
        *,
        items:items_orden_mesa(*)
      `)
      .eq('id', orden.id)
      .single();

    return NextResponse.json(ordenCompleta || orden, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error al crear orden:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: error.message
      },
      { status: 500 }
    );
  }
}
