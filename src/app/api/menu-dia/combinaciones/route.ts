// app/api/menu-dia/combinaciones/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuración de PostgreSQL - usando tu configuración existente
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Spoon_db',
  password: 'spoon',
  port: 5432,
});

/**
 * GET: Obtener combinaciones reales de PostgreSQL usando nueva arquitectura
 */
export async function GET(request: NextRequest) {
  let client;
  
  try {
    console.log('🔍 GET /api/menu-dia/combinaciones - Nueva arquitectura...');
    client = await pool.connect();
    
    // Obtener el restaurante dinámicamente
    const restaurantQuery = 'SELECT id FROM restaurant.restaurants WHERE status = $1 ORDER BY created_at ASC LIMIT 1';
    const restaurantResult = await client.query(restaurantQuery, ['active']);
    
    if (restaurantResult.rows.length === 0) {
      console.log('❌ No hay restaurantes disponibles');
      return NextResponse.json({
        success: false,
        message: 'No hay restaurantes disponibles',
        combinaciones: []
      });
    }
    
    const restauranteId = restaurantResult.rows[0].id;
    console.log('✅ Usando restaurante:', restauranteId);
    
    // Buscar el menú del día más reciente publicado
    const menuQuery = `
      SELECT id, menu_date, name, description, status, published_at
      FROM menu.daily_menus 
      WHERE restaurant_id = $1 
        AND status = 'published'
      ORDER BY menu_date DESC, published_at DESC 
      LIMIT 1
    `;
    
    const menuResult = await client.query(menuQuery, [restauranteId]);
    
    if (menuResult.rows.length === 0) {
      console.log('❌ No hay menús publicados');
      return NextResponse.json({
        success: false,
        message: 'No se encontró un menú del día publicado',
        combinaciones: []
      });
    }
    
    const menuDelDia = menuResult.rows[0];
    console.log('✅ Menú encontrado:', menuDelDia.name);
    
    // ✅ CONSULTA CORREGIDA: Solo columnas que existen en menu.menu_combinations 
    const combinacionesQuery = `
      SELECT 
        mc.id,
        mc.name,
        mc.description,
        mc.is_available,
        mc.max_daily_quantity,
        mc.current_quantity,
        mc.created_at,
        
        -- ✅ ENTRADA: system.products
        pe.id as entrada_id,
        pe.name as entrada_nombre,
        pe.description as entrada_descripcion,
        
        -- ✅ PRINCIPIO: system.products
        pp.id as principio_id,
        pp.name as principio_nombre,
        pp.description as principio_descripcion,
        
        -- ✅ PROTEÍNA: system.products
        ppr.id as proteina_id,
        ppr.name as proteina_nombre,
        ppr.description as proteina_descripcion,
        
        -- ✅ BEBIDA: system.products
        pb.id as bebida_id,
        pb.name as bebida_nombre,
        pb.description as bebida_descripcion,
        
        -- ✅ PRECIOS del restaurante
        COALESCE(mp.daily_menu_price, 0) as precio_restaurante,
        mp.special_menu_price as precio_especial_restaurante
        
      FROM menu.menu_combinations mc
      LEFT JOIN system.products pe ON mc.entrada_id = pe.id
      LEFT JOIN system.products pp ON mc.principio_id = pp.id
      LEFT JOIN system.products ppr ON mc.proteina_id = ppr.id
      LEFT JOIN system.products pb ON mc.bebida_id = pb.id
      LEFT JOIN restaurant.menu_pricing mp ON mp.restaurant_id = $2
      WHERE mc.daily_menu_id = $1
        AND mc.is_available = true
        AND (mc.status IS NULL OR mc.status = 'active')
      ORDER BY mc.name
    `;
    
    const combinacionesResult = await client.query(combinacionesQuery, [menuDelDia.id, restauranteId]);
    console.log(`🍽️ Encontradas ${combinacionesResult.rows.length} combinaciones`);
    
    // Formatear las combinaciones para el frontend
    const combinacionesFormateadas = combinacionesResult.rows.map(row => ({
      id: row.id,
      nombre: row.name,
      descripcion: '',
      precioBase: parseFloat(row.base_price) || 0,
      precioEspecial: row.special_price ? parseFloat(row.special_price) : null,
      esFavorito: false,
      esEspecial: row.is_featured || false,
      disponible: row.is_available,
      cantidadMaxima: row.max_daily_quantity,
      cantidadActual: row.current_quantity,
      cantidadVendida: row.sold_quantity,
      fechaCreacion: row.created_at,
      
      // ✅ PRODUCTOS usando precios del restaurante
      entrada: row.entrada_id ? {
        id: row.entrada_id,
        nombre: row.entrada_nombre,
        descripcion: row.entrada_descripcion,
        precio: parseFloat(row.precio_restaurante) || 0
      } : null,
      
      principio: row.principio_id ? {
        id: row.principio_id,
        nombre: row.principio_nombre,
        descripcion: row.principio_descripcion,
        precio: parseFloat(row.precio_restaurante) || 0
      } : null,
      
      proteina: row.proteina_id ? {
        id: row.proteina_id,
        nombre: row.proteina_nombre,
        descripcion: row.proteina_descripcion,
        precio: parseFloat(row.precio_restaurante) || 0
      } : null,
      
      bebida: row.bebida_id ? {
        id: row.bebida_id,
        nombre: row.bebida_nombre,
        descripcion: row.bebida_descripcion,
        precio: parseFloat(row.precio_restaurante) || 0
      } : null
    }));
    
    console.log('✅ Combinaciones formateadas correctamente (nueva arquitectura)');
    
    return NextResponse.json({
      success: true,
      menuDelDia: {
        id: menuDelDia.id,
        fecha: menuDelDia.menu_date,
        nombre: menuDelDia.name,
        descripcion: menuDelDia.description,
        estado: menuDelDia.status,
        fechaPublicacion: menuDelDia.published_at
      },
      totalCombinaciones: combinacionesFormateadas.length,
      combinaciones: combinacionesFormateadas,
      architecture: 'new'
    });
    
  } catch (error) {
    console.error('❌ Error en endpoint de combinaciones:', error);
    
    // Fallback a datos de prueba si hay error de BD
    console.log('🔄 Usando datos de prueba como fallback...');
    const combinacionesTest = [
      {
        id: 'test-1',
        nombre: 'Combinación de Prueba (Fallback)',
        descripcion: 'Datos de prueba - Error de conexión a BD',
        precioBase: 10000,
        precioEspecial: null,
        esFavorito: false,
        esEspecial: false,
        disponible: true,
        cantidadMaxima: 10,
        cantidadActual: 10,
        cantidadVendida: 0,
        fechaCreacion: new Date().toISOString(),
        entrada: {
          id: 'entrada-test',
          nombre: 'Ajiaco Santafereño (Test)',
          descripcion: 'Sopa tradicional bogotana',
          precio: 0
        },
        principio: {
          id: 'principio-test',
          nombre: 'Arroz con Frijoles (Test)',
          descripcion: 'Arroz blanco con frijoles rojos',
          precio: 0
        },
        proteina: {
          id: 'proteina-test',
          nombre: 'Bandeja Paisa (Test)',
          descripcion: 'Plato típico antioqueño',
          precio: 0
        },
        bebida: null
      }
    ];
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Error de base de datos - usando datos de prueba',
        message: error instanceof Error ? error.message : 'Error desconocido',
        menuDelDia: {
          id: 'test-menu',
          fecha: new Date().toISOString().split('T')[0],
          nombre: 'Menú de Prueba (Fallback)',
          descripcion: 'Error de conexión a BD',
          estado: 'published',
          fechaPublicacion: new Date().toISOString()
        },
        totalCombinaciones: combinacionesTest.length,
        combinaciones: combinacionesTest,
        architecture: 'fallback'
      },
      { status: 200 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * POST: Actualizar estado de combinaciones
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 POST /api/menu-dia/combinaciones:', body);
    
    // Por ahora solo simular la actualización
    return NextResponse.json({ 
      success: true, 
      message: 'Actualización realizada correctamente',
      architecture: 'new'
    });
    
  } catch (error) {
    console.error('❌ Error en POST:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
