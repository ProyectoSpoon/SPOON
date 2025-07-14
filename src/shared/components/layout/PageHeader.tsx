'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Icons
import { 
  ArrowLeft, 
  MoreHorizontal, 
  Download, 
  Share, 
  Filter,
  Search,
  Plus,
  RefreshCw,
  Settings,
  Info,
  ChevronRight
} from 'lucide-react';

interface ActionButton {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  loading?: boolean;
  disabled?: boolean;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface PageHeaderProps {
  /**
   * Título principal de la página
   */
  title: string;
  
  /**
   * Subtítulo o descripción
   */
  subtitle?: string;
  
  /**
   * Navegación de migas de pan
   */
  breadcrumbs?: BreadcrumbItem[];
  
  /**
   * Botón de regreso
   */
  showBack?: boolean;
  onBack?: () => void;
  
  /**
   * Badges de estado
   */
  badges?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    color?: string;
  }[];
  
  /**
   * Acciones principales
   */
  actions?: ActionButton[];
  
  /**
   * Menú de opciones adicionales
   */
  menuActions?: ActionButton[];
  
  /**
   * Barra de búsqueda
   */
  searchConfig?: {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    onSearch?: (value: string) => void;
  };
  
  /**
   * Filtros
   */
  filterConfig?: {
    count?: number;
    onOpenFilters?: () => void;
  };
  
  /**
   * Información adicional (tooltip)
   */
  helpText?: string;
  
  /**
   * Modo compacto
   */
  compact?: boolean;
  
  /**
   * Sticky header
   */
  sticky?: boolean;
  
  /**
   * Clases adicionales
   */
  className?: string;
  
  /**
   * Contenido personalizado en la parte derecha
   */
  rightContent?: React.ReactNode;
  
  /**
   * Contenido adicional debajo del header
   */
  children?: React.ReactNode;
}

// Componente Badge simple
const Badge: React.FC<{ children: React.ReactNode; variant?: string; className?: string; }> = ({ 
  children, 
  variant = 'default', 
  className = '' 
}) => {
  const variants = {
    default: 'bg-spoon-neutral-100 text-spoon-neutral-800',
    secondary: 'bg-spoon-neutral-200 text-spoon-neutral-700',
    destructive: 'bg-spoon-error/10 text-spoon-error',
    outline: 'border border-spoon-border text-spoon-neutral-600',
  };
  
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
      variants[variant as keyof typeof variants] || variants.default,
      className
    )}>
      {children}
    </span>
  );
};

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  showBack = false,
  onBack,
  badges = [],
  actions = [],
  menuActions = [],
  searchConfig,
  filterConfig,
  helpText,
  compact = false,
  sticky = false,
  className = '',
  rightContent,
  children,
}) => {
  const [searchValue, setSearchValue] = React.useState(searchConfig?.value || '');
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    searchConfig?.onChange?.(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchConfig?.onSearch?.(searchValue);
  };

  return (
    <div
      className={cn(
        'bg-white border-b border-spoon-border',
        sticky && 'sticky top-0 z-50 backdrop-blur-sm bg-white/95',
        className
      )}
    >
      <div className={cn(
        'px-4 py-4 lg:px-6',
        compact && 'py-3'
      )}>
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-2 text-sm text-spoon-neutral-500 mb-3">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight className="w-4 h-4" />}
                {item.href || item.onClick ? (
                  <button
                    onClick={() => item.onClick?.()}
                    className="hover:text-spoon-primary-dark transition-colors"
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className="font-medium text-spoon-neutral-800">
                    {item.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Header Principal */}
        <div className="flex items-start justify-between gap-4">
          {/* Lado Izquierdo */}
          <div className="flex items-start space-x-4 min-w-0 flex-1">
            {/* Botón Back */}
            {showBack && (
              <button
                onClick={onBack}
                className="flex-shrink-0 mt-1 flex items-center justify-center w-8 h-8 rounded-lg hover:bg-spoon-neutral-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            {/* Títulos y Badges */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-3 mb-1">
                <h1 className={cn(
                  'font-bold text-spoon-neutral-800 truncate',
                  compact ? 'text-xl' : 'text-2xl lg:text-3xl'
                )}>
                  {title}
                </h1>

                {/* Info Helper */}
                {helpText && (
                  <button
                    title={helpText}
                    className="text-spoon-neutral-400 hover:text-spoon-neutral-600 transition-colors"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Badges */}
              {badges.length > 0 && (
                <div className="flex items-center space-x-2 mb-2">
                  {badges.map((badge, index) => (
                    <Badge key={index} variant={badge.variant}>
                      {badge.label}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Subtitle */}
              {subtitle && (
                <p className={cn(
                  'text-spoon-neutral-600',
                  compact ? 'text-sm' : 'text-base'
                )}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Lado Derecho */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Búsqueda */}
            {searchConfig && (
              <form onSubmit={handleSearchSubmit} className="hidden sm:block">
                <div className={cn(
                  'relative flex items-center transition-all duration-200',
                  isSearchFocused && 'scale-105'
                )}>
                  <Search className="absolute left-3 w-4 h-4 text-spoon-neutral-400" />
                  <input
                    type="text"
                    placeholder={searchConfig.placeholder || 'Buscar...'}
                    value={searchValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className={cn(
                      'pl-10 pr-4 py-2 bg-spoon-neutral-50 border border-spoon-border rounded-lg',
                      'focus:outline-none focus:ring-2 focus:ring-spoon-primary/50 focus:border-transparent',
                      'transition-all duration-200 text-sm w-64'
                    )}
                  />
                </div>
              </form>
            )}

            {/* Filtros */}
            {filterConfig && (
              <button
                onClick={filterConfig.onOpenFilters}
                className="relative inline-flex items-center px-3 py-2 border border-spoon-border bg-white text-spoon-neutral-700 rounded-lg font-medium hover:bg-spoon-neutral-50 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                {filterConfig.count && filterConfig.count > 0 && (
                  <Badge className="ml-2 px-1.5 py-0.5 text-xs">
                    {filterConfig.count}
                  </Badge>
                )}
              </button>
            )}

            {/* Contenido Personalizado */}
            {rightContent}

            {/* Acciones Principales */}
            {actions.map((action, index) => {
              const baseClasses = "flex-shrink-0 inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
              const variantClasses = {
                primary: "bg-spoon-primary text-white hover:bg-spoon-primary-dark",
                secondary: "bg-spoon-neutral-100 text-spoon-neutral-700 hover:bg-spoon-neutral-200",
                outline: "border border-spoon-border bg-white text-spoon-neutral-700 hover:bg-spoon-neutral-50",
                ghost: "text-spoon-neutral-700 hover:bg-spoon-neutral-100",
                destructive: "bg-spoon-error text-white hover:bg-spoon-error/90",
              };
              
              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  disabled={action.disabled || action.loading}
                  className={cn(baseClasses, variantClasses[action.variant || 'primary'])}
                >
                  {action.loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    action.icon && <span className="mr-2">{action.icon}</span>
                  )}
                  {action.label}
                </button>
              );
            })}

            {/* Menú de Opciones */}
            {menuActions.length > 0 && (
              <button className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-spoon-neutral-100 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Contenido Adicional */}
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

// Componentes preconfigurados para casos comunes
export const DashboardPageHeader: React.FC<Partial<PageHeaderProps> & { title: string; }> = (props) => (
  <PageHeader
    actions={[
      {
        label: 'Nueva venta',
        icon: <Plus className="w-4 h-4" />,
        onClick: () => {},
        variant: 'primary',
      }
    ]}
    {...props}
  />
);

export const ListPageHeader: React.FC<Partial<PageHeaderProps> & { 
  title: string;
  onAdd?: () => void;
  onExport?: () => void;
  addLabel?: string;
}> = ({ onAdd, onExport, addLabel = 'Agregar', ...props }) => (
  <PageHeader
    searchConfig={{
      placeholder: 'Buscar...',
      onChange: () => {},
      ...props.searchConfig,
    }}
    actions={[
      ...(onExport ? [{
        label: 'Exportar',
        icon: <Download className="w-4 h-4" />,
        onClick: onExport,
        variant: 'outline' as const,
      }] : []),
      ...(onAdd ? [{
        label: addLabel,
        icon: <Plus className="w-4 h-4" />,
        onClick: onAdd,
        variant: 'primary' as const,
      }] : []),
    ]}
    filterConfig={{
      onOpenFilters: () => {},
      ...props.filterConfig,
    }}
    {...props}
  />
);

export const DetailPageHeader: React.FC<Partial<PageHeaderProps> & {
  title: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
}> = ({ onEdit, onDelete, onShare, ...props }) => (
  <PageHeader
    showBack
    actions={[
      ...(onShare ? [{
        label: 'Compartir',
        icon: <Share className="w-4 h-4" />,
        onClick: onShare,
        variant: 'outline' as const,
      }] : []),
      ...(onEdit ? [{
        label: 'Editar',
        icon: <Settings className="w-4 h-4" />,
        onClick: onEdit,
        variant: 'primary' as const,
      }] : []),
    ]}
    menuActions={[
      ...(onDelete ? [{
        label: 'Eliminar',
        onClick: onDelete,
        variant: 'destructive' as const,
      }] : []),
    ]}
    {...props}
  />
);

export default PageHeader;


























