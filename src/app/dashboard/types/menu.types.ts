// /app/horarios-restaurante/tipos/horarios.types.ts

export interface RangoHorario {
  horaApertura: string;  // formato "HH:mm"
  horaCierre: string;    // formato "HH:mm"
  estaActivo: boolean;
}

export interface HorariosSemanales {
  lunes: RangoHorario[];
  martes: RangoHorario[];
  miercoles: RangoHorario[];
  jueves: RangoHorario[];
  viernes: RangoHorario[];
  sabado: RangoHorario[];
  domingo: RangoHorario[];
}

export interface DatosHorarioRestaurante {
  idRestaurante: string;
  horarios: HorariosSemanales;
  ultimaActualizacion: Date;
}

// Tipo para props y estados
export type DiaSemana = keyof HorariosSemanales;

export const diasSemana: DiaSemana[] = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo'
];