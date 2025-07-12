'use client';

import React from 'react';
import { DashboardMetrics } from '../../types/dashboard.types';
import { formatCurrency, getTrendIcon, getTrendColor } from '../../utils/dashboard.utils';

interface MetricasWidgetProps {
  metricas?: DashboardMetrics;
  loading?: boolean;
}

interface MetricaItemProps {
  label: string;
  value: string;
  icon: string;
  trend?: 'up' | 'down' | 'stable';
  comparison?: number;
}

const MetricaItem: React.FC<MetricaItemProps> = ({
  label,
  value,
  icon,
  trend,
  comparison
}) => {
  return (
    <div className="metrica-moderna">
      <div className="metrica-icono">{icon}</div>
      <div className="metrica-valor">{value}</div>
      <div className="metrica-label">{label}</div>
      {comparison !== undefined && trend && (
        <div className={`metrica-comparacion ${getTrendColor(trend)}`}>
          <span>{getTrendIcon(trend)}</span>
          {comparison > 0 ? '+' : ''}{comparison}% vs ayer
        </div>
      )}
    </div>
  );
};

const SkeletonMetricas: React.FC = () => (
  <div className="dashboard-card grid-area-metricas">
    <div className="card-header-modern">
      <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
    </div>
    <div className="card-content-modern">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
            <div className="h-8 bg-gray-200 rounded-full w-8 mx-auto mb-3"></div>
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const MetricasWidget: React.FC<MetricasWidgetProps> = ({
  metricas,
  loading
}) => {
  if (loading || !metricas) {
    return <SkeletonMetricas />;
  }

  return (
    <div className="dashboard-card grid-area-metricas">
      <div className="card-header-modern">
        <h2 className="card-title-modern">
          📈 Resumen del Día
        </h2>
      </div>
      <div className="card-content-modern">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricaItem
            label="Ventas Hoy"
            value={formatCurrency(metricas.ventasHoy)}
            icon="💰"
            trend={metricas.tendencia}
            comparison={metricas.comparacionAyer}
          />
          <MetricaItem
            label="Platos Vendidos"
            value={metricas.platosVendidos.toString()}
            icon="🍽️"
          />
          <MetricaItem
            label="Ticket Promedio"
            value={formatCurrency(metricas.ticketPromedio)}
            icon="🧾"
          />
          <MetricaItem
            label="vs Ayer"
            value={`${metricas.comparacionAyer > 0 ? '+' : ''}${metricas.comparacionAyer}%`}
            icon={getTrendIcon(metricas.tendencia)}
            trend={metricas.tendencia}
          />
        </div>
      </div>
    </div>
  );
};
