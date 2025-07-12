'use client';

import React from 'react';
import { Button } from '@/shared/components/ui/Button';
import { useDashboardData } from './hooks/useDashboardData';
import { MetricasWidget } from './components/widgets/MetricasWidget';
import { EstadoMenuWidget } from './components/widgets/EstadoMenuWidget';
import { AccionesRapidasWidget } from './components/widgets/AccionesRapidasWidget';
import { PlatosTopWidget } from './components/widgets/PlatosTopWidget';
import { NotificacionesWidget } from './components/widgets/NotificacionesWidget';
import './dashboard.css';

// Error Boundary simple
interface ErrorBoundaryProps {
  error: string;
  retry: () => void;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ error, retry }) => (
  <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
    <div className="mb-4 text-6xl">⚠️</div>
    <h2 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar el dashboard</h2>
    <p className="text-gray-600 mb-4">{error}</p>
    <Button onClick={retry} variant="outline">
      🔄 Reintentar
    </Button>
  </div>
);

// Loading fallback
const DashboardLoading: React.FC = () => (
  <div className="p-6 space-y-6">
    <div className="flex justify-between items-center">
      <div>
        <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
    </div>
    <div className="dashboard-grid">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-gray-100 rounded-lg p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function DashboardPage() {
  const { data, loading, error, refetch } = useDashboardData();

  // Formatear fecha actual
  const fechaHoy = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (error) {
    return <ErrorBoundary error={error} retry={refetch} />;
  }

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard de SPOON
          </h1>
          <p className="text-gray-600 capitalize">
            {fechaHoy}
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={refetch} 
            variant="outline" 
            disabled={loading}
            className="flex items-center gap-2"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            Actualizar
          </Button>
          <Button 
            onClick={() => window.open('/dashboard/carta/menu-dia', '_blank')}
            className="flex items-center gap-2 bg-[#F4821F] hover:bg-[#E6750C] text-white"
          >
            🍽️ Gestionar Menú
          </Button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        <MetricasWidget 
          metricas={data?.metricas} 
          loading={loading} 
        />
        
        <EstadoMenuWidget 
          estadoMenu={data?.estadoMenu} 
          loading={loading} 
        />
        
        <AccionesRapidasWidget />
        
        <PlatosTopWidget 
          platos={data?.platosTop} 
          loading={loading} 
        />
        
        <NotificacionesWidget 
          notificaciones={data?.notificaciones} 
          loading={loading} 
        />
      </div>

      {/* Footer del Dashboard */}
      <div className="mt-8 p-4 bg-white rounded-lg border text-center">
        <p className="text-sm text-gray-500">
          Dashboard actualizado automáticamente • 
          <span className="text-[#F4821F] font-medium"> SPOON v1.0</span>
        </p>
      </div>
    </div>
  );
}
