// src/app/config-restaurante/ubicacion/hooks/useUbicacion.ts
import { useState, useCallback } from 'react';
import { useToast } from '@/shared/Hooks/use-toast';
import { useConfigStore } from '@/app/config-restaurante/store/config-store';

interface Location {
  lat: number;
  lng: number;
}

// Obtener ID del restaurante actual (por ahora hardcodeado, luego vendrá de auth)
const RESTAURANT_ID = '4073a4ad-b275-4e17-b197-844881f0319e';

export function useUbicacion() {
  const [coordenadas, setCoordenadas] = useState<Location>({
    lat: 4.6097102,
    lng: -74.081749
  });
  const [direccion, setDireccion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const { toast } = useToast();
  const { actualizarCampo } = useConfigStore();

  const cargarUbicacion = useCallback(async () => {
    if (!RESTAURANT_ID) {
      console.log('No hay ID de restaurante');
      return;
    }

    try {
      setCargando(true);
      const response = await fetch(`/api/restaurants/${RESTAURANT_ID}/location`);
      
      if (response.ok) {
        const data = await response.json();
        setCoordenadas(data.coordenadas);
        setDireccion(data.direccion);
        
        // Actualizar store si hay datos
        if (data.direccion) {
          actualizarCampo('/config-restaurante/ubicacion', 'direccion', true);
          actualizarCampo('/config-restaurante/ubicacion', 'ciudad', true);
        }
      } else {
        console.log('No se encontraron datos de ubicación');
      }
    } catch (error) {
      console.error('Error cargando ubicación:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la ubicación guardada',
        variant: 'destructive'
      });
    } finally {
      setCargando(false);
    }
  }, [toast, actualizarCampo]);

  const guardarUbicacion = async (nuevaDireccion: string, nuevasCoordenadas: Location) => {
    if (!RESTAURANT_ID || !nuevaDireccion.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor, selecciona una dirección válida',
        variant: 'destructive'
      });
      return;
    }

    try {
      setGuardando(true);

      const response = await fetch(`/api/restaurants/${RESTAURANT_ID}/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          direccion: nuevaDireccion,
          coordenadas: nuevasCoordenadas
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar la ubicación');
      }

      const data = await response.json();
      
      if (data.success) {
        setDireccion(nuevaDireccion);
        setCoordenadas(nuevasCoordenadas);
        
        // Actualizar store
        actualizarCampo('/config-restaurante/ubicacion', 'direccion', true);
        actualizarCampo('/config-restaurante/ubicacion', 'ciudad', true);

        toast({
          title: 'Éxito',
          description: 'Ubicación guardada correctamente'
        });
      }
    } catch (error) {
      console.error('Error guardando ubicación:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al guardar la ubicación',
        variant: 'destructive'
      });
    } finally {
      setGuardando(false);
    }
  };

  const actualizarCoordenadas = async (nuevasCoordenadas: Location) => {
    if (!RESTAURANT_ID) {
      toast({
        title: 'Error',
        description: 'ID de restaurante no válido',
        variant: 'destructive'
      });
      return;
    }

    try {
      setGuardando(true);
      
      const response = await fetch(`/api/restaurants/${RESTAURANT_ID}/location`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordenadas: nuevasCoordenadas
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar las coordenadas');
      }

      const data = await response.json();
      
      if (data.success) {
        setCoordenadas(nuevasCoordenadas);
        
        toast({
          title: 'Éxito',
          description: 'Coordenadas actualizadas correctamente'
        });
      }
    } catch (error) {
      console.error('Error actualizando coordenadas:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al actualizar las coordenadas',
        variant: 'destructive'
      });
    } finally {
      setGuardando(false);
    }
  };

  return {
    coordenadas,
    direccion,
    guardando,
    cargando,
    cargarUbicacion,
    guardarUbicacion,
    actualizarCoordenadas,
    setDireccion
  };
}
