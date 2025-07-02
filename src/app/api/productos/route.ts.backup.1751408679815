import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';

// GET - Obtener todos los productos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoriaId = searchParams.get('categoriaId');
    const subcategoriaId = searchParams.get('subcategoriaId');
    const restauranteId = searchParams.get('restauranteId') || 'default';

    let queryText = `
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.precio_actual as "currentPrice",
        p.categoria_id as "categoriaId",
        p.subcategoria_id as "subcategoriaId",
        p.imagen,
        p.version_actual as "currentVersion",
        p.estado as status,
        p.stock_actual as "currentQuantity",
        p.stock_minimo as "minQuantity",
        p.stock_maximo as "maxQuantity",
        p.created_at as "createdAt",
        p.updated_at as "updatedAt",
        p.created_by as "createdBy",
        p.updated_by as "updatedBy"
      FROM productos p
      WHERE p.restaurante_id = $1
    `;
    
    const params = [restauranteId];
    let paramIndex = 2;

    if (categoriaId) {
      queryText += ` AND p.categoria_id = $${paramIndex}`;
      params.push(categoriaId);
      paramIndex++;
    }

    if (subcategoriaId) {
      queryText += ` AND p.subcategoria_id = $${paramIndex}`;
      params.push(subcategoriaId);
      paramIndex++;
    }

    queryText += ' ORDER BY p.nombre ASC';

    const result = await query(queryText, params);
    
    // Transformar los datos al formato VersionedProduct
    const productos: VersionedProduct[] = result.rows.map(row => ({
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      currentPrice: parseFloat(row.currentPrice) || 0,
      categoriaId: row.subcategoriaId || row.categoriaId, // Usar subcategoriaId si existe, sino categoriaId
      imagen: row.imagen,
      currentVersion: row.currentVersion || 1,
      priceHistory: [], // Se cargaría por separado si es necesario
      versions: [], // Se cargaría por separado si es necesario
      status: row.status || 'active',
      stock: {
        currentQuantity: parseInt(row.currentQuantity) || 0,
        minQuantity: parseInt(row.minQuantity) || 0,
        maxQuantity: parseInt(row.maxQuantity) || 100,
        status: parseInt(row.currentQuantity) > 0 ? 'in_stock' : 'out_of_stock',
        lastUpdated: new Date(),
        alerts: {
          lowStock: parseInt(row.currentQuantity) <= parseInt(row.minQuantity),
          overStock: parseInt(row.currentQuantity) >= parseInt(row.maxQuantity),
          thresholds: {
            low: parseInt(row.minQuantity) || 10,
            high: parseInt(row.maxQuantity) || 90
          }
        }
      },
      metadata: {
        createdAt: new Date(row.createdAt),
        createdBy: row.createdBy || 'system',
        lastModified: new Date(row.updatedAt),
        lastModifiedBy: row.updatedBy || 'system'
      }
    }));

    return NextResponse.json({
      success: true,
      data: productos,
      count: productos.length
    });

  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo producto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nombre,
      descripcion,
      precio,
      categoriaId,
      subcategoriaId,
      imagen,
      stockInicial = 0,
      stockMinimo = 5,
      stockMaximo = 100,
      restauranteId = 'default'
    } = body;

    // Validaciones básicas
    if (!nombre || !descripcion || !categoriaId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Datos requeridos faltantes',
          message: 'Nombre, descripción y categoría son requeridos'
        },
        { status: 400 }
      );
    }

    const queryText = `
      INSERT INTO productos (
        nombre, descripcion, precio_actual, categoria_id, subcategoria_id,
        imagen, stock_actual, stock_minimo, stock_maximo, restaurante_id,
        estado, version_actual, created_at, updated_at, created_by, updated_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active', 1, NOW(), NOW(), 'api', 'api'
      ) RETURNING *
    `;

    const params = [
      nombre,
      descripcion,
      precio || 0,
      categoriaId,
      subcategoriaId,
      imagen,
      stockInicial,
      stockMinimo,
      stockMaximo,
      restauranteId
    ];

    const result = await query(queryText, params);
    const newProduct = result.rows[0];

    // Transformar al formato VersionedProduct
    const producto: VersionedProduct = {
      id: newProduct.id,
      nombre: newProduct.nombre,
      descripcion: newProduct.descripcion,
      currentPrice: parseFloat(newProduct.precio_actual) || 0,
      categoriaId: newProduct.subcategoria_id || newProduct.categoria_id, // Usar subcategoriaId si existe, sino categoriaId
      imagen: newProduct.imagen,
      currentVersion: 1,
      priceHistory: [],
      versions: [],
      status: 'active',
      stock: {
        currentQuantity: parseInt(newProduct.stock_actual) || 0,
        minQuantity: parseInt(newProduct.stock_minimo) || 0,
        maxQuantity: parseInt(newProduct.stock_maximo) || 100,
        status: 'in_stock',
        lastUpdated: new Date(),
        alerts: {
          lowStock: false,
          overStock: false,
          thresholds: {
            low: parseInt(newProduct.stock_minimo) || 10,
            high: parseInt(newProduct.stock_maximo) || 90
          }
        }
      },
      metadata: {
        createdAt: new Date(newProduct.created_at),
        createdBy: 'api',
        lastModified: new Date(newProduct.updated_at),
        lastModifiedBy: 'api'
      }
    };

    return NextResponse.json({
      success: true,
      data: producto,
      message: 'Producto creado exitosamente'
    }, { status: 201 });

  } catch (error) {
    console.error('Error al crear producto:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
