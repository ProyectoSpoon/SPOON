'use client';

import { Card } from '@/shared/components/ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DatosComparativa {
  categoria: string;
  mesActual: number;
  mesAnterior: number;
  porcentajeCambio: number;
}

interface ComparativaMensualProps {
  datos?: DatosComparativa[];
  mesActual?: string;
  mesAnterior?: string;
}

export const ComparativaMensual = ({
  datos = [],
  mesActual = 'Mes actual',
  mesAnterior = 'Mes anterior'
}: ComparativaMensualProps) => {
  // Función para formatear moneda
  const formatearDinero = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  // Tipamos correctamente el CustomTooltip
  const CustomTooltip = ({ 
    active, 
    payload, 
    label 
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const datoActual = datos.find(d => d.categoria === label);
      const porcentajeCambio = datoActual?.porcentajeCambio || 0;
      
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border border-neutral-200">
          <p className="font-medium text-neutral-800 mb-2">{label}</p>
          <div className="space-y-2">
            <p className="text-spoon-primary">
              {`${mesActual}: ${formatearDinero(payload[0].value as number)}`}
            </p>
            <p className="text-neutral-500">
              {`${mesAnterior}: ${formatearDinero(payload[1].value as number)}`}
            </p>
            <div className={`flex items-center gap-1 ${
              porcentajeCambio >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {porcentajeCambio >= 0 
                ? <ArrowUpRight className="h-4 w-4" />
                : <ArrowDownRight className="h-4 w-4" />
              }
              <span>{Math.abs(porcentajeCambio)}% vs mes anterior</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!datos || datos.length === 0) {
    return (
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-neutral-800">Comparativa Mensual por Categoría</h3>
          <p className="text-sm text-neutral-600 mt-1">
            Comparación de ventas entre {mesActual} y {mesAnterior}
          </p>
        </div>
        <div className="flex items-center justify-center h-[400px] text-neutral-500">
          No hay datos disponibles para comparar
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-neutral-800">Comparativa Mensual por Categoría</h3>
        <p className="text-sm text-neutral-600 mt-1">
          Comparación de ventas entre {mesActual} y {mesAnterior}
        </p>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={datos}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="categoria" 
              scale="point" 
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              tickFormatter={formatearDinero}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="mesActual" 
              name={mesActual} 
              fill="#F4821F" 
            />
            <Bar 
              dataKey="mesAnterior" 
              name={mesAnterior} 
              fill="#9CA3AF" 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Resumen de cambios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {datos.map((item) => (
          <div 
            key={item.categoria}
            className="p-4 rounded-lg bg-neutral-50"
          >
            <p className="text-sm font-medium text-neutral-700">{item.categoria}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className={`
                flex items-center gap-1
                ${item.porcentajeCambio >= 0 ? 'text-green-600' : 'text-red-600'}
              `}>
                {item.porcentajeCambio >= 0 
                  ? <ArrowUpRight className="h-4 w-4" />
                  : <ArrowDownRight className="h-4 w-4" />
                }
                <span className="font-medium">{Math.abs(item.porcentajeCambio)}%</span>
              </div>
              <span className="text-sm text-neutral-500">vs mes anterior</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};



























