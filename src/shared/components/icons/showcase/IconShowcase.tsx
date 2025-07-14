import React, { useState } from 'react';

// En tu proyecto real, importarías estos tipos:
// import { SpoonIconVariant, SpoonIconProps } from '@/shared/components/icons';

const IconShowcase = () => {
  // Tipos locales que coinciden con el sistema real
  type LocalVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'disabled';
  
  const [selectedSize, setSelectedSize] = useState(24);
  const [selectedVariant, setSelectedVariant] = useState<LocalVariant>('default');

  // Iconos simulados para demo (en tu proyecto serían imports reales)
  const createIcon = (paths: React.ReactNode) => ({ size = 24, variant = 'default' as LocalVariant }) => {
    const colors: Record<LocalVariant, string> = {
      default: '#374151',
      primary: '#F4821F',
      success: '#15803D',
      warning: '#CC6A10',
      error: '#B91C1C',
      disabled: '#9CA3AF',
    };
    
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ color: colors[variant] }}>
        {paths}
      </svg>
    );
  };

  const ChefHatIcon = createIcon(
    <>
      <path d="M6 10C6 6.686 8.686 4 12 4C15.314 4 18 6.686 18 10V12C18 12.552 17.552 13 17 13H7C6.448 13 6 12.552 6 12V10Z" 
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 13V17C8 17.552 8.448 18 9 18H15C15.552 18 16 17.552 16 17V13" 
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="9" cy="7" r="1" fill="currentColor" opacity="0.6"/>
      <circle cx="12" cy="6.5" r="1" fill="currentColor" opacity="0.6"/>
      <circle cx="15" cy="7" r="1" fill="currentColor" opacity="0.6"/>
      <path d="M7 20H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </>
  );

  const PlateServiceIcon = createIcon(
    <>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
      <path d="M8 8L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M15 9L16 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5 12H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M21 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </>
  );

  const OrderBellIcon = createIcon(
    <>
      <path d="M12 3C8.686 3 6 5.686 6 9V12.586L4.293 14.293C3.902 14.684 4.176 15.5 4.707 15.5H19.293C19.824 15.5 20.098 14.684 19.707 14.293L18 12.586V9C18 5.686 15.314 3 12 3Z" 
            stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M10.5 19C10.5 20.381 11.119 21 12 21S13.5 20.381 13.5 19" 
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="17" cy="7" r="2" fill="#F4821F" opacity="0.8"/>
      <path d="M12 7V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </>
  );

  const SalesAnalyticsIcon = createIcon(
    <>
      <path d="M3 18L9 12L13 16L21 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 3V8H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 21L10 19L12 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
      <circle cx="7" cy="21" r="1" fill="currentColor" opacity="0.4"/>
      <circle cx="13" cy="21" r="1" fill="currentColor" opacity="0.4"/>
    </>
  );

  const CustomersIcon = createIcon(
    <>
      <path d="M16 21V19C16 17.895 15.105 17 14 17H6C4.895 17 4 17.895 4 19V21" 
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="10" cy="11" r="4" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M19.071 19.071C20.442 17.7 20.442 15.5 19.071 14.129C17.7 12.758 15.5 12.758 14.129 14.129" 
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="18" cy="6" r="2" fill="currentColor" opacity="0.5"/>
    </>
  );

  const RestaurantTableIcon = createIcon(
    <>
      <rect x="4" y="9" width="16" height="2" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 11V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M18 11V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
      <circle cx="16" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
      <path d="M9 21H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
    </>
  );

  // Datos de los iconos organizados por categorías
  const iconCategories = [
    {
      name: 'Cocina & Chef',
      description: 'Iconos relacionados con la cocina y preparación',
      icons: [
        { name: 'Chef Hat', component: ChefHatIcon, usage: 'Cocineros, equipo de cocina' },
        { name: 'Plate Service', component: PlateServiceIcon, usage: 'Servicio, platos listos' },
      ]
    },
    {
      name: 'Órdenes & Servicio',
      description: 'Iconos para gestión de pedidos y servicio',
      icons: [
        { name: 'Order Bell', component: OrderBellIcon, usage: 'Notificaciones, nuevos pedidos' },
        { name: 'Restaurant Table', component: RestaurantTableIcon, usage: 'Mesas, áreas del restaurante' },
      ]
    },
    {
      name: 'Analytics & Ventas',
      description: 'Iconos para métricas y análisis',
      icons: [
        { name: 'Sales Analytics', component: SalesAnalyticsIcon, usage: 'Dashboard, reportes de ventas' },
        { name: 'Customers', component: CustomersIcon, usage: 'Clientes, usuarios' },
      ]
    }
  ];

  const sizes = [16, 20, 24, 28, 32, 48];
  const variants: Array<{ key: LocalVariant; label: string; color: string }> = [
    { key: 'default', label: 'Default', color: '#374151' },
    { key: 'primary', label: 'Primary', color: '#F4821F' },
    { key: 'success', label: 'Success', color: '#15803D' },
    { key: 'warning', label: 'Warning', color: '#CC6A10' },
    { key: 'error', label: 'Error', color: '#B91C1C' },
    { key: 'disabled', label: 'Disabled', color: '#9CA3AF' },
  ];

  return (
    <div className="min-h-screen bg-spoon-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-spoon-neutral-800 mb-4">
            🍽️ Sistema de Iconos Spoon Refined
          </h1>
          <p className="text-lg text-spoon-neutral-600 max-w-2xl mx-auto">
            Sistema completo de iconografía específica para restaurantes con micro-detalles y personalidad gastronómica
          </p>
        </div>

        {/* Controles Interactivos */}
        <div className="bg-white rounded-xl p-6 shadow-spoon-md mb-8">
          <h2 className="text-xl font-semibold text-spoon-neutral-700 mb-4">
            🎛️ Controles Interactivos
          </h2>
          
          {/* Size Selector */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-spoon-neutral-600 mb-2 block">
                Tamaño (px)
              </label>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? 'bg-spoon-primary text-white'
                        : 'bg-spoon-neutral-100 text-spoon-neutral-600 hover:bg-spoon-neutral-200'
                    }`}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </div>
            
            {/* Variant Selector */}
            <div>
              <label className="text-sm font-medium text-spoon-neutral-600 mb-2 block">
                Variante de Color
              </label>
              <div className="grid grid-cols-3 gap-2">
                {variants.map(variant => (
                  <button
                    key={variant.key}
                    onClick={() => setSelectedVariant(variant.key)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedVariant === variant.key
                        ? 'bg-spoon-primary text-white'
                        : 'bg-spoon-neutral-100 text-spoon-neutral-600 hover:bg-spoon-neutral-200'
                    }`}
                  >
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: variant.color }}
                    />
                    <span>{variant.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Categorías de Iconos */}
        {iconCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-8">
            <div className="bg-white rounded-xl shadow-spoon-md overflow-hidden">
              <div className="bg-gradient-to-r from-spoon-primary/10 to-spoon-primary/5 px-6 py-4 border-b border-spoon-border">
                <h3 className="text-xl font-semibold text-spoon-neutral-800">
                  {category.name}
                </h3>
                <p className="text-sm text-spoon-neutral-600 mt-1">
                  {category.description}
                </p>
              </div>
              
              <div className="p-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {category.icons.map((icon, iconIndex) => (
                    <div key={iconIndex} className="flex items-center space-x-6 p-4 bg-spoon-neutral-50 rounded-lg">
                      {/* Icon Display */}
                      <div className="flex-shrink-0 p-4 bg-white rounded-lg shadow-sm">
                        <icon.component size={selectedSize} variant={selectedVariant} />
                      </div>
                      
                      {/* Icon Info */}
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-spoon-neutral-800 mb-1">
                          {icon.name}
                        </h4>
                        <p className="text-sm text-spoon-neutral-600 mb-3">
                          {icon.usage}
                        </p>
                        
                        {/* Code Example */}
                        <div className="bg-spoon-neutral-800 rounded-lg p-3 text-xs">
                          <code className="text-green-400">
                            {`<${icon.name.replace(' ', '')}Icon size={${selectedSize}} variant="${selectedVariant}" />`}
                          </code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Información Técnica */}
        <div className="bg-white rounded-xl p-8 shadow-spoon-lg">
          <h2 className="text-2xl font-semibold text-spoon-neutral-700 mb-6">
            📋 Especificaciones Técnicas
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-spoon-neutral-800">Características</h3>
              <ul className="space-y-2 text-sm text-spoon-neutral-600">
                <li>• Stroke weight: 1.5px consistente</li>
                <li>• Esquinas redondeadas: 2px radius</li>
                <li>• Grid system: 24x24px base</li>
                <li>• Micro-detalles temáticos</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-spoon-neutral-800">Tamaños Disponibles</h3>
              <ul className="space-y-2 text-sm text-spoon-neutral-600">
                <li>• 16px - Iconos inline, badges</li>
                <li>• 20px - Botones, navegación</li>
                <li>• 24px - Estándar dashboard</li>
                <li>• 28px - Headers, títulos</li>
                <li>• 32px - Destacados</li>
                <li>• 48px - Heroes, ilustraciones</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-spoon-neutral-800">Variantes de Color</h3>
              <ul className="space-y-2 text-sm text-spoon-neutral-600">
                <li>• Default - Texto neutro</li>
                <li>• Primary - Acciones principales</li>
                <li>• Success - Estados positivos</li>
                <li>• Warning - Advertencias</li>
                <li>• Error - Estados negativos</li>
                <li>• Disabled - Elementos inactivos</li>
              </ul>
            </div>
          </div>
          
          {/* Uso Recomendado */}
          <div className="mt-8 p-4 bg-spoon-primary-light rounded-lg">
            <h3 className="font-semibold text-spoon-neutral-800 mb-2">💡 Uso Recomendado</h3>
            <p className="text-sm text-spoon-neutral-700">
              Importa iconos específicos: <code className="bg-white px-2 py-1 rounded text-spoon-primary">
                import {"{ ChefHatIcon, OrderBellIcon }"} from '@/shared/components/icons'
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconShowcase;