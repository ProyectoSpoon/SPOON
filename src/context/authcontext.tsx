'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Tipo de usuario actualizado para PostgreSQL con permisos
interface User {
  uid: string;              // Para mantener compatibilidad (mapea a id)
  id: string;               // ID real de PostgreSQL
  email: string;
  displayName: string;      // Para mantener compatibilidad (mapea a first_name + last_name)
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  status: string;
  email_verified: boolean;
  permissions: string[];    // ← NUEVO: Añadir permisos al usuario
}

// Datos para registro
interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
}

// Contexto de autenticación
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | null>(null);

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Proveedor de autenticación
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar token al inicializar
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Función para obtener permisos del JWT
  const extractPermissionsFromJWT = (token: string): string[] => {
    try {
      const payload = token.split('.')[1];
      if (payload) {
        const jwtData = JSON.parse(atob(payload));
        return jwtData.permissions || [];
      }
    } catch (error) {
      console.error('❌ Error extrayendo permisos del JWT:', error);
    }
    return [];
  };

  // Función para obtener permisos basados en rol (fallback)
  const getPermissionsByRole = (role: string): string[] => {
    const roleMap: { [key: string]: string[] } = {
      'super_admin': [
        'MENU_READ', 'MENU_WRITE', 
        'SETTINGS_READ', 'SETTINGS_WRITE',
        'USERS_READ', 'USERS_WRITE',
        'ORDERS_READ', 'ORDERS_WRITE',
        'REPORTS_READ'
      ],
      'admin': [
        'MENU_READ', 'MENU_WRITE', 
        'SETTINGS_READ', 'ORDERS_READ', 'REPORTS_READ'
      ],
      'staff': [
        'MENU_READ', 'ORDERS_READ'
      ]
    };

    return roleMap[role] || ['MENU_READ'];
  };

  // Función para mapear usuario de DB a nuestro formato
  const mapUserFromDB = (dbUser: any, permissions: string[] = []): User => {
    return {
      uid: dbUser.id,                                           // Compatibilidad
      id: dbUser.id,
      email: dbUser.email,
      displayName: `${dbUser.first_name} ${dbUser.last_name}`, // Compatibilidad
      first_name: dbUser.first_name,
      last_name: dbUser.last_name,
      phone: dbUser.phone,
      role: dbUser.role,
      status: dbUser.status,
      email_verified: dbUser.email_verified,
      permissions: permissions.length > 0 ? permissions : getPermissionsByRole(dbUser.role) // ← NUEVO
    };
  };

  // Función de inicio de sesión con PostgreSQL
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 Iniciando login para:', email);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const errorMessage = errorData?.message || errorData?.error || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Datos recibidos del login:', {
        success: data.success,
        hasToken: !!data.token,
        hasUser: !!data.user,
        userEmail: data.user?.email,
        permissionsFromAPI: data.permissions
      });
      
      // Guardar token en localStorage
      localStorage.setItem('auth_token', data.token);
      
      // NUEVO: Extraer permisos del JWT si no vienen en la respuesta
      let effectivePermissions = data.permissions || [];
      if (!effectivePermissions || effectivePermissions.length === 0) {
        effectivePermissions = extractPermissionsFromJWT(data.token);
        console.log('🔑 Permisos extraídos del JWT:', effectivePermissions);
      }
      
      // Si aún no hay permisos, usar los del rol
      if (!effectivePermissions || effectivePermissions.length === 0) {
        effectivePermissions = getPermissionsByRole(data.user.role);
        console.log('👑 Permisos asignados por rol:', effectivePermissions);
      }
      
      // Guardar token en cookies para el middleware
      const cookieMaxAge = 7 * 24 * 60 * 60; // 7 días en segundos
      document.cookie = `auth-token=${data.token}; path=/; max-age=${cookieMaxAge}; secure; samesite=strict`;
      
      // NUEVO: Preparar info del usuario con permisos CORRECTOS para el middleware
      const userInfoForCookie = {
        uid: data.user.id,  // ← Añadir uid para compatibilidad
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        permissions: effectivePermissions // ← Usar permisos efectivos
      };
      
      // Guardar info del usuario en cookies para el middleware
      document.cookie = `user-info=${encodeURIComponent(JSON.stringify(userInfoForCookie))}; path=/; max-age=${cookieMaxAge}; secure; samesite=strict`;
      console.log('🍪 Info de usuario guardada en cookies:', userInfoForCookie);
      
      // Mapear y establecer usuario en el estado CON PERMISOS
      const mappedUser = mapUserFromDB(data.user, effectivePermissions);
      setUser(mappedUser);
      console.log('✅ Usuario establecido con permisos:', {
        email: mappedUser.email,
        role: mappedUser.role,
        permissions: mappedUser.permissions
      });
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al iniciar sesión';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función de registro con PostgreSQL
  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la cuenta');
      }

      const data = await response.json();
      
      // Guardar token (auto-login después del registro)
      localStorage.setItem('auth_token', data.token);
      
      // Obtener permisos
      const permissions = data.permissions || getPermissionsByRole(data.user.role);
      
      // Mapear y establecer usuario
      const mappedUser = mapUserFromDB(data.user, permissions);
      setUser(mappedUser);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar datos del usuario
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      // NUEVO: Intentar extraer permisos del token primero
      const permissionsFromToken = extractPermissionsFromJWT(token);

      const response = await fetch('/api/auth/current-user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Usar permisos del token o de la respuesta
        const permissions = data.permissions || permissionsFromToken || getPermissionsByRole(data.user.role);
        
        const mappedUser = mapUserFromDB(data.user, permissions);
        setUser(mappedUser);
        
        console.log('🔄 Usuario refrescado con permisos:', {
          email: mappedUser.email,
          permissions: mappedUser.permissions
        });
      } else {
        // Token inválido, limpiar
        logout();
      }
    } catch (error) {
      console.error('Error al verificar usuario:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // NUEVO: Función de logout mejorada
  const logout = async () => {
    try {
      // Limpiar localStorage
      localStorage.removeItem('auth_token');
      
      // Limpiar cookies
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'user-info=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Limpiar estado
      setUser(null);
      setError(null);
      
      console.log('✅ Logout completado');
      
      // Redirigir al login
      window.location.href = '/login';
    } catch (error) {
      console.error('❌ Error en logout:', error);
    }
  };

  // NUEVO: Funciones de verificación de permisos
  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user?.permissions) return false;
    return permissions.some(permission => user.permissions.includes(permission));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      register,
      logout,
      refreshUser,
      hasPermission,     // ← NUEVO
      hasAnyPermission   // ← NUEVO
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;