/**
 * Tipos base para el sistema de estadísticas
 */

// Tipos de períodos para filtros
export type PeriodoTiempo = 'hoy' | 'semana' | 'mes' | 'trimestre' | 'año';
export type PeriodoHorario = 'mañana' | 'tarde' | 'noche';

// Interfaces para Análisis de Ventas
export interface DatosVenta {
  fecha: Date;
  total: number;
  cantidad: number;
  categoria: string;
  plato: string;
  hora: string;
}

export interface KPI {
  titulo: string;
  valor: number | string;
  porcentajeCambio?: number;
  icono?: string;
  color?: string;
}

export interface ResumenVentas {
  totalVentas: number;
  ticketPromedio: number;
  totalOrdenes: number;
  comparacionPeriodoAnterior: number;
}

// Interfaces para Rendimiento de Menú
export interface RendimientoPlato {
  id: string;
  nombre: string;
  categoria: string;
  cantidadVendida: number;
  ingresos: number;
  costoUnitario: number;
  precioVenta: number;
  margen: number;
  ranking: number;
}

export interface RendimientoCategoria {
  categoria: string;
  cantidadPlatos: number;
  ventasTotales: number;
  ingresosTotales: number;
  margenPromedio: number;
}

// Interfaces para Tendencias y Patrones
export interface TendenciaDiaria {
  hora: string;
  ventasPromedio: number;
  platosPopulares: string[];
}

export interface TendenciaSemanal {
  dia: string;
  ventasTotales: number;
  categoriasMasVendidas: string[];
}

export interface EstadisticasEstacionales {
  mes: string;
  ventasTotales: number;
  platosMasVendidos: {
    plato: string;
    cantidad: number;
  }[];
}

// Interfaces para filtros
export interface FiltrosEstadisticas {
  periodo: PeriodoTiempo;
  categoria?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  horario?: PeriodoHorario;
}

// Interfaces para respuestas de Firebase
export interface RespuestaEstadisticas {
  ventas: DatosVenta[];
  kpis: KPI[];
  rendimiento: {
    platos: RendimientoPlato[];
    categorias: RendimientoCategoria[];
  };
  tendencias: {
    diarias: TendenciaDiaria[];
    semanales: TendenciaSemanal[];
    estacionales: EstadisticasEstacionales[];
  };
}

// Tipos para estados de carga
export type EstadoCarga = 'idle' | 'loading' | 'success' | 'error';

export interface EstadoEstadisticas {
  datos: RespuestaEstadisticas | null;
  estado: EstadoCarga;
  error: string | null;
  filtros: FiltrosEstadisticas;
}

// Tipos para gráficos
export type TipoGrafico = 'linea' | 'barra' | 'pie' | 'area' | 'radar';

export interface ConfiguracionGrafico {
  tipo: TipoGrafico;
  titulo: string;
  ejeX: string;
  ejeY: string;
  colorPrimario?: string;
  colorSecundario?: string;
  mostrarLeyenda?: boolean;
  mostrarEtiquetas?: boolean;
}

// Tipos para acciones y eventos
export type AccionEstadistica = 
  | { tipo: 'CARGAR_DATOS' }
  | { tipo: 'ACTUALIZAR_FILTROS'; payload: Partial<FiltrosEstadisticas> }
  | { tipo: 'ESTABLECER_ERROR'; payload: string }
  | { tipo: 'LIMPIAR_DATOS' };
