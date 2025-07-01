// src/app/dashboard/carta/hooks/useHorarios.ts
import { useState, useCallback } from 'react';
import { Horario, RangoHorario } from '../types/menu.types';

interface UseHorariosProps {
  categoriaId: string;
  restauranteId: string;
}

export function useHorarios({ categoriaId, restauranteId }: UseHorariosProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actualizarHorarios = useCallback(async (horarios: Horario) => {
    setLoading(true);
    setError(null);
    try {
      // Simulación de actualización de horarios
      console.log('Simulando actualización de horarios para categoría:', categoriaId);
      console.log('Horarios a actualizar:', horarios);
      
      // En una implementación real, aquí se actualizaría la base de datos
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay
      
      console.log('Horarios actualizados exitosamente (simulación)');
    } catch (err) {
      setError('Error al actualizar los horarios');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [categoriaId]);

  const verificarDisponibilidad = useCallback((horario: Horario, fecha: Date): boolean => {
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'] as const;
    const dia = diasSemana[fecha.getDay()];
    
    if (!horario.dias.includes(dia as any)) return false;

    const hora = fecha.getHours() * 60 + fecha.getMinutes();
    return horario.rangos.some(rango => {
      const [inicioHora, inicioMin] = rango.inicio.split(':').map(Number);
      const [finHora, finMin] = rango.fin.split(':').map(Number);
      const inicioTotal = inicioHora * 60 + inicioMin;
      const finTotal = finHora * 60 + finMin;
      return hora >= inicioTotal && hora <= finTotal;
    });
  }, []);

  return {
    loading,
    error,
    actualizarHorarios,
    verificarDisponibilidad
  };
}
