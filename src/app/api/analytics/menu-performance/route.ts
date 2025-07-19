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

    // Obtener KPIs del menú
    const menuKpisQuery = `
      WITH menu_stats AS (
        SELECT 
          COUNT(DISTINCT p.id) as platos_activos,
          COUNT(DISTINCT p.id) FILTER (WHERE mi.is_available = true) as platos_disponibles,
          COALESCE(AVG(mp.price), 0) as precio_promedio,
          COUNT(DISTINCT c.id) as categorias_activas
        FROM system.products p
        LEFT JOIN restaurant.menu_items mi ON p.id = mi.product_id AND mi.restaurant_id = $1
        LEFT JOIN restaurant.menu_pricing mp ON mi.id = mp.menu_item_id
        LEFT JOIN system.categories c ON p.category_id = c.id
        WHERE p.is_active = true
      ),
      top_dish AS (
        SELECT 
          p.name as plato_estrella,
          SUM(oi.quantity) as cantidad_vendida,
          SUM(oi.price * oi.quantity) as ingresos_plato
        FROM sales.order_items oi
        JOIN sales.orders o ON oi.order_id = o.id
        JOIN system.products p ON oi.product_id = p.id
        WHERE o.restaurant_id = $1 
          AND DATE(o.created_at) = CURRENT_DATE
          AND o.status = 'completed'
        GROUP BY p.id, p.name
        ORDER BY cantidad_vendida DESC
        LIMIT 1
      ),
      best_margin AS (
        SELECT 
          p.name as mejor_margen_plato,
          COALESCE(
            ROUND(
              ((mp.price - p.cost_price) / NULLIF(mp.price, 0)) * 100, 1
            ), 0
          ) as margen_porcentaje
        FROM system.products p
        JOIN restaurant.menu_items mi ON p.id = mi.product_id
        JOIN restaurant.menu_pricing mp ON mi.id = mp.menu_item_id
        WHERE mi.restaurant_id = $1 
          AND p.cost_price > 0 
          AND mp.price > 0
          AND mi.is_available = true
        ORDER BY ((mp.price - p.cost_price) / mp.price) DESC
        LIMIT 1
      ),
      total_sales AS (
        SELECT 
          COALESCE(SUM(oi.price * oi.quantity), 0) as ingresos_totales,
          COALESCE(SUM(oi.quantity), 0) as platos_vendidos,
          COALESCE(AVG(oi.price), 0) as ticket_promedio_plato
        FROM sales.order_items oi
        JOIN sales.orders o ON oi.order_id = o.id
        WHERE o.restaurant_id = $1 
          AND DATE(o.created_at) = CURRENT_DATE
          AND o.status = 'completed'
      )
      SELECT 
        ms.platos_activos,
        ms.platos_disponibles,
        ms.precio_promedio,
        ms.categorias_activas,
        COALESCE(td.plato_estrella, 'Sin datos') as plato_estrella,
        COALESCE(td.cantidad_vendida, 0) as cantidad_estrella,
        COALESCE(td.ingresos_plato, 0) as ingresos_estrella,
        COALESCE(bm.mejor_margen_plato, 'Sin datos') as mejor_margen_plato,
        COALESCE(bm.margen_porcentaje, 0) as mejor_margen_porcentaje,
        ts.ingresos_totales,
        ts.platos_vendidos,
        ts.ticket_promedio_plato
      FROM menu_stats ms
      CROSS JOIN total_sales ts
      LEFT JOIN top_dish td ON true
      LEFT JOIN best_margin bm ON true;
    `;

    const kpisResult = await query(menuKpisQuery, [restaurantId]);
    const kpis = kpisResult.rows[0] || {};

    // Obtener rendimiento de platos
    const platosRendimientoQuery = `
      SELECT 
        p.name as nombre,
        c.name as categoria,
        COALESCE(SUM(oi.quantity), 0) as vendidos,
        COALESCE(SUM(oi.price * oi.quantity), 0) as ingresos,
        COALESCE(
          ROUND(
            ((mp.price - p.cost_price) / NULLIF(mp.price, 0)) * 100, 1
          ), 0
        ) as margen,
        CASE 
          WHEN COALESCE(SUM(oi.quantity), 0) >= 20 THEN 'estrella'
          WHEN COALESCE(SUM(oi.quantity), 0) >= 10 THEN 'excelente'
          WHEN COALESCE(SUM(oi.quantity), 0) >= 5 THEN 'bueno'
          ELSE 'bajo'
        END as status,
        mi.is_available as disponible,
        p.is_featured as destacado
      FROM system.products p
      JOIN system.categories c ON p.category_id = c.id
      LEFT JOIN restaurant.menu_items mi ON p.id = mi.product_id AND mi.restaurant_id = $1
      LEFT JOIN restaurant.menu_pricing mp ON mi.id = mp.menu_item_id
      LEFT JOIN sales.order_items oi ON p.id = oi.product_id
      LEFT JOIN sales.orders o ON oi.order_id = o.id 
        AND o.restaurant_id = $1 
        AND DATE(o.created_at) = CURRENT_DATE
        AND o.status = 'completed'
      WHERE p.is_active = true
      GROUP BY p.id, p.name, c.name, mp.price, p.cost_price, mi.is_available, p.is_featured
      ORDER BY vendidos DESC, ingresos DESC;
    `;

    const platosResult = await query(platosRendimientoQuery, [restaurantId]);

    // Obtener rendimiento por categorías
    const categoriasQuery = `
      SELECT 
        c.name as nombre,
        COUNT(DISTINCT p.id) as platos,
        COALESCE(SUM(oi.price * oi.quantity), 0) as ingresos,
        COALESCE(
          AVG(
            CASE 
              WHEN mp.price > 0 AND p.cost_price > 0 
              THEN ((mp.price - p.cost_price) / mp.price) * 100
              ELSE 0 
            END
          ), 0
        ) as margen
      FROM system.categories c
      JOIN system.products p ON c.id = p.category_id
      LEFT JOIN restaurant.menu_items mi ON p.id = mi.product_id AND mi.restaurant_id = $1
      LEFT JOIN restaurant.menu_pricing mp ON mi.id = mp.menu_item_id
      LEFT JOIN sales.order_items oi ON p.id = oi.product_id
      LEFT JOIN sales.orders o ON oi.order_id = o.id 
        AND o.restaurant_id = $1 
        AND DATE(o.created_at) = CURRENT_DATE
        AND o.status = 'completed'
      WHERE p.is_active = true
      GROUP BY c.id, c.name
      ORDER BY ingresos DESC;
    `;

    const categoriasResult = await query(categoriasQuery, [restaurantId]);

    // Calcular margen promedio
    const margenPromedio = platosResult.rows.length > 0 
      ? platosResult.rows.reduce((sum, plato) => sum + (parseFloat(plato.margen) || 0), 0) / platosResult.rows.length
      : 0;

    // Formatear respuesta
    const response = {
      kpis: {
        plato_estrella: {
          valor: kpis.plato_estrella || "Sin datos",
          cantidad: kpis.cantidad_estrella || 0,
          descripcion: "más vendido"
        },
        mayor_ingreso: {
          valor: kpis.ingresos_estrella || 0,
          plato: kpis.plato_estrella || "Sin datos",
          descripcion: "ingresos del top"
        },
        mejor_margen: {
          valor: kpis.mejor_margen_porcentaje || 0,
          plato: kpis.mejor_margen_plato || "Sin datos",
          descripcion: "rentabilidad"
        },
        platos_activos: {
          valor: `${kpis.platos_disponibles || 0}/${kpis.platos_activos || 0}`,
          descripcion: "del menú total"
        },
        ingresos_totales: {
          valor: kpis.ingresos_totales || 0,
          descripcion: "todos los platos"
        },
        margen_promedio: {
          valor: margenPromedio,
          descripcion: "rentabilidad general"
        },
        platos_vendidos: {
          valor: kpis.platos_vendidos || 0,
          descripcion: "total de órdenes"
        },
        ticket_promedio: {
          valor: kpis.ticket_promedio_plato || 0,
          descripcion: "por plato"
        }
      },
      platos_rendimiento: platosResult.rows.map(row => ({
        nombre: row.nombre,
        categoria: row.categoria,
        vendidos: parseInt(row.vendidos) || 0,
        ingresos: parseFloat(row.ingresos) || 0,
        margen: parseFloat(row.margen) || 0,
        status: row.status,
        disponible: row.disponible || false,
        destacado: row.destacado || false
      })),
      categorias: categoriasResult.rows.map(row => ({
        nombre: row.nombre,
        platos: parseInt(row.platos) || 0,
        ingresos: parseFloat(row.ingresos) || 0,
        margen: parseFloat(row.margen) || 0
      })),
      insights: {
        tiene_datos: (kpis.platos_vendidos || 0) > 0,
        total_platos: kpis.platos_activos || 0,
        platos_sin_ventas: Math.max(0, (kpis.platos_activos || 0) - platosResult.rows.filter(p => p.vendidos > 0).length)
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in menu performance API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
