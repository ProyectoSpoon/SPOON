// src/app/api/menu-dia/favoritos/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { ProductosFavoritosService } from '@/app/dashboard/carta/menu-dia/services/favoritos.service';

/**
 * GET /api/menu-dia/favoritos
 * Obtiene favoritos de un usuario
 */
export async function GET(request: NextRequest) {
  console.log('📥 GET /api/menu-dia/favoritos - Iniciando...');
  
  try {
    // Extraer userId de query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('🔍 Query params:', { userId });

    // Validar parámetros requeridos
    if (!userId) {
      console.log('❌ userId requerido');
      return NextResponse.json(
        { 
          error: 'userId es requerido',
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }

    // Validar formato de userId (opcional - ajustar según tu sistema)
    if (typeof userId !== 'string' || userId.trim().length === 0) {
      console.log('❌ userId inválido:', userId);
      return NextResponse.json(
        { 
          error: 'userId debe ser un string válido',
          code: 'INVALID_USER_ID' 
        },
        { status: 400 }
      );
    }

    console.log(`🔄 Obteniendo favoritos para usuario: ${userId}`);

    // Obtener favoritos del usuario
    const favoritos = await ProductosFavoritosService.getFavoritosByUser(userId);

    console.log(`✅ Favoritos obtenidos: ${favoritos.length} productos`);

    // Obtener estadísticas adicionales
    const estadisticas = await ProductosFavoritosService.getEstadisticasFavoritos(userId);

    const response = {
      success: true,
      data: {
        favoritos,
        estadisticas,
        meta: {
          total: favoritos.length,
          userId,
          timestamp: new Date().toISOString()
        }
      }
    };

    console.log('📤 Enviando respuesta exitosa');
    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('❌ Error en GET /api/menu-dia/favoritos:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/menu-dia/favoritos
 * Agrega un producto a favoritos
 */
export async function POST(request: NextRequest) {
  console.log('📥 POST /api/menu-dia/favoritos - Iniciando...');
  
  try {
    // Parsear body de la request
    const body = await request.json();
    console.log('📦 Body recibido:', body);

    const { userId, productId } = body;

    // Validar parámetros requeridos
    if (!userId || !productId) {
      console.log('❌ Parámetros faltantes:', { userId: !!userId, productId: !!productId });
      return NextResponse.json(
        { 
          error: 'userId y productId son requeridos',
          code: 'MISSING_REQUIRED_FIELDS',
          received: { userId: !!userId, productId: !!productId }
        },
        { status: 400 }
      );
    }

    // Validar tipos
    if (typeof userId !== 'string' || typeof productId !== 'string') {
      console.log('❌ Tipos inválidos:', { userId: typeof userId, productId: typeof productId });
      return NextResponse.json(
        { 
          error: 'userId y productId deben ser strings',
          code: 'INVALID_FIELD_TYPES' 
        },
        { status: 400 }
      );
    }

    console.log(`🔄 Agregando favorito: usuario=${userId}, producto=${productId}`);

    // Agregar a favoritos
    const favorito = await ProductosFavoritosService.addFavorito({
      user_id: userId,
      product_id: productId
    });

    console.log('✅ Favorito agregado exitosamente:', favorito.id);

    const response = {
      success: true,
      data: {
        favorito,
        meta: {
          action: 'added',
          timestamp: new Date().toISOString()
        }
      },
      message: 'Producto agregado a favoritos exitosamente'
    };

    console.log('📤 Enviando respuesta exitosa');
    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('❌ Error en POST /api/menu-dia/favoritos:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/menu-dia/favoritos
 * Elimina un producto de favoritos
 */
export async function DELETE(request: NextRequest) {
  console.log('📥 DELETE /api/menu-dia/favoritos - Iniciando...');
  
  try {
    // Extraer parámetros de query
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');

    console.log('🔍 Query params:', { userId, productId });

    // Validar parámetros requeridos
    if (!userId || !productId) {
      console.log('❌ Parámetros faltantes:', { userId: !!userId, productId: !!productId });
      return NextResponse.json(
        { 
          error: 'userId y productId son requeridos',
          code: 'MISSING_REQUIRED_FIELDS' 
        },
        { status: 400 }
      );
    }

    console.log(`🔄 Eliminando favorito: usuario=${userId}, producto=${productId}`);

    // Eliminar de favoritos
    const eliminado = await ProductosFavoritosService.removeFavorito(userId, productId);

    if (!eliminado) {
      console.log('⚠️ Favorito no encontrado o ya estaba inactivo');
      return NextResponse.json(
        { 
          success: false,
          error: 'Favorito no encontrado o ya estaba eliminado',
          code: 'FAVORITE_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    console.log('✅ Favorito eliminado exitosamente');

    const response = {
      success: true,
      data: {
        meta: {
          action: 'removed',
          userId,
          productId,
          timestamp: new Date().toISOString()
        }
      },
      message: 'Producto eliminado de favoritos exitosamente'
    };

    console.log('📤 Enviando respuesta exitosa');
    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('❌ Error en DELETE /api/menu-dia/favoritos:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/menu-dia/favoritos
 * Toggle favorito (agregar si no existe, eliminar si existe)
 */
export async function PUT(request: NextRequest) {
  console.log('📥 PUT /api/menu-dia/favoritos - Iniciando...');
  
  try {
    // Parsear body de la request
    const body = await request.json();
    console.log('📦 Body recibido:', body);

    const { userId, productId } = body;

    // Validar parámetros requeridos
    if (!userId || !productId) {
      console.log('❌ Parámetros faltantes:', { userId: !!userId, productId: !!productId });
      return NextResponse.json(
        { 
          error: 'userId y productId son requeridos',
          code: 'MISSING_REQUIRED_FIELDS' 
        },
        { status: 400 }
      );
    }

    console.log(`🔄 Toggle favorito: usuario=${userId}, producto=${productId}`);

    // Toggle favorito
    const resultado = await ProductosFavoritosService.toggleFavorito(userId, productId);

    console.log(`✅ Toggle exitoso: ${resultado.isNowFavorite ? 'agregado' : 'eliminado'}`);

    const response = {
      success: true,
      data: {
        isNowFavorite: resultado.isNowFavorite,
        favorito: resultado.favorito || null,
        meta: {
          action: resultado.isNowFavorite ? 'added' : 'removed',
          userId,
          productId,
          timestamp: new Date().toISOString()
        }
      },
      message: `Producto ${resultado.isNowFavorite ? 'agregado a' : 'eliminado de'} favoritos`
    };

    console.log('📤 Enviando respuesta exitosa');
    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('❌ Error en PUT /api/menu-dia/favoritos:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/menu-dia/favoritos/stats
 * Obtiene estadísticas de favoritos (endpoint adicional)
 */
export async function PATCH(request: NextRequest) {
  console.log('📥 PATCH /api/menu-dia/favoritos - Obteniendo estadísticas...');
  
  try {
    // Extraer userId de query parameters  
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      );
    }

    console.log(`🔄 Obteniendo estadísticas para usuario: ${userId}`);

    // Obtener estadísticas
    const estadisticas = await ProductosFavoritosService.getEstadisticasFavoritos(userId);

    console.log('✅ Estadísticas obtenidas:', estadisticas.total);

    const response = {
      success: true,
      data: {
        estadisticas,
        meta: {
          userId,
          timestamp: new Date().toISOString()
        }
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('❌ Error en PATCH /api/menu-dia/favoritos:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/menu-dia/favoritos
 * Manejo de CORS para requests preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}