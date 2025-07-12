// /shared/hooks/horarios/usar-gestor-horarios.ts
import { useState, useCallback } from 'react';
import { 
  RangoHorario, 
  ConfiguracionHorario, 
  DiaSemana 
} from '@/shared/types/horarios';
import { ServicioHorarios } from '@/shared/services/horarios/servicio-horarios';
import { ValidadorHorarios } from '@/shared/services/horarios/validador-horarios';
import { toast } from 'sonner';

export function usarGestorHorarios(restauranteId: string) {
  const [configuracion, setConfiguracion] = useState<ConfiguracionHorario | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarConfiguracion = useCallback(async () => {
    try {
      setCargando(true);
      const config = await ServicioHorarios.obtenerConfiguracion(restauranteId);
      setConfiguracion(config);
    } catch (error) {
      setError('Error al cargar la configuración de horarios');
      console.error(error);
    } finally {
      setCargando(false);
    }
  }, [restauranteId]);

  const actualizarRangosHorarios = useCallback(async (
    dia: DiaSemana,
    nuevosRangos: RangoHorario[]
  ) => {
    if (!configuracion) return;

    const validacion = ValidadorHorarios.validarSuperposicion(nuevosRangos);
    if (!validacion.valido) {
      toast.error('Hay horarios superpuestos');
      return;
    }

    try {
      const nuevaConfig = {
        ...configuracion,
        horariosPorDefecto: {
          ...configuracion.horariosPorDefecto,
          [dia]: nuevosRangos
        }
      };

      await ServicioHorarios.guardarConfiguracion(restauranteId, nuevaConfig);
      setConfiguracion(nuevaConfig);
      toast.success('Horarios actualizados');
    } catch (error) {
      toast.error('Error al actualizar los horarios');
      console.error(error);
    }
  }, [configuracion, restauranteId]);

  return {
    configuracion,
    cargando,
    error,
    cargarConfiguracion,
    actualizarRangosHorarios
  };
}
