// tipos/horarios.types.ts
export interface RangoHorario {
  horaApertura: string | null;  // Cambiado a null cuando no hay valor
  horaCierre: string | null;    // Cambiado a null cuando no hay valor
  estaActivo: boolean;
}

export interface HorariosSemanales {
  [key: string]: RangoHorario[];
}

export type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export const diasSemana: DiaSemana[] = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo'
];