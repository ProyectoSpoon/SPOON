'use client';

import { Card } from '@/shared/components/ui/Card';
import { formatearMoneda, formatearPorcentaje } from '@/app/dashboard/estadisticas/utils/formatters';
import { calcularCrecimiento } from '@/app/dashboard/estadisticas/utils/calculosEstadisticos';

// ✨ REEMPLAZADO: Iconos Spoon Refined en lugar de lucide-react
import {
  RevenueIcon,
  PlateServiceIcon,
  KitchenTimerIcon,
  CustomersIcon,
  SalesAnalyticsIcon
} from '@/shared/components/icons';

// ✨ INTERFACE HÍBRIDA: Compatible con ambos sistemas existentes
interface KPI {
  // Campos obligatorios (común en ambos sistemas)
  titulo: string;
  valor: number;

  // Campos opcionales (compatibilidad con datos existentes)
  id?: string;                    // Solo en algunos datos
  tipo?: 'moneda' | 'porcentaje' | 'numero';  // Inferido si no existe
  icono?: 'revenue' | 'plates' | 'timer' | 'customers' | 'dollar' | 'bag' | 'clock' | 'users';  // Híbrido
  valorAnterior?: number;         // Usado para cálculos de tendencia
  descripcion?: string;

  // Campos legacy (mantener compatibilidad)
  porcentajeCambio?: number;      // Del sistema existente
  color?: string;                 // Del sistema existente
  colorIcono?: string;            // Hardcodeos existentes
  colorFondo?: string;            // Hardcodeos existentes
}

interface KPIsCardsProps {
  kpis: KPI[];
  isLoading?: boolean;
}

export const KPIsCards = ({ kpis, isLoading = false }: KPIsCardsProps) => {

  // ✨ MAPEO HÍBRIDO: Lucide-react → Spoon Refined + fallbacks
  const renderizarIcono = (tipo: KPI['icono'], variant: 'default' | 'primary' | 'success' | 'error' = 'primary') => {
    const iconProps = { size: 24 as const, variant };

    // Mapeo moderno (Spoon Refined)
    switch (tipo) {
      case 'revenue':
        return <RevenueIcon {...iconProps} />;
      case 'plates':
        return <PlateServiceIcon {...iconProps} />;
      case 'timer':
        return <KitchenTimerIcon {...iconProps} />;
      case 'customers':
        return <CustomersIcon {...iconProps} />;

      // Compatibilidad con iconos legacy (lucide-react)
      case 'dollar':
        return <RevenueIcon {...iconProps} />;        // dollar → RevenueIcon
      case 'bag':
        return <PlateServiceIcon {...iconProps} />;   // bag → PlateServiceIcon
      case 'clock':
        return <KitchenTimerIcon {...iconProps} />;   // clock → KitchenTimerIcon
      case 'users':
        return <CustomersIcon {...iconProps} />;      // users → CustomersIcon

      // Fallback por defecto
      default:
        return <SalesAnalyticsIcon {...iconProps} />;
    }
  };

  // ✨ HÍBRIDO: Formateo inteligente con detección automática de tipo
  const formatearValor = (valor: number, tipo?: KPI['tipo']): string => {
    // Si no hay tipo definido, inferir por el valor
    if (!tipo) {
      if (valor > 1000 && valor < 1000000) {
        tipo = 'moneda';  // Valores grandes probablemente son moneda
      } else if (valor < 100) {
        tipo = 'numero';  // Valores pequeños probablemente son cantidades
      } else {
        tipo = 'numero';  // Default
      }
    }

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

  // ✨ MODERNIZADO: Función para obtener variante de icono basada en tendencia
  const obtenerVarianteIcono = (variacion: { esPositivo: boolean } | null): 'default' | 'primary' | 'success' | 'error' => {
    if (!variacion) return 'primary';
    return variacion.esPositivo ? 'success' : 'error';
  };

  // ✨ ACTUALIZADO: Usando clases spoon-* en lugar de hardcodeo
  const obtenerColores = (variacion: { esPositivo: boolean } | null) => {
    if (!variacion) return 'text-spoon-neutral-500';
    return variacion.esPositivo ? 'text-spoon-success' : 'text-spoon-error';
  };

  // ✨ NUEVO: Icono de tendencia usando SalesAnalyticsIcon con rotación CSS
  const renderizarTendencia = (esPositivo: boolean) => (
    <div className={`transform ${esPositivo ? 'rotate-0' : 'rotate-180'}`}>
      <SalesAnalyticsIcon
        size={16}
        variant={esPositivo ? 'success' : 'error'}
      />
    </div>
  );

  // ✨ NUEVO: Loading state moderno
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="p-6">
            <div className="animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-spoon-neutral-200 rounded w-3/4"></div>
                  <div className="h-8 bg-spoon-neutral-200 rounded w-1/2"></div>
                  <div className="h-4 bg-spoon-neutral-200 rounded w-2/3"></div>
                </div>
                <div className="w-12 h-12 bg-spoon-neutral-200 rounded-full"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => {
        const variacion = kpi.valorAnterior !== undefined
          ? obtenerVariacion(kpi.valor, kpi.valorAnterior)
          : null;

        const varianteIcono = obtenerVarianteIcono(variacion);

        return (
          <Card
            key={kpi.id || index}
            className="p-6 hover:shadow-spoon-lg transition-all duration-300 hover:scale-[1.02] border-l-4 border-l-spoon-primary"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                {/* ✨ MEJORADO: Título con mejor tipografía */}
                <span className="text-sm font-medium text-spoon-neutral-600 block">
                  {kpi.titulo}
                </span>

                <div className="space-y-2">
                  {/* ✨ HÍBRIDO: Valor principal con formateo inteligente */}
                  <p className="text-3xl font-bold text-spoon-neutral-800 leading-none">
                    {formatearValor(kpi.valor, kpi.tipo)}
                  </p>

                  {/* ✨ MODERNIZADO: Indicador de tendencia con iconos Spoon */}
                  {variacion && (
                    <div className="flex items-center gap-2">
                      {renderizarTendencia(variacion.esPositivo)}
                      <span className={`font-semibold ${obtenerColores(variacion)}`}>
                        {variacion.texto}
                      </span>
                      <span className="text-xs text-spoon-neutral-500">
                        vs período anterior
                      </span>
                    </div>
                  )}

                  {/* ✨ MEJORADO: Descripción con mejor espaciado */}
                  {kpi.descripcion && (
                    <p className="text-sm text-spoon-neutral-500 leading-relaxed">
                      {kpi.descripcion}
                    </p>
                  )}
                </div>
              </div>

              {/* ✨ MODERNIZADO: Contenedor de icono con gradiente sutil */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-spoon-primary/10 to-spoon-primary/5 rounded-xl blur-sm"></div>
                <div className="relative p-3 bg-spoon-primary-light rounded-xl shadow-spoon-sm">
                  {renderizarIcono(kpi.icono, varianteIcono)}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
