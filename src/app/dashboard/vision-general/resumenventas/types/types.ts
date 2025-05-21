export type PeriodoTiempo = 'hoy' | 'semana' | 'mes';

export interface DatosVenta {
  total: number;
  totalPedidos: number;
  platoMasVendido: string;
  promedioTicket: number;
}

export interface DatosGrafico {
  name: string;
  ventas: number;
}

export interface TarjetaEstadisticaProps {
  titulo: string;
  valor: string | number;
  icono: React.ReactNode;
  colorFondo: string;
  colorIcono: string;
}