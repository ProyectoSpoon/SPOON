import { auth, db } from './config';
import { 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  multiFactor,
  RecaptchaVerifier,
  MultiFactorResolver,
  AuthErrorCodes
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { COLLECTIONS } from './utils/collections';
import type { UserSession } from './utils/collections';

export class SessionManager {
  private static readonly MAX_FAILED_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutos
  private static recaptchaVerifier: RecaptchaVerifier | null = null;
  private static multiFactorResolver: MultiFactorResolver | null = null;

  private static async updateSession(
    uid: string, 
    data: Partial<UserSession>
  ): Promise<void> {
    const sessionRef = doc(db, COLLECTIONS.SESSIONS, uid);
    await setDoc(sessionRef, {
      ...data,
      lastUpdated: serverTimestamp()
    }, { merge: true });
  }

  private static getRecaptchaVerifier(): RecaptchaVerifier {
    if (!this.recaptchaVerifier) {
      if (!document.getElementById('recaptcha-container')) {
        const container = document.createElement('div');
        container.id = 'recaptcha-container';
        document.body.appendChild(container);
      }

      this.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // Callback después de verificar reCAPTCHA
          return Promise.resolve();
        },
        'expired-callback': () => {
          // Limpiar y recrear el verifier cuando expire
          this.cleanup();
          return Promise.resolve();
        }
      });
    }
    return this.recaptchaVerifier;
  }

  static async checkSessionStatus(): Promise<UserSession | null> {
    const user = auth.currentUser;
    if (!user) return null;

    const sessionRef = doc(db, COLLECTIONS.SESSIONS, user.uid);
    const sessionDoc = await getDoc(sessionRef);
    
    if (!sessionDoc.exists()) return null;
    return sessionDoc.data() as UserSession;
  }

  static async checkLockoutStatus(email: string): Promise<void> {
    const userDoc = await getDoc(doc(db, COLLECTIONS.DUENO_RESTAURANTE, email));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.failedAttempts >= this.MAX_FAILED_ATTEMPTS && userData.lastFailedAttempt) {
        const lockoutEnd = new Date(userData.lastFailedAttempt.toDate()).getTime() + this.LOCKOUT_DURATION;
        if (Date.now() < lockoutEnd) {
          throw new Error(`Cuenta bloqueada. Intente nuevamente en ${Math.ceil((lockoutEnd - Date.now()) / 60000)} minutos`);
        }
        // Si el periodo de bloqueo terminó, resetear los intentos
        await setDoc(doc(db, COLLECTIONS.DUENO_RESTAURANTE, email), {
          failedAttempts: 0,
          lastFailedAttempt: null
        }, { merge: true });
      }
    }
  }

  static async signInWithEmail(email: string, password: string): Promise<UserSession> {
    try {
      await this.checkLockoutStatus(email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      const sessionData: UserSession = {
        uid: user.uid,
        email: user.email!,
        lastLogin: new Date(),
        failedAttempts: 0,
        lastFailedAttempt: null,
        is2FAEnabled: false,
        emailVerified: user.emailVerified,
        phoneNumber: user.phoneNumber || undefined
      };

      await this.updateSession(user.uid, sessionData);
      
      await setDoc(doc(db, COLLECTIONS.DUENO_RESTAURANTE, email), {
        failedAttempts: 0,
        lastFailedAttempt: null,
        lastLogin: serverTimestamp()
      }, { merge: true });

      return sessionData;

    } catch (error: any) {
      if (error.code === AuthErrorCodes.MFA_REQUIRED) {
        this.multiFactorResolver = error.resolver;
        throw error;
      }

      if (error.code === AuthErrorCodes.INVALID_PASSWORD || 
          error.code === AuthErrorCodes.USER_DELETED) {
        const userRef = doc(db, COLLECTIONS.DUENO_RESTAURANTE, email);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          await setDoc(userRef, {
            failedAttempts: (userData?.failedAttempts || 0) + 1,
            lastFailedAttempt: serverTimestamp()
          }, { merge: true });

          const updatedDoc = await getDoc(userRef);
          if (updatedDoc.exists()) {
            const updatedData = updatedDoc.data();
            if (updatedData?.failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
              throw new Error(`Cuenta bloqueada por múltiples intentos fallidos. Intente nuevamente en 15 minutos.`);
            }
          }
        }
      }
      throw error;
    }
  }

  static async setup2FA(phoneNumber: string): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const session = multiFactor(user);
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        phoneNumber,
        this.getRecaptchaVerifier()
      );

      await this.updateSession(user.uid, {
        phoneNumber,
        is2FAEnabled: true
      });

      return verificationId;
    } catch (error) {
      console.error('Error en setup2FA:', error);
      throw new Error('Error al configurar 2FA. Por favor, intente nuevamente.');
    } finally {
      this.cleanup();
    }
  }

  static async verify2FACode(verificationId: string, code: string): Promise<void> {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(credential);

      if (this.multiFactorResolver) {
        await this.multiFactorResolver.resolveSignIn(multiFactorAssertion);
        this.multiFactorResolver = null;
        return;
      }

      const user = auth.currentUser;
      if (!user) {
        throw new Error('Usuario no autenticado');
      }
      
      const session = multiFactor(user);
      await session.enroll(multiFactorAssertion, 'Phone Number');
    } catch (error) {
      console.error('Error en verify2FACode:', error);
      throw new Error('Código inválido. Por favor, intente nuevamente.');
    }
  }

  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error en resetPassword:', error);
      throw new Error('Error al enviar el correo de restablecimiento. Verifique el email ingresado.');
    }
  }

  static cleanup(): void {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
  }

  static async signOut(): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await this.updateSession(user.uid, {
        lastLogin: new Date()
      });
      await auth.signOut();
    } catch (error) {
      console.error('Error en signOut:', error);
      throw new Error('Error al cerrar sesión. Por favor, intente nuevamente.');
    }
  }
}