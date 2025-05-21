'use client';

import { auth, db } from './config';
import { 
  GoogleAuthProvider, 
  signInWithPopup,
  browserPopupRedirectResolver,
  sendEmailVerification,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp, 
  writeBatch,
  updateDoc,
  increment 
} from 'firebase/firestore';
import { COLLECTIONS } from './types/collections.types';
import { Permission, UserRole, DEFAULT_ROLE_PERMISSIONS } from '@/types/auth';
import { setAuthCookies } from '@/utils/auth-client';

const googleProvider = new GoogleAuthProvider();

interface UserInfo {
  uid: string;
  email: string | null;
  role: UserRole;
  permissions: Permission[];
  nombre: string;
  apellido: string;
}

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Primero autenticamos al usuario
    const result = await signInWithPopup(auth, provider);
    console.log('Usuario autenticado con Google:', result.user.email);

    // Obtener el token del usuario
    const token = await result.user.getIdToken();

    try {
      // Verificar si el usuario existe en dueno_restaurante
      const userDocRef = doc(db, 'dueno_restaurante', result.user.email!);
      const userDoc = await getDoc(userDocRef);

      // Si el usuario no existe, crearlo
      if (!userDoc.exists()) {
        const userData = {
          uid: result.user.uid,
          email: result.user.email,
          nombre: result.user.displayName?.split(' ')[0] || '',
          apellido: result.user.displayName?.split(' ').slice(1).join(' ') || '',
          fechaRegistro: serverTimestamp(),
          ultimoAcceso: serverTimestamp(),
          activo: true,
          is2FAEnabled: false,
          metodosAuth: ['google'],
          role: 'OWNER',
          requiresAdditionalInfo: true,
          emailVerified: result.user.emailVerified
        };

        await setDoc(userDocRef, userData);
        return { needsProfile: true, user: result.user };
      }

      // Si el usuario existe, verificar si necesita completar perfil
      const userData = userDoc.data();
      return { 
        needsProfile: !userData.RestauranteID, 
        user: result.user,
        ...userData 
      };

    } catch (firestoreError) {
      console.error('Error al acceder a Firestore:', firestoreError);
      // Aún retornamos el usuario aunque haya error en Firestore
      return { needsProfile: true, user: result.user };
    }

  } catch (error: any) {
    console.error('Error en signInWithGoogle:', error);
    
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Inicio de sesión cancelado');
    }
    if (error.code === 'auth/popup-blocked') {
      throw new Error('El navegador bloqueó la ventana emergente. Permite ventanas emergentes para este sitio.');
    }
    
    throw new Error('Error al iniciar sesión con Google. Por favor, intente nuevamente.');
  }
};

export const updateUserProfile = async (userData: any) => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No hay usuario autenticado');
    }

    // Referencia al documento del usuario
    const userDocRef = doc(db, 'dueno_restaurante', user.email);

    // Batch write para actualizar tanto el perfil como la sesión
    const batch = writeBatch(db);

    // Actualizar el documento del usuario
    batch.update(userDocRef, {
      ...userData,
      ultimoAcceso: serverTimestamp(),
      updated_at: serverTimestamp()
    });

    // Actualizar la sesión si existe
    const sessionRef = doc(db, 'sessions', user.uid);
    batch.set(sessionRef, {
      uid: user.uid,
      email: user.email,
      lastLogin: serverTimestamp(),
      updated_at: serverTimestamp()
    }, { merge: true });

    // Ejecutar el batch
    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.DUENO_RESTAURANTE, email));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      if (!userData.activo) {
        throw new Error('Esta cuenta ha sido desactivada. Por favor, contacte al soporte.');
      }

      if (userData.failedAttempts >= 5 && userData.lastFailedAttempt) {
        const lockoutEnd = new Date(userData.lastFailedAttempt.toDate()).getTime() + (15 * 60 * 1000);
        if (Date.now() < lockoutEnd) {
          throw new Error(`Cuenta bloqueada. Intente nuevamente en ${Math.ceil((lockoutEnd - Date.now()) / 60000)} minutos`);
        }
      }
    }

    const result = await signInWithEmailAndPassword(auth, email, password);
    const token = await result.user.getIdToken();

    if (userDoc.exists()) {
      await updateDoc(doc(db, COLLECTIONS.DUENO_RESTAURANTE, email), {
        failedAttempts: 0,
        lastFailedAttempt: null,
        ultimoAcceso: serverTimestamp(),
        sesionesTotal: increment(1)
      });
    }

    return result.user;

  } catch (error: any) {
    console.error('Error en signInWithEmail:', error);

    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      if (userDoc.exists()) {
        await updateDoc(doc(db, COLLECTIONS.DUENO_RESTAURANTE, email), {
          failedAttempts: increment(1),
          lastFailedAttempt: serverTimestamp()
        });
      }
      throw new Error('Email o contraseña incorrectos');
    }

    if (error.code === 'auth/too-many-requests') {
      throw new Error('Demasiados intentos fallidos. Por favor, intente más tarde.');
    }

    throw error;
  }
};

export const registerWithEmail = async (email: string, password: string, nombre: string, apellido: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token = await user.getIdToken();

    const defaultPermissions = DEFAULT_ROLE_PERMISSIONS[UserRole.OWNER];

    const userData = {
      uid: user.uid,
      nombre,
      apellido,
      email,
      telefono: '',
      fechaRegistro: serverTimestamp(),
      RestauranteID: '',
      is2FAEnabled: false,
      failedAttempts: 0,
      lastFailedAttempt: null,
      requiresAdditionalInfo: true,
      emailVerified: false,
      role: UserRole.OWNER,
      permissions: defaultPermissions,
      activo: true,
      ultimoAcceso: serverTimestamp(),
      metodosAuth: ['email'],
      sesionesTotal: 1
    };

    const batch = writeBatch(db);

    batch.set(doc(db, COLLECTIONS.DUENO_RESTAURANTE, email), userData);
    batch.set(doc(db, COLLECTIONS.SESSIONS, user.uid), {
      uid: user.uid,
      email,
      lastLogin: serverTimestamp(),
      token,
      deviceInfo: {
        userAgent: window.navigator.userAgent,
        platform: window.navigator.platform,
        language: window.navigator.language
      }
    });

    await batch.commit();
    await sendEmailVerification(user);

    const userInfo: UserInfo = {
      uid: user.uid,
      email,
      role: UserRole.OWNER,
      permissions: defaultPermissions,
      nombre,
      apellido
    };

    setAuthCookies(token, userInfo);

    return { user, userData };

  } catch (error: any) {
    console.error('Error en registerWithEmail:', error);

    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Ya existe una cuenta con este email');
    }
    if (error.code === 'auth/invalid-email') {
      throw new Error('Email inválido');
    }
    if (error.code === 'auth/operation-not-allowed') {
      throw new Error('El registro con email/contraseña no está habilitado');
    }
    if (error.code === 'auth/weak-password') {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    throw new Error('Error al crear la cuenta. Por favor, intente nuevamente.');
  }
};

export const sendVerificationEmail = async () => {
  const user = auth.currentUser;
  if (user && !user.emailVerified) {
    try {
      await sendEmailVerification(user);
    } catch (error: any) {
      console.error('Error al enviar email de verificación:', error);
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Se han enviado demasiados emails de verificación. Por favor, intente más tarde.');
      }
      throw new Error('Error al enviar el email de verificación. Por favor, intente nuevamente.');
    }
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Error al enviar email de recuperación:', error);
    if (error.code === 'auth/user-not-found') {
      throw new Error('No existe una cuenta con este email');
    }
    if (error.code === 'auth/invalid-email') {
      throw new Error('Email inválido');
    }
    throw new Error('Error al enviar el email de recuperación. Por favor, intente nuevamente.');
  }
};

export const signOutUser = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      await updateDoc(doc(db, COLLECTIONS.SESSIONS, user.uid), {
        lastLogout: serverTimestamp()
      });
    }
    await signOut(auth);
    document.cookie = 'Firebase-Auth-Token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    document.cookie = 'userInfo=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw new Error('Error al cerrar sesión. Por favor, intente nuevamente.');
  }
};

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};