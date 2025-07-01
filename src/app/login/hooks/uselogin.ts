// src/hooks/useLogin.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FormularioLogin {
  correo: string;
  contrasena: string;
  codigo2FA?: string;
}

export const useLogin = () => {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiere2FA, setRequiere2FA] = useState(false);

  const manejarLoginGoogle = async () => {
    try {
      setCargando(true);
      setError(null);
      
      console.log('Simulando login con Google...');
      
      // Simular delay de autenticación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular éxito y redirección
      router.push('/dashboard');
      
    } catch (err: any) {
      console.error('Error en login con Google:', err);
      setError(err.message || 'Error al iniciar sesión con Google');
    } finally {
      setCargando(false);
    }
  };

  const manejarLogin = async (datos: FormularioLogin) => {
    try {
      setCargando(true);
      setError(null);

      console.log('Simulando login con email/password:', datos.correo);
      
      // Simular delay de autenticación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular validación básica
      if (!datos.correo || !datos.contrasena) {
        throw new Error('Email y contraseña son requeridos');
      }
      
      if (datos.correo === 'admin@spoon.com' && datos.contrasena === 'admin123') {
        // Simular éxito y redirección
        router.push('/dashboard');
      } else {
        throw new Error('Credenciales incorrectas');
      }

    } catch (err: any) {
      console.error('Error en login:', err);
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setCargando(false);
    }
  };

  return {
    cargando,
    error,
    requiere2FA,
    sessionInfo: null,
    manejarLogin,
    manejarLoginGoogle  
  };
};
