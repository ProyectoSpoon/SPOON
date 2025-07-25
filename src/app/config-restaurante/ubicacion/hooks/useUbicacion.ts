// src/app/config-restaurante/ubicacion/hooks/useUbicacion.ts
import { useState, useCallback } from 'react';
import { useToast } from '@/shared/Hooks/use-toast';
import { useConfigStore } from '@/app/config-restaurante/store/config-store';
import { useAuth } from '@/context/authcontext';

interface Location {
  lat: number;
  lng: number;
}

export function useUbicacion(restaurantId: string) {
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
    if (!restaurantId) {
      console.log('No hay ID de restaurante');
      return;
    }

    try {
      setCargando(true);
      const response = await fetch(`/api/restaurants/${restaurantId}/location`);
      
      if (response.ok) {
        const ubicacionGuardada = await response.json();
        setCoordenadas(ubicacionGuardada.coordenadas);
        setDireccion(ubicacionGuardada.direccion);
        actualizarCampo('ubicacion', 'direccion', true);
        actualizarCampo('ubicacion', 'coordenadas', true);
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
  }, [restaurantId, toast, actualizarCampo]);

  const guardarUbicacion = async (nuevaDireccion: string, nuevasCoordenadas: Location) => {
    if (!restaurantId || !nuevaDireccion.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor, selecciona una dirección válida',
        variant: 'destructive'
      });
      return;
    }

    try {
      setGuardando(true);

      const response = await fetch(`/api/restaurants/${restaurantId}/location`, {
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
        throw new Error('Error al guardar la ubicación');
      }

      setDireccion(nuevaDireccion);
      setCoordenadas(nuevasCoordenadas);
      actualizarCampo('ubicacion', 'direccion', true);
      actualizarCampo('ubicacion', 'coordenadas', true);

      toast({
        title: 'Éxito',
        description: 'Ubicación guardada correctamente'
      });
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
    if (!restaurantId) {
      toast({
        title: 'Error',
        description: 'ID de restaurante no válido',
        variant: 'destructive'
      });
      return;
    }

    try {
      setGuardando(true);
      
      const response = await fetch(`/api/restaurants/${restaurantId}/location`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordenadas: nuevasCoordenadas
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar las coordenadas');
      }

      setCoordenadas(nuevasCoordenadas);
      actualizarCampo('ubicacion', 'coordenadas', true);

      toast({
        title: 'Éxito',
        description: 'Coordenadas actualizadas correctamente'
      });
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
