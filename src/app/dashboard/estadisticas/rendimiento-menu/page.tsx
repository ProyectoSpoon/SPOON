'use client';

import { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { useRendimientoMenu } from '../hooks/useRendimientoMenu';
import { FiltroPeriodo } from '../components/AnalisisVentas/FiltroPeriodo';
import { TrendingUp, TrendingDown, DollarSign, LineChart } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { PeriodoTiempo } from '../types/estadisticas.types';

export default function RendimientoMenuPage() {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<PeriodoTiempo>('mes');
  const { datos, loading: cargando, error } = useRendimientoMenu(periodoSeleccionado);

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  if (cargando) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F4821F]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-4 bg-red-50 border-l-4 border-red-500">
          <p className="text-red-600">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">
          Rendimiento del Menú
        </h1>
        <p className="text-neutral-600 mt-2">
          Análisis detallado del desempeño de platos y categorías
        </p>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <FiltroPeriodo 
          periodoSeleccionado={periodoSeleccionado}
          onPeriodoChange={setPeriodoSeleccionado}
        />
      </Card>

      {/* Resumen por Categorías */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Rendimiento por Categoría */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Rendimiento por Categoría</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datos?.rendimientoCategorias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="totalVentas" 
                  name="Total Ventas" 
                  fill="#F4821F" 
                />
                <Bar 
                  yAxisId="right"
                  dataKey="margenPromedio" 
                  name="Margen Promedio" 
                  fill="#22C55E" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Mejores y Peores Platos */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Platos por Rendimiento</h3>
          <div className="space-y-4">
            {datos?.mejoresPlatos.slice(0, 5).map((plato: any, index: number) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-[#F4821F]">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{plato.plato}</p>
                    <p className="text-sm text-neutral-500">{plato.categoria}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatearMoneda(plato.ingresos)}</p>
                  <p className="text-sm text-green-600">
                    {(plato.margenBruto * 100).toFixed(1)}% margen
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tabla de Rendimiento Detallado */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Rendimiento Detallado</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="p-3 text-left">Plato</th>
                <th className="p-3 text-left">Categoría</th>
                <th className="p-3 text-right">Vendidos</th>
                <th className="p-3 text-right">Ingresos</th>
                <th className="p-3 text-right">Margen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {datos?.rendimientoPlatos.map((plato: any, index: number) => (
                <tr key={index}>
                  <td className="p-3">{plato.plato}</td>
                  <td className="p-3 text-neutral-600">{plato.categoria}</td>
                  <td className="p-3 text-right">{plato.cantidadVendida}</td>
                  <td className="p-3 text-right">{formatearMoneda(plato.ingresos)}</td>
                  <td className="p-3 text-right">
                    <span className={`
                      px-2 py-1 rounded-full text-sm
                      ${plato.margenBruto > 0.4 ? 'bg-green-100 text-green-800' : 
                        plato.margenBruto > 0.2 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}
                    `}>
                      {(plato.margenBruto * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
