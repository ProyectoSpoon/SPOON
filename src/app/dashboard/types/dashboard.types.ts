// src/app/dashboard/types/dashboard.types.ts
export interface DashboardMetrics {
  ventasHoy: number;
  platosVendidos: number;
  ticketPromedio: number;
  comparacionAyer: number;
  tendencia: 'up' | 'down' | 'stable';
}

export interface EstadoMenu {
  menuPublicado: boolean;
  combinacionesActivas: number;
  productosAgotados: number;
  programacionCompleta: number;
  ultimaActualizacion: Date;
}

export interface PlatoTop {
  id: string;
  nombre: string;
  ventas: number;
  porcentaje: number;
  imagen?: string;
}

export interface NotificacionDashboard {
  id: string;
  tipo: 'success' | 'warning' | 'info' | 'error';
  mensaje: string;
  timestamp: Date;
  leida: boolean;
}

export interface VentaDiaria {
  fecha: string;
  ventas: number;
}

export interface DashboardData {
  metricas: DashboardMetrics;
  estadoMenu: EstadoMenu;
  platosTop: PlatoTop[];
  notificaciones: NotificacionDashboard[];
  ventasUltimos7Dias: VentaDiaria[];
}
