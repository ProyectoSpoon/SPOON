// types/horarios-simple.types.ts
export type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
export type EstadoDia = 'abierto' | 'cerrado' | 'especial';

export interface RangoHorario {
  horaApertura: string;
  horaCierre: string;
  estaActivo: boolean;
}

export interface HorariosDia {
  dia: DiaSemana;
  estado: EstadoDia;
  turnos: RangoHorario[];
}

export interface KPI {
  titulo: string;
  valor: string;
  subtitulo: string;
}

export const diasSemana: DiaSemana[] = [
  'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'
];
