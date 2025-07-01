'use client';

import { query } from '@/config/database';

// Constantes para autenticación
const JWT_SECRET = process.env.JWT_SECRET || 'spoon-restaurant-secret-key';

// Clase para gestionar sesiones
export class SessionManager {
  private static readonly MAX_FAILED_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutos

  // Actualizar sesión
  private static async updateSession(
    uid: string, 
    data: Record<string, any>
  ): Promise<void> {
    try {
      const fields = Object.keys(data);
      const values = Object.values(data);
      
      if (fields.length === 0) return;
      
      const setClause = fields.map((field, index) => {
        // Convertir camelCase a snake_case para PostgreSQL
        const column = field.replace(/([A-Z])/g, '_$1').toLowerCase();
        return `${column} = $${index + 2}`;
      }).join(', ');
      
      await query(
        `UPDATE sessions 
         SET last_updated = CURRENT_TIMESTAMP, ${setClause}
         WHERE uid = $1`,
        [uid, ...values]
      );
    } catch (error) {
      console.error('Error actualizando sesión:', error);
      throw error;
    }
  }

  // Comprobar estado de la sesión
  static async checkSessionStatus(uid: string): Promise<any | null> {
    if (!uid) return null;

    try {
      const session = await query(
        'SELECT * FROM sessions WHERE uid = $1',
        [uid]
      );
      
      if (!session || !session.rowCount || session.rowCount === 0) return null;
      return session.rows[0];
    } catch (error) {
      console.error('Error verificando estado de sesión:', error);
      return null;
    }
  }

  // Comprobar estado de bloqueo
  static async checkLockoutStatus(email: string): Promise<void> {
    try {
      const userDoc = await query(
        'SELECT failed_attempts, last_failed_attempt FROM usuarios WHERE email = $1',
        [email]
      );
      
      if (userDoc && userDoc.rowCount && userDoc.rowCount > 0) {
        const userData = userDoc.rows[0];
        if (userData.failed_attempts >= SessionManager.MAX_FAILED_ATTEMPTS && userData.last_failed_attempt) {
          const lockoutEnd = new Date(userData.last_failed_attempt).getTime() + SessionManager.LOCKOUT_DURATION;
          if (Date.now() < lockoutEnd) {
            throw new Error(`Cuenta bloqueada. Intente nuevamente en ${Math.ceil((lockoutEnd - Date.now()) / 60000)} minutos`);
          }
          // Si el periodo de bloqueo terminó, resetear los intentos
          await query(
            `UPDATE usuarios 
             SET failed_attempts = 0, 
                 last_failed_attempt = NULL
             WHERE email = $1`,
            [email]
          );
        }
      }
    } catch (error) {
      console.error('Error verificando estado de bloqueo:', error);
      throw error;
    }
  }

  // Iniciar sesión con email
  static async signInWithEmail(email: string, password: string): Promise<any> {
    try {
      await this.checkLockoutStatus(email);
      
      // Buscar usuario en la base de datos
      const userResult = await query(
        'SELECT * FROM usuarios WHERE email = $1 AND estado = $2',
        [email, 'active']
      );
      
      if (!userResult.rowCount || userResult.rowCount === 0) {
        throw new Error('Usuario no encontrado o inactivo');
      }
      
      const user = userResult.rows[0];
      
      // Verificar credenciales (simulado - en producción usar bcrypt)
      const credentialsResult = await query(
        'SELECT password_hash FROM auth_credenciales WHERE email = $1',
        [email]
      );
      
      if (!credentialsResult.rowCount || credentialsResult.rowCount === 0) {
        throw new Error('Credenciales no encontradas');
      }
      
      const credentials = credentialsResult.rows[0];
      
      // Simulación de verificación de contraseña
      const isValidPassword = credentials.password_hash === `hashed_${password}`;
      
      if (!isValidPassword) {
        // Incrementar intentos fallidos
        await query(
          `UPDATE usuarios 
           SET failed_attempts = COALESCE(failed_attempts, 0) + 1,
               last_failed_attempt = CURRENT_TIMESTAMP
           WHERE email = $1`,
          [email]
        );
        throw new Error('Contraseña incorrecta');
      }
      
      // Resetear intentos fallidos en login exitoso
      await query(
        `UPDATE usuarios 
         SET failed_attempts = 0,
             last_failed_attempt = NULL,
             ultimo_acceso = CURRENT_TIMESTAMP
         WHERE email = $1`,
        [email]
      );
      
      // Crear o actualizar sesión
      const sessionData = {
        uid: user.uid,
        email: user.email,
        lastLogin: new Date(),
        failedAttempts: 0,
        lastFailedAttempt: null,
        is2FAEnabled: false,
        emailVerified: true,
        token: this.generateSimpleToken(user.uid)
      };
      
      // Guardar sesión en la base de datos
      await query(
        `INSERT INTO sessions (uid, email, last_login, token, created_at, last_updated)
         VALUES ($1, $2, CURRENT_TIMESTAMP, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (uid) 
         DO UPDATE SET 
           last_login = CURRENT_TIMESTAMP,
           token = $3,
           last_updated = CURRENT_TIMESTAMP`,
        [user.uid, user.email, sessionData.token]
      );

      return { user, token: sessionData.token };
    } catch (error: any) {
      console.error('Error en signInWithEmail:', error);
      throw error;
    }
  }

  // Generar token simple (en producción usar JWT real)
  private static generateSimpleToken(uid: string): string {
    const tokenData = {
      uid,
      timestamp: Date.now(),
      random: Math.random()
    };
    return btoa(JSON.stringify(tokenData));
  }

  // Verificar token
  static async verifyToken(token: string): Promise<any | null> {
    try {
      const decoded = JSON.parse(atob(token));
      
      // Verificar que el token no sea muy antiguo (24 horas)
      const tokenAge = Date.now() - decoded.timestamp;
      if (tokenAge > 24 * 60 * 60 * 1000) {
        return null;
      }
      
      // Verificar que la sesión existe en la base de datos
      const sessionResult = await query(
        'SELECT * FROM sessions WHERE uid = $1 AND token = $2',
        [decoded.uid, token]
      );
      
      if (!sessionResult.rowCount || sessionResult.rowCount === 0) {
        return null;
      }
      
      return sessionResult.rows[0];
    } catch (error) {
      console.error('Error verificando token:', error);
      return null;
    }
  }

  // Configurar 2FA
  static async setup2FA(phoneNumber: string, uid: string): Promise<boolean> {
    try {
      await this.updateSession(uid, {
        phoneNumber,
        is2FAEnabled: true
      });

      // Aquí iría la lógica para enviar SMS con código de verificación
      console.log(`Código 2FA enviado a ${phoneNumber} para usuario ${uid}`);

      return true;
    } catch (error) {
      console.error('Error en setup2FA:', error);
      throw new Error('Error al configurar 2FA. Por favor, intente nuevamente.');
    }
  }

  // Verificar código 2FA
  static async verify2FACode(uid: string, code: string): Promise<boolean> {
    try {
      // Simulación de verificación de código 2FA
      // En producción, verificar contra código almacenado o servicio externo
      const isValidCode = code === '123456'; // Código de prueba
      
      if (isValidCode) {
        await this.updateSession(uid, {
          twoFactorVerified: true,
          lastTwoFactorVerification: new Date()
        });
      }
      
      return isValidCode;
    } catch (error) {
      console.error('Error en verify2FACode:', error);
      throw new Error('Código inválido. Por favor, intente nuevamente.');
    }
  }

  // Restablecer contraseña
  static async resetPassword(email: string): Promise<boolean> {
    try {
      // Verificar que el usuario existe
      const userResult = await query(
        'SELECT uid FROM usuarios WHERE email = $1',
        [email]
      );
      
      if (!userResult.rowCount || userResult.rowCount === 0) {
        throw new Error('Usuario no encontrado');
      }
      
      // Generar token de restablecimiento
      const resetToken = this.generateSimpleToken(userResult.rows[0].uid);
      
      // Guardar token de restablecimiento
      await query(
        `INSERT INTO password_resets (email, token, expires_at, created_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
        [email, resetToken, new Date(Date.now() + 60 * 60 * 1000)] // Expira en 1 hora
      );
      
      console.log(`Token de restablecimiento generado para ${email}: ${resetToken}`);
      return true;
    } catch (error) {
      console.error('Error en resetPassword:', error);
      throw new Error('Error al enviar el correo de restablecimiento. Verifique el email ingresado.');
    }
  }

  // Cerrar sesión
  static async signOut(uid: string): Promise<boolean> {
    if (!uid) return false;

    try {
      await query(
        `UPDATE sessions 
         SET last_logout = CURRENT_TIMESTAMP, 
             last_updated = CURRENT_TIMESTAMP,
             token = NULL
         WHERE uid = $1`,
        [uid]
      );
      return true;
    } catch (error) {
      console.error('Error en signOut:', error);
      throw new Error('Error al cerrar sesión. Por favor, intente nuevamente.');
    }
  }

  // Limpiar sesiones expiradas
  static async cleanupExpiredSessions(): Promise<void> {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      await query(
        'DELETE FROM sessions WHERE last_updated < $1',
        [oneDayAgo]
      );
      console.log('Sesiones expiradas limpiadas');
    } catch (error) {
      console.error('Error limpiando sesiones expiradas:', error);
    }
  }
}
