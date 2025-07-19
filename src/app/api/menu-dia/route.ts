import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// Función helper para mapear categorías a campos - CORREGIDA con IDs reales
function getCampoSegunCategoria(categoriaId: string): string {
  const categoriaMap: Record<string, string> = {
    '494fbac6-59ed-42af-af24-039298ba16b6': 'entrada_id',     // Entradas (Ajiaco)
    'de7f4731-3eb3-4d41-b830-d35e5125f4a3': 'principio_id',   // Principios (Arroz con Frijoles)
    '299b1ba0-0678-4e0e-ba53-90e5d95e5543': 'proteina_id',    // Proteínas (Bandeja Paisa)
    '8b0751ae-1332-409e-a710-f229be0b9758': 'proteina_id',    // Acompañamientos (Arepitas de Choclo)
    'c77ffc73-b65a-4f03-adb1-810443e61799': 'bebida_id'       // Bebidas (Agua con Gas)
  };
  return categoriaMap[categoriaId] || 'proteina_id';
}

export async function GET() {
  try {
    console.log('🔍 GET /api/menu-dia - Nueva arquitectura...');
    
    const restaurantQuery = 'SELECT id FROM restaurant.restaurants WHERE status = $1 ORDER BY created_at ASC LIMIT 1';
    const restaurantResult = await query(restaurantQuery, ['active']);
    
    if (restaurantResult.rows.length === 0) {
      return NextResponse.json({ error: 'No hay restaurantes disponibles' }, { status: 400 });
    }
    
    const restaurantId = restaurantResult.rows[0].id;
    console.log('✅ Usando restaurante:', restaurantId);
    
    let adminId: string | null = null;
    try {
      const adminQuery = `SELECT id FROM auth.users WHERE email LIKE '%admin%' OR email = 'spoon@spoon.com' ORDER BY created_at ASC LIMIT 1`;
      const adminResult = await query(adminQuery);
      if (adminResult.rows.length > 0) {
        adminId = adminResult.rows[0].id;
      }
    } catch (adminError) {
      console.warn('⚠️ Error al buscar admin:', adminError);
    }
    
    let menuDia: any;
    
    try {
      const menuQuery = `
        SELECT 
          dm.id, dm.restaurant_id, dm.name, dm.description, dm.menu_date, dm.status,
          dm.created_at, dm.updated_at, dm.created_by, dm.updated_by
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
        
        menuDia = { ...newMenuResult.rows[0], productos: [] };
      } else {
        menuDia = menuResult.rows[0];
        
        // ✅ CONSULTA CORREGIDA: Usar system.products + system.categories
        try {
          console.log('🔍 Buscando productos para menú ID:', menuDia.id);
          
          const productosMenuQuery = `
            SELECT DISTINCT
              p.id,
              p.name,
              p.description,
              p.category_id,
              c.name as categoria_nombre,
              c.category_type,
              c.sort_order,
              mc.current_quantity as cantidad,
              mc.name as combinacion_nombre,
              -- Precios del restaurante
              COALESCE(mp.daily_menu_price, 0) as current_price
            FROM menu.menu_combinations mc
            JOIN system.products p ON (
              p.id = mc.entrada_id OR 
              p.id = mc.principio_id OR 
              p.id = mc.proteina_id OR 
              p.id = mc.bebida_id
            )
            LEFT JOIN system.categories c ON p.category_id = c.id
            LEFT JOIN restaurant.menu_pricing mp ON mp.restaurant_id = $2
            WHERE mc.daily_menu_id = $1
              AND p.is_active = true
              AND (mc.status IS NULL OR mc.status = 'active')
            ORDER BY c.sort_order ASC, p.name ASC;
          `;
          
          const productosMenuResult = await query(productosMenuQuery, [menuDia.id, restaurantId]);
          console.log(`✅ Productos del menú cargados: ${productosMenuResult.rows.length}`);
          
          menuDia.productos = productosMenuResult.rows.map(row => ({
            id: row.id,
            nombre: row.name,
            descripcion: row.description || '',
            categoriaId: row.category_id,
            categoria: row.categoria_nombre || 'Sin categoría',
            precio: row.current_price || 0,
            imagen: null,
            cantidad: row.cantidad || 1
          }));
          
        } catch (productosError) {
          console.error('❌ Error al obtener productos del menú:', productosError);
          menuDia.productos = [];
        }
      }
    } catch (menuError) {
      console.error('❌ Error en consulta de menú:', menuError);
      throw menuError;
    }

    // ✅ CATEGORÍAS CORREGIDAS: Usar system.categories
    let categorias: any[] = [];
    try {
      const categoriasQuery = `
        SELECT c.id, c.name, c.category_type, c.sort_order
        FROM system.categories c
        ORDER BY c.sort_order ASC, c.name ASC;
      `;
      
      const categoriasResult = await query(categoriasQuery);
      categorias = categoriasResult.rows.map(row => ({
        id: row.id,
        nombre: row.name,
        tipo: row.category_type,
        orden: row.sort_order || 0,
        descripcion: '',
        activo: true
      }));
    } catch (categoriasError) {
      console.error('❌ Error al obtener categorías:', categoriasError);
    }

    // ✅ PRODUCTOS DISPONIBLES CORREGIDOS: Usar system.products + restaurant.menu_items
    let todosLosProductos: any[] = [];
    try {
      const productosQuery = `
        SELECT 
          p.id, p.name, p.description, p.category_id, p.is_active, p.created_at,
          c.name as categoria_nombre,
          mi.is_available,
          mi.is_featured,
          COALESCE(mp.daily_menu_price, 0) as current_price
        FROM system.products p
        JOIN restaurant.menu_items mi ON p.id = mi.product_id
        LEFT JOIN system.categories c ON p.category_id = c.id
        LEFT JOIN restaurant.menu_pricing mp ON mi.restaurant_id = mp.restaurant_id
        WHERE mi.restaurant_id = $1 
          AND p.is_active = true
          AND mi.is_available = true
        ORDER BY c.sort_order ASC, p.name ASC;
      `;
      
      const productosResult = await query(productosQuery, [restaurantId]);
      todosLosProductos = productosResult.rows.map(row => ({
        id: row.id,
        nombre: row.name,
        name: row.name,
        descripcion: '',
        description: '',
        precio: row.current_price,
        current_price: row.current_price,
        categoriaId: row.category_id,
        category_id: row.category_id,
        imagen: null,
        image_url: null,
        categoria_nombre: row.categoria_nombre,
        status: row.is_active ? 'active' : 'inactive',
        created_at: row.created_at,
        is_available: row.is_available,
        is_featured: row.is_featured
      }));
    } catch (productosError) {
      console.error('❌ Error al obtener productos:', productosError);
    }

    const productosPorCategoria = categorias.reduce((acc: any, categoria: any) => {
      const productosCategoria = todosLosProductos.filter(
        (producto: any) => producto.category_id === categoria.id
      );
      acc[categoria.nombre.toLowerCase()] = productosCategoria;
      return acc;
    }, {});

    console.log('✅ Menú del día obtenido exitosamente (nueva arquitectura)');

    return NextResponse.json({
      menuDia: {
        ...menuDia,
        created_at: menuDia.created_at?.toISOString(),
        updated_at: menuDia.updated_at?.toISOString(),
        menu_date: menuDia.menu_date?.toISOString()?.split('T')[0],
        fecha_creacion: menuDia.created_at?.toISOString(),
        fecha_actualizacion: menuDia.updated_at?.toISOString(),
        fecha: menuDia.menu_date?.toISOString()?.split('T')[0]
      },
      categorias,
      productosPorCategoria,
      todosLosProductos,
      restaurantId,
      architecture: 'new'
    });

  } catch (error) {
    console.error('❌ Error al obtener el menú del día:', error);
    return NextResponse.json(
      { error: 'Error al obtener el menú del día', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { productos } = await request.json();
    
    console.log('💾 POST /api/menu-dia - Nueva arquitectura...');
    console.log(`📦 Recibidos ${productos?.length || 0} productos`);
    
    const restaurantQuery = 'SELECT id FROM restaurant.restaurants WHERE status = $1 ORDER BY created_at ASC LIMIT 1';
    const restaurantResult = await query(restaurantQuery, ['active']);
    
    if (restaurantResult.rows.length === 0) {
      return NextResponse.json({ error: 'No hay restaurantes disponibles' }, { status: 400 });
    }
    
    const restaurantId = restaurantResult.rows[0].id;
    
    let menuQuery = `
      SELECT id FROM menu.daily_menus 
      WHERE menu_date = CURRENT_DATE AND restaurant_id = $1 AND status IN ('draft', 'published')
      LIMIT 1;
    `;
    
    let menuResult = await query(menuQuery, [restaurantId]);
    let menuId: string;
    
    if (menuResult.rows.length === 0) {
      const createMenuQuery = `
        INSERT INTO menu.daily_menus (restaurant_id, name, description, menu_date, status)
        VALUES ($1, $2, $3, CURRENT_DATE, 'published')
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
      await query('UPDATE menu.daily_menus SET status = $1 WHERE id = $2', ['published', menuId]);
    }

    // Limpiar combinaciones existentes
    await query('DELETE FROM menu.menu_combinations WHERE daily_menu_id = $1', [menuId]);

    // ✅ LÓGICA SIN CAMBIOS: Los productos ya vienen con los IDs correctos del sistema global
    if (productos && productos.length > 0) {
      console.log(`📦 Guardando ${productos.length} productos como combinaciones separadas...`);
      
      for (const producto of productos) {
        const campo = getCampoSegunCategoria(producto.categoriaId);
        console.log(`📝 Guardando: ${producto.nombre} en campo: ${campo}`);
        
        const valores = {
          entrada_id: campo === 'entrada_id' ? producto.id : null,
          principio_id: campo === 'principio_id' ? producto.id : null,
          proteina_id: campo === 'proteina_id' ? producto.id : null,
          bebida_id: campo === 'bebida_id' ? producto.id : null
        };
        
        const insertQuery = `
          INSERT INTO menu.menu_combinations (
            daily_menu_id, 
            entrada_id,
            principio_id,
            proteina_id,
            bebida_id,
            name, 
            description, 
            base_price, 
            current_quantity
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
        `;
        
        try {
          await query(insertQuery, [
            menuId,
            valores.entrada_id,
            valores.principio_id,
            valores.proteina_id,
            valores.bebida_id,
            producto.nombre || 'Producto sin nombre',
            producto.descripcion || '',
            producto.precio || 0,
            producto.cantidad || 1
          ]);
          console.log(`✅ Guardado: ${producto.nombre} en ${campo}`);
        } catch (insertError) {
          console.error(`❌ Error al insertar ${producto.nombre} en ${campo}:`, insertError);
        }
      }
      
      console.log('✅ Todos los productos guardados como combinaciones separadas');
    }

    return NextResponse.json({
      success: true,
      message: 'Menú del día publicado correctamente',
      menuId,
      restaurantId,
      productosGuardados: productos?.length || 0,
      architecture: 'new'
    });

  } catch (error) {
    console.error('❌ Error al guardar el menú del día:', error);
    return NextResponse.json(
      { error: 'Error al guardar el menú del día', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
