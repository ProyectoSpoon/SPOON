'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Icons
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  BarChart3,
  ArrowUpRight
} from 'lucide-react';

interface MetricCardProps {
  /**
   * Título de la métrica
   */
  title: string;
  
  /**
   * Valor principal de la métrica
   */
  value: string | number;
  
  /**
   * Valor anterior para comparación
   */
  previousValue?: string | number;
  
  /**
   * Cambio porcentual
   */
  change?: {
    value: number;
    period?: string;
  };
  
  /**
   * Icono de la métrica
   */
  icon?: React.ReactNode;
  
  /**
   * Color del icono y elementos de acento
   */
  iconColor?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
  
  /**
   * Descripción o contexto adicional
   */
  description?: string;
  
  /**
   * Formato del valor (moneda, porcentaje, número)
   */
  format?: 'currency' | 'percentage' | 'number';
  
  /**
   * Acción al hacer clic
   */
  onClick?: () => void;
  
  /**
   * Estado de carga
   */
  loading?: boolean;
  
  /**
   * Variante visual
   */
  variant?: 'default' | 'highlighted' | 'minimal' | 'gradient';
  
  /**
   * Tamaño de la card
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Mostrar línea de tendencia
   */
  showTrend?: boolean;
  
  /**
   * Datos para mini gráfico de tendencia
   */
  trendData?: number[];
  
  /**
   * Clases adicionales
   */
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  previousValue,
  change,
  icon,
  iconColor = 'primary',
  description,
  format = 'number',
  onClick,
  loading = false,
  variant = 'default',
  size = 'md',
  showTrend = false,
  trendData = [],
  className = '',
}) => {
  // Configuraciones de color
  const colorConfigs = {
    primary: {
      icon: 'text-spoon-primary bg-spoon-primary/10',
      accent: 'text-spoon-primary',
      gradient: 'from-spoon-primary/10 to-spoon-primary/5',
    },
    success: {
      icon: 'text-spoon-success bg-spoon-success/10',
      accent: 'text-spoon-success',
      gradient: 'from-emerald-50 to-emerald-25',
    },
    warning: {
      icon: 'text-spoon-warning bg-spoon-warning/10',
      accent: 'text-spoon-warning',
      gradient: 'from-amber-50 to-amber-25',
    },
    error: {
      icon: 'text-spoon-error bg-spoon-error/10',
      accent: 'text-spoon-error',
      gradient: 'from-red-50 to-red-25',
    },
    neutral: {
      icon: 'text-spoon-neutral-600 bg-spoon-neutral-100',
      accent: 'text-spoon-neutral-600',
      gradient: 'from-spoon-neutral-50 to-white',
    },
  };

  // Configuraciones de tamaño
  const sizeConfigs = {
    sm: {
      container: 'p-4',
      icon: 'w-8 h-8 p-1.5',
      iconSize: 'w-5 h-5',
      title: 'text-xs',
      value: 'text-lg',
      change: 'text-xs',
    },
    md: {
      container: 'p-6',
      icon: 'w-10 h-10 p-2',
      iconSize: 'w-6 h-6',
      title: 'text-sm',
      value: 'text-2xl',
      change: 'text-sm',
    },
    lg: {
      container: 'p-8',
      icon: 'w-12 h-12 p-2.5',
      iconSize: 'w-7 h-7',
      title: 'text-base',
      value: 'text-3xl',
      change: 'text-base',
    },
  };

  const colorConfig = colorConfigs[iconColor];
  const sizeConfig = sizeConfigs[size];

  // Formatear valor
  const formatValue = (val: string | number) => {
    const numValue = typeof val === 'string' ? parseFloat(val) : val;
    
    switch (format) {
      case 'currency':
        return `$${numValue.toLocaleString()}`;
      case 'percentage':
        return `${numValue}%`;
      default:
        return numValue.toLocaleString();
    }
  };

  // Calcular tendencia
  const getTrendDirection = () => {
    if (!change) return 'neutral';
    if (change.value > 0) return 'up';
    if (change.value < 0) return 'down';
    return 'neutral';
  };

  const trendDirection = getTrendDirection();
  const trendIcon = {
    up: <TrendingUp className="w-3 h-3" />,
    down: <TrendingDown className="w-3 h-3" />,
    neutral: <Minus className="w-3 h-3" />
  }[trendDirection];

  const trendColor = {
    up: 'text-spoon-success',
    down: 'text-spoon-error',
    neutral: 'text-spoon-neutral-400'
  }[trendDirection];

  // Componente de carga
  if (loading) {
    return (
      <div className={cn('animate-pulse bg-white rounded-lg border border-spoon-border', sizeConfig.container, className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-3 bg-spoon-neutral-200 rounded w-20"></div>
            <div className="h-6 bg-spoon-neutral-200 rounded w-16"></div>
            <div className="h-2 bg-spoon-neutral-200 rounded w-12"></div>
          </div>
          <div className={cn('bg-spoon-neutral-200 rounded-lg', sizeConfig.icon)}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className={cn(
          'bg-white rounded-lg border border-spoon-border shadow-sm transition-all duration-200',
          'hover:shadow-md hover:border-spoon-primary/20',
          variant === 'highlighted' && 'ring-1 ring-spoon-primary/20',
          variant === 'gradient' && `bg-gradient-to-br ${colorConfig.gradient}`,
          variant === 'minimal' && 'shadow-none border-none bg-spoon-neutral-50/50',
          sizeConfig.container,
          onClick && 'cursor-pointer hover:scale-[1.02]'
        )}
        onClick={onClick}
      >
        <div className="flex items-start justify-between">
          {/* Contenido Principal */}
          <div className="flex-1 space-y-2">
            {/* Título */}
            <p className={cn(
              'font-medium text-spoon-neutral-600',
              sizeConfig.title
            )}>
              {title}
            </p>

            {/* Valor Principal */}
            <p className={cn(
              'font-bold text-spoon-neutral-800',
              sizeConfig.value
            )}>
              {formatValue(value)}
            </p>

            {/* Cambio/Tendencia */}
            {change && (
              <div className="flex items-center space-x-2">
                <div className={cn(
                  'flex items-center space-x-1 px-2 py-1 rounded-full',
                  'bg-white/80 border',
                  trendDirection === 'up' && 'border-spoon-success/20 bg-spoon-success/5',
                  trendDirection === 'down' && 'border-spoon-error/20 bg-spoon-error/5',
                  trendDirection === 'neutral' && 'border-spoon-neutral-200'
                )}>
                  <span className={trendColor}>
                    {trendIcon}
                  </span>
                  <span className={cn(
                    'font-medium',
                    trendColor,
                    sizeConfig.change
                  )}>
                    {Math.abs(change.value)}%
                  </span>
                </div>
                
                {change.period && (
                  <span className={cn(
                    'text-spoon-neutral-500',
                    sizeConfig.change
                  )}>
                    vs {change.period}
                  </span>
                )}
              </div>
            )}

            {/* Descripción */}
            {description && (
              <p className={cn(
                'text-spoon-neutral-500',
                sizeConfig.change
              )}>
                {description}
              </p>
            )}
          </div>

          {/* Icono */}
          {icon && (
            <div className={cn(
              'rounded-lg flex items-center justify-center flex-shrink-0',
              sizeConfig.icon,
              colorConfig.icon
            )}>
              <div className={sizeConfig.iconSize}>
                {icon}
              </div>
            </div>
          )}
        </div>

        {/* Mini Gráfico de Tendencia */}
        {showTrend && trendData.length > 0 && (
          <div className="mt-4 pt-4 border-t border-spoon-border">
            <div className="flex items-end space-x-1 h-8">
              {trendData.map((point, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex-1 rounded-sm transition-all duration-300',
                    colorConfig.accent.replace('text-', 'bg-'),
                    'opacity-60 hover:opacity-100'
                  )}
                  style={{ height: `${(point / Math.max(...trendData)) * 100}%` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Indicador de Click */}
        {onClick && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="w-4 h-4 text-spoon-neutral-400" />
          </div>
        )}
      </div>
    </div>
  );
};

// Componentes preconfigurados para métricas comunes
export const SalesMetricCard: React.FC<Partial<MetricCardProps> & { title: string; value: string | number; }> = (props) => (
  <MetricCard
    icon={<DollarSign className="w-full h-full" />}
    iconColor="success"
    format="currency"
    {...props}
  />
);

export const OrdersMetricCard: React.FC<Partial<MetricCardProps> & { title: string; value: string | number; }> = (props) => (
  <MetricCard
    icon={<ShoppingCart className="w-full h-full" />}
    iconColor="primary"
    {...props}
  />
);

export const CustomersMetricCard: React.FC<Partial<MetricCardProps> & { title: string; value: string | number; }> = (props) => (
  <MetricCard
    icon={<Users className="w-full h-full" />}
    iconColor="primary"
    {...props}
  />
);

export default MetricCard;


























