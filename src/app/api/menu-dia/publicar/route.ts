import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// ✅ Interfaces ajustadas a la nueva arquitectura
interface ProductoParaCombinacion {
  id: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
  precio?: number;
  imagen?: string;
}

interface CombinacionGenerada {
  nombre: string;
  descripcion: string;
  entrada_id: string | null;
  principio_id: string | null;
  proteina_id: string;
  bebida_id: string | null;
  precio: number;
  cantidad: number;
  acompanamientos: ProductoParaCombinacion[];
}

// Función para limpiar menús anteriores automáticamente
async function limpiarMenusAnteriores(restaurantId: string): Promise<void> {
  try {
    console.log('🧹 Limpieza automática...');
    
    const deleteSidesQuery = `
      DELETE FROM menu.combination_sides 
      WHERE combination_id IN (
        SELECT mc.id 
        FROM menu.menu_combinations mc
        JOIN menu.daily_menus dm ON mc.daily_menu_id = dm.id
        WHERE dm.restaurant_id = $1 
          AND dm.menu_date < CURRENT_DATE
      )
    `;
    
    await query(deleteSidesQuery, [restaurantId]);
    
    const deleteCombinationsQuery = `
      DELETE FROM menu.menu_combinations 
      WHERE daily_menu_id IN (
        SELECT id 
        FROM menu.daily_menus 
        WHERE restaurant_id = $1 
          AND menu_date < CURRENT_DATE
      )
    `;
    
    await query(deleteCombinationsQuery, [restaurantId]);
    
    const archiveMenusQuery = `
      UPDATE menu.daily_menus 
      SET status = 'archived', 
          updated_at = NOW()
      WHERE restaurant_id = $1 
        AND menu_date < CURRENT_DATE
        AND status IN ('published', 'draft')
    `;
    
    await query(archiveMenusQuery, [restaurantId]);
    
    console.log('✅ Limpieza completada');
    
  } catch (error) {
    console.error('⚠️ Error en limpieza automática (continuando):', error);
  }
}

// ✅ FUNCIÓN CORREGIDA: Usar nueva arquitectura para generar combinaciones
function generarCombinaciones(
  productos: ProductoParaCombinacion[]
): CombinacionGenerada[] {
  const combinaciones: CombinacionGenerada[] = [];
  
  // Agrupar productos por categoría usando los IDs hardcodeados
  const entradas = productos.filter(p => p.categoriaId === 'b4e792ba-b00d-4348-b9e3-f34992315c23');
  const principios = productos.filter(p => p.categoriaId === '2d4c3ea8-843e-4312-821e-54d1c4e79dce');
  const proteinas = productos.filter(p => p.categoriaId === '342f0c43-7f98-48fb-b0ba-e4c5d3ee72b3');
  const acompanamientos = productos.filter(p => p.categoriaId === 'a272bc20-464c-443f-9283-4b5e7bfb71cf');
  const bebidas = productos.filter(p => p.categoriaId === '6feba136-57dc-4448-8357-6f5533177cfd');
  
  console.log('📊 Productos por categoría:', {
    entradas: entradas.length,
    principios: principios.length,
    proteinas: proteinas.length,
    acompanamientos: acompanamientos.length,
    bebidas: bebidas.length
  });
  
  // Validar que tengamos al menos proteínas
  if (proteinas.length === 0) {
    console.warn('⚠️ No se pueden generar combinaciones: faltan proteínas');
    return combinaciones;
  }
  
  const getPrecio = (producto: ProductoParaCombinacion | null | undefined): number => {
    if (!producto) return 0;
    return typeof producto.precio === 'number' ? producto.precio : 0;
  };
  
  // Lógica de combinaciones: siempre debe haber proteína
  if (principios.length === 0) {
    // Solo proteínas con acompañamientos
    proteinas.forEach(proteina => {
      const combo: CombinacionGenerada = {
        nombre: proteina.nombre,
        descripcion: `${proteina.nombre} con acompañamientos`,
        entrada_id: entradas[0]?.id || null,
        principio_id: null,
        proteina_id: proteina.id,
        bebida_id: bebidas[0]?.id || null,
        precio: getPrecio(entradas[0]) + getPrecio(proteina) + getPrecio(bebidas[0]),
        cantidad: 10,
        acompanamientos: acompanamientos
      };
      
      combinaciones.push(combo);
    });
  } else {
    // Combinar principios con proteínas
    if (entradas.length <= 1) {
      const entrada = entradas[0] || null;
      
      principios.forEach(principio => {
        proteinas.forEach(proteina => {
          const combo: CombinacionGenerada = {
            nombre: `${principio.nombre} con ${proteina.nombre}`,
            descripcion: `Combinación de ${principio.nombre} y ${proteina.nombre}${entrada ? ` con ${entrada.nombre}` : ''}`,
            entrada_id: entrada?.id || null,
            principio_id: principio.id,
            proteina_id: proteina.id,
            bebida_id: bebidas[0]?.id || null,
            precio: getPrecio(entrada) + getPrecio(principio) + getPrecio(proteina) + getPrecio(bebidas[0]),
            cantidad: 10,
            acompanamientos: acompanamientos
          };
          
          combinaciones.push(combo);
        });
      });
    } else {
      // Múltiples entradas
      entradas.forEach(entrada => {
        principios.forEach(principio => {
          proteinas.forEach(proteina => {
            const combo: CombinacionGenerada = {
              nombre: `${entrada.nombre} + ${principio.nombre} con ${proteina.nombre}`,
              descripcion: `Combinación completa con ${entrada.nombre}, ${principio.nombre} y ${proteina.nombre}`,
              entrada_id: entrada.id,
              principio_id: principio.id,
              proteina_id: proteina.id,
              bebida_id: bebidas[0]?.id || null,
              precio: getPrecio(entrada) + getPrecio(principio) + getPrecio(proteina) + getPrecio(bebidas[0]),
              cantidad: 10,
              acompanamientos: acompanamientos
            };
            
            combinaciones.push(combo);
          });
        });
      });
    }
  }
  
  console.log(`🎯 Combinaciones generadas: ${combinaciones.length}`);
  return combinaciones;
}

export async function POST(request: Request) {
  try {
    const { productos } = await request.json();
    
    console.log('🚀 POST /api/menu-dia/publicar - Nueva arquitectura...');
    console.log('📦 Productos recibidos:', productos?.length || 0);
    
    if (!productos || productos.length === 0) {
      return NextResponse.json({ error: 'No se enviaron productos' }, { status: 400 });
    }
    
    // 1. Obtener restaurante activo
    const restaurantQuery = 'SELECT id FROM restaurant.restaurants WHERE status = $1 ORDER BY created_at ASC LIMIT 1';
    const restaurantResult = await query(restaurantQuery, ['active']);
    
    if (restaurantResult.rows.length === 0) {
      return NextResponse.json({ error: 'No hay restaurantes disponibles' }, { status: 400 });
    }
    
    const restaurantId = restaurantResult.rows[0].id;
    console.log('✅ Restaurante:', restaurantId);
    
    // 2. Limpiar menús anteriores
    await limpiarMenusAnteriores(restaurantId);
    
    // 3. Obtener usuario admin
    const adminQuery = `SELECT id FROM auth.users WHERE role = 'admin' OR role = 'super_admin' ORDER BY created_at ASC LIMIT 1`;
    const adminResult = await query(adminQuery);
    const adminId = adminResult.rows[0]?.id || null;
    
    // 4. Crear menú del día
    const menuQuery = `
      INSERT INTO menu.daily_menus (restaurant_id, name, description, menu_date, status, created_by, published_at, published_by)
      VALUES ($1, $2, $3, CURRENT_DATE, 'published', $4, NOW(), $4)
      ON CONFLICT (restaurant_id, menu_date) 
      DO UPDATE SET 
        status = 'published',
        published_at = NOW(),
        published_by = $4,
        updated_at = NOW()
      RETURNING id;
    `;
    
    const menuResult = await query(menuQuery, [
      restaurantId,
      `Menú del ${new Date().toLocaleDateString('es-ES')}`,
      'Menú diario publicado automáticamente',
      adminId
    ]);
    
    const menuId = menuResult.rows[0].id;
    console.log('✅ Menú ID:', menuId);
    
    // 5. Limpiar combinaciones existentes
    await query('DELETE FROM menu.combination_sides WHERE combination_id IN (SELECT id FROM menu.menu_combinations WHERE daily_menu_id = $1)', [menuId]);
    await query('DELETE FROM menu.menu_combinations WHERE daily_menu_id = $1', [menuId]);
    
    // 6. ✅ VALIDAR PRODUCTOS: Verificar que existan en system.products
    console.log('🔍 Validando productos en system.products...');
    const productIds = productos.map((p: any) => p.id);
    const validationQuery = `
      SELECT id, name FROM system.products 
      WHERE id = ANY($1) AND is_active = true
    `;
    const validationResult = await query(validationQuery, [productIds]);
    
    if (validationResult.rows.length !== productos.length) {
      console.error('❌ Algunos productos no existen en system.products');
      return NextResponse.json({ 
        error: 'Algunos productos no existen en el catálogo global',
        details: `Esperados: ${productos.length}, Encontrados: ${validationResult.rows.length}`
      }, { status: 400 });
    }
    
    console.log('✅ Todos los productos validados en system.products');
    
    // 7. Generar combinaciones
    const combinaciones = generarCombinaciones(productos);
    
    if (combinaciones.length === 0) {
      return NextResponse.json({ error: 'No se pudieron generar combinaciones' }, { status: 400 });
    }
    
    // 8. Guardar combinaciones
    const insertQuery = `
      INSERT INTO menu.menu_combinations (
        daily_menu_id, name, description, entrada_id, principio_id, proteina_id, bebida_id, 
        base_price, max_daily_quantity, current_quantity, is_available
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id;
    `;
    
    let combinacionesGuardadas = 0;
    
    for (const combo of combinaciones) {
      const result = await query(insertQuery, [
        menuId,
        combo.nombre,
        combo.descripcion,
        combo.entrada_id,
        combo.principio_id,
        combo.proteina_id,
        combo.bebida_id,
        combo.precio,
        combo.cantidad,
        combo.cantidad,
        true
      ]);
      
      const combinacionId = result.rows[0].id;
      
      // 9. Guardar acompañamientos
      if (combo.acompanamientos && combo.acompanamientos.length > 0) {
        const sideQuery = `
          INSERT INTO menu.combination_sides (combination_id, product_id, quantity, is_required)
          VALUES ($1, $2, $3, $4)
        `;
        
        for (const acompanamiento of combo.acompanamientos) {
          await query(sideQuery, [combinacionId, acompanamiento.id, 1, false]);
        }
      }
      
      combinacionesGuardadas++;
    }
    
    console.log('✅ Menú publicado exitosamente (nueva arquitectura)');
    
    return NextResponse.json({
      success: true,
      message: `Menú publicado con ${combinacionesGuardadas} combinaciones`,
      menuId,
      combinacionesGeneradas: combinacionesGuardadas,
      fechaPublicacion: new Date().toISOString(),
      architecture: 'new'
    });
    
  } catch (error) {
    console.error('❌ Error al publicar menú:', error);
    return NextResponse.json(
      { error: 'Error al publicar menú', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}