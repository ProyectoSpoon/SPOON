'use client';

import pool, { query } from '@/config/database';
import { hash, compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { UserRole, Permission, DEFAULT_ROLE_PERMISSIONS } from '@/types/auth';

// Constantes para autenticación
const JWT_SECRET = process.env.JWT_SECRET || 'spoon-restaurant-secret-key';
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 10;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutos

interface UserInfo {
  uid: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  nombre: string;
  apellido: string;
}

export interface UserSession {
  uid: string;
  email: string;
  lastLogin: Date;
  failedAttempts: number;
  lastFailedAttempt: Date | null;
  is2FAEnabled: boolean;
  emailVerified: boolean;
  phoneNumber?: string;
}

// Crear tablas necesarias si no existen (esto debería ejecutarse al iniciar la app)
export const initAuthTables = async () => {
  try {
    // Tabla de usuarios
    await query(`
      CREATE TABLE IF NOT EXISTS dueno_restaurante (
        uid VARCHAR(50) PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(100),
        nombre VARCHAR(100) NOT NULL,
        apellido VARCHAR(100) NOT NULL,
        telefono VARCHAR(20),
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ultimo_acceso TIMESTAMP,
        restaurante_id VARCHAR(50),
        is_2fa_enabled BOOLEAN DEFAULT FALSE,
        failed_attempts INTEGER DEFAULT 0,
        last_failed_attempt TIMESTAMP,
        requires_additional_info BOOLEAN DEFAULT TRUE,
        email_verified BOOLEAN DEFAULT FALSE,
        role VARCHAR(20) DEFAULT 'OWNER',
        permissions JSONB,
        activo BOOLEAN DEFAULT TRUE,
        metodos_auth JSONB DEFAULT '["email"]',
        sesiones_total INTEGER DEFAULT 0
      )
    `);

    // Tabla de sesiones
    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        uid VARCHAR(50) PRIMARY KEY,
        email VARCHAR(100) NOT NULL,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_logout TIMESTAMP,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        token VARCHAR(500),
        device_info JSONB,
        FOREIGN KEY (uid) REFERENCES dueno_restaurante(uid)
      )
    `);

    console.log('Tablas de autenticación inicializadas correctamente');
    return true;
  } catch (error) {
    console.error('Error al inicializar tablas de autenticación:', error);
    return false;
  }
};

// Generar JWT token
const generateToken = (user: UserInfo): string => {
  return sign(
    {
      uid: user.uid,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Verificar JWT token
export const verifyToken = (token: string): any => {
  try {
    return verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Error al verificar token:', error);
    return null;
  }
};

// Registrar usuario con email y contraseña
export const registerWithEmail = async (
  email: string, 
  password: string, 
  nombre: string, 
  apellido: string
): Promise<{ user: UserInfo, token: string }> => {
  try {
    // Verificar si el email ya existe
    const userExists = await query('SELECT email FROM dueno_restaurante WHERE email = $1', [email]);
    if (userExists && userExists.rowCount && userExists.rowCount > 0) {
      throw new Error('Ya existe una cuenta con este email');
    }

    // Generar hash de la contraseña
    const passwordHash = await hash(password, SALT_ROUNDS);
    
    // Generar UID único
    const uid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Permisos por defecto según el rol
    const defaultPermissions = DEFAULT_ROLE_PERMISSIONS[UserRole.OWNER];

    // Insertar usuario en la base de datos
    await query(
      `INSERT INTO dueno_restaurante (
        uid, email, password_hash, nombre, apellido, fecha_registro, 
        ultimo_acceso, role, permissions, email_verified, 
        requires_additional_info, activo, sesiones_total
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 
        $6, $7, $8, $9, $10, $11)`,
      [
        uid, 
        email, 
        passwordHash, 
        nombre, 
        apellido, 
        UserRole.OWNER, 
        JSON.stringify(defaultPermissions),
        false, 
        true, 
        true, 
        1
      ]
    );

    // Crear sesión inicial
    await query(
      `INSERT INTO sessions (uid, email, last_login, token, device_info)
       VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4)`,
      [
        uid, 
        email, 
        '', // Token se actualizará después
        JSON.stringify({
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
          platform: typeof window !== 'undefined' ? window.navigator.platform : '',
          language: typeof window !== 'undefined' ? window.navigator.language : ''
        })
      ]
    );

    // Crear objeto de usuario para respuesta
    const userInfo: UserInfo = {
      uid,
      email,
      role: UserRole.OWNER,
      permissions: defaultPermissions,
      nombre,
      apellido
    };

    // Generar token JWT
    const token = generateToken(userInfo);

    // Actualizar token en la sesión
    await query(
      'UPDATE sessions SET token = $1 WHERE uid = $2',
      [token, uid]
    );

    // TODO: Implementar envío de email de verificación

    return { user: userInfo, token };
  } catch (error: any) {
    console.error('Error en registerWithEmail:', error);
    if (error.message.includes('duplicate key')) {
      throw new Error('Ya existe una cuenta con este email');
    }
    throw new Error('Error al crear la cuenta. Por favor, intente nuevamente.');
  }
};

// Iniciar sesión con email y contraseña
export const signInWithEmail = async (
  email: string, 
  password: string
): Promise<{ user: UserInfo, token: string }> => {
  try {
    // Verificar si el usuario existe y obtener sus datos
    const result = await query(
      `SELECT * FROM dueno_restaurante WHERE email = $1`,
      [email]
    );

    if (result.rowCount === 0) {
      throw new Error('Email o contraseña incorrectos');
    }

    const userData = result.rows[0];

    // Verificar si la cuenta está activa
    if (!userData.activo) {
      throw new Error('Esta cuenta ha sido desactivada. Por favor, contacte al soporte.');
    }

    // Verificar bloqueo por intentos fallidos
    if (userData.failed_attempts >= MAX_FAILED_ATTEMPTS && userData.last_failed_attempt) {
      const lockoutEnd = new Date(userData.last_failed_attempt).getTime() + LOCKOUT_DURATION;
      if (Date.now() < lockoutEnd) {
        throw new Error(`Cuenta bloqueada. Intente nuevamente en ${Math.ceil((lockoutEnd - Date.now()) / 60000)} minutos`);
      }
    }

    // Verificar contraseña
    const isPasswordValid = await compare(password, userData.password_hash);
    if (!isPasswordValid) {
      // Incrementar contador de intentos fallidos
      await query(
        `UPDATE dueno_restaurante 
         SET failed_attempts = failed_attempts + 1, 
             last_failed_attempt = CURRENT_TIMESTAMP
         WHERE email = $1`,
        [email]
      );
      throw new Error('Email o contraseña incorrectos');
    }

    // Resetear contador de intentos fallidos y actualizar último acceso
    await query(
      `UPDATE dueno_restaurante 
       SET failed_attempts = 0, 
           last_failed_attempt = NULL,
           ultimo_acceso = CURRENT_TIMESTAMP,
           sesiones_total = sesiones_total + 1
       WHERE email = $1`,
      [email]
    );

    // Crear objeto de usuario para respuesta y token
    const userInfo: UserInfo = {
      uid: userData.uid,
      email: userData.email,
      role: userData.role,
      permissions: userData.permissions,
      nombre: userData.nombre,
      apellido: userData.apellido
    };

    // Generar token JWT
    const token = generateToken(userInfo);

    // Actualizar o crear sesión
    const sessionExists = await query(
      'SELECT uid FROM sessions WHERE uid = $1',
      [userData.uid]
    );

    if (sessionExists && sessionExists.rowCount && sessionExists.rowCount > 0) {
      await query(
        `UPDATE sessions 
         SET last_login = CURRENT_TIMESTAMP, 
             token = $1,
             last_updated = CURRENT_TIMESTAMP
         WHERE uid = $2`,
        [token, userData.uid]
      );
    } else {
      await query(
        `INSERT INTO sessions (uid, email, last_login, token, device_info)
         VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4)`,
        [
          userData.uid,
          email,
          token,
          JSON.stringify({
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
            platform: typeof window !== 'undefined' ? window.navigator.platform : '',
            language: typeof window !== 'undefined' ? window.navigator.language : ''
          })
        ]
      );
    }

    return { user: userInfo, token };
  } catch (error: any) {
    console.error('Error en signInWithEmail:', error);
    throw error;
  }
};

// Cerrar sesión
export const signOut = async (uid: string): Promise<boolean> => {
  try {
    await query(
      `UPDATE sessions 
       SET last_logout = CURRENT_TIMESTAMP, 
           last_updated = CURRENT_TIMESTAMP
       WHERE uid = $1`,
      [uid]
    );
    return true;
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return false;
  }
};

// Enviar email de restablecimiento de contraseña
export const resetPassword = async (email: string): Promise<boolean> => {
  try {
    const userExists = await query(
      'SELECT email FROM dueno_restaurante WHERE email = $1',
      [email]
    );

    if (!userExists || !userExists.rowCount || userExists.rowCount === 0) {
      throw new Error('No existe una cuenta con este email');
    }

    // TODO: Implementar envío de email de restablecimiento de contraseña

    return true;
  } catch (error) {
    console.error('Error al enviar email de recuperación:', error);
    throw error;
  }
};

// Actualizar perfil de usuario
export const updateUserProfile = async (uid: string, userData: any): Promise<boolean> => {
  try {
    const columns = Object.keys(userData)
      .map((key, index) => {
        // Convertir camelCase a snake_case para PostgreSQL
        const column = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        return `${column} = $${index + 2}`;
      })
      .join(', ');

    const values = [uid, ...Object.values(userData)];

    await query(
      `UPDATE dueno_restaurante 
       SET ${columns}, ultimo_acceso = CURRENT_TIMESTAMP
       WHERE uid = $1`,
      values
    );

    // Actualizar la sesión si existe
    await query(
      `UPDATE sessions 
       SET last_updated = CURRENT_TIMESTAMP
       WHERE uid = $1`,
      [uid]
    );

    return true;
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    throw error;
  }
};

// Obtener usuario actual por UID
export const getUserByUid = async (uid: string): Promise<UserInfo | null> => {
  try {
    const result = await query(
      'SELECT * FROM dueno_restaurante WHERE uid = $1',
      [uid]
    );

    if (result.rowCount === 0) {
      return null;
    }

    const userData = result.rows[0];
    return {
      uid: userData.uid,
      email: userData.email,
      role: userData.role,
      permissions: userData.permissions,
      nombre: userData.nombre,
      apellido: userData.apellido
    };
  } catch (error) {
    console.error('Error al obtener usuario por UID:', error);
    return null;
  }
};

// Obtener usuario actual por email
export const getUserByEmail = async (email: string): Promise<UserInfo | null> => {
  try {
    const result = await query(
      'SELECT * FROM dueno_restaurante WHERE email = $1',
      [email]
    );

    if (result.rowCount === 0) {
      return null;
    }

    const userData = result.rows[0];
    return {
      uid: userData.uid,
      email: userData.email,
      role: userData.role,
      permissions: userData.permissions,
      nombre: userData.nombre,
      apellido: userData.apellido
    };
  } catch (error) {
    console.error('Error al obtener usuario por email:', error);
    return null;
  }
};
