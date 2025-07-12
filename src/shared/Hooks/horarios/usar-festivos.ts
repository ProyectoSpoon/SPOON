// /shared/hooks/horarios/usar-festivos.ts
import { useState, useCallback } from 'react';
import { Festivo, ConfiguracionFestivos } from '@/shared/types/horarios';
import { ServicioFestivos } from '@/shared/services/horarios/servicio-festivos';
import { toast } from 'sonner';

export function usarFestivos(restauranteId: string) {
  const [configuracion, setConfiguracion] = useState<ConfiguracionFestivos | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarFestivos = useCallback(async (año: number) => {
    try {
      setCargando(true);
      const config = await ServicioFestivos.obtenerFestivos(restauranteId, año);
      setConfiguracion(config);
    } catch (error) {
      setError('Error al cargar los festivos');
      console.error(error);
    } finally {
      setCargando(false);
    }
  }, [restauranteId]);

  const agregarFestivo = useCallback(async (festivo: Omit<Festivo, 'id'>) => {
    try {
      await ServicioFestivos.agregarFestivo(restauranteId, festivo);
      await cargarFestivos(new Date().getFullYear());
      toast.success('Festivo agregado correctamente');
    } catch (error) {
      toast.error('Error al agregar el festivo');
      console.error(error);
    }
  }, [restauranteId, cargarFestivos]);

  return {
    configuracion,
    cargando,
    error,
    cargarFestivos,
    agregarFestivo
  };
}
