import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    console.log('🔍 GET /api/combinaciones - PostgreSQL (reemplazando JSON)');
    
    // ✅ CONVERTIDO: De archivos JSON a PostgreSQL
    // Antes: fs.readFileSync('test-data/combinaciones.json')
    // Ahora: SELECT desde menu.menu_combinations reales
    
    // Obtener restaurante activo por defecto
    const restaurantQuery = 'SELECT id, name FROM restaurant.restaurants WHERE status = $1 ORDER BY created_at ASC LIMIT 1';
    const restaurantResult = await query(restaurantQuery, ['active']);
    
    if (restaurantResult.rows.length === 0) {
      return NextResponse.json({
        error: 'No hay restaurantes disponibles',
        combinaciones: []
      }, { status: 400 });
    }
    
    const restaurant = restaurantResult.rows[0];
    console.log('✅ Usando restaurante:', restaurant.name);
    
    // Obtener combinaciones reales desde PostgreSQL
    const combinacionesQuery = `
      SELECT 
        mc.id,
        mc.name,
        mc.description,
        mc.base_price,
        mc.special_price,
        mc.is_available,
        mc.is_featured,
        mc.max_daily_quantity,
        mc.current_quantity,
        mc.sold_quantity,
        mc.created_at,
        mc.updated_at,
        
        -- Información del menú del día
        dm.menu_date,
        dm.name as menu_name,
        dm.status as menu_status,
        
        -- ✅ PRODUCTOS desde system.products
        pe.id as entrada_id,
        pe.name as entrada_nombre,
        pe.description as entrada_descripcion,
        
        pp.id as principio_id,
        pp.name as principio_nombre,
        pp.description as principio_descripcion,
        
        ppr.id as proteina_id,
        ppr.name as proteina_nombre,
        ppr.description as proteina_descripcion,
        
        pb.id as bebida_id,
        pb.name as bebida_nombre,
        pb.description as bebida_descripcion,
        
        -- Precios del restaurante
        COALESCE(mp.daily_menu_price, 0) as restaurant_base_price,
        mp.special_menu_price as restaurant_special_price
        
      FROM menu.menu_combinations mc
      JOIN menu.daily_menus dm ON mc.daily_menu_id = dm.id
      LEFT JOIN system.products pe ON mc.entrada_id = pe.id
      LEFT JOIN system.products pp ON mc.principio_id = pp.id
      LEFT JOIN system.products ppr ON mc.proteina_id = ppr.id
      LEFT JOIN system.products pb ON mc.bebida_id = pb.id
      LEFT JOIN restaurant.menu_pricing mp ON dm.restaurant_id = mp.restaurant_id
      WHERE dm.restaurant_id = $1
        AND dm.status IN ('published', 'draft')
        AND mc.is_available = true
      ORDER BY dm.menu_date DESC, mc.created_at DESC
      LIMIT 50;
    `;
    
    const result = await query(combinacionesQuery, [restaurant.id]);
    
    if (result.rows.length === 0) {
      console.log('⚠️ No hay combinaciones, devolviendo ejemplo');
      
      // Devolver combinación de ejemplo si no hay datos reales
      const combinacionesEjemplo = [
        {
          id: 'ejemplo-1',
          nombre: 'Combinación Ejemplo',
          descripcion: 'Esta es una combinación de ejemplo. Crea combinaciones reales desde el menú del día.',
          precio: 12000,
          precioEspecial: null,
          disponible: true,
          destacado: false,
          categoria: 'ejemplo',
          componentes: {
            entrada: {
              id: 'entrada-ejemplo',
              nombre: 'Entrada de Ejemplo',
              descripcion: 'Ejemplo de entrada'
            },
            principio: {
              id: 'principio-ejemplo',
              nombre: 'Principio de Ejemplo',
              descripcion: 'Ejemplo de principio'
            },
            proteina: {
              id: 'proteina-ejemplo',
              nombre: 'Proteína de Ejemplo',
              descripcion: 'Ejemplo de proteína'
            },
            bebida: null
          },
          fecha: new Date().toISOString().split('T')[0],
          restaurante: restaurant.name,
          source: 'ejemplo_database'
        }
      ];
      
      return NextResponse.json({
        combinaciones: combinacionesEjemplo,
        total: combinacionesEjemplo.length,
        restaurant_id: restaurant.id,
        restaurant_name: restaurant.name,
        source: 'ejemplo'
      });
    }
    
    // Transformar datos reales al formato esperado
    const combinaciones = result.rows.map(row => ({
      id: row.id,
      nombre: row.name,
      name: row.name, // Para compatibilidad
      descripcion: row.description || '',
      description: row.description || '',
      precio: parseFloat(row.base_price) || 0,
      precioBase: parseFloat(row.base_price) || 0,
      precioEspecial: row.special_price ? parseFloat(row.special_price) : null,
      disponible: row.is_available,
      destacado: row.is_featured,
      cantidad: {
        maxima: row.max_daily_quantity || 0,
        actual: row.current_quantity || 0,
        vendida: row.sold_quantity || 0,
        disponible: (row.current_quantity || 0) - (row.sold_quantity || 0)
      },
      
      // Componentes de la combinación
      componentes: {
        entrada: row.entrada_id ? {
          id: row.entrada_id,
          nombre: row.entrada_nombre,
          descripcion: row.entrada_descripcion || ''
        } : null,
        
        principio: row.principio_id ? {
          id: row.principio_id,
          nombre: row.principio_nombre,
          descripcion: row.principio_descripcion || ''
        } : null,
        
        proteina: row.proteina_id ? {
          id: row.proteina_id,
          nombre: row.proteina_nombre,
          descripcion: row.proteina_descripcion || ''
        } : null,
        
        bebida: row.bebida_id ? {
          id: row.bebida_id,
          nombre: row.bebida_nombre,
          descripcion: row.bebida_descripcion || ''
        } : null
      },
      
      // Información del menú
      menu: {
        id: row.daily_menu_id,
        nombre: row.menu_name,
        fecha: row.menu_date?.toISOString().split('T')[0],
        estado: row.menu_status
      },
      
      // Metadatos
      fecha: row.menu_date?.toISOString().split('T')[0],
      restaurante: restaurant.name,
      restaurant_id: restaurant.id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      source: 'postgresql_real'
    }));
    
    // Obtener estadísticas adicionales
    const statsQuery = `
      SELECT 
        COUNT(*) as total_combinaciones,
        COUNT(*) FILTER (WHERE mc.is_featured = true) as destacadas,
        COUNT(*) FILTER (WHERE mc.special_price IS NOT NULL) as con_oferta,
        COUNT(*) FILTER (WHERE mc.is_available = false) as no_disponibles,
        AVG(mc.base_price) as precio_promedio
      FROM menu.menu_combinations mc
      JOIN menu.daily_menus dm ON mc.daily_menu_id = dm.id
      WHERE dm.restaurant_id = $1
        AND dm.status IN ('published', 'draft')
    `;
    
    const statsResult = await query(statsQuery, [restaurant.id]);
    const stats = statsResult.rows[0];
    
    console.log(`✅ ${combinaciones.length} combinaciones reales obtenidas de PostgreSQL`);
    
    return NextResponse.json({
      combinaciones,
      total: combinaciones.length,
      restaurant_id: restaurant.id,
      restaurant_name: restaurant.name,
      estadisticas: {
        total_en_sistema: parseInt(stats.total_combinaciones) || 0,
        destacadas: parseInt(stats.destacadas) || 0,
        con_oferta: parseInt(stats.con_oferta) || 0,
        no_disponibles: parseInt(stats.no_disponibles) || 0,
        precio_promedio: parseFloat(stats.precio_promedio) || 0
      },
      metadata: {
        last_updated: new Date().toISOString(),
        source: 'postgresql',
        query_limit: 50
      }
    });
    
  } catch (error) {
    console.error('❌ Error al obtener combinaciones:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener las combinaciones',
        details: error instanceof Error ? error.message : 'Error desconocido',
        combinaciones: []
      },
      { status: 500 }
    );
  }
}

// POST - Crear nueva combinación
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('🔄 POST /api/combinaciones - Creando combinación en PostgreSQL');
    
    const {
      nombre,
      descripcion,
      precio,
      entrada_id,
      principio_id,
      proteina_id,
      bebida_id,
      cantidad_maxima = 10
    } = body;
    
    // Validaciones
    if (!nombre || !proteina_id) {
      return NextResponse.json(
        { error: 'Nombre y proteína son requeridos' },
        { status: 400 }
      );
    }
    
    // Obtener menú del día actual o crear uno
    const restaurantQuery = 'SELECT id FROM restaurant.restaurants WHERE status = $1 ORDER BY created_at ASC LIMIT 1';
    const restaurantResult = await query(restaurantQuery, ['active']);
    
    if (restaurantResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'No hay restaurantes disponibles' },
        { status: 400 }
      );
    }
    
    const restaurantId = restaurantResult.rows[0].id;
    
    // Buscar o crear menú del día
    let menuQuery = `
      SELECT id FROM menu.daily_menus 
      WHERE menu_date = CURRENT_DATE AND restaurant_id = $1 AND status IN ('draft', 'published')
      LIMIT 1
    `;
    
    let menuResult = await query(menuQuery, [restaurantId]);
    let menuId: string;
    
    if (menuResult.rows.length === 0) {
      const createMenuQuery = `
        INSERT INTO menu.daily_menus (restaurant_id, name, description, menu_date, status)
        VALUES ($1, $2, $3, CURRENT_DATE, 'draft')
        RETURNING id
      `;
      
      const newMenuResult = await query(createMenuQuery, [
        restaurantId,
        `Menú del ${new Date().toLocaleDateString('es-ES')}`,
        'Menú creado automáticamente'
      ]);
      
      menuId = newMenuResult.rows[0].id;
    } else {
      menuId = menuResult.rows[0].id;
    }
    
    // Crear la combinación
    const insertQuery = `
      INSERT INTO menu.menu_combinations (
        daily_menu_id, name, description, entrada_id, principio_id, proteina_id, bebida_id,
        base_price, max_daily_quantity, current_quantity, is_available, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9, true, NOW(), NOW())
      RETURNING id, name, description, base_price, created_at
    `;
    
    const insertResult = await query(insertQuery, [
      menuId,
      nombre,
      descripcion || '',
      entrada_id || null,
      principio_id || null,
      proteina_id,
      bebida_id || null,
      precio || 0,
      cantidad_maxima
    ]);
    
    const nuevaCombinacion = insertResult.rows[0];
    
    console.log('✅ Combinación creada exitosamente:', nuevaCombinacion.name);
    
    return NextResponse.json({
      success: true,
      combinacion: {
        id: nuevaCombinacion.id,
        nombre: nuevaCombinacion.name,
        descripcion: nuevaCombinacion.description,
        precio: parseFloat(nuevaCombinacion.base_price),
        created_at: nuevaCombinacion.created_at
      },
      message: 'Combinación creada exitosamente',
      source: 'postgresql'
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error al crear combinación:', error);
    return NextResponse.json(
      { 
        error: 'Error al crear la combinación',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}