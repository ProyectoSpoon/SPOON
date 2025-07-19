// src/app/api/analytics/sales/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // TODO: Implementar autenticación cuando esté disponible
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID requerido' }, { status: 400 });
    }

    try {
      // 🔥 OBTENER KPIs OPERACIONALES EN TIEMPO REAL
      const kpisOperacionQuery = `
        WITH mesas_config AS (
          SELECT 
            COALESCE(
              (SELECT value::integer FROM config.system_settings WHERE key = 'total_mesas'), 
              20
            ) as total_mesas
        ),
        ordenes_activas AS (
          SELECT COUNT(*) as activas
          FROM sales.orders o
          WHERE o.restaurant_id = $1
            AND o.status IN ('pending', 'preparing', 'ready')
        ),
        ventas_hoy AS (
          SELECT 
            COALESCE(SUM(o.total_amount), 0) as total_ventas,
            COALESCE(AVG(o.total_amount), 0) as ticket_promedio,
            COUNT(*) as total_ordenes
          FROM sales.orders o
          WHERE o.restaurant_id = $1
            AND DATE(o.created_at) = CURRENT_DATE
            AND o.status IN ('completed', 'paid')
        ),
        tiempo_promedio AS (
          SELECT 
            COALESCE(
              AVG(EXTRACT(EPOCH FROM (o.updated_at - o.created_at))/60), 
              45
            ) as minutos_promedio
          FROM sales.orders o
          WHERE o.restaurant_id = $1
            AND DATE(o.created_at) = CURRENT_DATE
            AND o.status = 'completed'
        ),
        plato_top_hoy AS (
          SELECT 
            p.name as nombre,
            COUNT(oi.id) as vendidos
          FROM sales.order_items oi
          JOIN sales.orders o ON oi.order_id = o.id
          JOIN system.products p ON oi.product_id = p.id
          WHERE o.restaurant_id = $1
            AND DATE(o.created_at) = CURRENT_DATE
            AND o.status IN ('completed', 'paid')
          GROUP BY p.id, p.name
          ORDER BY vendidos DESC
          LIMIT 1
        ),
        metodo_preferido AS (
          SELECT 
            payment_method,
            ROUND((COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER(), 0)), 0) as porcentaje
          FROM sales.orders o
          WHERE o.restaurant_id = $1
            AND DATE(o.created_at) = CURRENT_DATE
            AND o.status IN ('completed', 'paid')
          GROUP BY payment_method
          ORDER BY COUNT(*) DESC
          LIMIT 1
        ),
        eficiencia AS (
          SELECT 
            CASE 
              WHEN COUNT(*) = 0 THEN 95
              ELSE GREATEST(85, 100 - (COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END) * 100 / COUNT(*)))
            END as porcentaje_eficiencia
          FROM sales.orders o
          WHERE o.restaurant_id = $1
            AND DATE(o.created_at) = CURRENT_DATE
        )
        SELECT 
          mc.total_mesas,
          GREATEST(0, mc.total_mesas - COALESCE(oa.activas, 0)) as mesas_libres,
          COALESCE(oa.activas, 0) as ordenes_activas,
          vh.total_ventas,
          vh.ticket_promedio,
          COALESCE(tp.minutos_promedio, 45) as tiempo_promedio,
          COALESCE(pt.nombre, 'Sin ventas') as plato_top,
          COALESCE(pt.vendidos, 0) as plato_cantidad,
          COALESCE(mp.payment_method, 'efectivo') as metodo_preferido,
          COALESCE(mp.porcentaje, 0) as metodo_porcentaje,
          COALESCE(ef.porcentaje_eficiencia, 95) as eficiencia
        FROM mesas_config mc
        LEFT JOIN ordenes_activas oa ON true
        LEFT JOIN ventas_hoy vh ON true
        LEFT JOIN tiempo_promedio tp ON true
        LEFT JOIN plato_top_hoy pt ON true
        LEFT JOIN metodo_preferido mp ON true
        LEFT JOIN eficiencia ef ON true;
      `;

      const kpisResult = await query(kpisOperacionQuery, [restaurantId]);
      const kpisData = kpisResult.rows[0] || {};

      // 🔥 OBTENER PRODUCTOS DISPONIBLES POR CATEGORÍA
      const productosQuery = `
        SELECT 
          p.id,
          p.name as nombre,
          c.category_type as categoria,
          COALESCE(mp.daily_menu_price, 15000) as precio,
          mi.is_available as disponible,
          mi.is_featured as destacado
        FROM restaurant.menu_items mi
        JOIN system.products p ON mi.product_id = p.id
        JOIN system.categories c ON p.category_id = c.id
        LEFT JOIN restaurant.menu_pricing mp ON mi.restaurant_id = mp.restaurant_id
        WHERE mi.restaurant_id = $1
          AND mi.is_available = true
        ORDER BY c.sort_order, p.name;
      `;

      const productosResult = await query(productosQuery, [restaurantId]);

      // 🔥 AGRUPAR PRODUCTOS POR CATEGORÍA
      const productosPorCategoria = productosResult.rows.reduce((acc: any, producto: any) => {
        const categoria = producto.categoria;
        if (!acc[categoria]) {
          acc[categoria] = [];
        }
        acc[categoria].push({
          id: producto.id,
          nombre: producto.nombre,
          categoria: categoria,
          precio: parseFloat(producto.precio),
          disponible: producto.disponible,
          destacado: producto.destacado
        });
        return acc;
      }, {});

      // 🔥 OBTENER CONFIGURACIÓN DE MESAS (SIMULADA)
      const mesasQuery = `
        SELECT 
          COALESCE(
            (SELECT value::integer FROM config.system_settings WHERE key = 'total_mesas'), 
            20
          ) as total_mesas;
      `;

      const mesasResult = await query(mesasQuery, []);
      const totalMesas = mesasResult.rows[0]?.total_mesas || 20;

      // 🔥 GENERAR LAYOUT DE MESAS (SIMULADO)
      const layoutMesas = [];
      for (let i = 1; i <= totalMesas; i++) {
        // Simular estados de mesas basado en órdenes activas
        const estadoRandom = Math.random();
        let estado = 'libre';
        
        if (kpisData.ordenes_activas > 0 && estadoRandom > 0.6) {
          estado = 'ocupada';
        } else if (estadoRandom > 0.8) {
          estado = 'reservada';
        }

        layoutMesas.push({
          id: `mesa-${i}`,
          numero: i,
          capacidad: i <= 12 ? 4 : i <= 16 ? 6 : 8,
          estado: estado,
          tiempoOcupada: estado === 'ocupada' ? Math.floor(Math.random() * 90) + 15 : undefined
        });
      }

      // 🔥 FORMATEAR RESPUESTA
      const response = {
        kpisOperacion: {
          mesasLibres: `${kpisData.mesas_libres}/${kpisData.total_mesas}`,
          ordenesActivas: kpisData.ordenes_activas || 0,
          ventasHoy: kpisData.total_ventas || 0,
          tiempoPromedio: `${Math.round(kpisData.tiempo_promedio)} min`,
          platoTop: {
            nombre: kpisData.plato_top || 'Sin datos',
            cantidad: kpisData.plato_cantidad || 0
          },
          pagoPreferido: {
            metodo: kpisData.metodo_preferido || 'efectivo',
            porcentaje: kpisData.metodo_porcentaje || 0
          },
          ticketPromedio: kpisData.ticket_promedio || 0,
          eficiencia: `${Math.round(kpisData.eficiencia)}%`
        },
        productosPorCategoria,
        configRestaurante: {
          totalMesas: totalMesas,
          layoutMesas: layoutMesas
        },
        metadata: {
          restaurantId,
          fechaConsulta: new Date().toISOString(),
          tieneVentas: kpisData.total_ventas > 0,
          productosDisponibles: productosResult.rows.length
        }
      };

      return NextResponse.json(response);

    } catch (error) {
      console.error('Error en analytics/sales:', error);
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error general en analytics/sales:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
