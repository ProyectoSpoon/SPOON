import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // 1. Obtener sesión del usuario
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.log('❌ No hay sesión activa');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log('🔍 Buscando restaurante para usuario (SDK):', userId);

    // 2. Buscar como OWNER
    const { data: restaurantData, error: ownerError } = await supabase
      .schema('restaurant')
      .from('restaurants')
      .select(`
        id, name, description, address, city, state, country, 
        latitude, longitude, phone, email, logo_url, cover_image_url, 
        cuisine_type_id, status, created_at,
        cuisine_type:system.cuisine_types(name)
      `)
      .eq('owner_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    let restaurant: any = restaurantData;
    let userRole = 'owner';

    // 3. Si no es OWNER, buscar como EMPLEADO
    if (!restaurant) {
      console.log('👤 Usuario no es owner, verificando si es empleado...');

      const { data: staffData, error: staffError } = await supabase
        .schema('restaurant')
        .from('restaurant_users')
        .select(`
          restaurant:restaurants(
            id, name, description, address, city, state, country, 
            latitude, longitude, phone, email, logo_url, cover_image_url, 
            cuisine_type_id, status, created_at,
            cuisine_type:system.cuisine_types(name)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const staffDataAny = staffData as any; // Cast para evitar error de parser TS

      if (staffDataAny && staffDataAny.restaurant) {
        restaurant = staffDataAny.restaurant;
        userRole = 'employee';
        // Verificar status del restaurante
        if (restaurant.status !== 'active') {
          restaurant = null; // Ignorar si no está activo
        }
      }
    }

    if (!restaurant) {
      console.log('⚠️ Usuario no tiene restaurante asignado');
      return NextResponse.json(
        { error: 'Usuario no tiene restaurante asignado' },
        { status: 404 }
      );
    }

    // Normalizar cuisine_type (array/object issue)
    const cuisineTypeName = Array.isArray(restaurant.cuisine_type)
      ? restaurant.cuisine_type[0]?.name
      : restaurant.cuisine_type?.name;

    restaurant.cuisine_type_name = cuisineTypeName;

    // 4. Obtener HORARIOS
    const { data: businessHours, error: hoursError } = await supabase
      .schema('restaurant')
      .from('business_hours')
      .select('day_of_week, open_time, close_time, is_closed, is_24_hours')
      .eq('restaurant_id', restaurant.id)
      .order('day_of_week');

    const hours = businessHours || [];

    // 5. Analizar completitud
    const completeness = analyzeCompleteness(restaurant, hours);

    console.log(`✅ Restaurante encontrado: ${restaurant.name} (${userRole})`);

    return NextResponse.json({
      restaurantId: restaurant.id, // Mapeo para frontend
      restaurantName: restaurant.name,
      userRole,
      restaurantData: {
        ...restaurant,
        restaurant_id: restaurant.id, // Compatibilidad legacy
        business_hours: hours
      },
      completeness
    });

  } catch (error: any) {
    console.error('❌ Error no controlado:', error.message);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}

// ✅ Función Helper de Completitud (Mantener lógica original)
function analyzeCompleteness(restaurant: any, businessHours: any[]) {
  const steps = {
    informacionGeneral: {
      completed: !!(
        restaurant.name?.trim() &&
        restaurant.phone?.trim() &&
        restaurant.email?.trim() &&
        restaurant.description?.trim() &&
        restaurant.cuisine_type_id
      ),
      fields: {
        name: !!restaurant.name?.trim(),
        phone: !!restaurant.phone?.trim(),
        email: !!restaurant.email?.trim(),
        description: !!restaurant.description?.trim(),
        cuisine_type: !!restaurant.cuisine_type_id
      }
    },
    ubicacion: {
      completed: !!(
        restaurant.address?.trim() &&
        restaurant.latitude &&
        restaurant.longitude &&
        restaurant.city?.trim() &&
        restaurant.state?.trim()
      ),
      fields: {
        address: !!restaurant.address?.trim(),
        coordinates: !!(restaurant.latitude && restaurant.longitude),
        city: !!restaurant.city?.trim(),
        state: !!restaurant.state?.trim()
      }
    },
    logoPortada: {
      completed: !!(
        restaurant.logo_url?.trim() &&
        restaurant.cover_image_url?.trim()
      ),
      fields: {
        logo: !!restaurant.logo_url?.trim(),
        cover_image: !!restaurant.cover_image_url?.trim()
      }
    },
    horarios: {
      completed: businessHours.length >= 7,
      fields: {
        total_days: businessHours.length,
        has_all_days: businessHours.length >= 7
      }
    }
  };

  const completedSteps = Object.values(steps).filter(step => step.completed).length;
  const totalSteps = Object.keys(steps).length;
  const isComplete = completedSteps === totalSteps;

  return {
    isComplete,
    completedSteps,
    totalSteps,
    percentage: Math.round((completedSteps / totalSteps) * 100),
    steps
    // nextStep removed to enforce Layout Guard authority
  };
}

function getNextStep(steps: any) {
  if (!steps.informacionGeneral.completed) return '/config-restaurante/informacion-general';
  if (!steps.ubicacion.completed) return '/config-restaurante/ubicacion';
  if (!steps.horarios.completed) return '/config-restaurante/horario-comercial';
  if (!steps.logoPortada.completed) return '/config-restaurante/logo-portada';
  return '/dashboard';
}