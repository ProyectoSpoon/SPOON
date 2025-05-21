'use client';

import { query } from '@/config/database';
import { hash, compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { 
  getUserByEmail, 
  signInWithEmail, 
  resetPassword as resetPasswordService 
} from './auth.service';

// Constantes para autenticación
const JWT_SECRET = process.env.JWT_SECRET || 'spoon-restaurant-secret-key';

// Clase para gestionar sesiones
export class SessionManager {
  private static recaptchaVerifier: any = null;
  private static multiFactorResolver: any = null;
  private static readonly MAX_FAILED_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutos

  // Actualizar sesión
  private static async updateSession(
    uid: string, 
    data: Partial<any>
  ): Promise<void> {
    const sessionRef = await query(
      `UPDATE sessions 
       SET last_updated = CURRENT_TIMESTAMP, 
       ${Object.keys(data).map((key, index) => {
         // Convertir camelCase a snake_case para PostgreSQL
         const column = key.replace(/([A-Z])/g, '_$1').toLowerCase();
         return `${column} = $${index + 2}`;
       }).join(', ')}
       WHERE uid = $1`,
      [uid, ...Object.values(data)]
    );
  }

  // Comprobar estado de la sesión
  static async checkSessionStatus(uid: string): Promise<any | null> {
    if (!uid) return null;

    const session = await query(
      'SELECT * FROM sessions WHERE uid = $1',
      [uid]
    );
    
    if (!session || !session.rowCount || session.rowCount === 0) return null;
    return session.rows[0];
  }

  // Comprobar estado de bloqueo
  static async checkLockoutStatus(email: string): Promise<void> {
    const userDoc = await query(
      'SELECT * FROM dueno_restaurante WHERE email = $1',
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
          `UPDATE dueno_restaurante 
           SET failed_attempts = 0, 
               last_failed_attempt = NULL
           WHERE email = $1`,
          [email]
        );
      }
    }
  }

  // Iniciar sesión con email
  static async signInWithEmail(email: string, password: string): Promise<any> {
    try {
      await this.checkLockoutStatus(email);
      const { user, token } = await signInWithEmail(email, password);

      // Formato de respuesta similar al antiguo para mantener compatibilidad
      const sessionData = {
        uid: user.uid,
        email: user.email,
        lastLogin: new Date(),
        failedAttempts: 0,
        lastFailedAttempt: null,
        is2FAEnabled: false,
        emailVerified: false, // Se podría actualizar si hay una columna para esto
        token
      };

      return sessionData;
    } catch (error: any) {
      // Gestión de errores y múltiples factores de autenticación se manejaría aquí
      throw error;
    }
  }

  // Configurar 2FA - Esta es una implementación básica que se puede adaptar
  static async setup2FA(phoneNumber: string, uid: string): Promise<boolean> {
    try {
      await this.updateSession(uid, {
        phoneNumber,
        is2FAEnabled: true
      });

      // Aquí iría la lógica para enviar SMS con código de verificación
      // usando un servicio externo como Twilio

      return true;
    } catch (error) {
      console.error('Error en setup2FA:', error);
      throw new Error('Error al configurar 2FA. Por favor, intente nuevamente.');
    }
  }

  // Verificar código 2FA
  static async verify2FACode(uid: string, code: string): Promise<boolean> {
    try {
      // Aquí iría la lógica para verificar el código SMS
      // contra el código almacenado o verificado por el servicio externo
      
      // Por ahora, simulamos una verificación exitosa
      return true;
    } catch (error) {
      console.error('Error en verify2FACode:', error);
      throw new Error('Código inválido. Por favor, intente nuevamente.');
    }
  }

  // Restablecer contraseña
  static async resetPassword(email: string): Promise<boolean> {
    try {
      return await resetPasswordService(email);
    } catch (error) {
      console.error('Error en resetPassword:', error);
      throw new Error('Error al enviar el correo de restablecimiento. Verifique el email ingresado.');
    }
  }

  // Limpiar recursos
  static cleanup(): void {
    // Limpieza de recursos si es necesario
  }

  // Cerrar sesión
  static async signOut(uid: string): Promise<boolean> {
    if (!uid) return false;

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
      console.error('Error en signOut:', error);
      throw new Error('Error al cerrar sesión. Por favor, intente nuevamente.');
    }
  }
}
