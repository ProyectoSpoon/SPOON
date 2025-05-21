// /shared/types/horarios/tipos-programacion.ts
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
      fechaCreacion: Timestamp;
      ultimaModificacion: Timestamp;
      version: number;
    };
  }