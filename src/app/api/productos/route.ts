import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET - Obtener productos del catálogo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoriaId = searchParams.get('categoriaId');
    const restauranteId = searchParams.get('restauranteId');

    console.log('🔍 GET /api/productos');

    const supabase = createRouteHandlerClient({ cookies });

    // Si restaurantId es default o no está, obtener del usuario autenticado
    let finalRestaurantId = restauranteId;
    if (!restauranteId || restauranteId === 'default' || restauranteId === 'current') {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: restaurant } = await supabase
          .from('restaurants')
          .select('id')
          .eq('owner_id', session.user.id)
          .limit(1)
          .single();

        finalRestaurantId = restaurant?.id;
      }
    }

    // Consultar productos del catálogo universal
    let query = supabase
      .from('universal_products')
      .select(`
        id,
        name,
        description,
        category_id,
        image_url,
        suggested_price_min,
        suggested_price_max,
        popularity_score,
        is_vegetarian,
        is_vegan,
        search_tags,
        created_at,
        updated_at
      `);

    if (categoriaId) {
      query = query.eq('category_id', categoriaId);
    }

    const { data: productos, error } = await query.order('name');

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json(
        { success: false, error: 'Error al obtener productos' },
        { status: 500 }
      );
    }

    console.log(`✅ Productos encontrados: ${productos?.length || 0}`);

    return NextResponse.json({
      success: true,
      data: productos || [],
      count: productos?.length || 0,
      restaurantId: finalRestaurantId
    });

  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Agregar producto al menú del restaurante
// TODO: Implementar una vez se confirme la estructura correcta de tablas
// Posibles tablas: daily_menu_selections, menu_productos, etc.
export async function POST(request: NextRequest) {
  try {
    return NextResponse.json(
      {
        success: false,
        error: 'Funcionalidad de agregar productos al menú aún no implementada. Use la interfaz de menú del día.'
      },
      { status: 501 }
    );
  } catch (error) {
    console.error('❌ Error al agregar producto:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
