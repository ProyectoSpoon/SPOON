import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * Google OAuth con Supabase
 * Nota: Supabase maneja Google OAuth automáticamente a través de su dashboard.
 * Este endpoint es principalmente para compatibilidad con el frontend existente.
 */
export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json();

    if (!token && !email) {
      return NextResponse.json(
        { success: false, error: 'Token o email de Google requerido' },
        { status: 400 }
      );
    }

    console.log('🔐 Intento de login con Google');

    const supabase = createRouteHandlerClient({ cookies });

    // Opción 1: Si ya tiene sesión de Supabase (login directo desde frontend)
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      console.log('✅ Sesión de Supabase encontrada');

      // Obtener datos del usuario
      const { data: user, error: userError } = await supabase
        .schema('auth')
        .from('users')
        .select('id, email, first_name, last_name, role, status')
        .eq('id', session.user.id)
        .single();

      if (userError || !user) {
        console.error('Error fetching user:', userError);
        return NextResponse.json(
          { success: false, error: 'Usuario no encontrado' },
          { status: 404 }
        );
      }

      // Obtener permisos
      const { data: permissions } = await supabase
        .schema('auth')
        .from('role_permissions')
        .select('permission:permissions(name)')
        .eq('role', user.role)
        .eq('is_active', true);

      const permissionNames = permissions?.map(p => (p.permission as any)?.name) || [];

      return NextResponse.json({
        success: true,
        session: session,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          permissions: permissionNames,
          isNewUser: false
        }
      });
    }

    // Opción 2: Si tiene token de Google (flujo legacy)
    // NOTA: Para producción, se recomienda usar el flujo OAuth de Supabase directamente
    // desde el frontend con: supabase.auth.signInWithOAuth({ provider: 'google' })

    console.log('⚠️ Usando flujo legacy de Google OAuth');
    console.log('💡 Recomendación: Migrar frontend a usar supabase.auth.signInWithOAuth()');

    return NextResponse.json(
      {
        success: false,
        error: 'Por favor use el flujo OAuth de Supabase directamente desde el frontend',
        migration_note: 'Use supabase.auth.signInWithOAuth({ provider: "google" })'
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Error en Google OAuth:', error);

    return NextResponse.json(
      { success: false, error: 'Error en autenticación con Google' },
      { status: 500 }
    );
  }
}

/**
 * GET - Iniciar flujo OAuth con Google usando Supabase
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${request.nextUrl.origin}/auth/callback`
      }
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Redirigir a Google OAuth
    return NextResponse.redirect(data.url);

  } catch (error) {
    console.error('Error iniciando OAuth:', error);
    return NextResponse.json(
      { error: 'Error al iniciar autenticación con Google' },
      { status: 500 }
    );
  }
}
