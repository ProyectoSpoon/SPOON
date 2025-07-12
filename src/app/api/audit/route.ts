// src/app/api/audit/route.ts - API de Auditoría
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/config/database';

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 GET /api/audit - Obteniendo logs de auditoría...");
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('user_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '50');

    let sql = `
      SELECT 
        al.id,
        al.action,
        al.entity_type,
        al.entity_id,
        al.details,
        al.ip_address,
        al.user_agent,
        al.created_at,
        u.first_name || ' ' || u.last_name as user_name,
        u.email as user_email,
        r.name as restaurant_name
      FROM audit.activity_logs al
      LEFT JOIN auth.users u ON al.user_id = u.id
      LEFT JOIN restaurant.restaurants r ON al.restaurant_id = r.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramCount = 0;

    if (action) {
      paramCount++;
      sql += ` AND al.action = $${paramCount}`;
      params.push(action);
    }

    if (userId) {
      paramCount++;
      sql += ` AND al.user_id = $${paramCount}`;
      params.push(userId);
    }

    if (startDate) {
      paramCount++;
      sql += ` AND al.created_at >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      sql += ` AND al.created_at <= $${paramCount}`;
      params.push(endDate);
    }

    sql += ` ORDER BY al.created_at DESC LIMIT $${paramCount + 1}`;
    params.push(limit);

    console.log("📊 Ejecutando consulta de auditoría:", sql);
    console.log("📋 Parámetros:", params);

    const result = await query(sql, params);
    
    console.log(`✅ ${result.rows.length} registros de auditoría encontrados`);

    return NextResponse.json({
      logs: result.rows,
      total: result.rows.length
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

    console.log("📊 Datos de auditoría:", {
      action,
      entity_type,
      entity_id,
      user_id,
      restaurant_id
    });

    // IDs por defecto si no se proporcionan
    const defaultUserId = user_id || 'b40bff69-722e-4e49-ba56-ad85f82f6716';
    const defaultRestaurantId = restaurant_id || '4073a4ad-b275-4e17-b197-844881f0319e';

    // Insertar registro de auditoría
    const auditSql = `
      INSERT INTO audit.activity_logs (
        action,
        entity_type,
        entity_id,
        details,
        user_id,
        restaurant_id,
        ip_address,
        user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const auditResult = await query(auditSql, [
      action,
      entity_type,
      entity_id || null,
      JSON.stringify(details || {}),
      defaultUserId,
      defaultRestaurantId,
      ip_address || request.ip || 'unknown',
      user_agent || request.headers.get('user-agent') || 'unknown'
    ]);

    console.log("✅ Registro de auditoría creado:", auditResult.rows[0].id);

    return NextResponse.json(auditResult.rows[0], { status: 201 });
    
  } catch (error: any) {
    console.error('❌ Error al crear registro de auditoría:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
