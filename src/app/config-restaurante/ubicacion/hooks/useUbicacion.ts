// src/app/config-restaurante/ubicacion/hooks/useUbicacion.ts
import { useState, useCallback } from 'react';
import { useToast } from '@/shared/Hooks/use-toast';
import { useConfigStore } from '@/app/config-restaurante/store/config-store';

interface Location {
  lat: number;
  lng: number;
}

export function useUbicacion() {
  const [coordenadas, setCoordenadas] = useState<Location>({
    lat: 4.6097102, // Bogotá por defecto
    lng: -74.081749
  });
  const [direccion, setDireccion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(false);
  
  const { toast } = useToast();
  const { actualizarCampo } = useConfigStore();

  // Simular carga de ubicación (sin API real)
  const cargarUbicacion = useCallback(async () => {
    try {
      setCargando(true);
      // Por ahora usamos datos mockeados
      const ubicacionMock = {
        direccion: "Carrera 15 #85-32, Chapinero",
        coordenadas: { lat: 4.6097102, lng: -74.081749 }
      };
      
      setCoordenadas(ubicacionMock.coordenadas);
      setDireccion(ubicacionMock.direccion);
      
      // Actualizar store - COINCIDIR con campos definidos
      actualizarCampo('/config-restaurante/ubicacion', 'direccion', true);
      actualizarCampo('/config-restaurante/ubicacion', 'ciudad', true);
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  }, [toast, actualizarCampo]);

  const guardarUbicacion = async (nuevaDireccion: string, nuevasCoordenadas: Location) => {
    if (!nuevaDireccion.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor, selecciona una dirección válida',
        variant: 'destructive'
      });
      return;
    }

    try {
      setGuardando(true);
      
      // Simular guardado exitoso
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDireccion(nuevaDireccion);
      setCoordenadas(nuevasCoordenadas);
      
      // Actualizar store como completado
      actualizarCampo('/config-restaurante/ubicacion', 'direccion', true);
      actualizarCampo('/config-restaurante/ubicacion', 'ciudad', true);

      toast({
        title: 'Éxito',
        description: 'Ubicación guardada correctamente'
      });
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Error al guardar la ubicación',
        variant: 'destructive'
      });
    } finally {
      setGuardando(false);
    }
  };

  const actualizarCoordenadas = async (nuevasCoordenadas: Location) => {
    try {
      setGuardando(true);
      setCoordenadas(nuevasCoordenadas);
      toast({
        title: 'Éxito',
        description: 'Posición actualizada correctamente'
      });
    } catch (error) {
      console.error('Error:', error);
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