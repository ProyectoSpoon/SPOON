// src/app/dashboard/carta/hooks/useHorarios.ts
import { useState, useCallback } from 'react';
;
import { db } from '@/firebase/config';
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
      const docRef = doc(db, 'categorias', categoriaId);
      await updateDoc(docRef, { horarios });
    } catch (err) {
      setError('Error al actualizar los horarios');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [categoriaId]);

  const verificarDisponibilidad = useCallback((horario: Horario, fecha: Date): boolean => {
    const dia = fecha.toLocaleLowerCase().split(',')[0];
    if (!horario.dias.includes(dia)) return false;

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