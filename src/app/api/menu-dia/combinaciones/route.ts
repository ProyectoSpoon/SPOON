// app/api/menu-dia/combinaciones/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuración de PostgreSQL - usando tu configuración existente
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Spoon_db',
  password: 'spoon', // Cambia por tu contraseña real
  port: 5432,
});

/**
 * GET: Obtener combinaciones reales de PostgreSQL
 */
export async function GET(request: NextRequest) {
  let client;
  
  try {
    console.log('🔍 Conectando a PostgreSQL...');
    client = await pool.connect();
    console.log('✅ Conectado a PostgreSQL');
    
    // ID del restaurante real
    const restauranteId = '4073a4ad-b275-4e17-b197-844881f0319e';
    
    // Buscar el menú del día más reciente publicado
    console.log('🔍 Buscando menú del día...');
    const menuQuery = `
      SELECT id, menu_date, name, description, status, published_at
      FROM menu.daily_menus 
      WHERE restaurant_id = $1 
        AND status = 'published'
      ORDER BY menu_date DESC, published_at DESC 
      LIMIT 1
    `;
    
    const menuResult = await client.query(menuQuery, [restauranteId]);
    console.log(`📋 Encontrados ${menuResult.rows.length} menús`);
    
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
    
    // Obtener las combinaciones con información de productos
    console.log('🔍 Buscando combinaciones...');
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
        
        -- Información de la entrada
        pe.id as entrada_id,
        pe.name as entrada_nombre,
        pe.description as entrada_descripcion,
        pe.current_price as entrada_precio,
        
        -- Información del principio
        pp.id as principio_id,
        pp.name as principio_nombre,
        pp.description as principio_descripcion,
        pp.current_price as principio_precio,
        
        -- Información de la proteína
        ppr.id as proteina_id,
        ppr.name as proteina_nombre,
        ppr.description as proteina_descripcion,
        ppr.current_price as proteina_precio,
        
        -- Información de la bebida
        pb.id as bebida_id,
        pb.name as bebida_nombre,
        pb.description as bebida_descripcion,
        pb.current_price as bebida_precio
        
      FROM menu.menu_combinations mc
      LEFT JOIN menu.products pe ON mc.entrada_id = pe.id
      LEFT JOIN menu.products pp ON mc.principio_id = pp.id
      LEFT JOIN menu.products ppr ON mc.proteina_id = ppr.id
      LEFT JOIN menu.products pb ON mc.bebida_id = pb.id
      WHERE mc.daily_menu_id = $1
        AND mc.is_available = true
      ORDER BY mc.sort_order, mc.name
    `;
    
    const combinacionesResult = await client.query(combinacionesQuery, [menuDelDia.id]);
    console.log(`🍽️ Encontradas ${combinacionesResult.rows.length} combinaciones`);
    
    // Formatear las combinaciones para el frontend
    const combinacionesFormateadas = combinacionesResult.rows.map(row => ({
      id: row.id,
      nombre: row.name,
      descripcion: row.description,
      precioBase: parseFloat(row.base_price) || 0,
      precioEspecial: row.special_price ? parseFloat(row.special_price) : null,
      esFavorito: false, // Se puede extender para manejar favoritos
      esEspecial: row.is_featured || false,
      disponible: row.is_available,
      cantidadMaxima: row.max_daily_quantity,
      cantidadActual: row.current_quantity,
      cantidadVendida: row.sold_quantity,
      fechaCreacion: row.created_at,
      
      // Productos individuales
      entrada: row.entrada_id ? {
        id: row.entrada_id,
        nombre: row.entrada_nombre,
        descripcion: row.entrada_descripcion,
        precio: parseFloat(row.entrada_precio) || 0
      } : null,
      
      principio: row.principio_id ? {
        id: row.principio_id,
        nombre: row.principio_nombre,
        descripcion: row.principio_descripcion,
        precio: parseFloat(row.principio_precio) || 0
      } : null,
      
      proteina: row.proteina_id ? {
        id: row.proteina_id,
        nombre: row.proteina_nombre,
        descripcion: row.proteina_descripcion,
        precio: parseFloat(row.proteina_precio) || 0
      } : null,
      
      bebida: row.bebida_id ? {
        id: row.bebida_id,
        nombre: row.bebida_nombre,
        descripcion: row.bebida_descripcion,
        precio: parseFloat(row.bebida_precio) || 0
      } : null
    }));
    
    console.log('✅ Combinaciones formateadas correctamente');
    
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
      combinaciones: combinacionesFormateadas
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
        combinaciones: combinacionesTest
      },
      { status: 200 } // Devolver 200 en lugar de 500 para que el frontend maneje el fallback
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
    console.log('📝 Actualizando combinación:', body);
    
    // Por ahora solo simular la actualización
    return NextResponse.json({ 
      success: true, 
      message: 'Actualización simulada - PostgreSQL no conectado aún' 
    });
    
  } catch (error) {
    console.error('❌ Error en POST:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
