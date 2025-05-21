'use client';

import { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { KPIsCards } from '../components/AnalisisVentas/KPIsCards';
import { FiltroPeriodo } from '../components/AnalisisVentas/FiltroPeriodo';
import { GraficoVentasPeriodo } from '../components/AnalisisVentas/GraficoVentasPeriodo';
import { PeriodoTiempo, KPI } from '../types/estadisticas.types';

// Datos de ejemplo - Esto vendría de Firebase
const kpisEjemplo: KPI[] = [
  {
    id: "ventas-totales",
    titulo: "Ventas Totales",
    valor: 2345678,
    tipo: "moneda",
    icono: "dollar",
    valorAnterior: 2000000,
    colorIcono: "text-blue-600",
    colorFondo: "bg-blue-100",
    descripcion: "Total de ventas del periodo"
  },
  {
    id: "ordenes-totales",
    titulo: "Órdenes Totales",
    valor: 1234,
    tipo: "numero",
    icono: "bag",
    valorAnterior: 1100,
    colorIcono: "text-green-600",
    colorFondo: "bg-green-100",
    descripcion: "Número total de órdenes"
  },
  {
    id: "ticket-promedio",
    titulo: "Ticket Promedio",
    valor: 1890,
    tipo: "moneda",
    icono: "dollar",
    valorAnterior: 1750,
    colorIcono: "text-purple-600",
    colorFondo: "bg-purple-100",
    descripcion: "Valor promedio por orden"
  },
  {
    id: "tiempo-promedio",
    titulo: "Tiempo Promedio",
    valor: 23,
    tipo: "numero",
    icono: "clock",
    valorAnterior: 25,
    colorIcono: "text-orange-600",
    colorFondo: "bg-orange-100",
    descripcion: "Tiempo promedio de atención"
  }
];

// Datos de ejemplo para el gráfico
const datosGraficoEjemplo = [
  { fecha: '01/11', ventas: 1500000, ventasAnteriores: 1200000, ordenes: 45 },
  { fecha: '02/11', ventas: 1750000, ventasAnteriores: 1400000, ordenes: 52 },
  { fecha: '03/11', ventas: 1600000, ventasAnteriores: 1350000, ordenes: 48 },
  { fecha: '04/11', ventas: 1900000, ventasAnteriores: 1600000, ordenes: 55 },
  { fecha: '05/11', ventas: 2100000, ventasAnteriores: 1800000, ordenes: 62 },
  { fecha: '06/11', ventas: 1850000, ventasAnteriores: 1700000, ordenes: 50 },
  { fecha: '07/11', ventas: 2200000, ventasAnteriores: 1900000, ordenes: 65 },
];

export default function AnalisisVentasPage() {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<PeriodoTiempo>('mes');

  const handlePeriodoChange = (periodo: PeriodoTiempo) => {
    setPeriodoSeleccionado(periodo);
    // Aquí podrías añadir lógica adicional al cambiar el período
    // Por ejemplo, cargar nuevos datos según el período seleccionado
  };

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">
              Análisis de Ventas
            </h1>
            <p className="text-neutral-600 mt-2">
              Visualiza y analiza el rendimiento de tus ventas en diferentes períodos
            </p>
          </div>
          <div className="text-sm text-neutral-500">
            Última actualización: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-4 bg-white shadow-sm">
        <FiltroPeriodo 
          periodoSeleccionado={periodoSeleccionado}
          onPeriodoChange={handlePeriodoChange}
        />
      </Card>

      {/* KPIs */}
      <KPIsCards kpis={kpisEjemplo} />

      {/* Gráfico Principal */}
      <div className="mt-6">
        <GraficoVentasPeriodo 
          datos={datosGraficoEjemplo}
          titulo="Evolución de Ventas"
          periodoActual="Noviembre 2023"
          periodoAnterior="Octubre 2023"
        />
      </div>

      {/* Sección adicional para más detalles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-semibold mb-4">Top Horas de Venta</h3>
          {/* Aquí irá un componente para mostrar las mejores horas */}
        </Card>

        <Card className="p-6 bg-white">
          <h3 className="text-lg font-semibold mb-4">Comparativa por Día</h3>
          {/* Aquí irá un componente para mostrar comparativa por día */}
        </Card>
      </div>

      {/* Mensaje informativo */}
      <div className="mt-6">
        <Card className="p-4 bg-[#FFF9F2] border-l-4 border-[#F4821F]">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h4 className="font-medium text-[#F4821F]">Consejo</h4>
              <p className="text-sm text-neutral-600 mt-1">
                Utiliza los filtros para ajustar el período de tiempo y obtener insights más específicos. 
                Puedes comparar diferentes períodos para identificar tendencias.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}