// src/hooks/useLogin.ts
import { useState } from 'react';
import { useAuth } from '@/context/authcontext';
import { useRouter } from 'next/navigation';

interface FormularioLogin {
  correo: string;
  contrasena: string;
  codigo2FA?: string;
}

export const useLogin = () => {
  const { 
    iniciarSesion, 
    iniciarSesionCon2FA,
    sessionInfo,
    requiere2FA,
    signInWithGoogle  // Añadir esta importación
  } = useAuth();
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const manejarLoginGoogle = async () => {
    try {
      setCargando(true);
      setError(null);
      
      const result = await signInWithGoogle();
      
      if (result.needsProfile) {
        router.push('/config-restaurante');
      } else {
        router.push('/dashboard');
      }
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

      if (requiere2FA && datos.codigo2FA) {
        await iniciarSesionCon2FA(datos.codigo2FA);
      } else {
        await iniciarSesion(datos.correo, datos.contrasena);
      }

      // Si el usuario necesita verificar su email
      if (!sessionInfo?.emailVerified) {
        router.push('/verificar-email');
        return;
      }

      // Redirigir según el estado de configuración
      router.push(
        sessionInfo?.requiresAdditionalInfo 
          ? '/completar-perfil'
          : '/dashboard'
      );

    } catch (err: any) {
      if (err.message.includes('bloqueada')) {
        setError(err.message);
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiados intentos fallidos. Por favor, intente más tarde.');
      } else if (err.code === 'auth/invalid-verification-code') {
        setError('Código de verificación inválido.');
      } else {
        setError('Error al iniciar sesión. Verifica tus credenciales.');
      }
    } finally {
      setCargando(false);
    }
  };

  return {
    cargando,
    error,
    requiere2FA,
    sessionInfo,
    manejarLogin,
    manejarLoginGoogle  
  };
};