// src/app/api/audit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 GET /api/audit - Obteniendo logs de auditoría...");

    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('user_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Construir query
    let query = supabase
      .from('audit_log')
      .select(`
        id,
        action,
        entity_type,
        entity_id,
        details,
        ip_address,
        user_agent,
        created_at,
        user_id,
        restaurant_id
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filtros opcionales
    if (action) {
      query = query.eq('action', action);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener logs de auditoría:', error);
      return NextResponse.json(
        { error: 'Error al obtener logs de auditoría' },
        { status: 500 }
      );
    }

    console.log(`✅ ${data?.length || 0} registros de auditoría encontrados`);

    return NextResponse.json({
      logs: data || [],
      total: data?.length || 0
    });
  } catch (error: any) {
    console.error('❌ Error al obtener logs de auditoría:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("📝 POST /api/audit - Creando registro de auditoría...");

    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();
    const {
      action,
      entity_type,
      entity_id,
      details,
      user_id,
      restaurant_id,
      ip_address,
      user_agent
    } = body;

    // Validaciones básicas
    if (!action || !entity_type) {
      return NextResponse.json(
        { error: 'action y entity_type son requeridos' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('audit_log')
      .insert({
        action,
        entity_type,
        entity_id: entity_id || null,
        details: details || {},
        user_id: user_id || null,
        restaurant_id: restaurant_id || null,
        ip_address: ip_address || request.ip || 'unknown',
        user_agent: user_agent || request.headers.get('user-agent') || 'unknown',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error al crear registro de auditoría:', error);
      return NextResponse.json(
        { error: 'Error al crear registro de auditoría' },
        { status: 500 }
      );
    }

    console.log("✅ Registro de auditoría creado:", data.id);

    return NextResponse.json(data, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error al crear registro de auditoría:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
