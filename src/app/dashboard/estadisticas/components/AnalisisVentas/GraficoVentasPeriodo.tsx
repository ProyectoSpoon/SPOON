'use client';

import { Card } from '@/shared/components/ui/Card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useState } from 'react';
import { formatearMoneda, formatearFechaCorta } from '../../utils/formatters';
import { calcularCrecimiento } from '../../utils/calculosEstadisticos';

// Tipos para los datos del gráfico
interface DatoVenta {
  fecha: string;
  ventas: number;
  ordenes: number;
  ventasAnteriores?: number;
}

interface GraficoVentasPeriodoProps {
  datos: DatoVenta[];
  titulo: string;
  periodoActual: string;
  periodoAnterior: string;
}

export const GraficoVentasPeriodo = ({
  datos,
  titulo,
  periodoActual,
  periodoAnterior
}: GraficoVentasPeriodoProps) => {
  const [tipoGrafico, setTipoGrafico] = useState<'linea' | 'barra'>('linea');
  const [mostrarComparativa, setMostrarComparativa] = useState(true);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const ventasActuales = payload[0].value;
      const ventasAnteriores = payload[1]?.value;
      const porcentajeCambio = ventasAnteriores 
        ? calcularCrecimiento(ventasActuales, ventasAnteriores)
        : null;

      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border border-neutral-200">
          <p className="font-medium text-neutral-800">
            {formatearFechaCorta(new Date(label))}
          </p>
          <div className="space-y-2 mt-2">
            <p className="text-[#F4821F] font-medium">
              {`Ventas: ${formatearMoneda(ventasActuales)}`}
            </p>
            {mostrarComparativa && ventasAnteriores && porcentajeCambio !== null && (
              <>
                <p className="text-neutral-500">
                  {`${periodoAnterior}: ${formatearMoneda(ventasAnteriores)}`}
                </p>
                <p className={`text-sm ${porcentajeCambio >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {`${porcentajeCambio >= 0 ? '+' : ''}${porcentajeCambio.toFixed(1)}% vs ${periodoAnterior}`}
                </p>
              </>
            )}
            <p className="text-emerald-600 font-medium">
              {`Órdenes: ${payload[2]?.value || 0}`}
            </p>
          </div>
        </div>
      );
    }
    return null;
};

  const renderGrafico = () => {
    const configuracionComun = {
      data: datos,
      children: [
        <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#E5E7EB" />,
        <XAxis 
          key="x"
          dataKey="fecha" 
          stroke="#6B7280"
          fontSize={12}
        />,
        <YAxis 
          key="y1"
          yAxisId="left"
          stroke="#6B7280"
          fontSize={12}
          tickFormatter={formatearMoneda}
        />,
        <YAxis 
          key="y2"
          yAxisId="right"
          orientation="right"
          stroke="#6B7280"
          fontSize={12}
        />,
        <Tooltip key="tooltip" content={<CustomTooltip />} />,
        <Legend key="legend" />
      ]
    };

    if (tipoGrafico === 'linea') {
      return (
        <LineChart {...configuracionComun}>
          {configuracionComun.children}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="ventas"
            stroke="#F4821F"
            strokeWidth={2}
            name={periodoActual}
            dot={{ stroke: '#F4821F', fill: '#F4821F' }}
            activeDot={{ r: 8 }}
          />
          {mostrarComparativa && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="ventasAnteriores"
              stroke="#9CA3AF"
              strokeWidth={2}
              strokeDasharray="5 5"
              name={periodoAnterior}
              dot={{ stroke: '#9CA3AF', fill: '#9CA3AF' }}
            />
          )}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="ordenes"
            stroke="#059669"
            strokeWidth={2}
            name="Órdenes"
            dot={{ stroke: '#059669', fill: '#059669' }}
          />
        </LineChart>
      );
    }

    return (
      <BarChart {...configuracionComun}>
        {configuracionComun.children}
        <Bar
          yAxisId="left"
          dataKey="ventas"
          fill="#F4821F"
          name={periodoActual}
          radius={[4, 4, 0, 0]}
        />
        {mostrarComparativa && (
          <Bar
            yAxisId="left"
            dataKey="ventasAnteriores"
            fill="#9CA3AF"
            name={periodoAnterior}
            radius={[4, 4, 0, 0]}
          />
        )}
        <Bar
          yAxisId="right"
          dataKey="ordenes"
          fill="#059669"
          name="Órdenes"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-neutral-800">{titulo}</h3>
          <p className="text-sm text-neutral-500">
            Comparativa de ventas y órdenes
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="comparativa"
              checked={mostrarComparativa}
              onChange={(e) => setMostrarComparativa(e.target.checked)}
              className="rounded text-[#F4821F] focus:ring-[#F4821F]"
            />
            <label htmlFor="comparativa" className="text-sm text-neutral-600">
              Mostrar comparativa
            </label>
          </div>
          <select
            value={tipoGrafico}
            onChange={(e) => setTipoGrafico(e.target.value as 'linea' | 'barra')}
            className="px-3 py-1 rounded-lg border border-neutral-200 text-sm 
                     focus:outline-none focus:ring-2 focus:ring-[#F4821F]
                     bg-white"
          >
            <option value="linea">Gráfico de línea</option>
            <option value="barra">Gráfico de barras</option>
          </select>
        </div>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          {renderGrafico()}
        </ResponsiveContainer>
      </div>

      {/* Leyenda de colores */}
      <div className="mt-4 flex items-center gap-6 text-sm text-neutral-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#F4821F]" />
          <span>Ventas actuales</span>
        </div>
        {mostrarComparativa && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#9CA3AF]" />
            <span>Ventas anteriores</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#059669]" />
          <span>Órdenes</span>
        </div>
      </div>
    </Card>
  );
};
