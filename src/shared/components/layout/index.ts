// src/shared/components/layout/index.ts
// =====================================================
// SISTEMA DE LAYOUT SPOON - EXPORTS COMPLETOS
// =====================================================

import React from 'react';

// LAYOUT PRINCIPAL
// ================
export { DashboardLayout } from './DashboardLayout';

// ESTADOS VACÍOS
// ==============
export { 
  EmptyState,
  NoProductsState,
  NoMenuState, 
  NoOrdersState
} from './EmptyState';

// MÉTRICAS Y DASHBOARDS
// =====================
export { 
  MetricCard,
  SalesMetricCard,
  OrdersMetricCard,
  CustomersMetricCard
} from './MetricCard';

// HEADERS DE PÁGINA
// =================
export {
  PageHeader,
  DashboardPageHeader,
  ListPageHeader,
  DetailPageHeader
} from './PageHeader';

// =====================================================
// TIPOS Y INTERFACES COMPARTIDAS
// =====================================================

// Tipo principal del sidebar
export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: string | number;
  isActive?: boolean;
  children?: SidebarItem[];
}

// Tipos de layout común
export interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

// Configuración de sidebar
export interface SidebarConfig {
  collapsed?: boolean;
  items: SidebarItem[];
}

// Configuración de métricas
export interface MetricConfig {
  title: string;
  value: string | number;
  format?: 'currency' | 'percentage' | 'number';
  change?: {
    value: number;
    period?: string;
  };
  icon?: React.ReactNode;
  iconColor?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
}

// Configuración de acciones
export interface ActionConfig {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

// Configuración de breadcrumbs
export interface BreadcrumbConfig {
  label: string;
  href?: string;
  onClick?: () => void;
}

// =====================================================
// CONFIGURACIONES PREDEFINIDAS
// =====================================================

/**
 * Configuración estándar de sidebar para restaurante
 */
export const getDefaultSidebarItems = (activeRoute?: string): SidebarItem[] => [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: null, // Se asigna en el componente que lo use
    isActive: activeRoute === '/dashboard',
  },
  {
    id: 'menu',
    label: 'Menú',
    href: '/dashboard/carta',
    icon: null,
    isActive: activeRoute?.startsWith('/dashboard/carta'),
    children: [
      {
        id: 'menu-items',
        label: 'Productos',
        href: '/dashboard/carta',
        icon: null,
        isActive: activeRoute === '/dashboard/carta',
      },
      {
        id: 'menu-daily',
        label: 'Menú del día',
        href: '/dashboard/carta/menu-dia',
        icon: null,
        isActive: activeRoute === '/dashboard/carta/menu-dia',
      },
      {
        id: 'combinations',
        label: 'Combinaciones',
        href: '/dashboard/carta/combinaciones',
        icon: null,
        isActive: activeRoute === '/dashboard/carta/combinaciones',
      },
    ],
  },
  {
    id: 'orders',
    label: 'Órdenes',
    href: '/dashboard/registro-ventas',
    icon: null,
    isActive: activeRoute === '/dashboard/registro-ventas',
  },
  {
    id: 'stats',
    label: 'Estadísticas',
    href: '/dashboard/estadisticas',
    icon: null,
    isActive: activeRoute?.startsWith('/dashboard/estadisticas'),
  },
  {
    id: 'users',
    label: 'Usuarios',
    href: '/dashboard/configuracion/usuarios',
    icon: null,
    isActive: activeRoute?.startsWith('/dashboard/configuracion/usuarios'),
  },
  {
    id: 'config',
    label: 'Configuración',
    href: '/dashboard/configuracion',
    icon: null,
    isActive: activeRoute?.startsWith('/dashboard/configuracion'),
  },
];

/**
 * Configuración de métricas por defecto para dashboard
 */
export const getDefaultDashboardMetrics = (): MetricConfig[] => [
  {
    title: 'Ventas totales',
    value: 0,
    format: 'currency',
    change: { value: 0, period: 'vs ayer' },
    iconColor: 'success',
  },
  {
    title: 'Órdenes activas',
    value: 0,
    format: 'number',
    iconColor: 'primary',
  },
  {
    title: 'Productos',
    value: 0,
    format: 'number',
    iconColor: 'neutral',
  },
  {
    title: 'Ingresos del mes',
    value: 0,
    format: 'currency',
    change: { value: 0, period: 'vs mes anterior' },
    iconColor: 'success',
  },
];

/**
 * Acciones comunes para headers de página
 */
export const getDefaultHeaderActions = (): Record<string, ActionConfig> => ({
  add: {
    label: 'Agregar',
    onClick: () => {},
    variant: 'primary',
  },
  export: {
    label: 'Exportar',
    onClick: () => {},
    variant: 'outline',
  },
  edit: {
    label: 'Editar',
    onClick: () => {},
    variant: 'primary',
  },
  delete: {
    label: 'Eliminar',
    onClick: () => {},
    variant: 'destructive',
  },
  share: {
    label: 'Compartir',
    onClick: () => {},
    variant: 'outline',
  },
});

// =====================================================
// HELPERS Y UTILIDADES DE LAYOUT
// =====================================================

/**
 * Genera clases de grid responsive basadas en el número de elementos
 */
export const getResponsiveGridCols = (itemCount: number): string => {
  if (itemCount === 1) return 'grid-cols-1';
  if (itemCount === 2) return 'grid-cols-1 md:grid-cols-2';
  if (itemCount === 3) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  if (itemCount >= 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
};

/**
 * Obtiene clases de espaciado consistentes
 */
export const getSpacingClasses = (spacing: 'none' | 'sm' | 'md' | 'lg' | 'xl' = 'md'): string => {
  const spacingMap = {
    none: '',
    sm: 'gap-2 p-2',
    md: 'gap-4 p-4',
    lg: 'gap-6 p-6',
    xl: 'gap-8 p-8',
  };
  return spacingMap[spacing];
};

/**
 * Obtiene clases de tamaño consistentes
 */
export const getSizeClasses = (size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md'): string => {
  const sizeMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  };
  return sizeMap[size];
};

/**
 * Genera clases de sombra consistentes
 */
export const getShadowClasses = (level: 'none' | 'sm' | 'md' | 'lg' | 'xl' = 'md'): string => {
  const shadowMap = {
    none: '',
    sm: 'shadow-spoon-sm',
    md: 'shadow-spoon-md',
    lg: 'shadow-spoon-lg',
    xl: 'shadow-spoon-xl',
  };
  return shadowMap[level];
};

/**
 * Formatea valores para métricas
 */
export const formatMetricValue = (
  value: string | number,
  format: 'currency' | 'percentage' | 'number' = 'number'
): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  switch (format) {
    case 'currency':
      return `$${numValue.toLocaleString()}`;
    case 'percentage':
      return `${numValue}%`;
    default:
      return numValue.toLocaleString();
  }
};

/**
 * Detecta si una ruta está activa
 */
export const isRouteActive = (currentRoute: string, targetRoute: string, exact = false): boolean => {
  if (exact) {
    return currentRoute === targetRoute;
  }
  return currentRoute.startsWith(targetRoute);
};

/**
 * Genera breadcrumbs automáticos desde una ruta
 */
export const generateBreadcrumbsFromRoute = (route: string): BreadcrumbConfig[] => {
  const segments = route.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbConfig[] = [];
  
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;
    
    breadcrumbs.push({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' '),
      href: isLast ? undefined : currentPath,
    });
  });
  
  return breadcrumbs;
};

// =====================================================
// CONSTANTES Y CONFIGURACIONES
// =====================================================

/**
 * Breakpoints del sistema de diseño
 */
export const BREAKPOINTS = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Configuraciones de animación
 */
export const ANIMATION_DURATIONS = {
  fast: 200,
  normal: 300,
  slow: 500,
} as const;

/**
 * Z-index del sistema
 */
export const Z_INDEX = {
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
} as const;

// =====================================================
// VERSIÓN Y METADATA
// =====================================================
export const LAYOUT_VERSION = '2.0.0';
export const LAYOUT_SYSTEM_NAME = 'Spoon Layout System';

/**
 * Información del sistema de layout
 */
export const getLayoutInfo = () => ({
  version: LAYOUT_VERSION,
  name: LAYOUT_SYSTEM_NAME,
  components: [
    'DashboardLayout',
    'EmptyState',
    'MetricCard',
    'PageHeader',
  ],
  utilities: [
    'getResponsiveGridCols',
    'getSpacingClasses',
    'getSizeClasses',
    'formatMetricValue',
  ],
});
