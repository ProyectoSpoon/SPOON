'use client';

import React, { useMemo } from 'react';
import { Button } from '@/shared/components/ui/Button';
import {
  DashboardError,
  DashboardFooter,
  DashboardHeader,
  DashboardPageSkeleton,
} from '@/app/dashboard/components';
import { useDashboardData } from '@/app/dashboard/hooks/useDashboardData';
import { MetricasWidget } from '@/app/dashboard/components/widgets/MetricasWidget';
import { EstadoMenuWidget } from '@/app/dashboard/components/widgets/EstadoMenuWidget';
import { AccionesRapidasWidget } from '@/app/dashboard/components/widgets/AccionesRapidasWidget';
import { PlatosTopWidget } from '@/app/dashboard/components/widgets/PlatosTopWidget';
import { NotificacionesWidget } from '@/app/dashboard/components/widgets/NotificacionesWidget';
import TestInsights from '@/app/dashboard/components/widgets/TestInsights';
import './dashboard.css';

export default function DashboardPage() {
  const { data, loading, error, refetch } = useDashboardData();

  // Formatear fecha actual
  const fechaHoy = useMemo(() => 
    new Date().toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }), 
  []);

  if (error) {
    return <DashboardError error={error} retry={refetch} />;
  }

  if (loading) {
    return <DashboardPageSkeleton />;
  }

  // Comprobación de seguridad: si no hay error y no está cargando,
  // pero `data` sigue sin existir, muestra un error específico.
  if (!data) {
    return <DashboardError error="No se pudieron obtener los datos del dashboard." retry={refetch} />;
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <DashboardHeader fechaHoy={fechaHoy} onRefetch={refetch} />

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        <MetricasWidget 
          metricas={data?.metricas}
        />
        
        <EstadoMenuWidget 
          estadoMenu={data?.estadoMenu}
        />
        
        <AccionesRapidasWidget />
        
        <PlatosTopWidget 
          platos={data?.platosTop}
        />
        
        <NotificacionesWidget 
          notificaciones={data?.notificaciones}
        />

        <TestInsights/>
      </div>

      {/* Footer del Dashboard */}
      <DashboardFooter />
    </div>
  );
}
