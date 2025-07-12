// src/app/api/orders/route.ts - Versión REAL con PostgreSQL
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/config/database';

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 GET /api/orders - Iniciando...");
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let sql = `
      SELECT
        o.id,
        o.order_number,
        o.customer_name,
        o.table_number,
        o.order_type,
        o.status,
        o.subtotal,
        o.total_amount,
        o.payment_method,
        o.notes,
        o.special_instructions,
        o.estimated_preparation_time,
        o.created_at,
        o.served_at,
        o.completed_at,
        COALESCE(
          json_agg(
            CASE WHEN oi.id IS NOT NULL THEN
              json_build_object(
                'id', oi.id,
                'product_id', oi.product_id,
                'item_name', oi.item_name,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'total_price', oi.total_price,
                'special_instructions', oi.special_instructions,
                'status', oi.status
              )
            END
          ) FILTER (WHERE oi.id IS NOT NULL), '[]'::json
        ) as items
      FROM sales.orders o
      LEFT JOIN sales.order_items oi ON o.id = oi.order_id
    `;

    const params: any[] = [];

    if (status) {
      const statusArray = status.split(',');
      sql += ` WHERE o.status = ANY($1)`;
      params.push(statusArray);
    }

    sql += ` GROUP BY o.id ORDER BY o.created_at DESC`;

    console.log("📊 Ejecutando consulta:", sql);
    console.log("📋 Parámetros:", params);

    const result = await query(sql, params);
    
    console.log(`✅ ${result.rows.length} órdenes encontradas`);

    return NextResponse.json(result.rows);
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
    console.log("🔍 POST /api/orders - Iniciando creación real...");
    
    const body = await request.json();
    console.log("📝 Body recibido:", JSON.stringify(body, null, 2));
    
    const {
      table_number,
      customer_name,
      order_type = 'dine_in',
      items,
      notes,
      special_instructions,
      payment_method
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

    // Calcular totales
    const subtotal = items.reduce((sum: number, item: any) =>
      sum + (parseFloat(item.unit_price) * parseInt(item.quantity)), 0
    );

    // Generar número de orden único
    const orderNumber = `ORD-${Date.now()}`;

    console.log("💰 Subtotal calculado:", subtotal);
    console.log("🏷️ Número de orden:", orderNumber);

    // IDs fijos por ahora (en producción vendrían del usuario autenticado)
    const restaurantId = '4073a4ad-b275-4e17-b197-844881f0319e';
    const userId = 'b40bff69-722e-4e49-ba56-ad85f82f6716';

    // 1. Insertar orden principal
    const orderSql = `
      INSERT INTO sales.orders (
        restaurant_id,
        order_number,
        customer_name,
        table_number,
        order_type,
        status,
        subtotal,
        total_amount,
        payment_method,
        notes,
        special_instructions,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    console.log("🔄 Insertando orden principal...");

    const orderResult = await query(orderSql, [
      restaurantId,
      orderNumber,
      customer_name || '',
      table_number,
      order_type,
      'pending',
      subtotal,
      subtotal, // total_amount = subtotal por ahora
      payment_method || null,
      notes || '',
      special_instructions || '',
      userId
    ]);

    const order = orderResult.rows[0];
    console.log("✅ Orden creada con ID:", order.id);

    // 2. Insertar items de la orden
    console.log("🔄 Insertando items de la orden...");
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      const itemSql = `
        INSERT INTO sales.order_items (
          order_id,
          product_id,
          item_name,
          item_description,
          quantity,
          unit_price,
          total_price,
          special_instructions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;

      await query(itemSql, [
        order.id,
        item.product_id || null,
        item.nombre || item.item_name || `Producto ${i + 1}`,
        item.descripcion || item.item_description || '',
        parseInt(item.quantity || item.cantidad),
        parseFloat(item.unit_price || item.precio),
        parseFloat(item.unit_price || item.precio) * parseInt(item.quantity || item.cantidad),
        item.special_instructions || item.notes || ''
      ]);
    }

    console.log(`✅ ${items.length} items insertados`);

    // 3. Obtener orden completa con items
    const completeSql = `
      SELECT
        o.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'product_id', oi.product_id,
              'item_name', oi.item_name,
              'quantity', oi.quantity,
              'unit_price', oi.unit_price,
              'total_price', oi.total_price,
              'special_instructions', oi.special_instructions
            )
          ), '[]'::json
        ) as items
      FROM sales.orders o
      LEFT JOIN sales.order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
      GROUP BY o.id
    `;

    const completeResult = await query(completeSql, [order.id]);
    const completeOrder = completeResult.rows[0];

    console.log("🎉 Orden completa creada exitosamente:", completeOrder.order_number);

    return NextResponse.json(completeOrder, { status: 201 });
    
  } catch (error: any) {
    console.error('❌ Error al crear orden:', error);
    console.error('Stack trace:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
