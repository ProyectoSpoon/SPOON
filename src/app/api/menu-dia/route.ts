import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    console.log('🔍 Obteniendo menú del día desde la base de datos...');
    
    // Usar la misma lógica exitosa de /api/categorias para encontrar restaurante
    console.log('🔍 Buscando restaurante por defecto...');
    
    const restaurantQuery = 'SELECT id FROM restaurant.restaurants WHERE status = $1 ORDER BY created_at ASC LIMIT 1';
    const restaurantResult = await query(restaurantQuery, ['active']);
    
    if (restaurantResult.rows.length === 0) {
      return NextResponse.json(
        {
          error: 'No hay restaurantes disponibles',
          message: 'Debe existir al menos un restaurante activo'
        },
        { status: 400 }
      );
    }
    
    const restaurantId = restaurantResult.rows[0].id;
    console.log('✅ Usando restaurante por defecto:', restaurantId);
    
    // Buscar usuario admin de manera más flexible
    let adminId = null;
    try {
      const adminQuery = `
        SELECT id FROM auth.users 
        WHERE email LIKE '%admin%' OR role = 'admin'
        ORDER BY created_at ASC
        LIMIT 1;
      `;
      
      const adminResult = await query(adminQuery);
      if (adminResult.rows.length > 0) {
        adminId = adminResult.rows[0].id;
        console.log('✅ Usuario admin encontrado:', adminId);
      } else {
        console.warn('⚠️ No se encontró usuario admin, usando NULL');
      }
    } catch (adminError) {
      console.warn('⚠️ Error al buscar admin, continuando sin admin:', adminError);
    }
    
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
                   'cantidad', COALESCE(mc.current_quantity, 1)
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

    const menuResult = await query(menuQuery, [restaurantId]);
    
    let menuDia;
    
    if (menuResult.rows.length === 0) {
      console.log('📝 No hay menú del día, creando uno nuevo...');
      
      // Crear un nuevo menú del día
      const createMenuQuery = `
        INSERT INTO menu.daily_menus (restaurant_id, name, description, menu_date, status, created_by)
        VALUES ($1, $2, $3, CURRENT_DATE, 'draft', $4)
        RETURNING *;
      `;
      
      const newMenuResult = await query(createMenuQuery, [
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

    // Obtener todas las categorías disponibles usando la misma consulta que /api/categorias
    const categoriasQuery = `
      SELECT
        c.id,
        c.name,
        c.category_type,
        c.sort_order,
        c.description,
        c.parent_id,
        c.is_active
      FROM menu.categories c
      WHERE c.restaurant_id = $1
        AND c.is_active = true
      ORDER BY c.parent_id NULLS FIRST, c.sort_order ASC, c.name ASC;
    `;
    
    const categoriasResult = await query(categoriasQuery, [restaurantId]);
    const categorias = categoriasResult.rows.map(row => ({
      id: row.id,
      nombre: row.name,
      tipo: row.category_type,
      orden: row.sort_order || 0,
      descripcion: row.description,
      parentId: row.parent_id || undefined,
      activo: row.is_active,
      restaurantId
    }));

    // Obtener todos los productos disponibles por categoría
    const productosQuery = `
      SELECT p.*, c.name as categoria_nombre
      FROM menu.products p
      JOIN menu.categories c ON p.category_id = c.id
      WHERE p.status = 'active' AND c.restaurant_id = $1
      ORDER BY c.name, p.name;
    `;
    
    const productosResult = await query(productosQuery, [restaurantId]);
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
      restaurantId,
      menuId: menuDia.id,
      productosEnMenu: Array.isArray(menuDia.productos) ? menuDia.productos.length : 0,
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
      todosLosProductos,
      restaurantId
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
  try {
    const { productos } = await request.json();
    
    console.log('💾 Guardando menú del día...');
    
    // Usar la misma lógica para encontrar restaurante
    const restaurantQuery = 'SELECT id FROM restaurant.restaurants WHERE status = $1 ORDER BY created_at ASC LIMIT 1';
    const restaurantResult = await query(restaurantQuery, ['active']);
    
    if (restaurantResult.rows.length === 0) {
      return NextResponse.json(
        {
          error: 'No hay restaurantes disponibles',
          message: 'Debe existir al menos un restaurante activo'
        },
        { status: 400 }
      );
    }
    
    const restaurantId = restaurantResult.rows[0].id;
    
    // Obtener o crear el menú del día actual
    let menuQuery = `
      SELECT id FROM menu.daily_menus 
      WHERE menu_date = CURRENT_DATE 
        AND restaurant_id = $1 
        AND status IN ('draft', 'published')
      LIMIT 1;
    `;
    
    let menuResult = await query(menuQuery, [restaurantId]);
    let menuId;
    
    if (menuResult.rows.length === 0) {
      // Crear nuevo menú
      const createMenuQuery = `
        INSERT INTO menu.daily_menus (restaurant_id, name, description, menu_date, status)
        VALUES ($1, $2, $3, CURRENT_DATE, 'draft')
        RETURNING id;
      `;
      
      const newMenuResult = await query(createMenuQuery, [
        restaurantId,
        `Menú del ${new Date().toLocaleDateString('es-ES')}`,
        'Menú diario'
      ]);
      
      menuId = newMenuResult.rows[0].id;
    } else {
      menuId = menuResult.rows[0].id;
    }

    // Limpiar combinaciones existentes del menú
    await query('DELETE FROM menu.menu_combinations WHERE daily_menu_id = $1', [menuId]);

    // Insertar nuevos productos como combinaciones
    if (productos && productos.length > 0) {
      const insertQuery = `
        INSERT INTO menu.menu_combinations (daily_menu_id, proteina_id, name, description, base_price, current_quantity)
        VALUES ($1, $2, $3, $4, $5, $6);
      `;
      
      for (const producto of productos) {
        await query(insertQuery, [
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
      menuId,
      restaurantId
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