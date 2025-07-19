import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET - Obtener combinaciones especiales
export async function GET() {
  try {
    console.log('⭐ Obteniendo combinaciones especiales...');
    
    // Obtener restaurante activo
    const restaurantQuery = 'SELECT id FROM restaurant.restaurants WHERE status = $1 ORDER BY created_at ASC LIMIT 1';
    const restaurantResult = await query(restaurantQuery, ['active']);
    
    if (restaurantResult.rows.length === 0) {
      return NextResponse.json({ error: 'No hay restaurantes disponibles' }, { status: 400 });
    }
    
    const restaurantId = restaurantResult.rows[0].id;
    
    // Obtener combinaciones especiales (special_price IS NOT NULL)
    const especialesQuery = `
      SELECT 
        mc.id,
        mc.name,
        mmc.base_price,
        mc.special_price,
        mc.is_available,
        mc.is_featured,
        dm.menu_date,
        dm.name as menu_name,
        -- Productos de la combinación
        pe.name as entrada_nombre,
        pe.image_url as entrada_imagen,
        pp.name as principio_nombre,
        pp.image_url as principio_imagen,
        ppr.name as proteina_nombre,
        ppr.image_url as proteina_imagen,
        pb.name as bebida_nombre,
        pb.image_url as bebida_imagen,
        -- Acompañamientos
        COALESCE(
          json_agg(
            CASE WHEN pa.id IS NOT NULL THEN
              json_build_object(
                'id', pa.id,
                'nombre', pa.name,
                'imagen', pa.image_url,
                'cantidad', cs.quantity
              )
            END
          ) FILTER (WHERE pa.id IS NOT NULL),
          '[]'::json
        ) as acompanamientos,
        -- Calcular descuento
        CASE 
          WHEN mc.special_price IS NOT NULL AND mc.special_price < mc.base_price 
          THEN ROUND(((mc.base_price - mc.special_price) / mc.base_price * 100)::numeric, 0)
          ELSE 0
        END as descuento_porcentaje
      FROM menu.menu_combinations mc
      JOIN menu.daily_menus dm ON mc.daily_menu_id = dm.id
      LEFT JOIN system.products pe ON mc.entrada_id = pe.id
      LEFT JOIN system.products pp ON mc.principio_id = pp.id
      LEFT JOIN system.products ppr ON mc.proteina_id = ppr.id
      LEFT JOIN system.products pb ON mc.bebida_id = pb.id
      LEFT JOIN menu.combination_sides cs ON mc.id = cs.combination_id
      LEFT JOIN system.products pa ON cs.product_id = pa.id
      WHERE dm.restaurant_id = $1 
        AND mc.special_price IS NOT NULL
        AND mc.special_price < mc.base_price
        AND dm.status = 'published'
      GROUP BY mc.id, dm.id, pe.id, pp.id, ppr.id, pb.id
      ORDER BY descuento_porcentaje DESC, dm.menu_date DESC, mc.name ASC;
    `;
    
    const result = await query(especialesQuery, [restaurantId]);
    
    console.log(`✅ ${result.rows.length} combinaciones especiales encontradas`);
    
    return NextResponse.json({
      success: true,
      especiales: result.rows,
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('❌ Error al obtener especiales:', error);
    return NextResponse.json(
      { error: 'Error al obtener combinaciones especiales', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

// POST - Marcar/desmarcar combinación como especial
export async function POST(request: Request) {
  try {
    const { combinacionId, esEspecial, precioEspecial } = await request.json();
    
    console.log(`⭐ ${esEspecial ? 'Marcando' : 'Desmarcando'} combinación como especial:`, combinacionId);
    
    if (!combinacionId) {
      return NextResponse.json({ error: 'ID de combinación requerido' }, { status: 400 });
    }
    
    let updateQuery;
    let params;
    
    if (esEspecial) {
      // Marcar como especial con precio especial
      if (!precioEspecial || precioEspecial <= 0) {
        return NextResponse.json({ error: 'Precio especial requerido y debe ser mayor a 0' }, { status: 400 });
      }
      
      updateQuery = `
        UPDATE menu.menu_combinations 
        SET special_price = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, name, base_price, special_price;
      `;
      params = [precioEspecial, combinacionId];
    } else {
      // Desmarcar como especial (quitar precio especial)
      updateQuery = `
        UPDATE menu.menu_combinations 
        SET special_price = NULL, updated_at = NOW()
        WHERE id = $1
        RETURNING id, name, base_price, special_price;
      `;
      params = [combinacionId];
    }
    
    const result = await query(updateQuery, params);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Combinación no encontrada' }, { status: 404 });
    }
    
    const combinacion = result.rows[0];
    
    console.log(`✅ Combinación ${esEspecial ? 'marcada' : 'desmarcada'} como especial:`, combinacion.name);
    
    return NextResponse.json({
      success: true,
      message: `Combinación ${esEspecial ? 'marcada' : 'desmarcada'} como especial`,
      combinacion: {
        id: combinacion.id,
        nombre: combinacion.name,
        precioBase: combinacion.base_price,
        precioEspecial: combinacion.special_price,
        esEspecial: combinacion.special_price !== null
      }
    });
    
  } catch (error) {
    console.error('❌ Error al actualizar especial:', error);
    return NextResponse.json(
      { error: 'Error al actualizar especial', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}


