// utils/horarios-simple.utils.ts
import { DiaSemana, HorariosDia } from '../types/horarios-simple.types';

export const formatearHora = (hora: string): string => {
  const [horas, minutos] = hora.split(':');
  const h = parseInt(horas);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hora12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return ${hora12}: ;
};

export const getNombreDia = (dia: DiaSemana): string => {
  const nombres = {
    lunes: 'Lunes',
    martes: 'Martes', 
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
    domingo: 'Domingo'
  };
  return nombres[dia];
};

export const calcularHorasSemanales = (horarios: HorariosDia[]): number => {
  return horarios.reduce((total, dia) => {
    if (dia.estado === 'cerrado') return total;
    
    return total + dia.turnos.reduce((diaTot, turno) => {
      const inicio = new Date(2000-01-01T);
      const fin = new Date(2000-01-01T);
      return diaTot + (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
    }, 0);
  }, 0);
};

export const validarHorario = (horaApertura: string, horaCierre: string): boolean => {
  return horaApertura < horaCierre;
};
