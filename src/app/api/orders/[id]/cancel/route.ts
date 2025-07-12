// src/app/api/orders/[id]/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/config/database';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { cancellation_reason } = body;

    const sql = `
      UPDATE sales.orders 
      SET 
        status = 'cancelled',
        cancellation_reason = $1,
        cancelled_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await query(sql, [
      cancellation_reason || 'Cancelada por el usuario',
      params.id
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error al cancelar orden:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}