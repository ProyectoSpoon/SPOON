// MIGRATED TO SUPABASE - Analytics dashboard
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Obtener métricas básicas del dashboard
    // Nota: Para analytics complejos, considerar usar Supabase Functions o servicios externos

    const metrics = {
      timestamp: new Date().toISOString(),
      message: 'Analytics migrado a Supabase - Implementar lógica específica según necesidades'
    };

    return NextResponse.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Error en analytics:', error);
    return NextResponse.json({
      error: 'Error al obtener métricas'
    }, { status: 500 });
  }
}
