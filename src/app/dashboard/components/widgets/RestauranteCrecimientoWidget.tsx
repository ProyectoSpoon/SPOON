// app/dashboard/components/widgets/RestauranteCrecimientoWidget.tsx
'use client';

import React from 'react';
import { Card, CardContent } from '@/shared/components/ui/Card';

interface MetricaCrecimiento {
  titulo: string;
  valor: string;
  cambio: number;
  icono: string;
  color: 'amber' | 'green' | 'blue' | 'red';
  descripcion: string;
}

interface RestauranteCrecimientoProps {
  loading?: boolean;
}

const metricas: MetricaCrecimiento[] = [
  {
    titulo: "Ventas de Hoy",
    valor: "$847,500",
    cambio: 12.5,
    icono: "💰",
    color: "green",
    descripcion: "vs ayer"
  },
  {
    titulo: "Clientes Nuevos",
    valor: "23",
    cambio: 8.3,
    icono: "👥",
    color: "blue",
    descripcion: "primera visita"
  },
  {
    titulo: "Ticket Promedio",
    valor: "$28,400",
    cambio: 5.2,
    icono: "🧾",
    color: "amber",
    descripcion: "por cliente"
  },
  {
    titulo: "Platos Estrella",
    valor: "3",
    cambio: 15.7,
    icono: "⭐",
    color: "amber",
    descripcion: "vendiendo más"
  }
];

const getColorClasses = (color: string, cambio: number) => {
  const isPositive = cambio > 0;
  
  const backgrounds = {
    amber: isPositive ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200",
    green: isPositive ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200", 
    blue: isPositive ? "bg-blue-50 border-blue-200" : "bg-red-50 border-red-200",
    red: "bg-red-50 border-red-200"
  };

  const texts = {
    amber: isPositive ? "text-amber-700" : "text-red-700",
    green: isPositive ? "text-green-700" : "text-red-700",
    blue: isPositive ? "text-blue-700" : "text-red-700", 
    red: "text-red-700"
  };

  return {
    bg: backgrounds[color as keyof typeof backgrounds],
    text: texts[color as keyof typeof texts]
  };
};

const MetricaCard: React.FC<{ metrica: MetricaCrecimiento }> = ({ metrica }) => {
  const colors = getColorClasses(metrica.color, metrica.cambio);
  const isPositive = metrica.cambio > 0;

  return (
    <Card className={`${colors.bg} border-2 hover:shadow-lg transition-all duration-300 cursor-pointer`}>
      <CardContent className="p-6">
        {/* Header con icono */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-3xl">{metrica.icono}</div>
          <div className={`flex items-center gap-1 text-sm font-semibold ${colors.text}`}>
            <span>{isPositive ? "↗️" : "↘️"}</span>
            <span>{isPositive ? "+" : ""}{metrica.cambio}%</span>
          </div>
        </div>

        {/* Valor principal */}
        <div className="mb-2">
          <div className="text-2xl font-bold text-gray-800">
            {metrica.valor}
          </div>
        </div>

        {/* Título y descripción */}
        <div>
          <div className="text-sm font-semibold text-gray-700 mb-1">
            {metrica.titulo}
          </div>
          <div className="text-xs text-gray-500">
            {metrica.descripcion}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SkeletonCrecimiento: React.FC = () => (
  <Card className="p-6">
    <div className="mb-6">
      <div className="h-6 bg-gray-200 rounded w-48 animate-pulse mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-6">
          <div className="animate-pulse">
            <div className="flex justify-between mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </Card>
      ))}
    </div>
  </Card>
);

export const RestauranteCrecimientoWidget: React.FC<RestauranteCrecimientoProps> = ({
  loading = false
}) => {
  if (loading) {
    return <SkeletonCrecimiento />;
  }

  return (
    <Card className="p-6 shadow-lg">
      {/* Header principal */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
          <span className="text-white text-2xl">📈</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            ¿Cómo va tu restaurante hoy?
          </h2>
          <p className="text-sm text-gray-600">
            Métricas que importan para hacer crecer tu negocio
          </p>
        </div>
      </div>

      {/* Grid de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricas.map((metrica, index) => (
          <MetricaCard key={index} metrica={metrica} />
        ))}
      </div>

      {/* Insight del día */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-semibold text-amber-800 mb-1">
              Insight del día
            </h3>
            <p className="text-sm text-amber-700">
              Tus ventas están 12.5% por encima del promedio. La Bandeja Paisa está siendo tu plato estrella - considera promocionarla más.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};