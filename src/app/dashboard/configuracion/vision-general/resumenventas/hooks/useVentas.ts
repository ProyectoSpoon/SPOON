import { useState } from 'react';
// Tipos locales para evitar dependencias circulares
type PeriodoTiempo = 'hoy' | 'semana' | 'mes' | 'año';

interface DatosVenta {
  total: number;
  cantidad: number;
  promedio: number;
  crecimiento: number;
}

interface DatosGrafico {
  fecha: string;
  ventas: number;
  pedidos: number;
}

// Datos de ejemplo - Esto vendría de tu backend
const datosVentas = {
  hoy: {
    total: 850000,
    totalPedidos: 45,
    platoMasVendido: "Hamburguesa Clásica",
    promedioTicket: 18800,
  },
  semana: {
    total: 5250000,
    totalPedidos: 280,
    platoMasVendido: "Pizza Margherita",
    promedioTicket: 18750,
  },
  mes: {
    total: 22500000,
    totalPedidos: 1200,
    platoMasVendido: "Pizza Margherita",
    promedioTicket: 18750,
  },
  año: {
    total: 270000000,
    totalPedidos: 14400,
    platoMasVendido: "Pizza Margherita",
    promedioTicket: 18750,
  }
};

// Datos del gráfico
const datosGrafico = [
  { name: 'Lun', ventas: 850000 },
  { name: 'Mar', ventas: 920000 },
  { name: 'Mie', ventas: 880000 },
  { name: 'Jue', ventas: 950000 },
  { name: 'Vie', ventas: 1100000 },
  { name: 'Sab', ventas: 1250000 },
  { name: 'Dom', ventas: 1300000 },
];

export const useVentas = () => {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<PeriodoTiempo>('hoy');

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor);
  };

  return {
    periodoSeleccionado,
    setPeriodoSeleccionado,
    datos: datosVentas[periodoSeleccionado],
    datosGrafico,
    formatearMoneda,
  };
};
