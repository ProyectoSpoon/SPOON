'use client';
import React from 'react';
import { Card } from '@/shared/components/ui/Card';
import { DashboardMetrics } from '../../types/dashboard.types';

// ✨ REEMPLAZADO: Iconos Spoon Refined en lugar de emojis
import {
  RevenueIcon,
  PlateServiceIcon,
  SalesAnalyticsIcon,
  CustomersIcon
} from '@/shared/components/icons';

interface MetricasWidgetProps {
  metricas?: DashboardMetrics;
  loading?: boolean;
}

interface MetricaItemProps {
  label: string;
  value: string;
  IconComponent: React.ComponentType<any>;
  trend?: 'up' | 'down' | 'stable';
  comparison?: number;
  variant?: 'default' | 'primary' | 'success' | 'error';
}

// ✨ FUNCIÓN HÍBRIDA: Formateo de moneda mejorado
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// ✨ FUNCIÓN MODERNIZADA: Iconos de tendencia con Spoon
const getTrendIcon = (tendencia: 'up' | 'down' | 'stable') => {
  switch (tendencia) {
    case 'up': 
      return <SalesAnalyticsIcon size={16} variant="success" />;
    case 'down': 
      return <div className="transform rotate-180">
        <SalesAnalyticsIcon size={16} variant="error" />
      </div>;
    case 'stable': 
      return <SalesAnalyticsIcon size={16} variant="default" />;
    default: 
      return <SalesAnalyticsIcon size={16} variant="default" />;
  }
};

// ✨ FUNCIÓN MODERNIZADA: Colores con sistema spoon-*
const getTrendColor = (trend: 'up' | 'down' | 'stable'): string => {
  switch (trend) {
    case 'up': return 'text-spoon-success';
    case 'down': return 'text-spoon-error';
    case 'stable': return 'text-spoon-neutral-500';
    default: return 'text-spoon-neutral-500';
  }
};

const MetricaItem: React.FC<MetricaItemProps> = ({
  label,
  value,
  IconComponent,
  trend,
  comparison,
  variant = 'primary'
}) => {
  return (
    <Card className="p-6 hover:shadow-spoon-md transition-all duration-300 border-l-4 border-l-spoon-primary min-h-[140px] grid-area-metricas">
      {/* Header con icono - Más espacio */}
      <div className="flex items-start justify-between mb-6">
        <div className="p-3 bg-spoon-primary-light rounded-xl">
          <IconComponent size={24} variant={variant} />
        </div>
        
        {/* Indicador de tendencia más visible */}
        {comparison !== undefined && trend && (
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold ${
            trend === 'up' 
              ? 'bg-spoon-success/10 text-spoon-success'
              : trend === 'down'
              ? 'bg-spoon-error/10 text-spoon-error'
              : 'bg-spoon-neutral-100 text-spoon-neutral-600'
          }`}>
            {getTrendIcon(trend)}
            <span>{comparison > 0 ? '+' : ''}{comparison}%</span>
          </div>
        )}
      </div>

      {/* Valor principal - Más prominente */}
      <div className="mb-3">
        <div className="text-3xl font-bold text-spoon-neutral-800 leading-tight">
          {value}
        </div>
      </div>

      {/* Label - Más claro */}
      <div className="text-sm font-medium text-spoon-neutral-600 mb-2">
        {label}
      </div>

      {/* Comparación detallada */}
      {comparison !== undefined && trend && (
        <div className={`text-sm ${getTrendColor(trend)} font-medium`}>
          vs período anterior
        </div>
      )}
    </Card>
  );
};

const SkeletonMetricas: React.FC = () => (
  <Card className="p-6 grid-area-metricas">
    <div className="mb-6">
      <div className="h-7 bg-spoon-neutral-200 rounded w-48 animate-pulse"></div>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-spoon-neutral-200 rounded-lg"></div>
              <div className="w-16 h-6 bg-spoon-neutral-200 rounded-full"></div>
            </div>
            <div className="h-8 bg-spoon-neutral-200 rounded mb-2"></div>
            <div className="h-4 bg-spoon-neutral-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-spoon-neutral-200 rounded w-1/2"></div>
          </div>
        </Card>
      ))}
    </div>
  </Card>
);

export const MetricasWidget: React.FC<MetricasWidgetProps> = ({
  metricas,
  loading
}) => {
  if (loading || !metricas) {
    return <SkeletonMetricas />;
  }

  return (
    <Card className="p-6 shadow-spoon-lg grid-area-metricas">
      {/* ✨ MODERNIZADO: Header con mejor diseño */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-spoon-primary to-spoon-primary-dark rounded-lg">
          <SalesAnalyticsIcon size={24} variant="primary" className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-spoon-neutral-800">
            Resumen del Día
          </h2>
          <p className="text-sm text-spoon-neutral-600">
            Métricas principales de rendimiento
          </p>
        </div>
      </div>

      {/* ✨ CORREGIDO: Grid con más espacio y mejor responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricaItem
          label="Ventas Hoy"
          value={formatCurrency(metricas.ventasHoy)}
          IconComponent={RevenueIcon}
          trend={metricas.tendencia}
          comparison={metricas.comparacionAyer}
          variant={metricas.tendencia === 'up' ? 'success' : metricas.tendencia === 'down' ? 'error' : 'default'}
        />
        
        <MetricaItem
          label="Platos Vendidos"
          value={metricas.platosVendidos.toString()}
          IconComponent={PlateServiceIcon}
          variant="primary"
        />
        
        <MetricaItem
          label="Ticket Promedio"
          value={formatCurrency(metricas.ticketPromedio)}
          IconComponent={SalesAnalyticsIcon}
          variant="primary"
        />
        
        <MetricaItem
          label="Crecimiento"
          value={`${metricas.comparacionAyer > 0 ? '+' : ''}${metricas.comparacionAyer}%`}
          IconComponent={CustomersIcon}
          trend={metricas.tendencia}
          comparison={metricas.comparacionAyer}
          variant={metricas.tendencia === 'up' ? 'success' : metricas.tendencia === 'down' ? 'error' : 'default'}
        />
      </div>
    </Card>
  );
};
