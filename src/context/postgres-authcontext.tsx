'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  getUserByEmail, 
  signInWithEmail as pgSignInWithEmail,
  signOut as pgSignOut,
  resetPassword as pgResetPassword,
  getUserByUid,
  updateUserProfile
} from '@/services/postgres/auth.service';
import { SessionManager } from '@/services/postgres/session-manager';
import { Permission, UserRole, UserPermissions, DEFAULT_ROLE_PERMISSIONS } from '@/types/auth';
import { signInWithGoogle as pgSignInWithGoogle } from '@/auth/postgres-auth';

interface User {
  uid: string;
  email: string;
  emailVerified?: boolean;
}

interface SessionInfo {
  uid: string;
  email: string;
  is2FAEnabled: boolean;
  failedAttempts: number;
  lastFailedAttempt: Date | null;
  lastLogin: Date;
  emailVerified: boolean;
  phoneNumber?: string;
  requiresAdditionalInfo: boolean;
  role?: UserRole;
  restaurantId?: string;
  permissions?: Permission[];
}

interface AuthContextType {
  usuario: User | null;
  sessionInfo: SessionInfo | null;
  cargando: boolean;
  error: string | null;
  requiere2FA: boolean;
  role: UserRole | null;
  permissions: Permission[];
  iniciarSesion: (email: string, password: string) => Promise<void>;
  iniciarSesionCon2FA: (code: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  enviarCodigoVerificacion: () => Promise<void>;
  reenviarVerificacionEmail: () => Promise<void>;
  restablecerContrasena: (email: string) => Promise<void>;
  actualizarSesion: () => Promise<void>;
  checkPermission: (permission: Permission) => boolean;
  checkRoleLevel: (requiredRole: UserRole) => boolean;
  signInWithGoogle: () => Promise<{ needsProfile: boolean; [key: string]: any }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiere2FA, setRequiere2FA] = useState(false);
  const [tempEmail, setTempEmail] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  // Verificar si hay un usuario en localStorage/cookies al cargar
  useEffect(() => {
    const checkStoredUser = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUserInfo = localStorage.getItem('userInfo');
        
        if (storedToken && storedUserInfo) {
          const userInfo = JSON.parse(storedUserInfo);
          
          // Validar si el token sigue siendo válido (podría implementarse)
          const user: User = {
            uid: userInfo.uid,
            email: userInfo.email,
            emailVerified: true // Asumimos verdadero si está almacenado
          };
          
          setUsuario(user);
          
          // Intentar obtener la información de la sesión
          await actualizarSesion();
        }
      } catch (error) {
        console.error('Error al verificar usuario almacenado:', error);
      } finally {
        setCargando(false);
      }
    };
    
    checkStoredUser();
  }, []);

  const actualizarSesion = async () => {
    if (!usuario) {
      console.log('No hay usuario, saliendo de actualizarSesion');
      return;
    }

    try {
      console.log('Buscando sesión para uid:', usuario.uid);
      const session = await SessionManager.checkSessionStatus(usuario.uid);

      if (session) {
        console.log('Sesión encontrada:', session);
        
        // Obtener información adicional del usuario
        const userData = await getUserByUid(usuario.uid);
        
        if (userData) {
          console.log('Datos de usuario encontrados:', userData);
          
          const userRole = userData.role as UserRole;
          console.log('Role del usuario:', userRole);
          
          if (userRole && Object.values(UserRole).includes(userRole)) {
            console.log('Role válido');
            const newSessionInfo: SessionInfo = {
              uid: usuario.uid,
              email: usuario.email,
              is2FAEnabled: session.is_2fa_enabled || false,
              failedAttempts: 0,
              lastFailedAttempt: null,
              lastLogin: new Date(session.last_login),
              emailVerified: true,
              requiresAdditionalInfo: false,
              role: userRole,
              restaurantId: '',
              permissions: userData.permissions || DEFAULT_ROLE_PERMISSIONS[userRole]
            };
            
            setSessionInfo(newSessionInfo);
            setRole(userRole);
            setPermissions(userData.permissions || DEFAULT_ROLE_PERMISSIONS[userRole]);
          }
        }
      } else {
        console.log('No se encontró sesión, buscando usuario por email');
        
        const userData = await getUserByEmail(usuario.email);
        
        if (userData) {
          console.log('Datos de usuario encontrados:', userData);
          
          const userRole = userData.role;
          
          if (userRole && Object.values(UserRole).includes(userRole)) {
            console.log('Role válido, creando sessionInfo');
            const newSessionInfo: SessionInfo = {
              uid: usuario.uid,
              email: usuario.email,
              is2FAEnabled: false,
              failedAttempts: 0,
              lastFailedAttempt: null,
              lastLogin: new Date(),
              emailVerified: true,
              requiresAdditionalInfo: false,
              role: userRole,
              restaurantId: '',
              permissions: userData.permissions || DEFAULT_ROLE_PERMISSIONS[userRole]
            };
            
            setSessionInfo(newSessionInfo);
            setRole(userRole);
            setPermissions(userData.permissions || DEFAULT_ROLE_PERMISSIONS[userRole]);
          }
        }
      }
    } catch (error) {
      console.error('Error al actualizar información de sesión:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setCargando(true);
      
      const result = await pgSignInWithGoogle();
      
      if (result && result.user) {
        const user: User = {
          uid: result.user.uid,
          email: result.user.email || '',
          emailVerified: result.user.emailVerified
        };
        
        setUsuario(user);
        await actualizarSesion();
      }
      
      return result;
    } catch (err) {
      console.error('Error en signInWithGoogle:', err);
      setError('Error al iniciar sesión con Google');
      throw err;
    } finally {
      setCargando(false);
    }
  };

  const checkPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  const checkRoleLevel = (requiredRole: UserRole): boolean => {
    const roleHierarchy = {
      [UserRole.OWNER]: 4,
      [UserRole.ADMIN]: 3,
      [UserRole.MANAGER]: 2,
      [UserRole.STAFF]: 1,
      [UserRole.VIEWER]: 0
    };

    return role ? roleHierarchy[role] >= roleHierarchy[requiredRole] : false;
  };

  const iniciarSesion = async (email: string, password: string) => {
    try {
      setError(null);
      setCargando(true);

      // Obtenemos el usuario antes de autenticar para verificar si existe
      const userData = await getUserByEmail(email);
      
      if (!userData) {
        throw new Error('Usuario no encontrado en el sistema');
      }
      
      // Intentamos la autenticación (maneja verificaciones adicionales)
      const { user, token } = await pgSignInWithEmail(email, password);
      
      // Guardar token y datos en localStorage para persistencia
      localStorage.setItem('authToken', token);
      localStorage.setItem('userInfo', JSON.stringify(user));
      
      const userObj: User = {
        uid: user.uid,
        email: user.email || email,
        emailVerified: true
      };
      
      // Si requiere 2FA, configuramos el estado
      if (userData.is2FAEnabled) {
        setRequiere2FA(true);
        setTempEmail(email);
        setTempPassword(password);
        return;
      }
      
      // Si no requiere 2FA, configuramos el usuario y la sesión
      const userRole = userData.role || UserRole.OWNER;
      const newSessionInfo: SessionInfo = {
        uid: user.uid,
        email: email,
        is2FAEnabled: userData.is2FAEnabled || false,
        failedAttempts: 0,
        lastFailedAttempt: null,
        lastLogin: new Date(),
        emailVerified: true,
        requiresAdditionalInfo: false,
        role: userRole,
        restaurantId: '',
        permissions: userData.permissions || DEFAULT_ROLE_PERMISSIONS[userRole]
      };

      setUsuario(userObj);
      setSessionInfo(newSessionInfo);
      setRole(userRole);
      setPermissions(userData.permissions || DEFAULT_ROLE_PERMISSIONS[userRole]);

    } catch (err: any) {
      let errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.';
      
      if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      throw err;
    } finally {
      setCargando(false);
    }
  };

  const iniciarSesionCon2FA = async (code: string) => {
    try {
      setError(null);
      setCargando(true);

      if (!tempEmail || !tempPassword) {
        throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      }

      if (code.length !== 6) {
        throw new Error('Código inválido');
      }

      // Verificar código 2FA (se implementaría con un servicio real)
      const verified = await SessionManager.verify2FACode(
        tempEmail, 
        code
      );
      
      if (!verified) {
        throw new Error('Código inválido');
      }
      
      // Si es válido, completamos el inicio de sesión
      const { user, token } = await pgSignInWithEmail(tempEmail, tempPassword);
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userInfo', JSON.stringify(user));
      
      const userObj: User = {
        uid: user.uid,
        email: user.email || tempEmail,
        emailVerified: true
      };
      
      setUsuario(userObj);
      setRequiere2FA(false);
      setTempEmail(null);
      setTempPassword(null);
      await actualizarSesion();

    } catch (err) {
      setError('Código inválido. Por favor, intente nuevamente.');
      throw err;
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = async () => {
    try {
      if (usuario) {
        await pgSignOut(usuario.uid);
      }
      
      // Limpiar almacenamiento local
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      
      // Reiniciar estado
      setUsuario(null);
      setSessionInfo(null);
      setRequiere2FA(false);
      setRole(null);
      setPermissions([]);
    } catch (err) {
      setError('Error al cerrar sesión');
      throw err;
    }
  };

  const enviarCodigoVerificacion = async () => {
    if (!usuario) {
      throw new Error('No hay usuario autenticado');
    }
    
    if (!tempEmail) {
      throw new Error('No hay email asociado a la sesión');
    }
    
    // Implementación básica para 2FA
    await SessionManager.setup2FA(tempEmail, usuario.uid);
    return Promise.resolve();
  };

  const reenviarVerificacionEmail = async () => {
    if (!usuario) {
      throw new Error('No hay usuario autenticado');
    }
    
    // Implementación pendiente para enviar emails de verificación
    console.warn('Funcionalidad no implementada completamente en PostgreSQL');
    return Promise.resolve();
  };

  const restablecerContrasena = async (email: string) => {
    try {
      await pgResetPassword(email);
    } catch (err) {
      setError('Error al enviar el correo de restablecimiento');
      throw err;
    }
  };

  const value = {
    usuario,
    sessionInfo,
    cargando,
    error,
    requiere2FA,
    role,
    permissions,
    iniciarSesion,
    iniciarSesionCon2FA,
    cerrarSesion,
    enviarCodigoVerificacion,
    reenviarVerificacionEmail,
    restablecerContrasena,
    actualizarSesion,
    checkPermission,
    checkRoleLevel,
    signInWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {!cargando && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
