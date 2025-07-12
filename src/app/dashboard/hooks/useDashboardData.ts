// src/app/dashboard/hooks/useDashboardData.ts
'use client';

import { useState, useEffect } from 'react';
import { DashboardData } from '../types/dashboard.types';
import { DashboardService } from '../services/dashboard.service';

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [metricas, estadoMenu, platosTop, notificaciones, ventasUltimos7Dias] = 
        await Promise.all([
          DashboardService.getMetricas(),
          DashboardService.getEstadoMenu(),
          DashboardService.getPlatosTop(),
          DashboardService.getNotificaciones(),
          DashboardService.getVentasUltimos7Dias()
        ]);

      setData({
        metricas,
        estadoMenu,
        platosTop,
        notificaciones,
        ventasUltimos7Dias
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return { 
    data, 
    loading, 
    error, 
    refetch: loadDashboardData 
  };
};
