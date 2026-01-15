// src/shared/components/icons/index.tsx
// =====================================================
// SISTEMA DE ICONOS SPOON REFINED - LIMPIO
// =====================================================

import React from 'react';
import { cn } from '@/lib/utils';

// =====================================================
// TIPOS BASE (DEFINIDOS UNA SOLA VEZ)
// =====================================================

export type SpoonIconVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'disabled';

export interface SpoonIconProps {
  size?: 16 | 20 | 24 | 28 | 32 | 48;
  color?: string;
  className?: string;
  variant?: SpoonIconVariant;
  animate?: boolean;
}

// =====================================================
// UTILIDADES INTERNAS
// =====================================================

const getIconColor = (variant: SpoonIconVariant = 'default'): string => {
  const colorMap: Record<SpoonIconVariant, string> = {
    default: '#374151',      // spoon-neutral-700
    primary: '#F4821F',      // spoon-primary
    success: '#15803D',      // spoon-success
    warning: '#CC6A10',      // spoon-warning
    error: '#B91C1C',        // spoon-error
    disabled: '#9CA3AF',     // spoon-neutral-400
  };
  
  return colorMap[variant];
};

// Componente base para todos los iconos
const SpoonIconBase: React.FC<SpoonIconProps & { children: React.ReactNode }> = ({
  size = 24,
  color,
  className = '',
  variant = 'default',
  animate = false,
  children,
}) => {
  const defaultColor = getIconColor(variant);
  const finalColor = color || defaultColor;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        'flex-shrink-0',
        animate && 'transition-all duration-200',
        className
      )}
      style={{ color: finalColor }}
    >
      {children}
    </svg>
  );
};

// =====================================================
// ICONOS DE COCINA Y CHEF
// =====================================================

export const ChefHatIcon: React.FC<SpoonIconProps> = (props) => (
  <SpoonIconBase {...props}>
    <path 
      d="M6 10C6 6.686 8.686 4 12 4C15.314 4 18 6.686 18 10V12C18 12.552 17.552 13 17 13H7C6.448 13 6 12.552 6 12V10Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M8 13V17C8 17.552 8.448 18 9 18H15C15.552 18 16 17.552 16 17V13" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <circle cx="9" cy="7" r="1" fill="currentColor" opacity="0.6"/>
    <circle cx="12" cy="6.5" r="1" fill="currentColor" opacity="0.6"/>
    <circle cx="15" cy="7" r="1" fill="currentColor" opacity="0.6"/>
    <path 
      d="M7 20H17" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
  </SpoonIconBase>
);

export const KitchenTimerIcon: React.FC<SpoonIconProps> = (props) => (
  <SpoonIconBase {...props}>
    <circle 
      cx="12" 
      cy="13" 
      r="8" 
      stroke="currentColor" 
      strokeWidth="1.5"
    />
    <path 
      d="M12 9V13L15 16" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M9 2H15" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    <path 
      d="M12 2V5" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    <path 
      d="M21 8L19.5 9.5" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    <path 
      d="M3 8L4.5 9.5" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
  </SpoonIconBase>
);

export const CookingPotIcon: React.FC<SpoonIconProps> = (props) => (
  <SpoonIconBase {...props}>
    <path 
      d="M6 10C6 8.895 6.895 8 8 8H16C17.105 8 18 8.895 18 10V17C18 18.105 17.105 19 16 19H8C6.895 19 6 18.105 6 17V10Z" 
      stroke="currentColor" 
      strokeWidth="1.5"
    />
    <path 
      d="M4 10H20" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    <path 
      d="M10 5V8" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    <path 
      d="M14 5V8" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    {/* Vapor */}
    <path 
      d="M9 3C9 3 9.5 2 10 3C10.5 4 11 3 11 3" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      opacity="0.6"
    />
    <path 
      d="M13 3C13 3 13.5 2 14 3C14.5 4 15 3 15 3" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      opacity="0.6"
    />
  </SpoonIconBase>
);

// =====================================================
// ICONOS DE SERVICIO Y PLATOS
// =====================================================

export const PlateServiceIcon: React.FC<SpoonIconProps> = (props) => (
  <SpoonIconBase {...props}>
    <circle 
      cx="12" 
      cy="12" 
      r="8" 
      stroke="currentColor" 
      strokeWidth="1.5"
    />
    <circle 
      cx="12" 
      cy="12" 
      r="5" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      opacity="0.3"
    />
    <path 
      d="M8 8L9 9" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    <path 
      d="M15 9L16 8" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    <path 
      d="M5 12H3" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    <path 
      d="M21 12H19" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
  </SpoonIconBase>
);

export const OrderBellIcon: React.FC<SpoonIconProps> = (props) => (
  <SpoonIconBase {...props}>
    <path 
      d="M12 3C8.686 3 6 5.686 6 9V12.586L4.293 14.293C3.902 14.684 4.176 15.5 4.707 15.5H19.293C19.824 15.5 20.098 14.684 19.707 14.293L18 12.586V9C18 5.686 15.314 3 12 3Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinejoin="round"
    />
    <path 
      d="M10.5 19C10.5 20.381 11.119 21 12 21S13.5 20.381 13.5 19" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    <circle cx="17" cy="7" r="2" fill="#F4821F" opacity="0.8"/>
    <path 
      d="M12 7V9" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      opacity="0.5"
    />
  </SpoonIconBase>
);

export const ServiceBellIcon: React.FC<SpoonIconProps> = (props) => (
  <SpoonIconBase {...props}>
    <path 
      d="M6 14C6 10.134 9.134 7 13 7H11C14.866 7 18 10.134 18 14H20C20.552 14 21 14.448 21 15C21 15.552 20.552 16 20 16H4C3.448 16 3 15.552 3 15C3 14.448 3.448 14 4 14H6Z" 
      stroke="currentColor" 
      strokeWidth="1.5"
    />
    <circle cx="12" cy="17" r="1" fill="currentColor"/>
    <path 
      d="M12 5V7" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    <circle cx="12" cy="4" r="1" fill="currentColor" opacity="0.6"/>
  </SpoonIconBase>
);

// =====================================================
// ICONOS DE VENTAS Y ANALYTICS
// =====================================================

export const SalesAnalyticsIcon: React.FC<SpoonIconProps> = (props) => (
  <SpoonIconBase {...props}>
    <path 
      d="M3 18L9 12L13 16L21 8" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M21 3V8H16" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M8 21L10 19L12 21" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      opacity="0.6"
    />
    <circle cx="7" cy="21" r="1" fill="currentColor" opacity="0.4"/>
    <circle cx="13" cy="21" r="1" fill="currentColor" opacity="0.4"/>
  </SpoonIconBase>
);

export const RevenueIcon: React.FC<SpoonIconProps> = (props) => (
  <SpoonIconBase {...props}>
    <circle 
      cx="12" 
      cy="12" 
      r="9" 
      stroke="currentColor" 
      strokeWidth="1.5"
    />
    <path 
      d="M12 6V8M12 16V18" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    <path 
      d="M9 8H13C14.105 8 15 8.895 15 10C15 11.105 14.105 12 13 12H11C9.895 12 9 12.895 9 14C9 15.105 9.895 16 11 16H15" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <circle cx="17" cy="7" r="2" fill="#15803D" opacity="0.7"/>
  </SpoonIconBase>
);

// =====================================================
// ICONOS DE CLIENTES Y USUARIOS
// =====================================================

export const CustomersIcon: React.FC<SpoonIconProps> = (props) => (
  <SpoonIconBase {...props}>
    <path 
      d="M16 21V19C16 17.895 15.105 17 14 17H6C4.895 17 4 17.895 4 19V21" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <circle 
      cx="10" 
      cy="11" 
      r="4" 
      stroke="currentColor" 
      strokeWidth="1.5"
    />
    <path 
      d="M19.071 19.071C20.442 17.7 20.442 15.5 19.071 14.129C17.7 12.758 15.5 12.758 14.129 14.129" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    <circle cx="18" cy="6" r="2" fill="currentColor" opacity="0.5"/>
  </SpoonIconBase>
);

export const WaiterIcon: React.FC<SpoonIconProps> = (props) => (
  <SpoonIconBase {...props}>
    <circle 
      cx="12" 
      cy="6" 
      r="3" 
      stroke="currentColor" 
      strokeWidth="1.5"
    />
    <path 
      d="M8 13H16L15 21H9L8 13Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinejoin="round"
    />
    <path 
      d="M7 13C7 11.895 7.895 11 9 11H15C16.105 11 17 13" 
      stroke="currentColor" 
      strokeWidth="1.5"
    />
    <circle cx="10" cy="16" r="1" fill="currentColor" opacity="0.6"/>
    <circle cx="14" cy="16" r="1" fill="currentColor" opacity="0.6"/>
  </SpoonIconBase>
);

// =====================================================
// ICONOS DE RESTAURANTE Y LOCAL
// =====================================================

export const RestaurantTableIcon: React.FC<SpoonIconProps> = (props) => (
  <SpoonIconBase {...props}>
    <rect 
      x="4" 
      y="9" 
      width="16" 
      height="2" 
      rx="1" 
      stroke="currentColor" 
      strokeWidth="1.5"
    />
    <path 
      d="M6 11V19" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    <path 
      d="M18 11V19" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
    <circle cx="16" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
    <path 
      d="M9 21H15" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      opacity="0.4"
    />
  </SpoonIconBase>
);

export const RestaurantBuildingIcon: React.FC<SpoonIconProps> = (props) => (
  <SpoonIconBase {...props}>
    <path 
      d="M3 21H21" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    <rect 
      x="5" 
      y="8" 
      width="14" 
      height="13" 
      stroke="currentColor" 
      strokeWidth="1.5"
    />
    <path 
      d="M9 21V17C9 16.448 9.448 16 10 16H14C14.552 16 15 16.448 15 17V21" 
      stroke="currentColor" 
      strokeWidth="1.5"
    />
    <rect x="8" y="11" width="2" height="2" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="14" y="11" width="2" height="2" stroke="currentColor" strokeWidth="1.5"/>
    <path 
      d="M12 8V3L8 5L12 3L16 5" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </SpoonIconBase>
);

// =====================================================
// ICONOS DE DASHBOARD Y SISTEMA (ESTILO CONSISTENTE)
// =====================================================

export const DashboardSpoonIcon: React.FC<SpoonIconProps> = (props) => (
  <SpoonIconBase {...props}>
    <rect 
      x="3" 
      y="3" 
      width="18" 
      height="18" 
      rx="2" 
      stroke="currentColor" 
      strokeWidth="1.5"
    />
    <path 
      d="M9 9H15M9 12H15M9 15H12" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    <rect 
      x="5" 
      y="5" 
      width="3" 
      height="3" 
      rx="1" 
      stroke="currentColor" 
      strokeWidth="1.5"
    />
    {/* Elementos sutiles de dashboard gastronómico */}
    <circle cx="17" cy="7" r="2" fill="#F4821F" opacity="0.8"/>
    <path 
      d="M6.5 17V19" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      opacity="0.6"
    />
  </SpoonIconBase>
);

export const SettingsSpoonIcon: React.FC<SpoonIconProps> = (props) => (
  <SpoonIconBase {...props}>
    <circle 
      cx="12" 
      cy="12" 
      r="3" 
      stroke="currentColor" 
      strokeWidth="1.5"
    />
    <path 
      d="M19.4 15C19.26 15.37 19.04 15.7 18.77 16L17.66 15.47C17.44 15.35 17.17 15.35 16.95 15.47L15.84 16C15.57 15.7 15.35 15.37 15.21 15H16.5C16.78 15 17 14.78 17 14.5V13.5C17 13.22 16.78 13 16.5 13H15.21C15.35 12.63 15.57 12.3 15.84 12L16.95 12.53C17.17 12.65 17.44 12.65 17.66 12.53L18.77 12C19.04 12.3 19.26 12.63 19.4 13H18.1C17.82 13 17.6 13.22 17.6 13.5V14.5C17.6 14.78 17.82 15 18.1 15H19.4Z" 
      stroke="currentColor" 
      strokeWidth="1.5"
    />
    <path 
      d="M12 1L13.09 2.26L14.5 1.79L15.21 3.21L16.79 3.5L16.26 4.91L17 6L15.74 7.09L16.21 8.5L14.79 9.21L14.5 10.79L13.09 10.26L12 11L10.91 9.74L9.5 10.21L8.79 8.79L7.21 8.5L7.74 7.09L7 6L8.26 4.91L7.79 3.5L9.21 2.79L9.5 1.21L10.91 1.74L12 1Z" 
      stroke="currentColor" 
      strokeWidth="1.5"
    />
    {/* Elementos sutiles gastronómicos */}
    <circle cx="12" cy="8" r="1" fill="currentColor" opacity="0.5"/>
    <circle cx="8" cy="12" r="1" fill="currentColor" opacity="0.5"/>
  </SpoonIconBase>
);

export const AuditSpoonIcon: React.FC<SpoonIconProps> = (props) => (
  <SpoonIconBase {...props}>
    <path 
      d="M14 2H6C5.447 2 5 2.447 5 3V21C5 21.553 5.447 22 6 22H18C18.553 22 19 21.553 19 21V7L14 2Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinejoin="round"
    />
    <path 
      d="M14 2V7H19" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M8 10H16M8 14H16M8 18H12" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    {/* Elementos sutiles de verificación */}
    <circle cx="17" cy="17" r="2" fill="#15803D" opacity="0.8"/>
    <path 
      d="M7 12L8 13L10 11" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      opacity="0.6"
    />
  </SpoonIconBase>
);

export const HelpSpoonIcon: React.FC<SpoonIconProps> = (props) => (
  <SpoonIconBase {...props}>
    <circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="1.5"
    />
    <path 
      d="M9.09 9C9.325 8.425 9.725 7.925 10.225 7.575C10.725 7.225 11.35 7.05 12 7.05C12.65 7.05 13.275 7.225 13.775 7.575C14.275 7.925 14.675 8.425 14.91 9" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    <path 
      d="M12 13V14" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    <circle cx="12" cy="17" r="1" fill="currentColor"/>
    {/* Elementos sutiles de soporte */}
    <circle cx="6" cy="6" r="1" fill="#F4821F" opacity="0.6"/>
    <path 
      d="M19 7L17 9" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      opacity="0.5"
    />
  </SpoonIconBase>
);

// =====================================================
// EXPORTS ORGANIZADOS POR CATEGORÍA (ACTUALIZADO)
// =====================================================

export const KitchenIcons = {
  ChefHat: ChefHatIcon,
  Timer: KitchenTimerIcon,
  Pot: CookingPotIcon,
} as const;

export const ServiceIcons = {
  Plate: PlateServiceIcon,
  OrderBell: OrderBellIcon,
  ServiceBell: ServiceBellIcon,
} as const;

export const AnalyticsIcons = {
  Sales: SalesAnalyticsIcon,
  Revenue: RevenueIcon,
} as const;

export const PeopleIcons = {
  Customers: CustomersIcon,
  Waiter: WaiterIcon,
} as const;

export const RestaurantIcons = {
  Table: RestaurantTableIcon,
  Building: RestaurantBuildingIcon,
} as const;

export const SystemIcons = {
  Dashboard: DashboardSpoonIcon,
  Settings: SettingsSpoonIcon,
  Audit: AuditSpoonIcon,
  Help: HelpSpoonIcon,
} as const;

// Export por defecto con todos los iconos organizados (ACTUALIZADO)
const SpoonIcons = {
  Kitchen: KitchenIcons,
  Service: ServiceIcons,
  Analytics: AnalyticsIcons,
  People: PeopleIcons,
  Restaurant: RestaurantIcons,
  System: SystemIcons,
} as const;

export default SpoonIcons;
