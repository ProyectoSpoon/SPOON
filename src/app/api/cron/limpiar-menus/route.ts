// MIGRATED TO SUPABASE - Note: Cron jobs should use Supabase Edge Functions or external scheduler
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Cron: Limpiando menús antiguos...');

    const supabase = createRouteHandlerClient({ cookies });

    // Eliminar menús más antiguos que X días
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 días atrás

    const { error } = await supabase
      .schema('restaurant')
      .from('daily_menus')
      .delete()
      .lt('date', cutoffDate.toISOString().split('T')[0]);

    if (error) {
      console.error('Error limpiando menús:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    console.log('✅ Menús antiguos eliminados');

    return NextResponse.json({
      success: true,
      message: 'Menús antiguos eliminados correctamente'
    });

  } catch (error) {
    console.error('❌ Error en cron:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno'
    }, { status: 500 });
  }
}
