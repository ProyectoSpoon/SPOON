'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from './useAuthContext';

interface KPI {
  valor: number | string;
  cambio: number;
  descripcion: string;
  cantidad?: number;
}

interface VentaHora {
  hora: string;
  ventas: number;
  clientes: number;
}

interface TopPlato {
  nombre: string;
  categoria: string;
  cantidad: number;
  ingresos: number;
  porcentaje: number;
}

interface VentaDia {
  dia: string;
  ventas: number;
  clientes: number;
}

interface SalesAnalysisData {
  kpis: {
    ventas_hoy: KPI;
    clientes_servidos: KPI;
    ticket_promedio: KPI;
    plato_estrella: KPI;
  };
  ventas_por_hora: VentaHora[];
  top_platos: TopPlato[];
  ventas_semana: VentaDia[];
  insights: {
    mejor_hora: any;
    tiene_datos: boolean;
  };
}

export function useSalesAnalysis(period: string = 'today') {
  const [data, setData] = useState<SalesAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { restaurantId } = useAuthContext();

  useEffect(() => {
    if (!restaurantId) return;

    const fetchSalesAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/analytics/sales-analysis?restaurantId=${restaurantId}&period=${period}`
        );

        if (!response.ok) {
          throw new Error('Error al cargar análisis de ventas');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching sales analysis:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchSalesAnalysis();
  }, [restaurantId, period]);

  // Formatear KPIs para la UI
  const formattedKPIs = data ? [
    {
      titulo: "Ventas Hoy",
      valor: data.kpis.ventas_hoy.valor,
      cambio: data.kpis.ventas_hoy.cambio,
      descripcion: data.kpis.ventas_hoy.descripcion
    },
    {
      titulo: "Clientes Servidos",
      valor: data.kpis.clientes_servidos.valor,
      cambio: data.kpis.clientes_servidos.cambio,
      descripcion: data.kpis.clientes_servidos.descripcion
    },
    {
      titulo: "Ticket Promedio",
      valor: data.kpis.ticket_promedio.valor,
      cambio: data.kpis.ticket_promedio.cambio,
      descripcion: data.kpis.ticket_promedio.descripcion
    },
    {
      titulo: "Plato Estrella",
      valor: data.kpis.plato_estrella.valor,
      cantidad: data.kpis.plato_estrella.cantidad,
      descripcion: data.kpis.plato_estrella.descripcion
    }
  ] : [];

  // Función para formatear moneda
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calcular máximos para gráficos
  const maxVentasHora = data ? Math.max(...data.ventas_por_hora.map(v => v.ventas)) : 0;
  const maxVentasSemana = data ? Math.max(...data.ventas_semana.map(v => v.ventas)) : 0;

  // Generar insights automáticos
  const insights = data ? {
    mejor_hora: data.insights.mejor_hora ? {
      hora: `${String(data.insights.mejor_hora.hora).padStart(2, '0')}:00`,
      ventas: data.insights.mejor_hora.ventas,
      clientes: data.insights.mejor_hora.clientes
    } : null,
    plato_estrella: data.top_platos.length > 0 ? data.top_platos[0] : null,
    oportunidad: data.ventas_por_hora.length > 0 
      ? data.ventas_por_hora.reduce((min, current) => 
          current.clientes < min.clientes ? current : min
        )
      : null,
    tiene_datos: data.insights.tiene_datos
  } : null;

  return {
    data,
    loading,
    error,
    formattedKPIs,
    formatCurrency,
    maxVentasHora,
    maxVentasSemana,
    insights,
    refetch: () => {
      if (restaurantId) {
        setLoading(true);
        // Re-trigger useEffect
        setData(null);
      }
    }
  };
}
