// MIGRATED TO SUPABASE - Sales analytics placeholder
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    return NextResponse.json({
      success: true,
      message: 'Sales analytics - Implementar según modelo de datos',
      data: []
    });

  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
