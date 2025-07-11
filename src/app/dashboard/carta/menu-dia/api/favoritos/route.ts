// src/app/dashboard/carta/menu-dia/api/favoritos/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { ProductosFavoritosService } from '../../services/favoritos.service';
import type { 
  FavoritosApiRequest, 
  ApiResponse, 
  FavoritosResponse, 
  ToggleFavoritoResponse 
} from '../../types/menu-dia.types';

/**
 * GET /api/menu-dia/favoritos
 * Obtiene los favoritos de un usuario
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'userId es requerido' 
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    console.log('🔍 GET /api/menu-dia/favoritos - userId:', userId);

    const favoritos = await ProductosFavoritosService.getFavoritosByUser(userId);
    
    const response: ApiResponse<FavoritosResponse> = {
      success: true,
      data: {
        favoritos,
        total: favoritos.length
      },
      message: `${favoritos.length} favoritos encontrados`
    };

    console.log('✅ Favoritos obtenidos exitosamente:', favoritos.length);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error en GET /api/menu-dia/favoritos:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/menu-dia/favoritos
 * Agrega, elimina o hace toggle de un favorito
 */
export async function POST(request: NextRequest) {
  try {
    const body: FavoritosApiRequest = await request.json();
    const { userId, productId, action } = body;

    // Validaciones
    if (!userId || !productId || !action) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'userId, productId y action son requeridos' 
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    if (!['add', 'remove', 'toggle'].includes(action)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'action debe ser: add, remove o toggle' 
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    console.log('🔄 POST /api/menu-dia/favoritos:', { userId, productId, action });

    let result: any;
    let message: string;

    switch (action) {
      case 'add':
        result = await ProductosFavoritosService.addFavorito({ user_id: userId, product_id: productId });
        message = 'Producto agregado a favoritos';
        break;

      case 'remove':
        result = await ProductosFavoritosService.removeFavorito(userId, productId);
        message = 'Producto eliminado de favoritos';
        break;

      case 'toggle':
        result = await ProductosFavoritosService.toggleFavorito(userId, productId);
        message = result.isNowFavorite 
          ? 'Producto agregado a favoritos' 
          : 'Producto eliminado de favoritos';
        break;
    }

    const response: ApiResponse<any> = {
      success: true,
      data: result,
      message
    };

    console.log('✅ Operación de favorito exitosa:', { action, result: !!result });
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error en POST /api/menu-dia/favoritos:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * DELETE /api/menu-dia/favoritos/[productId]
 * Elimina un favorito específico (alternativa a POST con action=remove)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');

    if (!userId || !productId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'userId y productId son requeridos' 
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    console.log('🗑️ DELETE /api/menu-dia/favoritos:', { userId, productId });

    const result = await ProductosFavoritosService.removeFavorito(userId, productId);
    
    const response: ApiResponse<boolean> = {
      success: true,
      data: result,
      message: 'Producto eliminado de favoritos'
    };

    console.log('✅ Favorito eliminado exitosamente');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error en DELETE /api/menu-dia/favoritos:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * Manejo de métodos no soportados
 */
export async function PUT() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Método PUT no soportado. Usa POST con action.' 
    } as ApiResponse<null>,
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Método PATCH no soportado. Usa POST con action.' 
    } as ApiResponse<null>,
    { status: 405 }
  );
}