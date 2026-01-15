// src/app/api/orders/[id]/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();
    const { payment_method, tip_amount, payment_reference } = body;

    const { data, error } = await supabase
      .from('ordenes_mesa')
      .update({
        estado: 'completada',
        pagada_at: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error al completar orden:', error);
      return NextResponse.json(
        { error: 'Error al completar orden' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error al completar orden:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}