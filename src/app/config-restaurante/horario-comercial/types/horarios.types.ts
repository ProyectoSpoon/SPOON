// src/app/config-restaurante/horario-comercial/types/horarios.types.ts

export type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export interface Turno {
  horaApertura: string; // Formato HH:MM (24 horas)
  horaCierre: string;   // Formato HH:MM (24 horas)
}

export interface HorariosDia {
  abierto: boolean;
  turnos: Turno[];
}

export interface ErrorValidacion {
  valido: boolean;
  mensaje?: string; // ✅ TEMPORAL: Hacer opcional para evitar errores
  turnosConflicto?: number[];
}

export interface SugerenciasHorario {
  puede: boolean;
  mensaje?: string; // ✅ CORREGIDO: Mensaje opcional
  sugerenciaApertura?: string;
  sugerenciaCierre?: string;
}

export interface OpcionHorario {
  value: string;
  label: string;
  disabled?: boolean; // ✅ NUEVO: Para deshabilitar opciones conflictivas
}

// Constantes para días de la semana
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

// Mapeo de días a índices para BD (0 = domingo)
export const DIA_A_INDICE: Record<DiaSemana, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6
};

export const INDICE_A_DIA: Record<number, DiaSemana> = {
  0: 'domingo',
  1: 'lunes',
  2: 'martes',
  3: 'miercoles',
  4: 'jueves',
  5: 'viernes',
  6: 'sabado'
};