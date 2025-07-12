'use client';

import { Card } from '@/shared/components/ui/Card';
import { formatearMoneda, formatearPorcentaje } from '../../utils/formatters';
import { calcularCrecimiento } from '../../utils/calculosEstadisticos';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  Users 
} from 'lucide-react';

interface KPI {
  id: string;
  titulo: string;
  valor: number;
  tipo: 'moneda' | 'porcentaje' | 'numero';
  icono: 'dollar' | 'bag' | 'clock' | 'users';
  valorAnterior?: number;
  colorIcono?: string;
  colorFondo?: string;
  descripcion?: string;
}

interface KPIsCardsProps {
  kpis: KPI[];
}

export const KPIsCards = ({ kpis }: KPIsCardsProps) => {
  const renderizarIcono = (tipo: string, className: string = "h-6 w-6") => {
    switch (tipo) {
      case 'dollar':
        return <DollarSign className={className} />;
      case 'bag':
        return <ShoppingBag className={className} />;
      case 'clock':
        return <Clock className={className} />;
      case 'users':
        return <Users className={className} />;
      default:
        return <TrendingUp className={className} />;
    }
  };

  const formatearValor = (valor: number, tipo: KPI['tipo']): string => {
    switch (tipo) {
      case 'moneda':
        return formatearMoneda(valor);
      case 'porcentaje':
        return formatearPorcentaje(valor);
      default:
        return valor.toLocaleString();
    }
  };

  const obtenerVariacion = (actual: number, anterior: number | undefined) => {
    if (anterior === undefined) return null;
    
    const porcentaje = calcularCrecimiento(actual, anterior);
    return {
      valor: Math.abs(porcentaje),
      esPositivo: porcentaje >= 0,
      texto: `${porcentaje >= 0 ? '+' : '-'}${Math.abs(porcentaje).toFixed(1)}%`
    };
  };

  const obtenerColores = (variacion: { esPositivo: boolean } | null) => {
    if (!variacion) return 'text-neutral-500';
    return variacion.esPositivo ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi) => {
        const variacion = kpi.valorAnterior !== undefined 
          ? obtenerVariacion(kpi.valor, kpi.valorAnterior)
          : null;

        return (
          <Card key={kpi.id} className="p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <span className="text-sm font-medium text-neutral-600">
                  {kpi.titulo}
                </span>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-neutral-900">
                    {formatearValor(kpi.valor, kpi.tipo)}
                  </p>
                  {variacion && (
                    <div className="flex items-center gap-1">
                      {variacion.esPositivo 
                        ? <TrendingUp className="h-4 w-4 text-green-600" />
                        : <TrendingDown className="h-4 w-4 text-red-600" />
                      }
                      <span className={obtenerColores(variacion)}>
                        {variacion.texto}
                      </span>
                      <span className="text-sm text-neutral-500">
                        vs periodo anterior
                      </span>
                    </div>
                  )}
                  {kpi.descripcion && (
                    <p className="text-sm text-neutral-500">
                      {kpi.descripcion}
                    </p>
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-full ${kpi.colorFondo || 'bg-blue-100'}`}>
                {renderizarIcono(kpi.icono, `${kpi.colorIcono || 'text-blue-600'}`)}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
