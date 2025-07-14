// src/app/dashboard/components/widgets/NotificacionesWidget.tsx
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { NotificacionDashboard } from '../../types/dashboard.types';
import { getNotificationColor, timeAgo } from '../../utils/dashboard.utils';

interface NotificacionesWidgetProps {
  notificaciones?: NotificacionDashboard[];
  loading?: boolean;
}

const SkeletonNotificaciones: React.FC = () => (
  <Card className="grid-area-notificaciones">
    <CardHeader>
      <CardTitle>Notificaciones</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-3 rounded-lg border animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const NotificacionesWidget: React.FC<NotificacionesWidgetProps> = ({
  notificaciones,
  loading
}) => {
  if (loading || !notificaciones) {
    return <SkeletonNotificaciones />;
  }

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  return (
    <Card className="grid-area-notificaciones">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            🔔 Notificaciones
          </span>
          <div className="flex gap-1">
            {notificaciones.filter(n => !n.leida).length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {notificaciones.filter(n => !n.leida).length}
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {notificaciones.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p className="text-sm">No hay notificaciones</p>
            </div>
          ) : (
            notificaciones.slice(0, 5).map((notificacion) => (
              <div 
                key={notificacion.id} 
                className={`p-3 rounded-lg border-l-4 ${getNotificationColor(notificacion.tipo)} ${
                  !notificacion.leida ? 'shadow-sm' : 'opacity-75'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">
                    {getNotificationIcon(notificacion.tipo)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium mb-1">
                      {notificacion.mensaje}
                    </p>
                    <p className="text-xs opacity-75">
                      {timeAgo(notificacion.timestamp)}
                    </p>
                  </div>
                  {!notificacion.leida && (
                    <div className="w-2 h-2 bg-current rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        {notificaciones.length > 5 && (
          <div className="mt-3 pt-3 border-t">
            <Button variant="ghost" size="sm" className="w-full">
              Ver todas las notificaciones
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

























