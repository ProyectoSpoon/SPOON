import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validar datos de entrada
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    console.log('🔐 Intento de login para:', email);

    // Consultar usuario en PostgreSQL
    const result = await query(
      `SELECT 
        id, 
        email, 
        password_hash, 
        first_name, 
        last_name, 
        role, 
        status,
        email_verified,
        failed_login_attempts,
        account_locked_until
      FROM auth.users 
      WHERE email = $1 AND status = 'active'`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      console.log('❌ Usuario no encontrado:', email);
      return NextResponse.json(
        { success: false, error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Verificar si la cuenta está bloqueada
    if (user.account_locked_until && new Date(user.account_locked_until) > new Date()) {
      console.log('🔒 Cuenta bloqueada:', email);
      return NextResponse.json(
        { success: false, error: 'Cuenta temporalmente bloqueada. Intenta más tarde.' },
        { status: 423 }
      );
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      console.log('❌ Contraseña incorrecta para:', email);
      
      // Incrementar intentos fallidos
      await query(
        `UPDATE auth.users 
         SET failed_login_attempts = failed_login_attempts + 1,
             last_failed_login = CURRENT_TIMESTAMP,
             account_locked_until = CASE 
               WHEN failed_login_attempts >= 4 THEN CURRENT_TIMESTAMP + INTERVAL '15 minutes'
               ELSE account_locked_until
             END
         WHERE id = $1`,
        [user.id]
      );

      return NextResponse.json(
        { success: false, error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    // Verificar si el email está verificado
    if (!user.email_verified) {
      console.log('📧 Email no verificado:', email);
      return NextResponse.json(
        { success: false, error: 'Por favor verifica tu email antes de iniciar sesión' },
        { status: 403 }
      );
    }

    // Resetear intentos fallidos y actualizar último login
    await query(
      `UPDATE auth.users 
       SET failed_login_attempts = 0,
           last_login = CURRENT_TIMESTAMP,
           login_count = login_count + 1,
           account_locked_until = NULL
       WHERE id = $1`,
      [user.id]
    );

    // Obtener permisos del usuario
    const permissionsResult = await query(
      `SELECT DISTINCT p.name as permission_name
       FROM auth.role_permissions rp
       JOIN auth.permissions p ON rp.permission_id = p.id
       WHERE rp.role = $1`,
      [user.role]
    );

    const permissions = permissionsResult.rows.map(row => row.permission_name);

    // Generar JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET no configurado');
      return NextResponse.json(
        { success: false, error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        permissions: permissions
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // Crear refresh token
    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Guardar sesión en la base de datos
    await query(
      `INSERT INTO auth.user_sessions (
        user_id, 
        session_token, 
        refresh_token, 
        expires_at, 
        user_agent, 
        ip_address,
        is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, true)`,
      [
        user.id,
        token,
        refreshToken,
        new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        request.headers.get('user-agent') || 'Unknown',
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown'
      ]
    );

    console.log('✅ Login exitoso para:', email);

    // TODO: Registrar actividad en audit logs cuando la tabla esté configurada correctamente
    // await query(
    //   `INSERT INTO audit.activity_logs (
    //     user_id, 
    //     action, 
    //     resource_type, 
    //     resource_id
    //   ) VALUES ($1, 'LOGIN', 'USER', $2)`,
    //   [user.id, user.id]
    // );

    return NextResponse.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        permissions: permissions
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
