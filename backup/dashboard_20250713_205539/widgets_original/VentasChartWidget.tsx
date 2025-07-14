'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { VentaDiaria } from '../../types/dashboard.types';

interface VentasChartWidgetProps {
  ventas?: VentaDiaria[];
  loading?: boolean;
}

// Formateo simple para el tooltip
const formatearMoneda = (valor: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor);
};

const formatearFecha = (fecha: string): string => {
  const date = new Date(fecha);
  return date.toLocaleDateString('es-CO', { 
    month: 'short', 
    day: 'numeric' 
  });
};

const VentasChartWidget: React.FC<VentasChartWidgetProps> = ({ ventas, loading }) => {
  if (loading || !ventas) {
    return (
      <div className="dashboard-card grid-area-insights">
        <div className="card-header-modern">
          <h3 className="card-title-modern">📈 Ventas Últimos 7 Días</h3>
        </div>
        <div className="card-content-modern">
          <div className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Preparar datos para el gráfico
  const datosGrafico = ventas.map(item => ({
    fecha: formatearFecha(item.fecha),
    ventas: item.ventas,
    fechaCompleta: item.fecha
  }));

  return (
    <div className="dashboard-card grid-area-insights">
      <div className="card-header-modern">
        <h3 className="card-title-modern">📈 Ventas Últimos 7 Días</h3>
      </div>
      <div className="card-content-modern">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datosGrafico}>
              <XAxis 
                dataKey="fecha" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(valor) => `$${(valor / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(valor: number) => [formatearMoneda(valor), 'Ventas']}
                labelFormatter={(fecha) => `Fecha: ${fecha}`}
              />
              <Line
                type="monotone"
                dataKey="ventas"
                stroke="#F4821F"
                strokeWidth={3}
                dot={{ fill: '#F4821F', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#F4821F', strokeWidth: 2, fill: 'white' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default VentasChartWidget;