'use client';

import { query } from '@/config/database';
import { sign } from 'jsonwebtoken';
import { UserRole, Permission, DEFAULT_ROLE_PERMISSIONS } from '@/types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'spoon-restaurant-super-secret-key-2025';
const JWT_EXPIRES_IN = '7d';

interface UserInfo {
  uid: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  nombre: string;
  apellido: string;
}

/**
 * Función para autenticación con Google
 * Versión simulada para compatibilidad con la migración
 */
export async function signInWithGoogle(): Promise<{ user: UserInfo, token: string, needsProfile: boolean }> {
  try {
    // Esta función simula la autenticación con Google pero usa PostgreSQL
    // En una implementación real, usaríamos OAuth con Google y luego verificaríamos 
    // si el usuario existe en nuestra base de datos de PostgreSQL
    
    // Simulamos un retraso de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Creamos un ID único basado en la hora actual (simula el ID de Google)
    const googleId = `google_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Verificamos si este usuario ya existe en nuestra base de datos
    const userExists = await query(
      'SELECT * FROM dueno_restaurante WHERE uid LIKE $1',
      [`google_%`] // Simulamos buscar usuarios con autenticación de Google
    );
    
    // Si el usuario no existe, creamos uno nuevo
    if (!userExists || !userExists.rowCount || userExists.rowCount === 0) {
      // En una implementación real, obtendríamos estos datos del perfil de Google
      const email = `usuario${Date.now()}@gmail.com`;
      const nombre = 'Usuario';
      const apellido = 'de Google';
      
      // Crear un nuevo usuario en PostgreSQL
      await query(
        `INSERT INTO dueno_restaurante (
          uid, email, nombre, apellido, fecha_registro, 
          ultimo_acceso, role, permissions, email_verified, 
          requires_additional_info, activo, metodos_auth
        ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 
          $5, $6, $7, $8, $9, $10)`,
        [
          googleId, 
          email, 
          nombre, 
          apellido, 
          UserRole.OWNER, 
          JSON.stringify(DEFAULT_ROLE_PERMISSIONS[UserRole.OWNER]),
          true, 
          true, 
          true,
          JSON.stringify(['google'])
        ]
      );
      
      // Crear objeto de usuario para la respuesta
      const userInfo: UserInfo = {
        uid: googleId,
        email,
        role: UserRole.OWNER,
        permissions: DEFAULT_ROLE_PERMISSIONS[UserRole.OWNER],
        nombre,
        apellido
      };
      
      // Generar token JWT
      const token = sign(
        {
          uid: userInfo.uid,
          email: userInfo.email,
          role: userInfo.role,
          permissions: userInfo.permissions
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      // Guardar token en la sesión
      await query(
        `INSERT INTO sessions (uid, email, last_login, token, device_info)
         VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4)`,
        [
          googleId, 
          email, 
          token, 
          JSON.stringify({
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
            platform: typeof window !== 'undefined' ? window.navigator.platform : '',
            language: typeof window !== 'undefined' ? window.navigator.language : ''
          })
        ]
      );
      
      // Devolver el nuevo usuario, indicando que necesita completar su perfil
      return { 
        user: userInfo, 
        token,
        needsProfile: true
      };
    }
    
    // Si el usuario ya existe, devolvemos sus datos
    const userData = userExists.rows[0];
    const userInfo: UserInfo = {
      uid: userData.uid,
      email: userData.email,
      role: userData.role,
      permissions: userData.permissions,
      nombre: userData.nombre,
      apellido: userData.apellido
    };
    
    // Generar token JWT
    const token = sign(
      {
        uid: userInfo.uid,
        email: userInfo.email,
        role: userInfo.role,
        permissions: userInfo.permissions
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    // Actualizar sesión existente
    await query(
      `UPDATE sessions 
       SET last_login = CURRENT_TIMESTAMP, 
           token = $1,
           last_updated = CURRENT_TIMESTAMP
       WHERE uid = $2`,
      [token, userInfo.uid]
    );
    
    // Devolver el usuario existente
    return {
      user: userInfo,
      token,
      needsProfile: false
    };
  } catch (error) {
    console.error('Error en signInWithGoogle:', error);
    throw new Error('Error al iniciar sesión con Google');
  }
}
