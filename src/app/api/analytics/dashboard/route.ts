// src/app/api/analytics/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 === ANALYTICS DASHBOARD API ===');
    
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const periodo = searchParams.get('periodo') || 'hoy';

    console.log('📊 Parámetros recibidos:', { restaurantId, periodo });

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID requerido' }, { status: 400 });
    }

    // 🔥 VERIFICAR CONEXIÓN A BASE DE DATOS PRIMERO
    try {
      const testQuery = await query('SELECT NOW() as current_time');
      console.log('✅ Conexión a BD exitosa:', testQuery.rows[0]);
    } catch (dbError) {
      console.error('❌ Error de conexión a BD:', dbError);
      // Retornar datos de ejemplo si no hay conexión
      return NextResponse.json({
        kpis: {
          ventas_hoy: { valor: 0, cambio: 0, descripcion: "Sin datos" },
          ordenes_hoy: { valor: 0, cambio: 0, descripcion: "Sin datos" },
          clientes_hoy: { valor: 0, cambio: 0, descripcion: "Sin datos" },
          ticket_promedio: { valor: 0, cambio: 0, descripcion: "Sin datos" }
        },
        popular_dishes: [],
        client_counts: { nuevos: 0, recurrentes: 0 },
        sales_by_category: [],
        insights: { tiene_datos: false }
      });
    }

    try {
      // OBTENER KPIs REALES DEL DÍA (CONSULTA SIMPLIFICADA)
      console.log(' Ejecutando consulta de KPIs...');
      
      const kpisQuery = `
        WITH today_sales AS (
          SELECT 
            COALESCE(SUM(o.total_amount), 0) as ventas_hoy,
            COUNT(DISTINCT o.id) as ordenes_hoy
          FROM sales.orders o
          WHERE o.restaurant_id = $1 
            AND DATE(o.created_at) = CURRENT_DATE
            AND o.status = 'completed'
        ),
        yesterday_sales AS (
          SELECT 
            COALESCE(SUM(o.total_amount), 0) as ventas_ayer,
            COUNT(DISTINCT o.id) as ordenes_ayer
          FROM sales.orders o
          WHERE o.restaurant_id = $1 
            AND DATE(o.created_at) = CURRENT_DATE - INTERVAL '1 day'
            AND o.status = 'completed'
        )
        SELECT 
          ts.ventas_hoy,
          ts.ordenes_hoy,
          0 as clientes_hoy,
          ys.ventas_ayer,
          ys.ordenes_ayer,
          0 as clientes_ayer,
          CASE 
            WHEN ts.ordenes_hoy > 0 THEN ts.ventas_hoy / ts.ordenes_hoy 
            ELSE 0 
          END as ticket_promedio
        FROM today_sales ts
        CROSS JOIN yesterday_sales ys;
      `;

      const kpisResult = await query(kpisQuery, [restaurantId]);
      const kpisData = kpisResult.rows[0] || {};
      console.log('✅ KPIs obtenidos:', kpisData);

      // OBTENER PLATOS POPULARES (CONSULTA SIMPLIFICADA)
      console.log(' Ejecutando consulta de platos populares...');
      
      const popularDishesQuery = `
        SELECT 
          p.name as nombre,
          'General' as categoria,
          COALESCE(SUM(oi.quantity), 0) as cantidad_vendida,
          COALESCE(SUM(oi.price * oi.quantity), 0) as ingresos_totales
        FROM system.products p
        LEFT JOIN sales.order_items oi ON p.id = oi.product_id
        LEFT JOIN sales.orders o ON oi.order_id = o.id AND o.restaurant_id = $1 
          AND DATE(o.created_at) = CURRENT_DATE
          AND o.status = 'completed'
        WHERE p.is_active = true
        GROUP BY p.id, p.name
        ORDER BY cantidad_vendida DESC
        LIMIT 5;
      `;

      const platosResult = await query(popularDishesQuery, [restaurantId]);
      console.log('✅ Platos populares obtenidos:', platosResult.rows.length);

      // OBTENER DATOS PARA GRÁFICO DE CLIENTES (SIMPLIFICADO)
      const clientesDiariosQuery = `
        SELECT 
          DATE(o.created_at) as fecha,
          COUNT(DISTINCT o.id) as clientes
        FROM sales.orders o
        WHERE o.restaurant_id = $1
          AND DATE(o.created_at) >= CURRENT_DATE - INTERVAL '5 days'
          AND o.status = 'completed'
        GROUP BY DATE(o.created_at)
        ORDER BY fecha;
      `;

      const clientesResult = await query(clientesDiariosQuery, [restaurantId]);
      console.log('✅ Datos de clientes obtenidos:', clientesResult.rows.length);

      // OBTENER DISTRIBUCIÓN DE VENTAS POR CATEGORÍA (SIMPLIFICADO)
      console.log(' Ejecutando consulta de ventas por categoría...');
      
      const salesByCategoryQuery = `
        SELECT 
          c.name as categoria,
          COALESCE(SUM(oi.price * oi.quantity), 0) as total_ventas,
          0 as clientes_unicos
        FROM system.categories c
        LEFT JOIN system.products p ON c.id = p.category_id
        LEFT JOIN sales.order_items oi ON p.id = oi.product_id
        LEFT JOIN sales.orders o ON oi.order_id = o.id AND o.restaurant_id = $1 
          AND DATE(o.created_at) = CURRENT_DATE
          AND o.status = 'completed'
        GROUP BY c.id, c.name
        ORDER BY total_ventas DESC;
      `;

      const categoriasResult = await query(salesByCategoryQuery, [restaurantId]);
      console.log('✅ Categorías obtenidas:', categoriasResult.rows.length);

      // CAPACIDAD SIMULADA
      const capacidadMaxima = 200;

      // 🔥 FORMATEAR RESPUESTA SIMPLIFICADA
      const response = {
        kpis: {
          ventas_hoy: {
            valor: kpisData.ventas_hoy || 0,
            cambio: kpisData.ventas_ayer > 0 ? ((kpisData.ventas_hoy - kpisData.ventas_ayer) / kpisData.ventas_ayer * 100) : 0,
            descripcion: "vs ayer"
          },
          ordenes_hoy: {
            valor: kpisData.ordenes_hoy || 0,
            cambio: kpisData.ordenes_ayer > 0 ? ((kpisData.ordenes_hoy - kpisData.ordenes_ayer) / kpisData.ordenes_ayer * 100) : 0,
            descripcion: "órdenes"
          },
          clientes_hoy: {
            valor: kpisData.clientes_hoy || 0,
            cambio: 0,
            descripcion: "clientes"
          },
          ticket_promedio: {
            valor: kpisData.ticket_promedio || 0,
            cambio: 0,
            descripcion: "por orden"
          }
        },
        popular_dishes: platosResult.rows.map(row => ({
          nombre: row.nombre,
          categoria: row.categoria,
          cantidad: parseInt(row.cantidad_vendida) || 0,
          ingresos: parseFloat(row.ingresos_totales) || 0
        })),
        client_counts: {
          nuevos: 0,
          recurrentes: 0
        },
        sales_by_category: categoriasResult.rows.map(row => ({
          categoria: row.categoria,
          total_ventas: parseFloat(row.total_ventas) || 0,
          clientes_unicos: parseInt(row.clientes_unicos) || 0
        })),
        insights: {
          tiene_datos: (kpisData.ventas_hoy || 0) > 0 || platosResult.rows.length > 0
        }
      };

      console.log('✅ Respuesta formateada exitosamente');
      return NextResponse.json(response);

    } catch (error) {
      console.error('❌ Error en analytics/dashboard:', error);
      
      // 🔥 DEVOLVER ESTRUCTURA VÁLIDA CON DATOS EN CERO
      const fallbackResponse = {
        kpis: {
          ventas_hoy: {
            valor: 0,
            cambio: 0,
            descripcion: "vs ayer"
          },
          ordenes_hoy: {
            valor: 0,
            cambio: 0,
            descripcion: "órdenes"
          },
          clientes_hoy: {
            valor: 0,
            cambio: 0,
            descripcion: "clientes"
          },
          ticket_promedio: {
            valor: 0,
            cambio: 0,
            descripcion: "por orden"
          }
        },
        popular_dishes: [],
        client_counts: {
          nuevos: 0,
          recurrentes: 0
        },
        sales_by_category: [],
        insights: {
          tiene_datos: false
        }
      };
      
      console.log('✅ Devolviendo datos por defecto debido a error');
      return NextResponse.json(fallbackResponse);
    }

  } catch (error) {
    console.error('❌ Error general en analytics/dashboard:', error);
    
    // 🔥 DEVOLVER ESTRUCTURA VÁLIDA CON DATOS EN CERO
    const fallbackResponse = {
      kpis: {
        ventas_hoy: {
          valor: 0,
          cambio: 0,
          descripcion: "vs ayer"
        },
        ordenes_hoy: {
          valor: 0,
          cambio: 0,
          descripcion: "órdenes"
        },
        clientes_hoy: {
          valor: 0,
          cambio: 0,
          descripcion: "clientes"
        },
        ticket_promedio: {
          valor: 0,
          cambio: 0,
          descripcion: "por orden"
        }
      },
      popular_dishes: [],
      client_counts: {
        nuevos: 0,
        recurrentes: 0
      },
      sales_by_category: [],
      insights: {
        tiene_datos: false
      }
    };
    
    console.log('✅ Devolviendo datos por defecto debido a error general');
    return NextResponse.json(fallbackResponse);
  }
}
