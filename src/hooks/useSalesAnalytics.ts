// src/hooks/useSalesAnalytics.ts
import { useState, useEffect, useCallback } from 'react';

interface KPIOperacion {
  mesasLibres: string;
  ordenesActivas: number;
  ventasHoy: number;
  tiempoPromedio: string;
  platoTop: {
    nombre: string;
    cantidad: number;
  };
  pagoPreferido: {
    metodo: string;
    porcentaje: number;
  };
  ticketPromedio: number;
  eficiencia: string;
}

interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  disponible: boolean;
  destacado: boolean;
}

interface Mesa {
  id: string;
  numero: number;
  capacidad: number;
  estado: 'libre' | 'ocupada' | 'reservada' | 'limpieza';
  tiempoOcupada?: number;
}

interface ConfigRestaurante {
  totalMesas: number;
  layoutMesas: Mesa[];
}

interface SalesAnalyticsData {
  kpisOperacion: KPIOperacion;
  productosPorCategoria: Record<string, Producto[]>;
  configRestaurante: ConfigRestaurante;
  metadata: {
    restaurantId: string;
    fechaConsulta: string;
    tieneVentas: boolean;
    productosDisponibles: number;
  };
}

interface UseSalesAnalyticsReturn {
  data: SalesAnalyticsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  formatCurrency: (amount: number) => string;
  getEstadoColor: (estado: Mesa['estado']) => string;
  getEstadoTexto: (estado: Mesa['estado']) => string;
}

export function useSalesAnalytics(
  restaurantId: string | null
): UseSalesAnalyticsReturn {
  const [data, setData] = useState<SalesAnalyticsData | null>(null);
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

  const getEstadoColor = useCallback((estado: Mesa['estado']): string => {
    const colors = {
      libre: '#22c55e',
      ocupada: '#ef4444',
      reservada: '#f59e0b',
      limpieza: '#6b7280'
    };
    return colors[estado] || colors.libre;
  }, []);

  const getEstadoTexto = useCallback((estado: Mesa['estado']): string => {
    const textos = {
      libre: 'Libre',
      ocupada: 'Ocupada',
      reservada: 'Reservada',
      limpieza: 'Limpieza'
    };
    return textos[estado] || 'Libre';
  }, []);

  const fetchSalesAnalytics = useCallback(async () => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/analytics/sales?restaurantId=${restaurantId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const salesData = await response.json();
      setData(salesData);

    } catch (err) {
      console.error('Error fetching sales analytics:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      
      // 🔥 FALLBACK: Datos por defecto para servicio nuevo
      const fallbackMesas: Mesa[] = [];
      for (let i = 1; i <= 20; i++) {
        fallbackMesas.push({
          id: `mesa-${i}`,
          numero: i,
          capacidad: i <= 12 ? 4 : i <= 16 ? 6 : 8,
          estado: 'libre'
        });
      }

      setData({
        kpisOperacion: {
          mesasLibres: '20/20',
          ordenesActivas: 0,
          ventasHoy: 0,
          tiempoPromedio: '0 min',
          platoTop: {
            nombre: 'Sin datos',
            cantidad: 0
          },
          pagoPreferido: {
            metodo: 'efectivo',
            porcentaje: 0
          },
          ticketPromedio: 0,
          eficiencia: '100%'
        },
        productosPorCategoria: {},
        configRestaurante: {
          totalMesas: 20,
          layoutMesas: fallbackMesas
        },
        metadata: {
          restaurantId: restaurantId,
          fechaConsulta: new Date().toISOString(),
          tieneVentas: false,
          productosDisponibles: 0
        }
      });
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchSalesAnalytics();
  }, [fetchSalesAnalytics]);

  return {
    data,
    loading,
    error,
    refetch: fetchSalesAnalytics,
    formatCurrency,
    getEstadoColor,
    getEstadoTexto
  };
}
