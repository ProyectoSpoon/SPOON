'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RestaurantCheckResult {
  hasRestaurant: boolean;
  loading: boolean;
  restaurantId: string | null;
  error: string | null;
}

export function useRestaurantCheck(): RestaurantCheckResult {
  const [hasRestaurant, setHasRestaurant] = useState(false);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkRestaurant = async () => {
      try {
        console.log('🔍 Verificando si el usuario tiene restaurante...');
        
        const response = await fetch('/api/auth/current-user/restaurant', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (response.status === 404) {
          // Usuario no tiene restaurante
          console.log('❌ Usuario no tiene restaurante configurado');
          setHasRestaurant(false);
          setRestaurantId(null);
          setError('No tiene restaurante configurado');
          
          // Redirigir a config-restaurante después de un breve delay
          setTimeout(() => {
            console.log('🔄 Redirigiendo a configuración de restaurante...');
            router.push('/config-restaurante');
          }, 2000);
          
        } else if (response.ok) {
          // Usuario tiene restaurante
          const data = await response.json();
          console.log('✅ Usuario tiene restaurante:', data.restaurant?.name);
          setHasRestaurant(true);
          setRestaurantId(data.restaurant?.id || null);
          setError(null);
          
        } else {
          // Error en la respuesta
          console.error('❌ Error al verificar restaurante:', response.status);
          setError('Error al verificar restaurante');
          setHasRestaurant(false);
          setRestaurantId(null);
        }
        
      } catch (err) {
        console.error('❌ Error en verificación de restaurante:', err);
        setError('Error de conexión');
        setHasRestaurant(false);
        setRestaurantId(null);
      } finally {
        setLoading(false);
      }
    };

    checkRestaurant();
  }, [router]);

  return {
    hasRestaurant,
    loading,
    restaurantId,
    error
  };
}
