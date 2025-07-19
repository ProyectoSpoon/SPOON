import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // TODO: Implement proper authentication
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId') || '11111111-2222-3333-4444-555555555555';
    const period = searchParams.get('period') || 'today';

    // Obtener KPIs operativos
    const kpisQuery = `
      WITH today_sales AS (
        SELECT 
          COALESCE(SUM(o.total_amount), 0) as ventas_hoy,
          COUNT(DISTINCT o.id) as ordenes_hoy,
          COUNT(DISTINCT o.customer_id) as clientes_hoy
        FROM sales.orders o
        WHERE o.restaurant_id = $1 
          AND DATE(o.created_at) = CURRENT_DATE
          AND o.status = 'completed'
      ),
      yesterday_sales AS (
        SELECT 
          COALESCE(SUM(o.total_amount), 0) as ventas_ayer,
          COUNT(DISTINCT o.id) as ordenes_ayer,
          COUNT(DISTINCT o.customer_id) as clientes_ayer
        FROM sales.orders o
        WHERE o.restaurant_id = $1 
          AND DATE(o.created_at) = CURRENT_DATE - INTERVAL '1 day'
          AND o.status = 'completed'
      ),
      top_dish AS (
        SELECT 
          p.name as plato_estrella,
          SUM(oi.quantity) as cantidad_vendida
        FROM sales.order_items oi
        JOIN sales.orders o ON oi.order_id = o.id
        JOIN system.products p ON oi.product_id = p.id
        WHERE o.restaurant_id = $1 
          AND DATE(o.created_at) = CURRENT_DATE
          AND o.status = 'completed'
        GROUP BY p.id, p.name
        ORDER BY cantidad_vendida DESC
        LIMIT 1
      )
      SELECT 
        ts.ventas_hoy,
        ts.ordenes_hoy,
        ts.clientes_hoy,
        ys.ventas_ayer,
        ys.ordenes_ayer,
        ys.clientes_ayer,
        CASE 
          WHEN ts.clientes_hoy > 0 THEN ts.ventas_hoy / ts.clientes_hoy 
          ELSE 0 
        END as ticket_promedio,
        COALESCE(td.plato_estrella, 'Sin datos') as plato_estrella,
        COALESCE(td.cantidad_vendida, 0) as cantidad_estrella
      FROM today_sales ts
      CROSS JOIN yesterday_sales ys
      LEFT JOIN top_dish td ON true;
    `;

    const kpisResult = await query(kpisQuery, [restaurantId]);
    const kpis = kpisResult.rows[0] || {};

    // Calcular cambios porcentuales
    const cambioVentas = kpis.ventas_ayer > 0 
      ? ((kpis.ventas_hoy - kpis.ventas_ayer) / kpis.ventas_ayer * 100) 
      : 0;
    const cambioClientes = kpis.clientes_ayer > 0 
      ? ((kpis.clientes_hoy - kpis.clientes_ayer) / kpis.clientes_ayer * 100) 
      : 0;

    // Obtener ventas por hora
    const ventasHoraQuery = `
      SELECT 
        EXTRACT(HOUR FROM o.created_at) as hora,
        COALESCE(SUM(o.total_amount), 0) as ventas,
        COUNT(DISTINCT o.customer_id) as clientes
      FROM sales.orders o
      WHERE o.restaurant_id = $1 
        AND DATE(o.created_at) = CURRENT_DATE
        AND o.status = 'completed'
      GROUP BY EXTRACT(HOUR FROM o.created_at)
      ORDER BY hora;
    `;

    const ventasHoraResult = await query(ventasHoraQuery, [restaurantId]);

    // Obtener top platos
    const topPlatosQuery = `
      SELECT 
        p.name as nombre,
        c.name as categoria,
        SUM(oi.quantity) as cantidad,
        SUM(oi.price * oi.quantity) as ingresos,
        ROUND(
          (SUM(oi.price * oi.quantity) * 100.0 / 
           NULLIF(SUM(SUM(oi.price * oi.quantity)) OVER (), 0)), 1
        ) as porcentaje
      FROM sales.order_items oi
      JOIN sales.orders o ON oi.order_id = o.id
      JOIN system.products p ON oi.product_id = p.id
      JOIN system.categories c ON p.category_id = c.id
      WHERE o.restaurant_id = $1 
        AND DATE(o.created_at) = CURRENT_DATE
        AND o.status = 'completed'
      GROUP BY p.id, p.name, c.name
      ORDER BY cantidad DESC
      LIMIT 5;
    `;

    const topPlatosResult = await query(topPlatosQuery, [restaurantId]);

    // Obtener ventas por día de la semana
    const ventasSemanaQuery = `
      SELECT 
        CASE EXTRACT(DOW FROM date_series)
          WHEN 0 THEN 'Dom'
          WHEN 1 THEN 'Lun'
          WHEN 2 THEN 'Mar'
          WHEN 3 THEN 'Mié'
          WHEN 4 THEN 'Jue'
          WHEN 5 THEN 'Vie'
          WHEN 6 THEN 'Sáb'
        END as dia,
        COALESCE(SUM(o.total_amount), 0) as ventas,
        COUNT(DISTINCT o.customer_id) as clientes
      FROM (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          '1 day'::interval
        )::date as date_series
      ) dates
      LEFT JOIN sales.orders o ON DATE(o.created_at) = dates.date_series
        AND o.restaurant_id = $1
        AND o.status = 'completed'
      GROUP BY dates.date_series, EXTRACT(DOW FROM date_series)
      ORDER BY dates.date_series;
    `;

    const ventasSemanaResult = await query(ventasSemanaQuery, [restaurantId]);

    // Formatear respuesta
    const response = {
      kpis: {
        ventas_hoy: {
          valor: kpis.ventas_hoy || 0,
          cambio: cambioVentas,
          descripcion: "vs ayer"
        },
        clientes_servidos: {
          valor: kpis.clientes_hoy || 0,
          cambio: cambioClientes,
          descripcion: "personas"
        },
        ticket_promedio: {
          valor: kpis.ticket_promedio || 0,
          cambio: 0, // TODO: Calcular cambio del ticket promedio
          descripcion: "por cliente"
        },
        plato_estrella: {
          valor: kpis.plato_estrella || "Sin datos",
          cantidad: kpis.cantidad_estrella || 0,
          descripcion: "más vendido"
        }
      },
      ventas_por_hora: ventasHoraResult.rows.map(row => ({
        hora: `${String(row.hora).padStart(2, '0')}:00`,
        ventas: parseFloat(row.ventas) || 0,
        clientes: parseInt(row.clientes) || 0
      })),
      top_platos: topPlatosResult.rows.map(row => ({
        nombre: row.nombre,
        categoria: row.categoria,
        cantidad: parseInt(row.cantidad) || 0,
        ingresos: parseFloat(row.ingresos) || 0,
        porcentaje: parseFloat(row.porcentaje) || 0
      })),
      ventas_semana: ventasSemanaResult.rows.map(row => ({
        dia: row.dia,
        ventas: parseFloat(row.ventas) || 0,
        clientes: parseInt(row.clientes) || 0
      })),
      insights: {
        mejor_hora: ventasHoraResult.rows.length > 0 
          ? ventasHoraResult.rows.reduce((max, current) => 
              parseFloat(current.ventas) > parseFloat(max.ventas) ? current : max
            )
          : null,
        tiene_datos: kpis.ventas_hoy > 0 || ventasHoraResult.rows.length > 0
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in sales analysis API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
