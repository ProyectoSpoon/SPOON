// Archivo simplificado para evitar dependencias y errores de tipos

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  restaurantId?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: string;
}

// Simulación de funciones de autenticación
export async function authenticateUser(credentials: LoginCredentials): Promise<AuthUser | null> {
  try {
    console.log('Simulando autenticación para:', credentials.email);
    
    // Simular delay de autenticación
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Usuario de ejemplo para testing
    if (credentials.email === 'admin@spoon.com' && credentials.password === 'admin123') {
      return {
        id: 'user_1',
        email: credentials.email,
        name: 'Administrador SPOON',
        role: 'admin',
        permissions: ['read', 'write', 'delete', 'manage'],
        isActive: true,
        emailVerified: true,
        lastLogin: new Date()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error en autenticación:', error);
    return null;
  }
}

export async function registerUser(userData: RegisterData): Promise<AuthUser | null> {
  try {
    console.log('Simulando registro para:', userData.email);
    
    // Simular delay de registro
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser: AuthUser = {
      id: `user_${Date.now()}`,
      email: userData.email,
      name: userData.name,
      role: userData.role || 'owner',
      permissions: ['read', 'write'],
      isActive: true,
      emailVerified: false
    };
    
    return newUser;
  } catch (error) {
    console.error('Error en registro:', error);
    return null;
  }
}

export async function generateToken(user: AuthUser): Promise<string> {
  // Simulación de generación de token
  const tokenData = {
    userId: user.id,
    email: user.email,
    role: user.role,
    timestamp: Date.now()
  };
  
  // En lugar de JWT real, usar una simulación
  return btoa(JSON.stringify(tokenData));
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    // Simulación de verificación de token
    const decoded = JSON.parse(atob(token));
    
    // Verificar que el token no sea muy antiguo (24 horas)
    const tokenAge = Date.now() - decoded.timestamp;
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return null;
    }
    
    // Retornar usuario simulado
    return {
      id: decoded.userId,
      email: decoded.email,
      name: 'Usuario Simulado',
      role: decoded.role,
      permissions: ['read', 'write'],
      isActive: true,
      emailVerified: true
    };
  } catch (error) {
    console.error('Error verificando token:', error);
    return null;
  }
}

export async function getUserById(userId: string): Promise<AuthUser | null> {
  try {
    console.log('Simulando búsqueda de usuario:', userId);
    
    // Simular delay de búsqueda
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Usuario de ejemplo
    return {
      id: userId,
      email: 'usuario@spoon.com',
      name: 'Usuario Ejemplo',
      role: 'owner',
      permissions: ['read', 'write'],
      isActive: true,
      emailVerified: true
    };
  } catch (error) {
    console.error('Error buscando usuario:', error);
    return null;
  }
}

export async function updateUserLastLogin(userId: string): Promise<void> {
  try {
    console.log('Simulando actualización de último login:', userId);
    // Simular actualización
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (error) {
    console.error('Error actualizando último login:', error);
  }
}
