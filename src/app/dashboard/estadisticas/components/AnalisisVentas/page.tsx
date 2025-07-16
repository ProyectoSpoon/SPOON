'use client';

import { useSetPageTitle } from '@/shared/Context/page-title-context';

// Importar desde el index
import { KPIsCards, FiltroPeriodo, GraficoVentasPeriodo, ComparativaMensual } from '../../components/AnalisisVentas';

export default function AnalisisVentasPage() {

  // ✅ TÍTULO DINÁMICO DE LA PÁGINA
  useSetPageTitle('Análisis de Ventas', 'Componentes de análisis');
  const kpisData = [
    {
      id: 'ventas-totales',
      titulo: 'Ventas Totales',
      valor: 150000,
      tipo: 'moneda' as const,
      icono: 'dollar',
      valorAnterior: 120000,
      colorIcono: 'text-green-600',
      colorFondo: 'bg-green-100',
      descripcion: 'Total de ventas del periodo'
    },
    {
      id: 'ticket-promedio',
      titulo: 'Ticket Promedio',
      valor: 2500,
      tipo: 'moneda' as const,
      icono: 'bag',
      valorAnterior: 2300,
      colorIcono: 'text-blue-600',
      colorFondo: 'bg-blue-100',
      descripcion: 'Valor promedio por orden'
    },
    {
      id: 'total-ordenes',
      titulo: 'Total Órdenes',
      valor: 560,
      tipo: 'numero' as const,
      icono: 'bag',
      valorAnterior: 520,
      colorIcono: 'text-orange-600',
      colorFondo: 'bg-orange-100',
      descripcion: 'Número de órdenes procesadas'
    },
    {
      id: 'clientes-nuevos',
      titulo: 'Clientes Nuevos',
      valor: 85,
      tipo: 'numero' as const,
      icono: 'users',
      valorAnterior: 65,
      colorIcono: 'text-purple-600',
      colorFondo: 'bg-purple-100',
      descripcion: 'Nuevos clientes en el periodo'
    }
  ] as const;

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">
          Análisis de Ventas
        </h1>
        <p className="text-neutral-600 mt-2">
          Vista general del rendimiento de ventas y métricas clave
        </p>
      </div>

      {/* KPIs */}
      <KPIsCards kpis={kpisData as any} />

      {/* Filtro de período */}
      <FiltroPeriodo 
        periodoSeleccionado="mes"
        onPeriodoChange={() => {}}
      />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GraficoVentasPeriodo 
          datos={[]}
          titulo="Ventas del Período"
          periodoActual="Noviembre 2024"
          periodoAnterior="Octubre 2024"
        />
        <ComparativaMensual />
      </div>
    </div>
  );
}




























