// src/context/postgres-authcontext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  permissions: string[];
  emailVerified: boolean;
  restaurantId?: string;
  isActive: boolean;
  lastLogin?: Date;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateRestaurantId: (restaurantId: string) => void; // ← NUEVO
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Helper functions para manejo de cookies
const setCookie = (name: string, value: string, days: number = 1) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener restaurant_id del usuario
  const getRestaurantId = async (userId: string, token: string): Promise<string | undefined> => {
    try {
      const response = await fetch('/api/auth/current-user/restaurant', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.restaurantId;
      }
      
      console.log('Usuario sin restaurante asignado');
      return undefined;
    } catch (error) {
      console.error('Error obteniendo restaurant_id:', error);
      return undefined;
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('🔍 Verificando sesión existente...');
        
        // Buscar token en localStorage primero, luego en cookies
        let token = localStorage.getItem('auth_token');
        if (!token) {
          token = getCookie('auth-token');
        }
        
        if (!token) {
          setLoading(false);
          return;
        }

        // Verificar validez del token
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          
          // Verificar si el token ha expirado
          if (payload.exp * 1000 < Date.now()) {
            console.log('Token expirado, removiendo...');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            deleteCookie('auth-token');
            deleteCookie('user-info');
            setLoading(false);
            return;
          }

          // No obtener restaurant_id automáticamente al restaurar sesión
          // Esto se hará solo cuando sea necesario (en login o cuando se solicite)
          
          // Configurar usuario desde token válido
          const userData: User = {
            uid: payload.userId,
            email: payload.email,
            displayName: payload.firstName && payload.lastName 
              ? `${payload.firstName} ${payload.lastName}` 
              : payload.email,
            role: payload.role,
            permissions: payload.permissions || [],
            emailVerified: true,
            restaurantId: (() => {
              const userInfoCookie = getCookie('user-info');
              if (userInfoCookie) {
                try {
                  const userInfo = JSON.parse(userInfoCookie);
                  console.log('🏪 Restaurante desde cookie:', userInfo.restaurantId);
                  return userInfo.restaurantId;
                } catch (e) {
                  console.error('Error parsing user-info cookie:', e);
                }
              }
              return undefined;
            })(),
            isActive: true,
            lastLogin: new Date()
          };
          
          setUser(userData);
          console.log('✅ Sesión restaurada desde token válido');
          
          // Sincronizar token en ambos lugares si solo estaba en uno
          if (!localStorage.getItem('auth_token')) {
            localStorage.setItem('auth_token', token);
          }
          if (!getCookie('auth-token')) {
            setCookie('auth-token', token);
          }
          
        } catch (tokenError) {
          console.error('Token inválido:', tokenError);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          deleteCookie('auth-token');
          deleteCookie('user-info');
        }
        
      } catch (err) {
        console.error('❌ Error verificando sesión:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 Iniciando login para:', email);
      
      // Llamar a la API real de login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      if (!data.success) {
        throw new Error(data.error || 'Credenciales incorrectas');
      }

      // Guardar tokens en localStorage
      localStorage.setItem('auth_token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken);
      }

      // ✅ NUEVO: Guardar tokens en cookies para el middleware
      setCookie('auth-token', data.token);
      if (data.refreshToken) {
        setCookie('refresh-token', data.refreshToken);
      }

      // Obtener restaurant_id del usuario
      const restaurantId = await getRestaurantId(data.user.id, data.token);

      // Configurar usuario con datos reales de PostgreSQL
      const userData: User = {
        uid: data.user.id,
        email: data.user.email,
        displayName: data.user.firstName && data.user.lastName 
          ? `${data.user.firstName} ${data.user.lastName}` 
          : data.user.email,
        role: data.user.role,
        permissions: data.user.permissions || [],
        emailVerified: true,
        restaurantId: restaurantId,
        isActive: true,
        lastLogin: new Date()
      };
      
      // ✅ NUEVO: Guardar info del usuario en cookie para el middleware
      setCookie('user-info', JSON.stringify({
        uid: userData.uid,
        email: userData.email,
        role: userData.role,
        permissions: userData.permissions,
        restaurantId: userData.restaurantId
      }));
      
      setUser(userData);
      console.log('✅ Login exitoso con PostgreSQL');
      console.log('🏪 Restaurant ID:', restaurantId);
      
      // Nota: La redirección se maneja en el componente de login
      // No redirigir automáticamente desde el contexto
      
    } catch (err: any) {
      console.error('❌ Error en login:', err);
      setError(err.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 Iniciando login con Google...');
      
      // Redirigir a la API de Google OAuth
      window.location.href = '/api/auth/google';
      
    } catch (err: any) {
      console.error('❌ Error en login con Google:', err);
      setError(err.message || 'Error al iniciar sesión con Google');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      console.log('🚪 Cerrando sesión...');
      
      // Opcional: Notificar al servidor del logout
      const token = localStorage.getItem('auth_token') || getCookie('auth-token');
      if (token) {
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (logoutError) {
          console.log('Error notificando logout al servidor:', logoutError);
        }
      }
      
      // ✅ ACTUALIZADO: Limpiar estado local Y cookies
      setUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      deleteCookie('auth-token');
      deleteCookie('refresh-token');
      deleteCookie('user-info');
      
      console.log('✅ Logout exitoso');
      
    } catch (err: any) {
      console.error('❌ Error en logout:', err);
      setError(err.message || 'Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  };

  const refreshAuth = async () => {
    try {
      console.log('🔄 Refrescando autenticación...');
      
      const token = localStorage.getItem('auth_token') || getCookie('auth-token');
      if (!token) return;
      
      // Solo refrescar si es necesario, no hacer verificaciones automáticas
      console.log('✅ Auth refresh completado (sin verificaciones automáticas)');
      
    } catch (error) {
      console.error('Error refrescando auth:', error);
    }
  };

  // ✅ NUEVA FUNCIÓN: Actualizar restaurantId sin recargar página
  const updateRestaurantId = (restaurantId: string) => {
    console.log('🏪 Actualizando restaurantId en contexto:', restaurantId);
    
    setUser(prevUser => prevUser ? {
      ...prevUser,
      restaurantId: restaurantId
    } : null);
    
    // Actualizar cookie también para mantener sincronización
    if (user) {
      const currentUserInfo = getCookie('user-info');
      if (currentUserInfo) {
        try {
          const userInfo = JSON.parse(currentUserInfo);
          setCookie('user-info', JSON.stringify({
            ...userInfo,
            restaurantId: restaurantId
          }));
        } catch (error) {
          console.error('Error actualizando cookie user-info:', error);
        }
      }
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    signInWithGoogle,
    refreshAuth,
    updateRestaurantId // ← NUEVO
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};