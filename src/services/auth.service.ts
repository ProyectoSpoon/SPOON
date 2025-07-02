// src/services/auth.service.ts
export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    isNewUser?: boolean;
    permissions?: string[];
  };
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleAuthRequest {
  token: string;
}

export class AuthService {
  private static readonly BASE_URL = '/api/auth';

  /**
   * Iniciar sesión con email y contraseña
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error en el servidor');
      }

      return data;
    } catch (error) {
      console.error('Error en AuthService.login:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Iniciar sesión con Google OAuth
   */
  static async googleSignIn(googleToken: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: googleToken }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error en autenticación con Google');
      }

      return data;
    } catch (error) {
      console.error('Error en AuthService.googleSignIn:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en autenticación con Google'
      };
    }
  }

  /**
   * Cerrar sesión
   */
  static async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en AuthService.logout:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al cerrar sesión'
      };
    }
  }

  /**
   * Verificar token JWT
   */
  static async verifyToken(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Token inválido');
      }

      return data;
    } catch (error) {
      console.error('Error en AuthService.verifyToken:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al verificar token'
      };
    }
  }

  /**
   * Renovar token JWT
   */
  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al renovar token');
      }

      return data;
    } catch (error) {
      console.error('Error en AuthService.refreshToken:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al renovar token'
      };
    }
  }
}
