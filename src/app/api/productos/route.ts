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
        p.name,
        p.description,
        p.current_price as "currentPrice",
        p.category_id as "categoriaId",
        p.image_url as "imagen",
        p.current_version as "currentVersion",
        p.status as status,
        ps.current_quantity as "currentQuantity",
        ps.min_quantity as "minQuantity",
        ps.max_quantity as "maxQuantity",
        p.created_at as "createdAt",
        p.updated_at as "updatedAt",
        p.created_by as "createdBy",
        p.updated_by as "updatedBy"
      FROM menu.products p
      LEFT JOIN menu.product_stock ps ON p.id = ps.product_id
      WHERE p.restaurant_id = $1
    `;
    
    const params = [restauranteId];
    let paramIndex = 2;

    if (categoriaId) {
      queryText += ` AND p.category_id = $${paramIndex}`;
      params.push(categoriaId);
      paramIndex++;
    }

    queryText += ' ORDER BY p.name ASC';

    const result = await query(queryText, params);
    
    // Transformar los datos al formato VersionedProduct
    const productos: VersionedProduct[] = result.rows.map(row => ({
      id: row.id,
      nombre: row.name,
      descripcion: row.description,
      currentPrice: parseFloat(row.currentPrice) || 0,
      categoriaId: row.categoriaId,
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
      INSERT INTO menu.products (
        name, description, current_price, category_id,
        image_url, restaurant_id, status, current_version, 
        created_at, updated_at, created_by, updated_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 'active', 1, NOW(), NOW(), 'api', 'api'
      ) RETURNING *
    `;

    const params = [
      nombre,
      descripcion,
      precio || 0,
      categoriaId,
      imagen,
      restauranteId
    ];

    const result = await query(queryText, params);
    const newProduct = result.rows[0];

    // Crear registro de stock por separado
    if (stockInicial > 0 || stockMinimo > 0 || stockMaximo > 0) {
      await query(`
        INSERT INTO menu.product_stock (
          product_id, current_quantity, min_quantity, max_quantity,
          available_quantity, reserved_quantity, last_updated
        ) VALUES ($1, $2, $3, $4, $2, 0, NOW())
      `, [newProduct.id, stockInicial, stockMinimo, stockMaximo]);
    }

    // Transformar al formato VersionedProduct
    const producto: VersionedProduct = {
      id: newProduct.id,
      nombre: newProduct.name,
      descripcion: newProduct.description,
      currentPrice: parseFloat(newProduct.current_price) || 0,
      categoriaId: newProduct.category_id,
      imagen: newProduct.image_url,
      currentVersion: 1,
      priceHistory: [],
      versions: [],
      status: 'active',
      stock: {
        currentQuantity: stockInicial || 0,
        minQuantity: stockMinimo || 0,
        maxQuantity: stockMaximo || 100,
        status: 'in_stock',
        lastUpdated: new Date(),
        alerts: {
          lowStock: false,
          overStock: false,
          thresholds: {
            low: stockMinimo || 10,
            high: stockMaximo || 90
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
