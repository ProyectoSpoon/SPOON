// src/hooks/useDashboardAnalytics.ts
import { useState, useEffect, useCallback } from 'react';

interface KPIData {
  ventas_hoy: {
    valor: number;
    cambio: number;
    descripcion: string;
  };
  ordenes_hoy: {
    valor: number;
    cambio: number;
    descripcion: string;
  };
  clientes_hoy: {
    valor: number;
    cambio: number;
    descripcion: string;
  };
  ticket_promedio: {
    valor: number;
    cambio: number;
    descripcion: string;
  };
}

interface PlatoPopular {
  nombre: string;
  categoria: string;
  cantidad: number;
  ingresos: number;
}

interface VentaCategoria {
  categoria: string;
  total_ventas: number;
  clientes_unicos: number;
}

interface ClientCounts {
  nuevos: number;
  recurrentes: number;
}

interface DashboardAnalyticsData {
  kpis: KPIData;
  popular_dishes: PlatoPopular[];
  client_counts: ClientCounts;
  sales_by_category: VentaCategoria[];
  insights: {
    tiene_datos: boolean;
  };
}

interface UseDashboardAnalyticsReturn {
  data: DashboardAnalyticsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  formatCurrency: (amount: number) => string;
  formatKPI: (value: number, tipo: 'currency' | 'number' | 'percentage') => string;
}

export function useDashboardAnalytics(
  restaurantId: string | null,
  periodo: string = 'hoy'
): UseDashboardAnalyticsReturn {
  const [data, setData] = useState<DashboardAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const formatKPI = useCallback((value: number, tipo: 'currency' | 'number' | 'percentage'): string => {
    switch (tipo) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
        return value.toLocaleString('es-CO');
      default:
        return value.toString();
    }
  }, [formatCurrency]);

  const fetchAnalytics = useCallback(async () => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/analytics/dashboard?restaurantId=${restaurantId}&periodo=${periodo}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const analyticsData = await response.json();
      
      // ✅ VERIFICAR SI LA RESPUESTA CONTIENE ERROR
      if (analyticsData.error) {
        throw new Error(analyticsData.error);
      }
      
      setData(analyticsData);
      setError(null); // Limpiar cualquier error previo

    } catch (err) {
      console.error('Error fetching dashboard analytics:', err);
      
      // 🔥 SOLO MOSTRAR ERROR SI NO ES UN PROBLEMA DE CONEXIÓN O DATOS FALTANTES
      if (err instanceof Error && !err.message.includes('500')) {
        setError(err.message);
      } else {
        setError(null); // No mostrar error para problemas de datos faltantes
      }
      
      // 🔥 FALLBACK: Datos por defecto para servicio nuevo
      setData({
        kpis: {
          ventas_hoy: {
            valor: 0,
            cambio: 0,
            descripcion: "vs ayer"
          },
          ordenes_hoy: {
            valor: 0,
            cambio: 0,
            descripcion: "órdenes"
          },
          clientes_hoy: {
            valor: 0,
            cambio: 0,
            descripcion: "clientes"
          },
          ticket_promedio: {
            valor: 0,
            cambio: 0,
            descripcion: "por orden"
          }
        },
        popular_dishes: [],
        client_counts: {
          nuevos: 0,
          recurrentes: 0
        },
        sales_by_category: [],
        insights: {
          tiene_datos: false
        }
      });
    } finally {
      setLoading(false);
    }
  }, [restaurantId, periodo]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    data,
    loading,
    error,
    refetch: fetchAnalytics,
    formatCurrency,
    formatKPI
  };
}
