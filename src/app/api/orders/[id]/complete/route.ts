// src/app/api/orders/[id]/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/config/database';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { payment_method, tip_amount, payment_reference } = body;

    const sql = `
      UPDATE sales.orders 
      SET 
        payment_method = $1,
        tip_amount = $2,
        payment_reference = $3,
        payment_status = 'completed',
        status = 'delivered',
        completed_at = CURRENT_TIMESTAMP,
        served_at = COALESCE(served_at, CURRENT_TIMESTAMP),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;

    const result = await query(sql, [
      payment_method,
      tip_amount || 0,
      payment_reference || '',
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
    console.error('Error al completar orden:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}