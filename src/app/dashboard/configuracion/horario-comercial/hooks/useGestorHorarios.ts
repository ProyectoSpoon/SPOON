// /app/horarios-restaurante/hooks/useGestorHorarios.ts
'use client';

import { useState, useCallback } from 'react';
import { HorariosSemanales, RangoHorario, DiaSemana } from '../types/horarios.types';

const horarioInicial: RangoHorario = {
  horaApertura: "09:00",
  horaCierre: "18:00",
  estaActivo: true
};

const horariosSemanalesIniciales: HorariosSemanales = {
  lunes: [{ ...horarioInicial }],
  martes: [{ ...horarioInicial }],
  miercoles: [{ ...horarioInicial }],
  jueves: [{ ...horarioInicial }],
  viernes: [{ ...horarioInicial }],
  sabado: [{ ...horarioInicial }],
  domingo: [{ ...horarioInicial }]
};

export const useGestorHorarios = (idRestaurante: string) => {
  const [horarios, setHorarios] = useState<HorariosSemanales>(horariosSemanalesIniciales);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actualizarHorarios = useCallback((nuevosHorarios: HorariosSemanales) => {
    setHorarios(nuevosHorarios);
    // Aquí posteriormente agregaremos la lógica para guardar en Firebase
  }, []);

  const actualizarHorarioDia = useCallback((dia: DiaSemana, nuevosRangos: RangoHorario[]) => {
    setHorarios(horariosActuales => ({
      ...horariosActuales,
      [dia]: nuevosRangos
    }));
  }, []);

  const validarHorarios = useCallback((horarios: HorariosSemanales): boolean => {
    for (const dia of Object.keys(horarios) as DiaSemana[]) {
      const rangosDelDia = horarios[dia];
      
      for (const rango of rangosDelDia) {
        // Validar que la hora de cierre sea posterior a la de apertura
        if (rango.horaApertura >= rango.horaCierre) {
          setError(`Horario inválido en ${dia}: la hora de cierre debe ser posterior a la de apertura`);
          return false;
        }
      }

      // Validar superposición de horarios
      for (let i = 0; i < rangosDelDia.length; i++) {
        for (let j = i + 1; j < rangosDelDia.length; j++) {
          if (rangosDelDia[i].horaApertura < rangosDelDia[j].horaCierre &&
              rangosDelDia[j].horaApertura < rangosDelDia[i].horaCierre) {
            setError(`Horarios superpuestos en ${dia}`);
            return false;
          }
        }
      }
    }
    setError(null);
    return true;
  }, []);

  const guardarHorarios = useCallback(async () => {
    if (!validarHorarios(horarios)) return;

    setGuardando(true);
    setError(null);
    
    try {
      // Aquí irá la lógica para guardar en Firebase
      // Por ahora solo simulamos un guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Horarios guardados:', {
        idRestaurante,
        horarios,
        ultimaActualizacion: new Date()
      });
    } catch (err) {
      setError('Error al guardar los horarios');
      console.error(err);
    } finally {
      setGuardando(false);
    }
  }, [horarios, idRestaurante, validarHorarios]);

  return {
    horarios,
    guardando,
    error,
    actualizarHorarios,
    actualizarHorarioDia,
    guardarHorarios
  };
};