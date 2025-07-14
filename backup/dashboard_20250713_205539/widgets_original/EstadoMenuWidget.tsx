// src/app/dashboard/components/widgets/EstadoMenuWidget.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { EstadoMenu } from '../../types/dashboard.types';

interface EstadoMenuWidgetProps {
  estadoMenu?: EstadoMenu;
  loading?: boolean;
}

interface StatusItemProps {
  label: string;
  status?: 'publicado' | 'pendiente' | 'success' | 'warning';
  value?: number;
  action?: () => void;
  icon?: string;
}

const StatusItem: React.FC<StatusItemProps> = ({
  label,
  status,
  value,
  action,
  icon = '📋'
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'publicado':
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'pendiente':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const getStatusText = () => {
    if (value !== undefined) return value.toString();
    return status === 'publicado' ? 'Publicado' : 'Pendiente';
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <div>
          <p className="font-medium text-sm">{label}</p>
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>
      {action && (
        <Button variant="ghost" size="sm" onClick={action}>
          Ver
        </Button>
      )}
    </div>
  );
};

interface ProgressItemProps {
  label: string;
  progress: number;
  action?: () => void;
}

const ProgressItem: React.FC<ProgressItemProps> = ({
  label,
  progress,
  action
}) => {
  return (
    <div className="p-3 rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">{label}</span>
        <span className="text-sm text-gray-600">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className="bg-spoon-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      {action && (
        <Button variant="ghost" size="sm" onClick={action} className="w-full">
          Completar
        </Button>
      )}
    </div>
  );
};

const SkeletonEstadoMenu: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Mi Menú Digital</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-3 rounded-lg border animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-300 rounded"></div>
                <div className="space-y-1">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                  <div className="h-3 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
              <div className="h-6 bg-gray-300 rounded w-12"></div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const EstadoMenuWidget: React.FC<EstadoMenuWidgetProps> = ({
  estadoMenu,
  loading
}) => {
  const router = useRouter();

  if (loading || !estadoMenu) {
    return <SkeletonEstadoMenu />;
  }

  return (
    <Card className="grid-area-estadoMenu">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            🍽️ Mi Menú Digital
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/dashboard/carta/menu-dia')}
          >
            Gestionar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <StatusItem
            label="Menú del día"
            status={estadoMenu.menuPublicado ? 'publicado' : 'pendiente'}
            icon={estadoMenu.menuPublicado ? '✅' : '⏱️'}
            action={() => router.push('/dashboard/carta/menu-dia')}
          />
          <StatusItem
            label="Combinaciones activas"
            value={estadoMenu.combinacionesActivas}
            icon="🍲"
            action={() => router.push('/dashboard/carta/combinaciones')}
          />
          <StatusItem
            label="Productos agotados"
            value={estadoMenu.productosAgotados}
            status={estadoMenu.productosAgotados > 0 ? 'warning' : 'success'}
            icon={estadoMenu.productosAgotados > 0 ? '⚠️' : '✅'}
          />
          <ProgressItem
            label="Programación semanal"
            progress={estadoMenu.programacionCompleta}
            action={() => router.push('/dashboard/carta/programacion-semanal')}
          />
        </div>
      </CardContent>
    </Card>
  );
};

























