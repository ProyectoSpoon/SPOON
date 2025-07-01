// Types for business hours management

export interface HorarioDia {
  abierto: boolean;
  horaApertura: string;
  horaCierre: string;
  descanso?: {
    horaInicio: string;
    horaFin: string;
  };
}

export interface HorariosSemanales {
  lunes: HorarioDia;
  martes: HorarioDia;
  miercoles: HorarioDia;
  jueves: HorarioDia;
  viernes: HorarioDia;
  sabado: HorarioDia;
  domingo: HorarioDia;
}

export interface HorarioEspecial {
  id: string;
  fecha: string;
  descripcion: string;
  cerrado: boolean;
  horario?: HorarioDia;
}

export interface ConfiguracionHorarios {
  horariosSemanales: HorariosSemanales;
  horariosEspeciales: HorarioEspecial[];
  zonaHoraria: string;
  permitirReservasFueraHorario: boolean;
  tiempoAnticipacionMinimo: number; // en minutos
  tiempoAnticipacionMaximo: number; // en días
}

export interface ValidacionHorario {
  valido: boolean;
  errores: string[];
  advertencias: string[];
}

export interface PeriodoOperacion {
  inicio: string;
  fin: string;
  activo: boolean;
}

export interface HorarioRestaurante {
  id: string;
  restaurantId: string;
  configuracion: ConfiguracionHorarios;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  activo: boolean;
}

// Utility types
export type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export interface EstadoHorario {
  abierto: boolean;
  proximaApertura?: Date;
  proximoCierre?: Date;
  enDescanso?: boolean;
  mensaje: string;
}

export interface RangoHorario {
  inicio: string;
  fin: string;
  valido: boolean;
}
