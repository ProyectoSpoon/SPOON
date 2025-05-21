// /shared/types/horarios/tipos-horarios.ts
;

export type DiaSemana = 
  | 'lunes' 
  | 'martes' 
  | 'miercoles' 
  | 'jueves' 
  | 'viernes' 
  | 'sabado' 
  | 'domingo';

export const diasSemana: DiaSemana[] = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo'
];

export interface RangoHorario {
  horaApertura: string | null;
  horaCierre: string | null;
  estaActivo: boolean;
  diasAplicables?: DiaSemana[];
  excepciones?: FechaExcepcion[];
}

export interface FechaExcepcion {
  fecha: Date;
  rangos?: RangoHorario[];
  estaCerrado: boolean;
  motivo?: string;
}

export interface ConfiguracionHorario {
  zonaHoraria: string;
  formatoHora: '12h' | '24h';
  primerDiaSemana: DiaSemana;
  horariosPorDefecto: Record<DiaSemana, RangoHorario[]>;
  excepciones: FechaExcepcion[];
}