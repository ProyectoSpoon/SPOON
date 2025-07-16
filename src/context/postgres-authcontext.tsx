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
  restaurantId?: string; // ← YA EXISTE
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
  refreshAuth: () => Promise<void>; // Nuevo método para refrescar
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
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
        
        const token = localStorage.getItem('auth_token');
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
            setLoading(false);
            return;
          }

          // Obtener restaurant_id
          const restaurantId = await getRestaurantId(payload.userId, token);

          // Configurar usuario desde token válido
          const userData: User = {
            uid: payload.userId,
            email: payload.email,
            displayName: payload.firstName && payload.lastName 
              ? `${payload.firstName} ${payload.lastName}` 
              : payload.email,
            role: payload.role,
            permissions: payload.permissions || [],
            emailVerified: true, // Asumimos verificado si tiene token válido
            restaurantId: restaurantId,
            isActive: true,
            lastLogin: new Date()
          };
          
          setUser(userData);
          console.log('✅ Sesión restaurada desde token válido');
          
        } catch (tokenError) {
          console.error('Token inválido:', tokenError);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
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

      // Guardar tokens
      localStorage.setItem('auth_token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken);
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
        emailVerified: true, // Si llegó hasta aquí, está verificado
        restaurantId: restaurantId,
        isActive: true,
        lastLogin: new Date()
      };
      
      setUser(userData);
      console.log('✅ Login exitoso con PostgreSQL');
      console.log('🏪 Restaurant ID:', restaurantId);
      
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
      const token = localStorage.getItem('auth_token');
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
      
      // Limpiar estado local
      setUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      
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
      
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      const restaurantId = await getRestaurantId(payload.userId, token);
      
      if (user && restaurantId !== user.restaurantId) {
        setUser(prev => prev ? { ...prev, restaurantId } : null);
      }
      
    } catch (error) {
      console.error('Error refrescando auth:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    signInWithGoogle,
    refreshAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};