import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET - Obtener combinaciones favoritas
export async function GET() {
  try {
    console.log('🌟 Obteniendo combinaciones favoritas...');
    
    // Obtener restaurante activo
    const restaurantQuery = 'SELECT id FROM restaurant.restaurants WHERE status = $1 ORDER BY created_at ASC LIMIT 1';
    const restaurantResult = await query(restaurantQuery, ['active']);
    
    if (restaurantResult.rows.length === 0) {
      return NextResponse.json({ error: 'No hay restaurantes disponibles' }, { status: 400 });
    }
    
    const restaurantId = restaurantResult.rows[0].id;
    
    // Obtener combinaciones favoritas (is_featured = true)
    const favoritosQuery = `
      SELECT 
        mc.id,
        mc.name,
        mc.description,
        mc.base_price,
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
        ) as acompanamientos
      FROM menu.menu_combinations mc
      JOIN menu.daily_menus dm ON mc.daily_menu_id = dm.id
      LEFT JOIN menu.products pe ON mc.entrada_id = pe.id
      LEFT JOIN menu.products pp ON mc.principio_id = pp.id
      LEFT JOIN menu.products ppr ON mc.proteina_id = ppr.id
      LEFT JOIN menu.products pb ON mc.bebida_id = pb.id
      LEFT JOIN menu.combination_sides cs ON mc.id = cs.combination_id
      LEFT JOIN menu.products pa ON cs.product_id = pa.id
      WHERE dm.restaurant_id = $1 
        AND mc.is_featured = true
        AND dm.status = 'published'
      GROUP BY mc.id, dm.id, pe.id, pp.id, ppr.id, pb.id
      ORDER BY dm.menu_date DESC, mc.name ASC;
    `;
    
    const result = await query(favoritosQuery, [restaurantId]);
    
    console.log(`✅ ${result.rows.length} combinaciones favoritas encontradas`);
    
    return NextResponse.json({
      success: true,
      favoritos: result.rows,
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('❌ Error al obtener favoritos:', error);
    return NextResponse.json(
      { error: 'Error al obtener combinaciones favoritas', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

// POST - Marcar/desmarcar combinación como favorita
export async function POST(request: Request) {
  try {
    const { combinacionId, esFavorito } = await request.json();
    
    console.log(`🌟 ${esFavorito ? 'Marcando' : 'Desmarcando'} combinación como favorita:`, combinacionId);
    
    if (!combinacionId) {
      return NextResponse.json({ error: 'ID de combinación requerido' }, { status: 400 });
    }
    
    // Actualizar el estado de favorito
    const updateQuery = `
      UPDATE menu.menu_combinations 
      SET is_featured = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, is_featured;
    `;
    
    const result = await query(updateQuery, [esFavorito, combinacionId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Combinación no encontrada' }, { status: 404 });
    }
    
    const combinacion = result.rows[0];
    
    console.log(`✅ Combinación ${esFavorito ? 'marcada' : 'desmarcada'} como favorita:`, combinacion.name);
    
    return NextResponse.json({
      success: true,
      message: `Combinación ${esFavorito ? 'agregada a' : 'removida de'} favoritos`,
      combinacion: {
        id: combinacion.id,
        nombre: combinacion.name,
        esFavorito: combinacion.is_featured
      }
    });
    
  } catch (error) {
    console.error('❌ Error al actualizar favorito:', error);
    return NextResponse.json(
      { error: 'Error al actualizar favorito', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
