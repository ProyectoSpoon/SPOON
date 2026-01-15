// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';

interface AuthContextData {
  userId: string;
  restaurantId: string;
  loading: boolean;
  error: string | null;
}

export function useAuth(): AuthContextData {
  const [userId, setUserId] = useState<string>('11111111-2222-3333-4444-555555555555'); // Hardcoded por ahora
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const obtenerDatosAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // 🔑 OBTENER TOKEN DE LAS COOKIES
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('authToken='))
          ?.split('=')[1];

        if (!token) {
          console.log('⚠️ No hay token de autenticación');
          setRestaurantId('');
          setUserId('');
          return;
        }

        // 🔥 OBTENER RESTAURANT ID DEL USUARIO ACTUAL CON TOKEN
        const response = await fetch('/api/auth/current-user/restaurant', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.restaurantId) {
          setRestaurantId(data.restaurantId);
          console.log('🏦 Restaurant ID obtenido:', data.restaurantId);
        } else {
          throw new Error('No se encontró restaurant ID para el usuario');
        }

      } catch (err) {
        console.error('❌ Error obteniendo datos de autenticación:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        
        // 🔥 FALLBACK: Usar restaurant ID por defecto para desarrollo
        setRestaurantId('11111111-2222-3333-4444-555555555555');
        console.log('⚠️ Usando restaurant ID por defecto para desarrollo');
      } finally {
        setLoading(false);
      }
    };

    obtenerDatosAuth();
  }, []);

  return {
    userId,
    restaurantId,
    loading,
    error
  };
}
