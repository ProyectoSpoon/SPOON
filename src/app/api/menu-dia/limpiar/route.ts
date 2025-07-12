import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST() {
  try {
    console.log('🧹 Iniciando limpieza de menús anteriores...');
    
    // Obtener restaurante activo
    const restaurantQuery = 'SELECT id FROM restaurant.restaurants WHERE status = $1 ORDER BY created_at ASC LIMIT 1';
    const restaurantResult = await query(restaurantQuery, ['active']);
    
    if (restaurantResult.rows.length === 0) {
      return NextResponse.json({ error: 'No hay restaurantes disponibles' }, { status: 400 });
    }
    
    const restaurantId = restaurantResult.rows[0].id;
    
    // Limpiar combinaciones de menús anteriores
    const deleteSidesQuery = `
      DELETE FROM menu.combination_sides 
      WHERE combination_id IN (
        SELECT mc.id 
        FROM menu.menu_combinations mc
        JOIN menu.daily_menus dm ON mc.daily_menu_id = dm.id
        WHERE dm.restaurant_id = $1 
          AND dm.menu_date < CURRENT_DATE
      )
    `;
    
    const deleteSidesResult = await query(deleteSidesQuery, [restaurantId]);
    
    const deleteCombinationsQuery = `
      DELETE FROM menu.menu_combinations 
      WHERE daily_menu_id IN (
        SELECT id 
        FROM menu.daily_menus 
        WHERE restaurant_id = $1 
          AND menu_date < CURRENT_DATE
      )
    `;
    
    const deleteCombinationsResult = await query(deleteCombinationsQuery, [restaurantId]);
    
    // Archivar menús anteriores en lugar de eliminarlos (para auditoría)
    const archiveMenusQuery = `
      UPDATE menu.daily_menus 
      SET status = 'archived', 
          updated_at = NOW()
      WHERE restaurant_id = $1 
        AND menu_date < CURRENT_DATE
        AND status IN ('published', 'draft')
    `;
    
    const archiveMenusResult = await query(archiveMenusQuery, [restaurantId]);
    
    console.log('✅ Limpieza completada:', {
      acompanamientosEliminados: deleteSidesResult.rowCount || 0,
      combinacionesEliminadas: deleteCombinationsResult.rowCount || 0,
      menusArchivados: archiveMenusResult.rowCount || 0
    });
    
    return NextResponse.json({
      success: true,
      message: 'Limpieza completada exitosamente',
      estadisticas: {
        acompanamientosEliminados: deleteSidesResult.rowCount || 0,
        combinacionesEliminadas: deleteCombinationsResult.rowCount || 0,
        menusArchivados: archiveMenusResult.rowCount || 0
      }
    });
    
  } catch (error) {
    console.error('❌ Error en limpieza:', error);
    return NextResponse.json(
      { error: 'Error en limpieza', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

// Endpoint GET para verificar qué se limpiaría (sin ejecutar)
export async function GET() {
  try {
    console.log('🔍 Verificando elementos a limpiar...');
    
    // Obtener restaurante activo
    const restaurantQuery = 'SELECT id FROM restaurant.restaurants WHERE status = $1 ORDER BY created_at ASC LIMIT 1';
    const restaurantResult = await query(restaurantQuery, ['active']);
    
    if (restaurantResult.rows.length === 0) {
      return NextResponse.json({ error: 'No hay restaurantes disponibles' }, { status: 400 });
    }
    
    const restaurantId = restaurantResult.rows[0].id;
    
    // Contar elementos a limpiar
    const countQuery = `
      SELECT 
        COUNT(DISTINCT dm.id) as menus_a_archivar,
        COUNT(DISTINCT mc.id) as combinaciones_a_eliminar,
        COUNT(cs.id) as acompanamientos_a_eliminar,
        MIN(dm.menu_date) as fecha_mas_antigua,
        MAX(dm.menu_date) as fecha_mas_reciente
      FROM menu.daily_menus dm
      LEFT JOIN menu.menu_combinations mc ON dm.id = mc.daily_menu_id
      LEFT JOIN menu.combination_sides cs ON mc.id = cs.combination_id
      WHERE dm.restaurant_id = $1 
        AND dm.menu_date < CURRENT_DATE
        AND dm.status IN ('published', 'draft')
    `;
    
    const countResult = await query(countQuery, [restaurantId]);
    const stats = countResult.rows[0];
    
    return NextResponse.json({
      preview: true,
      message: 'Vista previa de limpieza (no ejecutada)',
      estadisticas: {
        menusAArchivar: parseInt(stats.menus_a_archivar) || 0,
        combinacionesAEliminar: parseInt(stats.combinaciones_a_eliminar) || 0,
        acompanamientosAEliminar: parseInt(stats.acompanamientos_a_eliminar) || 0,
        fechaMasAntigua: stats.fecha_mas_antigua,
        fechaMasReciente: stats.fecha_mas_reciente
      }
    });
    
  } catch (error) {
    console.error('❌ Error en verificación:', error);
    return NextResponse.json(
      { error: 'Error en verificación', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
