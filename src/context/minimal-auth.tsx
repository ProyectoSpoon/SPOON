'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Permission, UserRole } from '@/types/auth';

// Tipos mínimos necesarios para mantener la interfaz compatible
interface User {
  uid: string;
  email: string | null;
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
  signInWithGoogle: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const MinimalAuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiere2FA, setRequiere2FA] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  // Implementaciones mínimas para no romper la aplicación
  const iniciarSesion = async () => {
    setError('Autenticación no disponible. Se requiere configurar PostgreSQL.');
  };

  const iniciarSesionCon2FA = async () => {
    setError('Autenticación no disponible. Se requiere configurar PostgreSQL.');
  };

  const cerrarSesion = async () => {
    setUsuario(null);
    setSessionInfo(null);
  };

  const enviarCodigoVerificacion = async () => {
    setError('Servicio no disponible. Se requiere configurar PostgreSQL.');
  };

  const reenviarVerificacionEmail = async () => {
    setError('Servicio no disponible. Se requiere configurar PostgreSQL.');
  };

  const restablecerContrasena = async () => {
    setError('Servicio no disponible. Se requiere configurar PostgreSQL.');
  };

  const actualizarSesion = async () => {
    // No hace nada
  };

  const checkPermission = () => false;
  const checkRoleLevel = () => false;

  const signInWithGoogle = async () => {
    setError('Autenticación con Google no disponible. Se requiere configurar PostgreSQL.');
    return { needsProfile: false };
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
      {children}
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



























