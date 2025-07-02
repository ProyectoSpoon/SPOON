import { RangoHorario, FechaExcepcion } from '@/shared/types/horarios';

export class ValidadorHorarios {
  static validarRango(rango: RangoHorario): { 
    valido: boolean; 
    mensaje?: string 
  } {
    if (!rango.inicio || !rango.fin) {
      return {
        valido: false,
        mensaje: 'Las horas de apertura y cierre son requeridas'
      };
    }

    if (rango.inicio >= rango.fin) {
      return {
        valido: false,
        mensaje: 'La hora de cierre debe ser posterior a la de apertura'
      };
    }

    return { valido: true };
  }

  static validarSuperposicion(
    rangos: RangoHorario[]
  ): { 
    valido: boolean; 
    conflictos?: [RangoHorario, RangoHorario][] 
  } {
    const conflictos: [RangoHorario, RangoHorario][] = [];

    for (let i = 0; i < rangos.length; i++) {
      for (let j = i + 1; j < rangos.length; j++) {
        if (this.hayConflicto(rangos[i], rangos[j])) {
          conflictos.push([rangos[i], rangos[j]]);
        }
      }
    }

    return {
      valido: conflictos.length === 0,
      conflictos: conflictos.length > 0 ? conflictos : undefined
    };
  }

  private static hayConflicto(rango1: RangoHorario, rango2: RangoHorario): boolean {
    if (!rango1.inicio || !rango1.fin || 
        !rango2.inicio || !rango2.fin) {
      return false;
    }

    return rango1.inicio < rango2.fin && 
           rango2.inicio < rango1.fin;
  }
}
