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
    let adminId: string | null = null;
    try {
      const adminQuery = `
        SELECT id FROM auth.users 
        WHERE email LIKE '%admin%' OR email = 'spoon@spoon.com'
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
    
    // ✅ CONSULTA SIMPLIFICADA: Obtener el menú del día actual o crear uno nuevo
    let menuDia: any;
    
    try {
      const menuQuery = `
        SELECT 
          dm.id,
          dm.restaurant_id,
          dm.name,
          dm.description,
          dm.menu_date,
          dm.status,
          dm.created_at,
          dm.updated_at,
          dm.created_by,
          dm.updated_by
        FROM menu.daily_menus dm
        WHERE dm.menu_date = CURRENT_DATE
          AND dm.restaurant_id = $1
          AND dm.status IN ('draft', 'published')
        ORDER BY dm.created_at DESC
        LIMIT 1;
      `;

      const menuResult = await query(menuQuery, [restaurantId]);
      
      if (menuResult.rows.length === 0) {
        console.log('📝 No hay menú del día, creando uno nuevo...');
        
        // Crear un nuevo menú del día
        const createMenuQuery = `
          INSERT INTO menu.daily_menus (restaurant_id, name, description, menu_date, status, created_by)
          VALUES ($1, $2, $3, CURRENT_DATE, 'draft', $4)
          RETURNING id, restaurant_id, name, description, menu_date, status, created_at, updated_at, created_by, updated_by;
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
        
        // ✅ OBTENER PRODUCTOS DEL MENÚ DE FORMA SEPARADA
        try {
          const productosMenuQuery = `
            SELECT 
              p.id,
              p.name,
              p.description,
              p.current_price,
              p.category_id,
              p.gallery_images,
              c.name as categoria_nombre,
              COALESCE(mc.current_quantity, 1) as cantidad
            FROM menu.menu_combinations mc
            JOIN menu.products p ON (
              mc.entrada_id = p.id OR 
              mc.principio_id = p.id OR 
              mc.proteina_id = p.id OR
              mc.bebida_id = p.id
            )
            LEFT JOIN menu.categories c ON p.category_id = c.id
            WHERE mc.daily_menu_id = $1
              AND p.status = 'active'
            ORDER BY c.name, p.name;
          `;
          
          const productosMenuResult = await query(productosMenuQuery, [menuDia.id]);
          
          menuDia.productos = productosMenuResult.rows.map(row => ({
            id: row.id,
            nombre: row.name,
            descripcion: row.description,
            categoriaId: row.category_id,
            categoria: row.categoria_nombre,
            precio: row.current_price,
            imagen: row.gallery_images?.[0] || null,
            cantidad: row.cantidad
          }));
          
        } catch (productosError) {
          console.warn('⚠️ Error al obtener productos del menú, usando array vacío:', productosError);
          menuDia.productos = [];
        }
      }
    } catch (menuError) {
      console.error('❌ Error en consulta de menú:', menuError);
      throw menuError;
    }

    // ✅ CONSULTA SIMPLIFICADA: Obtener todas las categorías disponibles
    let categorias: any[] = [];
    try {
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
      categorias = categoriasResult.rows.map(row => ({
        id: row.id,
        nombre: row.name,
        tipo: row.category_type,
        orden: row.sort_order || 0,
        descripcion: row.description,
        parentId: row.parent_id || undefined,
        activo: row.is_active,
        restaurantId
      }));
    } catch (categoriasError) {
      console.error('❌ Error al obtener categorías:', categoriasError);
      // Continuar sin categorías
    }

    // ✅ CONSULTA SIMPLIFICADA: Obtener todos los productos disponibles
    let todosLosProductos: any[] = [];
    try {
      const productosQuery = `
        SELECT 
          p.id,
          p.name,
          p.description,
          p.current_price,
          p.category_id,
          p.gallery_images,
          p.status,
          p.created_at,
          c.name as categoria_nombre
        FROM menu.products p
        LEFT JOIN menu.categories c ON p.category_id = c.id
        WHERE p.status = 'active'
        ORDER BY c.name NULLS LAST, p.name;
      `;
      
      const productosResult = await query(productosQuery);
      todosLosProductos = productosResult.rows.map(row => ({
        id: row.id,
        nombre: row.name,
        name: row.name, // Para compatibilidad
        descripcion: row.description,
        description: row.description, // Para compatibilidad
        precio: row.current_price,
        current_price: row.current_price, // Para compatibilidad
        categoriaId: row.category_id,
        category_id: row.category_id, // Para compatibilidad
        imagen: row.gallery_images?.[0] || null,
        image_url: row.gallery_images?.[0] || null, // Para compatibilidad
        categoria_nombre: row.categoria_nombre,
        status: row.status,
        created_at: row.created_at
      }));
    } catch (productosError) {
      console.error('❌ Error al obtener productos:', productosError);
      // Continuar sin productos
    }

    // Agrupar productos por categoría
    const productosPorCategoria = categorias.reduce((acc: any, categoria: any) => {
      const productosCategoria = todosLosProductos.filter(
        (producto: any) => producto.category_id === categoria.id
      );
      acc[categoria.nombre.toLowerCase()] = productosCategoria;
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
        // Convertir fechas a string para JSON
        created_at: menuDia.created_at?.toISOString(),
        updated_at: menuDia.updated_at?.toISOString(),
        menu_date: menuDia.menu_date?.toISOString()?.split('T')[0],
        // Alias para compatibilidad
        fecha_creacion: menuDia.created_at?.toISOString(),
        fecha_actualizacion: menuDia.updated_at?.toISOString(),
        fecha: menuDia.menu_date?.toISOString()?.split('T')[0]
      },
      categorias,
      productosPorCategoria,
      todosLosProductos,
      restaurantId
    });

  } catch (error) {
    console.error('❌ Error al obtener el menú del día:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Error al obtener el menú del día',
        details: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
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
    let menuQuery: string = `
      SELECT id FROM menu.daily_menus 
      WHERE menu_date = CURRENT_DATE 
        AND restaurant_id = $1 
        AND status IN ('draft', 'published')
      LIMIT 1;
    `;
    
    let menuResult = await query(menuQuery, [restaurantId]);
    let menuId: string;
    
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
        INSERT INTO menu.menu_combinations (
          daily_menu_id, 
          proteina_id, 
          name, 
          description, 
          base_price, 
          current_quantity
        )
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
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Error al guardar el menú del día',
        details: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
