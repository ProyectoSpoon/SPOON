// Mock de autenticación para reemplazar Firebase Auth
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Tipo de usuario simulado
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// Contexto de autenticación
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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

  // Simular la carga inicial del usuario
  useEffect(() => {
    // En desarrollo, simular un usuario autenticado
    const mockUser: User = {
      uid: 'dev-user-123',
      email: 'dev@example.com',
      displayName: 'Developer User'
    };
    
    setUser(mockUser);
    setLoading(false);
  }, []);

  // Función de inicio de sesión simulada
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular una verificación de credenciales
      if (email === 'dev@example.com' && password === 'password') {
        const mockUser: User = {
          uid: 'dev-user-123',
          email: email,
          displayName: 'Developer User'
        };
        
        setUser(mockUser);
      } else {
        throw new Error('Credenciales inválidas');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Función de cierre de sesión simulada
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular cierre de sesión
      setUser(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;



























