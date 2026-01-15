// MIGRATED TO SUPABASE - Simplified version
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Health check básico
    const { data, error } = await supabase
      .schema('public')
      .from('restaurants')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json({
        status: 'unhealthy',
        database: 'error',
        error: error.message
      }, { status: 503 });
    }

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}
