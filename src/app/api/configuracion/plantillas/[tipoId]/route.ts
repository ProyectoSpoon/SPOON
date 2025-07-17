import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: Request,
  { params }: { params: { tipoId: string } }
) {
  try {
    const tipoId = params.tipoId;
    console.log('🔍 GET /api/configuracion/categorias/plantilla - PostgreSQL:', tipoId);
    
    // ✅ CONVERTIDO: De archivos JSON a PostgreSQL
    // Antes: fs.readFileSync(`plantilla_${tipoId}.json`)
    // Ahora: SELECT desde system.categories como plantillas globales
    
    // Verificar si el tipo de cocina existe
    let cuisineTypeQuery: string;
    let cuisineParams: any[];
    
    // Limpiar tipoId (remover prefijo "tipo_" si existe)
    const cleanTipoId = tipoId.replace('tipo_', '');
    
    if (cleanTipoId.length === 36 && cleanTipoId.includes('-')) {
      cuisineTypeQuery = 'SELECT id, name, slug FROM system.cuisine_types WHERE id = $1 AND is_active = true';
      cuisineParams = [cleanTipoId];
    } else {
      cuisineTypeQuery = 'SELECT id, name, slug FROM system.cuisine_types WHERE (slug = $1 OR name ILIKE $2) AND is_active = true';
      cuisineParams = [cleanTipoId, `%${cleanTipoId}%`];
    }
    
    const cuisineResult = await query(cuisineTypeQuery, cuisineParams);
    
    if (cuisineResult.rows.length === 0) {
      console.log(`❌ Tipo de cocina no encontrado: ${cleanTipoId}`);
      
      // Devolver plantilla básica por defecto
      const plantillaBasica = {
        tipoId: tipoId,
        tipoNombre: 'Tipo Genérico',
        plantilla: {
          categorias: [
            {
              id: 'default-entradas',
              nombre: 'Entradas',
              tipo: 'entrada',
              descripcion: 'Aperitivos y entradas',
              orden: 1,
              activa: true,
              esRequerida: true
            },
            {
              id: 'default-principios',
              nombre: 'Principios',
              tipo: 'principio',
              descripcion: 'Platos principales',
              orden: 2,
              activa: true,
              esRequerida: true
            },
            {
              id: 'default-proteinas',
              nombre: 'Proteínas',
              tipo: 'proteina',
              descripcion: 'Carnes y proteínas',
              orden: 3,
              activa: true,
              esRequerida: true
            },
            {
              id: 'default-bebidas',
              nombre: 'Bebidas',
              tipo: 'bebida',
              descripcion: 'Bebidas y refrescos',
              orden: 4,
              activa: true,
              esRequerida: false
            }
          ],
          metadata: {
            version: '1.0',
            created_at: new Date().toISOString(),
            source: 'default_template'
          }
        }
      };
      
      return NextResponse.json(plantillaBasica);
    }
    
    const cuisineType = cuisineResult.rows[0];
    
    // Obtener categorías del sistema como plantilla
    const plantillaQuery = `
      SELECT 
        c.id,
        c.name,
        c.category_type,
        c.sort_order,
        c.description,
        c.is_active,
        c.created_at,
        -- Contar productos por categoría para determinar si es popular/recomendada
        COUNT(p.id) as product_count,
        -- Determinar si es una categoría esencial
        CASE 
          WHEN c.category_type IN ('entrada', 'principio', 'proteina') THEN true
          ELSE false
        END as es_requerida
      FROM system.categories c
      LEFT JOIN system.products p ON c.id = p.category_id AND p.is_active = true
      WHERE c.is_active = true
      GROUP BY c.id, c.name, c.category_type, c.sort_order, c.description, c.is_active, c.created_at
      ORDER BY c.sort_order ASC, c.name ASC
    `;
    
    const plantillaResult = await query(plantillaQuery);
    
    // Transformar categorías a formato de plantilla
    const categorias = plantillaResult.rows.map(row => ({
      id: row.id,
      nombre: row.name,
      name: row.name, // Para compatibilidad
      tipo: row.category_type,
      category_type: row.category_type,
      descripcion: row.description || `Categoría de ${row.name.toLowerCase()}`,
      description: row.description || `Categoría de ${row.name.toLowerCase()}`,
      orden: row.sort_order || 0,
      sort_order: row.sort_order || 0,
      activa: row.is_active,
      is_active: row.is_active,
      esRequerida: row.es_requerida,
      productCount: parseInt(row.product_count) || 0,
      recomendada: parseInt(row.product_count) > 5, // Si tiene más de 5 productos
      created_at: row.created_at
    }));
    
    // Agregar categorías específicas del tipo de cocina si es necesario
    const categoriasEspecificas = await getCategoriesForCuisineType(cuisineType.slug);
    
    const plantilla = {
      tipoId: tipoId,
      tipoNombre: cuisineType.name,
      tipoSlug: cuisineType.slug,
      plantilla: {
        categorias: [...categorias, ...categoriasEspecificas],
        configuracion: {
          permitirPersonalizacion: true,
          categoriasMinimas: categorias.filter(c => c.esRequerida).length,
          categoriasRecomendadas: categorias.filter(c => c.recomendada).length
        },
        metadata: {
          cuisine_type_id: cuisineType.id,
          cuisine_type_name: cuisineType.name,
          total_categorias: categorias.length,
          last_updated: new Date().toISOString(),
          source: 'postgresql_template'
        }
      }
    };
    
    console.log(`✅ Plantilla generada para ${cuisineType.name}: ${categorias.length} categorías`);
    
    return NextResponse.json(plantilla);
    
  } catch (error) {
    console.error(`❌ Error al obtener plantilla:`, error);
    return NextResponse.json(
      { 
        error: 'Error al obtener la plantilla',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// Función auxiliar para obtener categorías específicas por tipo de cocina
async function getCategoriesForCuisineType(cuisineSlug: string): Promise<any[]> {
  try {
    // Categorías específicas según el tipo de cocina
    const especialesPorTipo: Record<string, any[]> = {
      'italiana': [
        {
          id: 'pasta-category',
          nombre: 'Pastas',
          tipo: 'pasta',
          descripcion: 'Pastas tradicionales italianas',
          orden: 15,
          activa: true,
          esRequerida: false,
          especifica: true,
          cuisineSpecific: 'italiana'
        }
      ],
      'mexicana': [
        {
          id: 'tacos-category',
          nombre: 'Tacos',
          tipo: 'taco',
          descripcion: 'Tacos mexicanos tradicionales',
          orden: 15,
          activa: true,
          esRequerida: false,
          especifica: true,
          cuisineSpecific: 'mexicana'
        }
      ],
      'asiatica': [
        {
          id: 'sushi-category',
          nombre: 'Sushi',
          tipo: 'sushi',
          descripcion: 'Sushi y rolls japoneses',
          orden: 15,
          activa: true,
          esRequerida: false,
          especifica: true,
          cuisineSpecific: 'asiatica'
        }
      ],
      'colombiana': [
        {
          id: 'tipicos-category',
          nombre: 'Platos Típicos',
          tipo: 'tipico',
          descripcion: 'Platos tradicionales colombianos',
          orden: 15,
          activa: true,
          esRequerida: true,
          especifica: true,
          cuisineSpecific: 'colombiana'
        }
      ]
    };
    
    return especialesPorTipo[cuisineSlug] || [];
    
  } catch (error) {
    console.error('Error obteniendo categorías específicas:', error);
    return [];
  }
}

// POST - Crear plantilla personalizada
export async function POST(
  request: Request,
  { params }: { params: { tipoId: string } }
) {
  try {
    const tipoId = params.tipoId;
    const data = await request.json();
    
    console.log('💾 POST /api/configuracion/categorias/plantilla - Guardando plantilla personalizada:', tipoId);
    
    // ✅ CONVERTIDO: De escritura de archivos a PostgreSQL
    // Nota: Las plantillas ahora son las categorías del sistema, no archivos separados
    
    if (!data.plantilla || !data.plantilla.categorias) {
      return NextResponse.json(
        { error: 'Datos de plantilla inválidos' },
        { status: 400 }
      );
    }
    
    // En lugar de guardar una plantilla separada, 
    // podemos crear las categorías en el sistema si no existen
    let categoriasCreadas = 0;
    
    for (const categoria of data.plantilla.categorias) {
      if (categoria.especifica && categoria.cuisineSpecific) {
        // Solo crear categorías específicas que no existan
        const existsQuery = 'SELECT id FROM system.categories WHERE name = $1 AND category_type = $2';
        const existsResult = await query(existsQuery, [categoria.nombre, categoria.tipo]);
        
        if (existsResult.rows.length === 0) {
          const createQuery = `
            INSERT INTO system.categories (name, category_type, sort_order, description, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, true, NOW(), NOW())
          `;
          
          await query(createQuery, [
            categoria.nombre,
            categoria.tipo,
            categoria.orden || 99,
            categoria.descripcion || ''
          ]);
          
          categoriasCreadas++;
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Plantilla procesada exitosamente',
      tipoId: tipoId,
      categoriasCreadas: categoriasCreadas,
      nota: 'Las plantillas se basan en las categorías del sistema. Se crearon las categorías específicas nuevas.',
      source: 'postgresql_custom_template'
    });
    
  } catch (error) {
    console.error('❌ Error al guardar plantilla:', error);
    return NextResponse.json(
      { 
        error: 'Error al guardar la plantilla',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}