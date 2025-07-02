// /shared/types/horarios/tipos-programacion.ts
import { RangoHorario, FechaExcepcion } from '../horarios';
import { Festivo } from './tipos-festivos';

export interface Programacion {
    id: string;
    restauranteId: string;
    fechaInicio: Date;
    fechaFin: Date;
    rangosHorarios: RangoHorario[];
    excepciones: FechaExcepcion[];
    festivos: Festivo[];
    zonaHoraria: string;
    estado: 'activa' | 'inactiva' | 'borrador';
    metadata: {
      creadoPor: string;
      fechaCreacion: Date;
      ultimaModificacion: Date;
      version: number;
    };
  }
