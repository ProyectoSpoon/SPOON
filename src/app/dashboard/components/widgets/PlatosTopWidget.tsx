// src/app/dashboard/components/widgets/PlatosTopWidget.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { PlatoTop } from '../../types/dashboard.types';

interface PlatosTopWidgetProps {
  platos?: PlatoTop[];
  loading?: boolean;
}

const SkeletonPlatosTop: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Top Platos</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              <div className="space-y-1">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
                <div className="h-3 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="h-4 bg-gray-300 rounded w-12"></div>
              <div className="h-2 bg-gray-300 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const PlatosTopWidget: React.FC<PlatosTopWidgetProps> = ({
  platos,
  loading
}) => {
  const router = useRouter();

  if (loading || !platos) {
    return <SkeletonPlatosTop />;
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${index + 1}`;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'bg-yellow-100 text-yellow-800';
      case 1: return 'bg-gray-100 text-gray-800';
      case 2: return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card className="grid-area-platosTop">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            🏆 Top Platos
          </span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/dashboard/estadisticas/rendimiento-menu')}
          >
            Ver más
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {platos.slice(0, 5).map((plato, index) => (
            <div key={plato.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getRankColor(index)}`}>
                  {typeof getRankIcon(index) === 'string' && getRankIcon(index).length > 1 
                    ? getRankIcon(index) 
                    : <span>{getRankIcon(index)}</span>
                  }
                </div>
                <div>
                  <p className="font-medium text-sm">{plato.nombre}</p>
                  <p className="text-xs text-gray-500">{plato.ventas} vendidos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{plato.porcentaje}%</p>
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#F4821F] transition-all duration-300"
                    style={{ width: `${Math.min(plato.porcentaje, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
