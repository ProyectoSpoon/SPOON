import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface HorarioConfig {
  dias: {
    [key: string]: {
      activo: boolean; // Si el día está habilitado
      apertura: string; // "08:00"
      cierre: string; // "22:00"
    };
  };
  festivos: boolean; // Si abre festivos
}

export const useGestorHorarios = (configInicial?: HorarioConfig) => {
  const [config, setConfig] = useState<HorarioConfig>(configInicial || {
    dias: {
      lunes: { activo: true, apertura: '08:00', cierre: '20:00' },
      martes: { activo: true, apertura: '08:00', cierre: '20:00' },
      miercoles: { activo: true, apertura: '08:00', cierre: '20:00' },
      jueves: { activo: true, apertura: '08:00', cierre: '20:00' },
      viernes: { activo: true, apertura: '08:00', cierre: '22:00' },
      sabado: { activo: true, apertura: '09:00', cierre: '22:00' },
      domingo: { activo: true, apertura: '09:00', cierre: '18:00' },
    },
    festivos: true
  });

  const actualizarDia = useCallback((dia: string, nuevoEstado: Partial<HorarioConfig['dias'][string]>) => {
    setConfig(prev => ({
      ...prev,
      dias: {
        ...prev.dias,
        [dia]: { ...prev.dias[dia], ...nuevoEstado }
      }
    }));
  }, []);

  const guardarCambios = async () => {
    try {
      // Aquí iría la llamada al backend
      console.log('Guardando configuración de horarios:', config);
      toast.success('Horarios actualizados correctamente');
      return true;
    } catch (error) {
      console.error('Error guardando horarios:', error);
      toast.error('Error al guardar horarios');
      return false;
    }
  };

  return {
    config,
    actualizarDia,
    guardarCambios,
    setConfig
  };
};

/**
 * @deprecated Use useGestorHorarios instead
 */
export const usarGestorHorarios = useGestorHorarios;
