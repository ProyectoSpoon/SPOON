import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    console.log('🔍 Obteniendo combinaciones del menú del día...');
    
    // Obtener restaurante activo
    const restaurantQuery = 'SELECT id FROM restaurant.restaurants WHERE status = $1 ORDER BY created_at ASC LIMIT 1';
    const restaurantResult = await query(restaurantQuery, ['active']);
    
    if (restaurantResult.rows.length === 0) {
      return NextResponse.json({ error: 'No hay restaurantes disponibles' }, { status: 400 });
    }
    
    const restaurantId = restaurantResult.rows[0].id;
    
    // Obtener combinaciones del menú del día actual
    const combinacionesQuery = `
      SELECT 
        mc.id,
        mc.name as nombre,
        mc.description as descripcion,
        mc.base_price as precio_base,
        mc.special_price as precio_especial,
        mc.current_quantity as cantidad,
        mc.is_available as disponible,
        mc.is_featured as es_favorito,
        dm.menu_date as fecha_menu,
        dm.name as nombre_menu,
        -- Entrada
        pe.id as entrada_id,
        pe.name as entrada_nombre,
        pe.description as entrada_descripcion,
        pe.image_url as entrada_imagen,
        pe.current_price as entrada_precio,
        -- Principio
        pp.id as principio_id,
        pp.name as principio_nombre,
        pp.description as principio_descripcion,
        pp.image_url as principio_imagen,
        pp.current_price as principio_precio,
        -- Proteína
        ppr.id as proteina_id,
        ppr.name as proteina_nombre,
        ppr.description as proteina_descripcion,
        ppr.image_url as proteina_imagen,
        ppr.current_price as proteina_precio,
        -- Bebida
        pb.id as bebida_id,
        pb.name as bebida_nombre,
        pb.description as bebida_descripcion,
        pb.image_url as bebida_imagen,
        pb.current_price as bebida_precio,
        -- Acompañamientos
        COALESCE(
          json_agg(
            CASE WHEN pa.id IS NOT NULL THEN
              json_build_object(
                'id', pa.id,
                'nombre', pa.name,
                'descripcion', pa.description,
                'imagen', pa.image_url,
                'precio', pa.current_price,
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
        AND dm.menu_date = CURRENT_DATE
        AND dm.status = 'published'
      GROUP BY mc.id, dm.id, pe.id, pp.id, ppr.id, pb.id
      ORDER BY mc.name ASC;
    `;
    
    const result = await query(combinacionesQuery, [restaurantId]);
    
    if (result.rows.length === 0) {
      console.log('⚠️ No se encontraron combinaciones para el menú del día actual');
      return NextResponse.json({
        success: true,
        combinaciones: [],
        total: 0,
        message: 'No hay combinaciones publicadas para hoy'
      });
    }
    
    // Formatear las combinaciones
    const combinaciones = result.rows.map(row => ({
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      precioBase: row.precio_base,
      precioEspecial: row.precio_especial,
      cantidad: row.cantidad,
      disponible: row.disponible,
      esFavorito: row.es_favorito,
      esEspecial: row.precio_especial !== null,
      fechaMenu: row.fecha_menu,
      nombreMenu: row.nombre_menu,
      entrada: row.entrada_id ? {
        id: row.entrada_id,
        nombre: row.entrada_nombre,
        descripcion: row.entrada_descripcion,
        imagen: row.entrada_imagen,
        precio: row.entrada_precio
      } : null,
      principio: row.principio_id ? {
        id: row.principio_id,
        nombre: row.principio_nombre,
        descripcion: row.principio_descripcion,
        imagen: row.principio_imagen,
        precio: row.principio_precio
      } : null,
      proteina: row.proteina_id ? {
        id: row.proteina_id,
        nombre: row.proteina_nombre,
        descripcion: row.proteina_descripcion,
        imagen: row.proteina_imagen,
        precio: row.proteina_precio
      } : null,
      bebida: row.bebida_id ? {
        id: row.bebida_id,
        nombre: row.bebida_nombre,
        descripcion: row.bebida_descripcion,
        imagen: row.bebida_imagen,
        precio: row.bebida_precio
      } : null,
      acompanamientos: row.acompanamientos || []
    }));
    
    console.log(`✅ ${combinaciones.length} combinaciones encontradas`);
    
    return NextResponse.json({
      success: true,
      combinaciones,
      total: combinaciones.length,
      restaurantId
    });
    
  } catch (error) {
    console.error('❌ Error al obtener combinaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener combinaciones', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
