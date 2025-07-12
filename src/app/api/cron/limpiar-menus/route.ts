import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: Request) {
  try {
    // Verificar autorización en producción
    const authHeader = process.env.CRON_SECRET;
    const requestAuth = request.headers.get('authorization');
    
    if (process.env.NODE_ENV === 'production' && authHeader && requestAuth !== `Bearer ${authHeader}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Ejecutar limpieza silenciosa
    const restaurantQuery = 'SELECT id FROM restaurant.restaurants WHERE status = $1';
    const restaurantResult = await query(restaurantQuery, ['active']);
    
    let totalLimpiados = 0;
    
    for (const restaurant of restaurantResult.rows) {
      const restaurantId = restaurant.id;
      
      // Limpiar para cada restaurante
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
      
      await query(deleteSidesQuery, [restaurantId]);
      
      const deleteCombinationsQuery = `
        DELETE FROM menu.menu_combinations 
        WHERE daily_menu_id IN (
          SELECT id 
          FROM menu.daily_menus 
          WHERE restaurant_id = $1 
            AND menu_date < CURRENT_DATE
        )
      `;
      
      await query(deleteCombinationsQuery, [restaurantId]);
      
      const archiveMenusQuery = `
        UPDATE menu.daily_menus 
        SET status = 'archived', 
            updated_at = NOW()
        WHERE restaurant_id = $1 
          AND menu_date < CURRENT_DATE
          AND status IN ('published', 'draft')
      `;
      
      const archiveResult = await query(archiveMenusQuery, [restaurantId]);
      
      // ✅ FIX: Manejar el caso donde rowCount puede ser null
      totalLimpiados += archiveResult.rowCount || 0;
    }
    
    // Solo log si realmente limpió algo
    if (totalLimpiados > 0) {
      console.log(`🗑️ Limpieza nocturna: ${totalLimpiados} menús archivados`);
    }
    
    return NextResponse.json({
      success: true,
      cleaned: totalLimpiados,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error en limpieza nocturna:', error);
    return NextResponse.json(
      { error: 'Error en limpieza nocturna' },
      { status: 500 }
    );
  }
}
