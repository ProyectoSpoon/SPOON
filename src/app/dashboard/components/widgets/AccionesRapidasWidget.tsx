// src/app/dashboard/components/widgets/AccionesRapidasWidget.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';

interface AccionRapida {
  label: string;
  descripcion: string;
  icono: string;
  ruta: string;
  color: string;
  estrategia: 'Land' | 'Expand' | 'Scale' | 'Setup';
}

export const AccionesRapidasWidget: React.FC = () => {
  const router = useRouter();

  const acciones: AccionRapida[] = [
    {
      label: 'Actualizar Menú',
      descripcion: 'Gestionar menú del día',
      icono: '🍽️',
      ruta: '/dashboard/carta/menu-dia',
      color: 'bg-blue-500 hover:bg-blue-600 text-white',
      estrategia: 'Land'
    },
    {
      label: 'Registrar Venta',
      descripcion: 'Anotar nueva venta',
      icono: '💰',
      ruta: '/dashboard/registro-ventas',
      color: 'bg-green-500 hover:bg-green-600 text-white',
      estrategia: 'Expand'
    },
    {
      label: 'Ver Analytics',
      descripcion: 'Análisis completo',
      icono: '📊',
      ruta: '/dashboard/estadisticas/analisis-ventas',
      color: 'bg-purple-500 hover:bg-purple-600 text-white',
      estrategia: 'Scale'
    },
    {
      label: 'Configuración',
      descripcion: 'Ajustar restaurante',
      icono: '⚙️',
      ruta: '/dashboard/configuracion',
      color: 'bg-gray-500 hover:bg-gray-600 text-white',
      estrategia: 'Setup'
    }
  ];

  return (
    <Card className="grid-area-acciones">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ⚡ Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {acciones.map((accion) => (
            <Button
              key={accion.label}
              variant="outline"
              className={`h-auto p-4 flex flex-col items-center gap-2 border-0 ${accion.color}`}
              onClick={() => router.push(accion.ruta)}
            >
              <span className="text-2xl">{accion.icono}</span>
              <div className="text-center">
                <p className="font-medium text-sm">{accion.label}</p>
                <p className="text-xs opacity-90">{accion.descripcion}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
