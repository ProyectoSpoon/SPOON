import React from 'react';
import { Button } from '@/shared/components/ui/Button';

interface DashboardErrorProps {
  error: string;
  retry: () => void;
}

export const DashboardError: React.FC<DashboardErrorProps> = ({ error, retry }) => (
  <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
    <div className="mb-4 text-6xl">⚠️</div>
    <h2 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar el dashboard</h2>
    <p className="text-gray-600 mb-4">{error}</p>
    <Button onClick={retry} variant="outline">
      🔄 Reintentar
    </Button>
  </div>
);
