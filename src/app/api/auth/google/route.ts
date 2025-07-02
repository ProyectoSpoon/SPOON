import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { query } from '@/lib/database';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token de Google requerido' },
        { status: 400 }
      );
    }

    console.log('🔐 Intento de login con Google');

    // Verificar token de Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      console.log('❌ Token de Google inválido');
      return NextResponse.json(
        { success: false, error: 'Token de Google inválido' },
        { status: 401 }
      );
    }

    const { email, name, picture, given_name, family_name, email_verified } = payload;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email no disponible en la cuenta de Google' },
        { status: 400 }
      );
    }

    console.log('✅ Token de Google verificado para:', email);

    // Buscar usuario existente en BD
    let result = await query(
      `SELECT 
        id, 
        email, 
        first_name, 
        last_name, 
        role, 
        status,
        email_verified
      FROM auth.users 
      WHERE email = $1`,
      [email.toLowerCase()]
    );

    let user;
    let isNewUser = false;

    if (result.rows.length === 0) {
      // Crear nuevo usuario
      console.log('👤 Creando nuevo usuario desde Google:', email);
      
      // Generar contraseña aleatoria (no se usará, pero es requerida por el esquema)
      const randomPassword = Math.random().toString(36).slice(-12);
      const hashedPassword = await bcrypt.hash(randomPassword, 12);

      const insertResult = await query(
        `INSERT INTO auth.users (
          email, 
          password_hash,
          first_name, 
          last_name,
          role, 
          status, 
          email_verified,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, 'staff', 'active', $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
        RETURNING id, email, first_name, last_name, role`,
        [
          email.toLowerCase(),
          hashedPassword,
          given_name || name || 'Usuario',
          family_name || '',
          email_verified || true
        ]
      );

      user = insertResult.rows[0];
      isNewUser = true;

      console.log('✅ Usuario creado exitosamente:', user.id);
    } else {
      user = result.rows[0];
      
      // Verificar si el usuario está activo
      if (user.status !== 'active') {
        console.log('❌ Usuario inactivo:', email);
        return NextResponse.json(
          { success: false, error: 'Cuenta desactivada. Contacta al administrador.' },
          { status: 403 }
        );
      }

      // Actualizar información del usuario si es necesario
      if (!user.email_verified) {
        await query(
          `UPDATE auth.users 
           SET email_verified = true, updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [user.id]
        );
      }

      console.log('✅ Usuario existente encontrado:', user.id);
    }

    // Actualizar último login
    await query(
      `UPDATE auth.users 
       SET last_login = CURRENT_TIMESTAMP,
           login_count = login_count + 1,
           failed_login_attempts = 0,
           account_locked_until = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [user.id]
    );

    // Obtener permisos del usuario
    const permissionsResult = await query(
      `SELECT DISTINCT p.name as permission_name
       FROM auth.role_permissions rp
       JOIN auth.permissions p ON rp.permission_id = p.id
       WHERE rp.role = $1 AND rp.is_active = true`,
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

    const jwtToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        permissions: permissions,
        provider: 'google'
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
        is_active,
        provider
      ) VALUES ($1, $2, $3, $4, $5, $6, true, 'google')`,
      [
        user.id,
        jwtToken,
        refreshToken,
        new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        request.headers.get('user-agent') || 'Unknown',
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown'
      ]
    );

    console.log('✅ Login con Google exitoso para:', email);

    // Registrar actividad
    await query(
      `INSERT INTO audit.activity_logs (
        user_id, 
        action, 
        resource_type, 
        resource_id, 
        details,
        ip_address,
        user_agent
      ) VALUES ($1, 'LOGIN', 'USER', $2, $3, $4, $5)`,
      [
        user.id,
        user.id,
        JSON.stringify({ 
          method: 'google_oauth', 
          success: true, 
          isNewUser: isNewUser,
          googleEmail: email 
        }),
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown',
        request.headers.get('user-agent') || 'Unknown'
      ]
    );

    return NextResponse.json({
      success: true,
      token: jwtToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        permissions: permissions,
        isNewUser: isNewUser
      }
    });

  } catch (error) {
    console.error('❌ Error en Google OAuth:', error);
    
    // Registrar error en logs de auditoría si es posible
    try {
      await query(
        `INSERT INTO audit.activity_logs (
          action, 
          resource_type, 
          details,
          ip_address,
          user_agent
        ) VALUES ('LOGIN_ERROR', 'USER', $1, $2, $3)`,
        [
          JSON.stringify({ 
            method: 'google_oauth', 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          }),
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown',
          request.headers.get('user-agent') || 'Unknown'
        ]
      );
    } catch (logError) {
      console.error('Error al registrar en audit log:', logError);
    }
    
    return NextResponse.json(
      { success: false, error: 'Error en autenticación con Google' },
      { status: 500 }
    );
  }
}
