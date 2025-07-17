import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: Request,
  { params }: { params: { categoriaId: string } }
) {
  try {
    const categoriaId = params.categoriaId;
    console.log('🔍 GET /api/productos/categoria - PostgreSQL:', categoriaId);
    
    // ✅ CONVERTIDO: De archivos JSON a PostgreSQL
    // Antes: fs.readFileSync('test-data/entradas.json')
    // Ahora: SELECT desde system.products
    
    // Buscar productos por categoría en system.products
    const productosQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.category_id,
        p.is_active,
        p.created_at,
        p.updated_at,
        c.name as category_name,
        c.category_type
      FROM system.products p
      LEFT JOIN system.categories c ON p.category_id = c.id
      WHERE p.category_id = $1 
        AND p.is_active = true
      ORDER BY p.name ASC
    `;
    
    const result = await query(productosQuery, [categoriaId]);
    
    if (result.rows.length === 0) {
      console.log(`❌ No se encontraron productos para categoría: ${categoriaId}`);
      return NextResponse.json(
        { 
          error: `No se encontraron productos para la categoría ${categoriaId}`,
          productos: []
        },
        { status: 404 }
      );
    }
    
    // Transformar al formato esperado por el frontend
    const productos = result.rows.map(row => ({
      id: row.id,
      nombre: row.name,
      name: row.name, // Para compatibilidad
      descripcion: row.description || '',
      description: row.description || '',
      categoriaId: row.category_id,
      category_id: row.category_id,
      categoria: row.category_name || 'Sin categoría',
      category_name: row.category_name,
      tipo: row.category_type,
      activo: row.is_active,
      fechaCreacion: row.created_at,
      fechaActualizacion: row.updated_at,
      // Campos adicionales para compatibilidad con el formato anterior
      precio: 0, // Se obtendría de restaurant.menu_pricing si es necesario
      imagen: null, // Se puede implementar sistema de imágenes después
      disponible: true
    }));
    
    console.log(`✅ ${productos.length} productos encontrados para categoría: ${categoriaId}`);
    
    return NextResponse.json({ 
      productos,
      total: productos.length,
      categoriaId: categoriaId,
      source: 'postgresql' // Para debugging
    });
    
  } catch (error) {
    console.error(`❌ Error al obtener productos de categoría:`, error);
    return NextResponse.json(
      { 
        error: 'Error al obtener productos de la categoría',
        details: error instanceof Error ? error.message : 'Error desconocido',
        productos: []
      },
      { status: 500 }
    );
  }
}

// POST - Opcional: Agregar producto a una categoría específica
export async function POST(
  request: Request,
  { params }: { params: { categoriaId: string } }
) {
  try {
    const categoriaId = params.categoriaId;
    const body = await request.json();
    const { nombre, descripcion, precio } = body;
    
    console.log('🔄 POST /api/productos/categoria - Agregando producto a categoría:', categoriaId);
    
    if (!nombre || !descripcion) {
      return NextResponse.json(
        { error: 'Nombre y descripción son requeridos' },
        { status: 400 }
      );
    }
    
    // Verificar que la categoría existe
    const categoryQuery = 'SELECT id, name FROM system.categories WHERE id = $1 AND is_active = true';
    const categoryResult = await query(categoryQuery, [categoriaId]);
    
    if (categoryResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }
    
    // Crear producto en la categoría específica
    const insertQuery = `
      INSERT INTO system.products (name, description, category_id, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, true, NOW(), NOW())
      RETURNING id, name, description, category_id, created_at
    `;
    
    const insertResult = await query(insertQuery, [nombre, descripcion, categoriaId]);
    const nuevoProducto = insertResult.rows[0];
    
    console.log('✅ Producto agregado a categoría exitosamente');
    
    return NextResponse.json({
      success: true,
      producto: {
        id: nuevoProducto.id,
        nombre: nuevoProducto.name,
        descripcion: nuevoProducto.description,
        categoriaId: nuevoProducto.category_id,
        fechaCreacion: nuevoProducto.created_at
      },
      message: 'Producto agregado a la categoría exitosamente',
      source: 'postgresql'
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error al agregar producto a categoría:', error);
    return NextResponse.json(
      { 
        error: 'Error al agregar producto a la categoría',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}