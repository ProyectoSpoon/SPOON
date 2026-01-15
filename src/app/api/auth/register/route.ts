import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Función para obtener permisos basados en rol
const getPermissionsByRole = (role: string) => {
  if (role === 'super_admin') {
    return [
      'MENU_READ', 'MENU_WRITE',
      'SETTINGS_READ', 'SETTINGS_WRITE',
      'USERS_READ', 'USERS_WRITE',
      'ORDERS_READ', 'ORDERS_WRITE',
      'REPORTS_READ'
    ];
  }
  if (role === 'admin') {
    return ['MENU_READ', 'MENU_WRITE', 'SETTINGS_READ', 'ORDERS_READ', 'REPORTS_READ'];
  }
  if (role === 'staff') {
    return ['MENU_READ', 'ORDERS_READ'];
  }
  if (role === 'customer') {
    return ['MENU_READ'];
  }
  if (role === 'restaurant_owner') {
    return ['MENU_READ', 'MENU_WRITE', 'SETTINGS_READ', 'SETTINGS_WRITE', 'ORDERS_READ', 'REPORTS_READ'];
  }
  return ['MENU_READ']; // Fallback por defecto
};

export async function POST(request: NextRequest) {
  try {
    const { email, password, first_name, last_name, phone, role = 'restaurant_owner' } = await request.json();

    console.log('📝 === REGISTRO DEBUG ===');
    console.log('📧 Email:', email);
    console.log('👤 Nombre:', first_name, last_name);
    console.log('📱 Teléfono:', phone);
    console.log('👑 Rol:', role);

    // Validaciones básicas
    if (!email || !password || !first_name || !last_name || !phone) {
      console.log('❌ Faltan campos requeridos');
      return NextResponse.json(
        { error: true, message: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: true, message: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { error: true, message: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Validar teléfono (10 dígitos)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: true, message: 'El teléfono debe tener 10 dígitos' },
        { status: 400 }
      );
    }

    // Validar rol válido
    const validRoles = ['customer', 'staff', 'admin', 'super_admin', 'restaurant_owner'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: true, message: 'Rol inválido' },
        { status: 400 }
      );
    }

    console.log('🔍 Creando usuario con Supabase Auth...');

    const supabase = createRouteHandlerClient({ cookies });

    // Registrar usuario con Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password: password,
      options: {
        data: {
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          phone: phone.trim(),
          role: role
        }
      }
    });

    if (signUpError) {
      console.error('❌ Error en Supabase signUp:', signUpError);

      if (signUpError.message.includes('already registered')) {
        return NextResponse.json(
          { error: true, message: 'Este email ya está registrado' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: true, message: signUpError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: true, message: 'Error al crear usuario' },
        { status: 500 }
      );
    }

    console.log('💾 Actualizando datos adicionales en auth.users...');

    // Actualizar campos adicionales en auth.users
    const { error: updateError } = await supabase
      .schema('auth')
      .from('users')
      .update({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        phone: phone.trim(),
        role: role,
        status: 'active'
      })
      .eq('id', authData.user.id);

    if (updateError) {
      console.error('⚠️ Error actualizando datos adicionales:', updateError);
      // No fallar si esto falla, el usuario ya fue creado
    }

    console.log('✅ Usuario creado exitosamente:', {
      id: authData.user.id,
      email: authData.user.email
    });

    // Obtener permisos basados en rol
    const permissions = getPermissionsByRole(role);
    console.log('🔑 Permisos asignados:', permissions);

    // Preparar respuesta del usuario
    const userResponse = {
      id: authData.user.id,
      email: authData.user.email,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      phone: phone.trim(),
      role: role,
      status: 'active',
      email_verified: authData.user.email_confirmed_at ? true : false,
      created_at: authData.user.created_at
    };

    console.log('✅ Registro exitoso para:', authData.user.email);

    return NextResponse.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      session: authData.session,
      user: userResponse,
      permissions: permissions,
      next_steps: {
        verify_email: !authData.user.email_confirmed_at,
        setup_restaurant: true,
        message: 'Por favor verifica tu email y configura tu restaurante'
      }
    });

  } catch (error) {
    console.error('❌ Error crítico en registro:', error);

    return NextResponse.json(
      { error: true, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}