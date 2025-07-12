'use client';

import { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { useTendencias } from '../hooks/useTendencias';
import { FiltroPeriodo } from '../components/AnalisisVentas/FiltroPeriodo';
import { Clock, TrendingUp, AlertCircle } from 'lucide-react';
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
import type { PeriodoTiempo } from '../types/estadisticas.types';

export default function TendenciasPage() {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<PeriodoTiempo>('mes');
  const { datos, cargando, error } = useTendencias(periodoSeleccionado);

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
          Tendencias y Patrones
        </h1>
        <p className="text-neutral-600 mt-2">
          Análisis de patrones de venta y comportamiento
        </p>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <FiltroPeriodo 
          periodoSeleccionado={periodoSeleccionado}
          onPeriodoChange={setPeriodoSeleccionado}
        />
      </Card>

      {/* Gráficos de Tendencias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencias por Hora */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tendencias por Hora</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={datos?.tendenciasHorarias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="ventas" 
                  stroke="#F4821F" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Tendencias por Día */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tendencias por Día</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datos?.tendenciasDiarias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ventas" fill="#F4821F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Horas Pico */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#F4821F]" />
          Horas Pico
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {datos?.horasPico.map((hora, index) => (
            <div 
              key={index}
              className="p-4 bg-neutral-50 rounded-lg"
            >
              <p className="text-lg font-semibold">{hora.hora}</p>
              <p className="text-sm text-neutral-500">
                Promedio: {hora.ventasPromedio.toLocaleString()} ventas
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Patrones Identificados */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#F4821F]" />
          Patrones Identificados
        </h3>
        <div className="space-y-4">
          {datos?.patronesIdentificados.map((patron, index) => (
            <div 
              key={index}
              className="p-4 border border-neutral-200 rounded-lg"
            >
              <div className="flex items-start gap-4">
                <div className={`
                  p-2 rounded-full
                  ${patron.impacto === 'alto' ? 'bg-red-100' :
                    patron.impacto === 'medio' ? 'bg-yellow-100' :
                    'bg-blue-100'}
                `}>
                  <AlertCircle className={`
                    h-5 w-5
                    ${patron.impacto === 'alto' ? 'text-red-600' :
                      patron.impacto === 'medio' ? 'text-yellow-600' :
                      'text-blue-600'}
                  `} />
                </div>
                <div>
                  <p className="font-medium">{patron.descripcion}</p>
                  <p className="text-sm text-neutral-600 mt-1">
                    {patron.recomendacion}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
