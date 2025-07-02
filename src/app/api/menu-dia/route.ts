import { NextResponse } from 'next/server';

// Función para obtener conexión a la base de datos
async function getDbConnection() {
  const { Pool } = await import('pg');
  
  return new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'Spoon_db',
    password: process.env.DB_PASSWORD || 'spoon',
    port: parseInt(process.env.DB_PORT || '5432'),
  });
}

export async function GET() {
  let pool;
  try {
    console.log('🔍 Obteniendo menú del día desde la base de datos...');
    
    pool = await getDbConnection();
    
    // Obtener el ID del restaurante demo
    const restaurantQuery = `
      SELECT id FROM restaurant.restaurants 
      WHERE slug = 'spoon-demo' 
      LIMIT 1;
    `;
    
    const restaurantResult = await pool.query(restaurantQuery);
    
    if (restaurantResult.rows.length === 0) {
      throw new Error('No se encontró el restaurante demo');
    }
    
    const restaurantId = restaurantResult.rows[0].id;
    
    // Obtener el ID del usuario admin
    const adminQuery = `
      SELECT id FROM auth.users 
      WHERE email = 'admin@spoon.com' 
      LIMIT 1;
    `;
    
    const adminResult = await pool.query(adminQuery);
    
    if (adminResult.rows.length === 0) {
      throw new Error('No se encontró el usuario admin');
    }
    
    const adminId = adminResult.rows[0].id;
    
    // Obtener el menú del día actual o crear uno nuevo
    const menuQuery = `
      SELECT dm.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', p.id,
                   'nombre', p.name,
                   'descripcion', p.description,
                   'categoriaId', p.category_id,
                   'categoria', c.name,
                   'precio', p.current_price,
                   'imagen', p.image_url,
                   'cantidad', mc.current_quantity
                 ) ORDER BY c.name, p.name
               ) FILTER (WHERE p.id IS NOT NULL), 
               '[]'::json
             ) as productos
      FROM menu.daily_menus dm
      LEFT JOIN menu.menu_combinations mc ON dm.id = mc.daily_menu_id
      LEFT JOIN menu.products p ON mc.proteina_id = p.id
      LEFT JOIN menu.categories c ON p.category_id = c.id
      WHERE dm.menu_date = CURRENT_DATE
        AND dm.restaurant_id = $1
        AND dm.status IN ('draft', 'published')
      GROUP BY dm.id
      ORDER BY dm.created_at DESC
      LIMIT 1;
    `;

    const menuResult = await pool.query(menuQuery, [restaurantId]);
    
    let menuDia;
    
    if (menuResult.rows.length === 0) {
      console.log('📝 No hay menú del día, creando uno nuevo...');
      
      // Crear un nuevo menú del día
      const createMenuQuery = `
        INSERT INTO menu.daily_menus (restaurant_id, name, description, menu_date, status, created_by)
        VALUES ($1, $2, $3, CURRENT_DATE, 'draft', $4)
        RETURNING *;
      `;
      
      const newMenuResult = await pool.query(createMenuQuery, [
        restaurantId,
        `Menú del ${new Date().toLocaleDateString('es-ES')}`,
        'Menú diario generado automáticamente',
        adminId
      ]);
      
      menuDia = {
        ...newMenuResult.rows[0],
        productos: []
      };
    } else {
      menuDia = menuResult.rows[0];
    }

    // Obtener todas las categorías disponibles
    const categoriasQuery = `
      SELECT id, name as nombre, description as descripcion
      FROM menu.categories
      WHERE is_active = true
      ORDER BY name;
    `;
    
    const categoriasResult = await pool.query(categoriasQuery);
    const categorias = categoriasResult.rows;

    // Obtener todos los productos disponibles por categoría
    const productosQuery = `
      SELECT p.*, c.name as categoria_nombre
      FROM menu.products p
      JOIN menu.categories c ON p.category_id = c.id
      WHERE p.status = 'active'
      ORDER BY c.name, p.name;
    `;
    
    const productosResult = await pool.query(productosQuery);
    const todosLosProductos = productosResult.rows;

    // Agrupar productos por categoría
    const productosPorCategoria = categorias.reduce((acc: any, categoria: any) => {
      acc[categoria.nombre.toLowerCase()] = todosLosProductos.filter(
        (producto: any) => producto.category_id === categoria.id
      );
      return acc;
    }, {});

    console.log('✅ Menú del día obtenido exitosamente');
    console.log('📊 Estadísticas:', {
      menuId: menuDia.id,
      productosEnMenu: menuDia.productos.length,
      categorias: categorias.length,
      totalProductosDisponibles: todosLosProductos.length
    });

    return NextResponse.json({
      menuDia: {
        ...menuDia,
        fecha_creacion: menuDia.fecha_creacion?.toISOString(),
        fecha_actualizacion: menuDia.fecha_actualizacion?.toISOString(),
        fecha: menuDia.fecha?.toISOString()?.split('T')[0]
      },
      categorias,
      productosPorCategoria,
      todosLosProductos
    });

  } catch (error) {
    console.error('❌ Error al obtener el menú del día:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener el menú del día',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  let pool;
  try {
    const { productos } = await request.json();
    
    console.log('💾 Guardando menú del día...');
    
    pool = await getDbConnection();
    
    // Obtener o crear el menú del día actual
    let menuQuery = `
      SELECT id FROM menu.daily_menus 
      WHERE menu_date = CURRENT_DATE AND status IN ('draft', 'published')
      LIMIT 1;
    `;
    
    let menuResult = await pool.query(menuQuery);
    let menuId;
    
    if (menuResult.rows.length === 0) {
      // Crear nuevo menú
      const createMenuQuery = `
        INSERT INTO menu.daily_menus (name, description, menu_date, status)
        VALUES ($1, $2, CURRENT_DATE, 'draft')
        RETURNING id;
      `;
      
      const newMenuResult = await pool.query(createMenuQuery, [
        `Menú del ${new Date().toLocaleDateString('es-ES')}`,
        'Menú diario'
      ]);
      
      menuId = newMenuResult.rows[0].id;
    } else {
      menuId = menuResult.rows[0].id;
    }

    // Limpiar combinaciones existentes del menú
    await pool.query('DELETE FROM menu.menu_combinations WHERE daily_menu_id = $1', [menuId]);

    // Insertar nuevos productos como combinaciones
    if (productos && productos.length > 0) {
      const insertQuery = `
        INSERT INTO menu.menu_combinations (daily_menu_id, proteina_id, name, description, base_price, current_quantity)
        VALUES ($1, $2, $3, $4, $5, $6);
      `;
      
      for (const producto of productos) {
        await pool.query(insertQuery, [
          menuId,
          producto.id,
          producto.nombre || 'Producto sin nombre',
          producto.descripcion || '',
          producto.precio || 0,
          producto.cantidad || 1
        ]);
      }
    }

    console.log('✅ Menú del día guardado exitosamente');

    return NextResponse.json({
      success: true,
      message: 'Menú del día guardado correctamente',
      menuId
    });

  } catch (error) {
    console.error('❌ Error al guardar el menú del día:', error);
    return NextResponse.json(
      { 
        error: 'Error al guardar el menú del día',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
