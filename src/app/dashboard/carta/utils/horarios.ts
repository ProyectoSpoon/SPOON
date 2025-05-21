// src/app/dashboard/carta/utils/horarios.ts
import { Horario, RangoHorario, Dia } from '../types/menu.types';

export const formatearHora = (hora: string): string => {
  const [horas, minutos] = hora.split(':');
  return `${horas.padStart(2, '0')}:${minutos.padStart(2, '0')}`;
};

export const validarRangoHorario = (rango: RangoHorario): boolean => {
  const [inicioHora, inicioMin] = rango.inicio.split(':').map(Number);
  const [finHora, finMin] = rango.fin.split(':').map(Number);
  
  const inicioTotal = inicioHora * 60 + inicioMin;
  const finTotal = finHora * 60 + finMin;
  
  return finTotal > inicioTotal;
};

export const validarSuperposicionHorarios = (
  rangos: RangoHorario[],
  nuevoRango: RangoHorario
): boolean => {
  const [nuevaInicioHora, nuevaInicioMin] = nuevoRango.inicio.split(':').map(Number);
  const [nuevaFinHora, nuevaFinMin] = nuevoRango.fin.split(':').map(Number);
  
  const nuevoInicioTotal = nuevaInicioHora * 60 + nuevaInicioMin;
  const nuevoFinTotal = nuevaFinHora * 60 + nuevaFinMin;

  return rangos.every(rango => {
    const [inicioHora, inicioMin] = rango.inicio.split(':').map(Number);
    const [finHora, finMin] = rango.fin.split(':').map(Number);
    
    const inicioTotal = inicioHora * 60 + inicioMin;
    const finTotal = finHora * 60 + finMin;

    return nuevoFinTotal <= inicioTotal || nuevoInicioTotal >= finTotal;
  });
};
