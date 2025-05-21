// /shared/types/horarios/tipos-festivos.ts
export interface Festivo {
    id: string;
    fecha: Date;
    tipo: 'festivo' | 'personalizado';
    descripcion: string;
    recurrenciaAnual?: boolean;
    afectaHorario?: boolean;
    horarioEspecial?: RangoHorario[];
  }
  
  export interface ConfiguracionFestivos {
    pais: string;
    zonaHoraria: string;
    festivosNacionales: Festivo[];
    festivosLocales: Festivo[];
    festivosPersonalizados: Festivo[];
  }