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

  useEffect(() => {
    // Simular verificación de sesión existente
    const checkSession = async () => {
      try {
        console.log('Verificando sesión existente...');
        
        // Simular delay de verificación
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verificar si hay un token guardado
        const token = localStorage.getItem('auth_token');
        if (token) {
          // Simular usuario autenticado
          setUser({
            uid: 'user_1',
            email: 'admin@spoon.com',
            displayName: 'Administrador SPOON',
            role: 'admin',
            permissions: ['read', 'write', 'delete', 'manage'],
            emailVerified: true,
            isActive: true,
            lastLogin: new Date()
          });
        }
      } catch (err) {
        console.error('Error verificando sesión:', err);
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
      
      console.log('Simulando login:', email);
      
      // Simular delay de autenticación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular validación
      if (email === 'admin@spoon.com' && password === 'admin123') {
        const userData: User = {
          uid: 'user_1',
          email: email,
          displayName: 'Administrador SPOON',
          role: 'admin',
          permissions: ['read', 'write', 'delete', 'manage'],
          emailVerified: true,
          isActive: true,
          lastLogin: new Date()
        };
        
        setUser(userData);
        localStorage.setItem('auth_token', 'simulated_token');
        console.log('Login exitoso (simulación)');
      } else {
        throw new Error('Credenciales incorrectas');
      }
    } catch (err: any) {
      console.error('Error en login:', err);
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
      
      console.log('Simulando login con Google...');
      
      // Simular delay de autenticación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData: User = {
        uid: 'user_google',
        email: 'usuario@gmail.com',
        displayName: 'Usuario Google',
        role: 'owner',
        permissions: ['read', 'write'],
        emailVerified: true,
        isActive: true,
        lastLogin: new Date()
      };
      
      setUser(userData);
      localStorage.setItem('auth_token', 'simulated_google_token');
      console.log('Login con Google exitoso (simulación)');
    } catch (err: any) {
      console.error('Error en login con Google:', err);
      setError(err.message || 'Error al iniciar sesión con Google');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      console.log('Simulando logout...');
      
      // Simular delay de logout
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setUser(null);
      localStorage.removeItem('auth_token');
      console.log('Logout exitoso (simulación)');
    } catch (err: any) {
      console.error('Error en logout:', err);
      setError(err.message || 'Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    signInWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
