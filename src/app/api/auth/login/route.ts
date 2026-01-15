// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('🔐 === LOGIN (SUPABASE SDK) ===');
    console.log('📧 Email:', email);

    // Inicializar cliente de rutas de Supabase (maneja cookies automáticamente)
    const supabase = createRouteHandlerClient({ cookies });

    // 1. Autenticar con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.log('❌ Error Auth:', authError.message);
      return NextResponse.json(
        { error: true, message: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    console.log('✅ Sesión creada para:', authData.session?.user.email);

    // 2. Obtener datos extra del usuario (rol, restaurante)
    // Usamos el mismo cliente que ya tiene la sesión del usuario
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, restaurant_id')
      .eq('id', authData.user?.id)
      .single();

    if (userError) {
      console.warn('⚠️ No se pudo obtener perfil de usuario:', userError.message);
      // No bloqueamos el login si falla el perfil, pero es ideal tenerlo
    }

    // 3. Buscar Restaurant ID si no está en users (Fallbacks)
    let restaurantId = userData?.restaurant_id;
    if (!restaurantId && authData.user) {
      // ... Lógica de búsqueda adicional si necesaria ...
    }

    return NextResponse.json({
      success: true,
      message: 'Login exitoso',
      user: {
        ...userData,
        email: authData.user?.email, // Asegurar email de Auth
        id: authData.user?.id
      },
      session: authData.session // Enviar sesión explícita si el front la necesita
    });

  } catch (error: any) {
    console.error('❌ Error Login:', error.message);
    return NextResponse.json(
      { error: true, message: 'Error interno' },
      { status: 500 }
    );
  }
}