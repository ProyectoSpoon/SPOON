'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Icons para diferentes tipos de estados vacíos
import { 
  FileText,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Search,
  Utensils,
  Calendar,
  Settings,
  AlertCircle,
  Plus,
  RefreshCw
} from 'lucide-react';

interface EmptyStateProps {
  variant?: 
    | 'no-data' 
    | 'no-products' 
    | 'no-menu' 
    | 'no-orders' 
    | 'no-users' 
    | 'no-search' 
    | 'no-content'
    | 'error'
    | 'maintenance'
    | 'custom';
  
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  illustration?: string | React.ReactNode;
  
  actions?: {
    primary?: {
      label: string;
      onClick: () => void;
      loading?: boolean;
    };
    secondary?: {
      label: string;
      onClick: () => void;
    };
  };
  
  helpLinks?: {
    label: string;
    href: string;
  }[];
  
  size?: 'sm' | 'md' | 'lg';
  variant_style?: 'default' | 'minimal' | 'illustrated';
  className?: string;
}

// Configuraciones predefinidas por tipo
const EmptyStateConfigs: Record<string, { icon: React.ReactNode; title: string; description: string; }> = {
  'no-data': {
    icon: <BarChart3 className="w-12 h-12" />,
    title: 'No hay datos disponibles',
    description: 'Aún no tienes información para mostrar en esta sección.',
  },
  'no-products': {
    icon: <Package className="w-12 h-12" />,
    title: 'Aún no tienes productos creados',
    description: 'Empieza agregando uno con las acciones de "Nueva venta" y "Nuevo gasto"',
  },
  'no-menu': {
    icon: <Utensils className="w-12 h-12" />,
    title: 'Aún no tienes productos creados',
    description: 'Comienza creando tu primer producto para el menú.',
  },
  'no-orders': {
    icon: <ShoppingCart className="w-12 h-12" />,
    title: 'No hay órdenes activas',
    description: 'Las nuevas órdenes aparecerán aquí cuando los clientes hagan pedidos.',
  },
  'no-users': {
    icon: <Users className="w-12 h-12" />,
    title: 'No hay usuarios registrados',
    description: 'Invita a tu equipo para empezar a colaborar en el restaurante.',
  },
  'no-search': {
    icon: <Search className="w-12 h-12" />,
    title: 'No se encontraron resultados',
    description: 'Intenta con términos diferentes o revisa que la búsqueda esté bien escrita.',
  },
  'no-content': {
    icon: <FileText className="w-12 h-12" />,
    title: 'No hay contenido',
    description: 'Esta sección está vacía por el momento.',
  },
  'error': {
    icon: <AlertCircle className="w-12 h-12" />,
    title: 'Algo salió mal',
    description: 'Ocurrió un error inesperado. Por favor intenta de nuevo.',
  },
  'maintenance': {
    icon: <Settings className="w-12 h-12" />,
    title: 'Mantenimiento en progreso',
    description: 'Esta funcionalidad está temporalmente deshabilitada.',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'no-data',
  title,
  description,
  icon,
  illustration,
  actions,
  helpLinks,
  size = 'md',
  variant_style = 'default',
  className = '',
}) => {
  // Valores finales - simplificado
  let finalTitle = title || 'No hay información';
  let finalDescription = description || '';
  let finalIcon = icon;
  
  // Aplicar configuración por variant
  if (!title && variant !== 'custom' && EmptyStateConfigs[variant]) {
    finalTitle = EmptyStateConfigs[variant].title;
  }
  if (!description && variant !== 'custom' && EmptyStateConfigs[variant]) {
    finalDescription = EmptyStateConfigs[variant].description;
  }
  if (!icon && variant !== 'custom' && EmptyStateConfigs[variant]) {
    finalIcon = EmptyStateConfigs[variant].icon;
  }

  // Configuraciones de tamaño
  const sizeConfigs = {
    sm: {
      container: 'p-6 max-w-sm',
      spacing: 'space-y-3',
      title: 'text-lg',
      description: 'text-sm',
      iconContainer: 'w-16 h-16',
    },
    md: {
      container: 'p-8 max-w-md',
      spacing: 'space-y-4',
      title: 'text-xl',
      description: 'text-base',
      iconContainer: 'w-20 h-20',
    },
    lg: {
      container: 'p-10 max-w-lg',
      spacing: 'space-y-6',
      title: 'text-2xl',
      description: 'text-lg',
      iconContainer: 'w-24 h-24',
    },
  };

  const sizeConfig = sizeConfigs[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center mx-auto',
        sizeConfig.container,
        className
      )}
    >
      <div className={cn('flex flex-col items-center', sizeConfig.spacing)}>
        {/* Ilustración o Icono */}
        <div
          className={cn(
            'flex items-center justify-center rounded-full mb-2',
            sizeConfig.iconContainer,
            variant_style === 'default' && 'bg-spoon-neutral-100',
            variant_style === 'minimal' && 'bg-transparent',
            variant_style === 'illustrated' && 'bg-gradient-to-br from-spoon-primary/10 to-spoon-primary/5'
          )}
        >
          {illustration ? (
            typeof illustration === 'string' ? (
              <img 
                src={illustration} 
                alt={finalTitle}
                className="w-full h-full object-contain"
              />
            ) : (
              illustration
            )
          ) : (
            <div className={cn(
              'text-spoon-neutral-400',
              variant === 'error' && 'text-spoon-error',
              variant === 'no-menu' && 'text-spoon-primary',
              variant === 'no-products' && 'text-spoon-primary'
            )}>
              {finalIcon}
            </div>
          )}
        </div>

        {/* Título */}
        <h3
          className={cn(
            'font-heading font-semibold text-spoon-neutral-800',
            sizeConfig.title
          )}
        >
          {finalTitle}
        </h3>

        {/* Descripción */}
        {finalDescription && (
          <p
            className={cn(
              'text-spoon-neutral-500 leading-relaxed max-w-sm',
              sizeConfig.description
            )}
          >
            {finalDescription}
          </p>
        )}

        {/* Acciones Principales */}
        {actions && (
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            {actions.primary && (
              <button
                onClick={actions.primary.onClick}
                disabled={actions.primary.loading}
                className="inline-flex items-center justify-center px-4 py-2 bg-spoon-primary text-white rounded-lg font-medium hover:bg-spoon-primary-dark transition-colors disabled:opacity-50 min-w-32"
              >
                {actions.primary.loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {actions.primary.label}
              </button>
            )}
            
            {actions.secondary && (
              <button
                onClick={actions.secondary.onClick}
                className="inline-flex items-center justify-center px-4 py-2 border border-spoon-border bg-white text-spoon-neutral-700 rounded-lg font-medium hover:bg-spoon-neutral-50 transition-colors min-w-32"
              >
                {actions.secondary.label}
              </button>
            )}
          </div>
        )}

        {/* Enlaces de Ayuda */}
        {helpLinks && helpLinks.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t border-spoon-border">
            {helpLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-sm text-spoon-primary-dark hover:text-spoon-primary-darker transition-colors underline-offset-4 hover:underline"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Componentes de conveniencia para casos específicos
export const NoProductsState: React.FC<Partial<EmptyStateProps>> = (props) => (
  <EmptyState
    variant="no-products"
    actions={{
      primary: {
        label: 'Crear producto',
        onClick: () => {},
      }
    }}
    helpLinks={[
      { label: 'Ver tutorial', href: '#' },
      { label: 'Contactar soporte', href: '#' }
    ]}
    {...props}
  />
);

export const NoMenuState: React.FC<Partial<EmptyStateProps>> = (props) => (
  <EmptyState
    variant="no-menu"
    actions={{
      primary: {
        label: 'Agregar al menú',
        onClick: () => {},
      }
    }}
    {...props}
  />
);

export const NoOrdersState: React.FC<Partial<EmptyStateProps>> = (props) => (
  <EmptyState
    variant="no-orders"
    size="lg"
    {...props}
  />
);

export default EmptyState;


























