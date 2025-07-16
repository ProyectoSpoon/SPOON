// src/app/config-restaurante/horario-comercial/types.ts

export type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export interface Turno {
  horaApertura: string;  // "08:00"
  horaCierre: string;    // "14:00"
}

export interface HorarioDia {
  abierto: boolean;
  turnos: Turno[];
}

export type HorariosRestaurante = Record<DiaSemana, HorarioDia>;

export const DIAS_SEMANA: DiaSemana[] = [
  'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'
];

export const NOMBRES_DIAS: Record<DiaSemana, string> = {
  lunes: 'Lunes',
  martes: 'Martes', 
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo'
};