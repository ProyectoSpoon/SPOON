import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

/**
 * GET: Obtener las categorías de un tipo de cocina específico desde PostgreSQL
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tipoId: string } }
) {
  try {
    const tipoId = params.tipoId;
    console.log('🔍 GET /api/configuracion/categorias - PostgreSQL:', tipoId);
    
    // ✅ CONVERTIDO: De archivos JSON a PostgreSQL
    // Antes: fs.readFileSync(`categorias/${tipoId}.json`)
    // Ahora: SELECT desde system.categories + system.cuisine_types
    
    // Primero verificar si el tipo de cocina existe
    let cuisineTypeQuery: string;
    let cuisineParams: any[];
    
    // Si tipoId es un UUID, buscar directamente
    if (tipoId.length === 36 && tipoId.includes('-')) {
      cuisineTypeQuery = 'SELECT id, name, slug FROM system.cuisine_types WHERE id = $1 AND is_active = true';
      cuisineParams = [tipoId];
    } else {
      // Si es un slug o nombre, buscar por esos campos
      cuisineTypeQuery = 'SELECT id, name, slug FROM system.cuisine_types WHERE (slug = $1 OR name ILIKE $2) AND is_active = true';
      cuisineParams = [tipoId, `%${tipoId}%`];
    }
    
    const cuisineResult = await query(cuisineTypeQuery, cuisineParams);
    
    if (cuisineResult.rows.length === 0) {
      console.log(`❌ Tipo de cocina no encontrado: ${tipoId}`);
      return NextResponse.json(
        { error: `No se encontró el tipo de cocina: ${tipoId}` },
        { status: 404 }
      );
    }
    
    const cuisineType = cuisineResult.rows[0];
    
    // Obtener todas las categorías del sistema (son globales)
    const categoriasQuery = `
      SELECT 
        c.id,
        c.name,
        c.category_type,
        c.sort_order,
        c.description,
        c.is_active,
        c.created_at,
        c.updated_at,
        -- Contar productos por categoría
        COUNT(p.id) as product_count
      FROM system.categories c
      LEFT JOIN system.products p ON c.id = p.category_id AND p.is_active = true
      WHERE c.is_active = true
      GROUP BY c.id, c.name, c.category_type, c.sort_order, c.description, c.is_active, c.created_at, c.updated_at
      ORDER BY c.sort_order ASC, c.name ASC
    `;
    
    const categoriasResult = await query(categoriasQuery);
    
    // Transformar al formato esperado por el frontend
    const categorias = categoriasResult.rows.map(row => ({
      id: row.id,
      nombre: row.name,
      name: row.name,
      tipo: row.category_type,
      category_type: row.category_type,
      orden: row.sort_order || 0,
      sort_order: row.sort_order || 0,
      descripcion: row.description || '',
      description: row.description || '',
      activa: row.is_active,
      is_active: row.is_active,
      productos_count: parseInt(row.product_count) || 0,
      created_at: row.created_at,
      updated_at: row.updated_at,
      // Metadatos del tipo de cocina
      cuisine_type: {
        id: cuisineType.id,
        name: cuisineType.name,
        slug: cuisineType.slug
      }
    }));
    
    const responseData = {
      tipoId: tipoId,
      tipoNombre: cuisineType.name,
      tipoSlug: cuisineType.slug,
      categorias: categorias,
      total: categorias.length,
      metadata: {
        cuisine_type_id: cuisineType.id,
        cuisine_type_name: cuisineType.name,
        last_updated: new Date().toISOString(),
        source: 'postgresql'
      }
    };
    
    console.log(`✅ ${categorias.length} categorías obtenidas para tipo: ${cuisineType.name}`);
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error(`❌ Error al obtener categorías:`, error);
    return NextResponse.json(
      { 
        error: 'Error al obtener las categorías',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Guardar/actualizar las categorías para un tipo de cocina específico
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { tipoId: string } }
) {
  try {
    const tipoId = params.tipoId;
    const data = await request.json();
    
    console.log('💾 POST /api/configuracion/categorias - Guardando en PostgreSQL:', tipoId);
    
    // ✅ CONVERTIDO: De escritura de archivos JSON a PostgreSQL
    // Antes: fs.writeFileSync(`categorias/${tipoId}.json`, JSON.stringify(data))
    // Ahora: INSERT/UPDATE en system.categories
    
    // Validar los datos
    if (!data.categorias || !Array.isArray(data.categorias)) {
      return NextResponse.json(
        { error: 'Formato de datos inválido. Se esperaba un array de categorías.' },
        { status: 400 }
      );
    }
    
    // Verificar que el tipo de cocina existe
    let cuisineTypeQuery: string;
    let cuisineParams: any[];
    
    if (tipoId.length === 36 && tipoId.includes('-')) {
      cuisineTypeQuery = 'SELECT id, name FROM system.cuisine_types WHERE id = $1 AND is_active = true';
      cuisineParams = [tipoId];
    } else {
      cuisineTypeQuery = 'SELECT id, name FROM system.cuisine_types WHERE (slug = $1 OR name ILIKE $2) AND is_active = true';
      cuisineParams = [tipoId, `%${tipoId}%`];
    }
    
    const cuisineResult = await query(cuisineTypeQuery, cuisineParams);
    
    if (cuisineResult.rows.length === 0) {
      return NextResponse.json(
        { error: `Tipo de cocina no encontrado: ${tipoId}` },
        { status: 404 }
      );
    }
    
    const cuisineType = cuisineResult.rows[0];
    
    // Procesar cada categoría
    const resultados = [];
    let categoriasCreadas = 0;
    let categoriasActualizadas = 0;
    
    for (const categoria of data.categorias) {
      if (!categoria.nombre || !categoria.tipo) {
        console.warn('Categoría inválida, saltando:', categoria);
        continue;
      }
      
      // Intentar actualizar o crear categoría
      const upsertQuery = `
        INSERT INTO system.categories (
          name, category_type, sort_order, description, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        ON CONFLICT (name, category_type) 
        DO UPDATE SET 
          sort_order = EXCLUDED.sort_order,
          description = EXCLUDED.description,
          is_active = EXCLUDED.is_active,
          updated_at = NOW()
        RETURNING id, name, category_type, 
          (CASE WHEN created_at = updated_at THEN 'created' ELSE 'updated' END) as action
      `;
      
      const upsertResult = await query(upsertQuery, [
        categoria.nombre,
        categoria.tipo,
        categoria.orden || 0,
        categoria.descripcion || '',
        categoria.activa !== false // Default true
      ]);
      
      const result = upsertResult.rows[0];
      
      if (result.action === 'created') {
        categoriasCreadas++;
      } else {
        categoriasActualizadas++;
      }
      
      resultados.push({
        id: result.id,
        nombre: result.name,
        tipo: result.category_type,
        accion: result.action
      });
    }
    
    console.log(`✅ Categorías procesadas: ${categoriasCreadas} creadas, ${categoriasActualizadas} actualizadas`);
    
    return NextResponse.json({
      success: true,
      message: `Categorías guardadas exitosamente para ${cuisineType.name}`,
      tipoId: tipoId,
      tipoNombre: cuisineType.name,
      estadisticas: {
        total_procesadas: resultados.length,
        categorias_creadas: categoriasCreadas,
        categorias_actualizadas: categoriasActualizadas
      },
      categorias: resultados,
      source: 'postgresql'
    });
    
  } catch (error) {
    console.error(`❌ Error al guardar categorías:`, error);
    return NextResponse.json(
      { 
        error: 'Error al guardar las categorías',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}