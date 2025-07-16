import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// Función helper para mapear categorías a campos
function getCampoSegunCategoria(categoriaId: string): string {
  const categoriaMap: Record<string, string> = {
    'b4e792ba-b00d-4348-b9e3-f34992315c23': 'entrada_id',     // Entradas
    '2d4c3ea8-843e-4312-821e-54d1c4e79dce': 'principio_id',   // Principios  
    '342f0c43-7f98-48fb-b0ba-e4c5d3ee72b3': 'proteina_id',    // Proteínas
    'a272bc20-464c-443f-9283-4b5e7bfb71cf': 'proteina_id',    // Acompañamientos → proteina_id (no hay campo específico)
    '6feba136-57dc-4448-8357-6f5533177cfd': 'bebida_id'       // Bebidas
  };
  return categoriaMap[categoriaId] || 'proteina_id';
}

export async function GET() {
  try {
    console.log('🔍 Obteniendo menú del día desde la base de datos...');
    
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
        
        // ✅ CONSULTA CORREGIDA: Buscar en TODOS los campos desde el inicio
        try {
          console.log('🔍 Buscando productos para menú ID:', menuDia.id);
          
          // Debug: Ver estructura de combinaciones
          const debugQuery = `SELECT * FROM menu.menu_combinations WHERE daily_menu_id = $1 LIMIT 1;`;
          const debugResult = await query(debugQuery, [menuDia.id]);
          console.log('🔍 DEBUG: Combinaciones encontradas:', debugResult.rows.length);
          
          if (debugResult.rows.length > 0) {
            console.log('🔍 DEBUG: Estructura de combinación:', Object.keys(debugResult.rows[0]));
            console.log('🔍 DEBUG: Valores de ejemplo:', {
              entrada_id: debugResult.rows[0].entrada_id,
              principio_id: debugResult.rows[0].principio_id,
              proteina_id: debugResult.rows[0].proteina_id,
              bebida_id: debugResult.rows[0].bebida_id
            });
          }
          
          // ✅ CONSULTA PRINCIPAL CORREGIDA: Buscar en TODOS los campos
          const productosMenuQuery = `
            SELECT DISTINCT
              p.id,
              p.name,
              p.description,
              p.current_price,
              p.category_id,
              p.gallery_images,
              c.name as categoria_nombre,
              mc.current_quantity as cantidad,
              mc.name as combinacion_nombre
            FROM menu.menu_combinations mc
            JOIN menu.products p ON (
              p.id = mc.entrada_id OR 
              p.id = mc.principio_id OR 
              p.id = mc.proteina_id OR 
              p.id = mc.bebida_id
            )
            LEFT JOIN menu.categories c ON p.category_id = c.id
            WHERE mc.daily_menu_id = $1
              AND p.status = 'active'
            ORDER BY c.name, p.name;
          `;
          
          const productosMenuResult = await query(productosMenuQuery, [menuDia.id]);
          console.log(`✅ Productos del menú cargados: ${productosMenuResult.rows.length}`);
          
          // Agrupar productos por categoría para debugging
          const productosPorCategoria = productosMenuResult.rows.reduce((acc: Record<string, number>, producto: any) => {
            const categoria = producto.categoria_nombre || 'Sin categoría';
            acc[categoria] = (acc[categoria] || 0) + 1;
            return acc;
          }, {});
          
          console.log('📊 Productos por categoría:', productosPorCategoria);
          
          menuDia.productos = productosMenuResult.rows.map(row => ({
            id: row.id,
            nombre: row.name,
            descripcion: row.description || '',
            categoriaId: row.category_id,
            categoria: row.categoria_nombre || 'Sin categoría',
            precio: row.current_price || 0,
            imagen: row.gallery_images?.[0] || null,
            cantidad: row.cantidad || 1
          }));
          
        } catch (productosError) {
          console.error('❌ Error al obtener productos del menú:', productosError);
          console.error('❌ Error completo:', productosError instanceof Error ? productosError.stack : 'No stack trace');
          menuDia.productos = [];
        }
      }
    } catch (menuError) {
      console.error('❌ Error en consulta de menú:', menuError);
      throw menuError;
    }

    // Obtener categorías
    let categorias: any[] = [];
    try {
      const categoriasQuery = `
        SELECT c.id, c.name, c.category_type, c.sort_order, c.description, c.parent_id, c.is_active
        FROM menu.categories c
        WHERE c.restaurant_id = $1 AND c.is_active = true
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
    }

    // Obtener todos los productos disponibles
    let todosLosProductos: any[] = [];
    try {
      const productosQuery = `
        SELECT p.id, p.name, p.description, p.current_price, p.category_id, p.gallery_images, 
               p.status, p.created_at, c.name as categoria_nombre
        FROM menu.products p
        LEFT JOIN menu.categories c ON p.category_id = c.id
        WHERE p.status = 'active'
        ORDER BY c.name NULLS LAST, p.name;
      `;
      
      const productosResult = await query(productosQuery);
      todosLosProductos = productosResult.rows.map(row => ({
        id: row.id,
        nombre: row.name,
        name: row.name,
        descripcion: row.description,
        description: row.description,
        precio: row.current_price,
        current_price: row.current_price,
        categoriaId: row.category_id,
        category_id: row.category_id,
        imagen: row.gallery_images?.[0] || null,
        image_url: row.gallery_images?.[0] || null,
        categoria_nombre: row.categoria_nombre,
        status: row.status,
        created_at: row.created_at
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

    console.log('✅ Menú del día obtenido exitosamente');

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
      restaurantId
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
    
    console.log('💾 Guardando menú del día...');
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
      
      // Actualizar status a published
      await query('UPDATE menu.daily_menus SET status = $1 WHERE id = $2', ['published', menuId]);
    }

    // Limpiar combinaciones existentes
    await query('DELETE FROM menu.menu_combinations WHERE daily_menu_id = $1', [menuId]);

    // ✅ GUARDAR CORREGIDO: Crear una combinación POR CADA producto
    if (productos && productos.length > 0) {
      console.log(`📦 Guardando ${productos.length} productos como combinaciones separadas...`);
      
      // Crear UNA combinación por cada producto
      for (const producto of productos) {
        const campo = getCampoSegunCategoria(producto.categoriaId);
        console.log(`📝 Guardando: ${producto.nombre} en campo: ${campo}`);
        
        // Preparar valores para todos los campos (NULL para los que no corresponden)
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
      productosGuardados: productos?.length || 0
    });

  } catch (error) {
    console.error('❌ Error al guardar el menú del día:', error);
    return NextResponse.json(
      { error: 'Error al guardar el menú del día', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}