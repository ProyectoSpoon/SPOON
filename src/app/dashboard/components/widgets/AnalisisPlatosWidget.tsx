// app/dashboard/components/widgets/AnalisisPlatosWidget.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';

interface PlatoAnalisis {
  id: string;
  nombre: string;
  categoria: string;
  ventasHoy: number;
  ingresoHoy: number;
  popularidad: number; // 0-100
  margen: number; // porcentaje
  tendencia: 'subiendo' | 'bajando' | 'estable';
  recomendacion: string;
  estado: 'estrella' | 'normal' | 'problema';
}

interface AnalisisPlatosProps {
  loading?: boolean;
}

const platos: PlatoAnalisis[] = [
  {
    id: '1',
    nombre: 'Bandeja Paisa',
    categoria: 'Platos fuertes',
    ventasHoy: 28,
    ingresoHoy: 658000,
    popularidad: 85,
    margen: 65,
    tendencia: 'subiendo',
    recomendacion: 'Tu plato estrella! Considera promocionarlo más.',
    estado: 'estrella'
  },
  {
    id: '2', 
    nombre: 'Sancocho Trifásico',
    categoria: 'Sopas',
    ventasHoy: 15,
    ingresoHoy: 285000,
    popularidad: 72,
    margen: 58,
    tendencia: 'estable',
    recomendacion: 'Buen desempeño constante.',
    estado: 'normal'
  },
  {
    id: '3',
    nombre: 'Arepa con Queso',
    categoria: 'Desayunos',
    ventasHoy: 42,
    ingresoHoy: 210000,
    popularidad: 95,
    margen: 78,
    tendencia: 'subiendo',
    recomendacion: 'Excelente margen y muy popular. Perfecto!',
    estado: 'estrella'
  }
];

const getEstadoStyles = (estado: string) => {
  const styles = {
    estrella: {
      bg: 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200',
      badge: 'bg-amber-100 text-amber-700',
      icon: '⭐'
    },
    normal: {
      bg: 'bg-blue-50 border-blue-200',
      badge: 'bg-blue-100 text-blue-700', 
      icon: '👍'
    },
    problema: {
      bg: 'bg-red-50 border-red-200',
      badge: 'bg-red-100 text-red-700',
      icon: '⚠️'
    }
  };
  
  return styles[estado as keyof typeof styles] || styles.normal;
};

const getTendenciaIcon = (tendencia: string) => {
  const icons = {
    subiendo: '📈',
    bajando: '📉', 
    estable: '➡️'
  };
  return icons[tendencia as keyof typeof icons] || '➡️';
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const PlatoCard: React.FC<{ plato: PlatoAnalisis }> = ({ plato }) => {
  const styles = getEstadoStyles(plato.estado);
  
  return (
    <Card className={`${styles.bg} border-2 hover:shadow-md transition-all duration-300`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{styles.icon}</span>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">
                {plato.nombre}
              </h3>
              <span className="text-xs text-gray-500">{plato.categoria}</span>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles.badge}`}>
            {plato.estado.toUpperCase()}
          </span>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="text-center p-2 bg-white/60 rounded-lg">
            <div className="text-lg font-bold text-gray-800">{plato.ventasHoy}</div>
            <div className="text-xs text-gray-600">vendidos hoy</div>
          </div>
          <div className="text-center p-2 bg-white/60 rounded-lg">
            <div className="text-lg font-bold text-gray-800">{formatCurrency(plato.ingresoHoy)}</div>
            <div className="text-xs text-gray-600">ingresos</div>
          </div>
        </div>

        {/* Barras de métricas */}
        <div className="space-y-2 mb-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Popularidad</span>
              <span>{plato.popularidad}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${plato.popularidad}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Margen</span>
              <span>{plato.margen}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${plato.margen}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tendencia */}
        <div className="flex items-center gap-2 mb-3">
          <span>{getTendenciaIcon(plato.tendencia)}</span>
          <span className="text-xs text-gray-600">
            Tendencia: <span className="font-medium">{plato.tendencia}</span>
          </span>
        </div>

        {/* Recomendación */}
        <div className="p-3 bg-white/80 rounded-lg">
          <p className="text-xs text-gray-700 leading-relaxed">
            <span className="font-medium">💡 Recomendación:</span> {plato.recomendacion}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const ResumenGeneral: React.FC = () => {
  const platosEstrella = platos.filter(p => p.estado === 'estrella').length;
  const ingresoTotal = platos.reduce((sum, p) => sum + p.ingresoHoy, 0);
  const ventasTotal = platos.reduce((sum, p) => sum + p.ventasHoy, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-700">{platosEstrella}</div>
          <div className="text-xs text-amber-600">Platos Estrella</div>
        </div>
      </Card>
      
      <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-700">{ventasTotal}</div>
          <div className="text-xs text-green-600">Platos Vendidos</div>
        </div>
      </Card>
      
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-700">{formatCurrency(ingresoTotal)}</div>
          <div className="text-xs text-blue-600">Ingresos Totales</div>
        </div>
      </Card>
    </div>
  );
};

export const AnalisisPlatosWidget: React.FC<AnalisisPlatosProps> = ({
  loading = false
}) => {
  if (loading) {
    return <Card className="p-6"><div className="text-center">Cargando análisis...</div></Card>;
  }

  return (
    <Card className="p-6 shadow-lg">
      {/* Header principal */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
          <span className="text-white text-2xl">🍽️</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Top Platos
          </h2>
          <p className="text-sm text-gray-600">
            Descubre qué platos te están haciendo ganar más dinero
          </p>
        </div>
      </div>

      {/* Resumen general */}
      <ResumenGeneral />

      {/* Lista de platos */}
      <div className="space-y-4">
        {platos.map((plato, index) => (
          <div key={plato.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 font-bold text-sm">{index + 1}</span>
              </div>
              <div>
                <div className="font-semibold text-gray-800">{plato.nombre}</div>
                <div className="text-sm text-gray-500">{plato.ventasHoy} vendidos • {plato.categoria}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-800">{formatCurrency(plato.ingresoHoy)}</div>
              <div className="text-sm text-gray-500">Margen: {plato.margen}%</div>
            </div>
            <div className="text-xl">{getTendenciaIcon(plato.tendencia)}</div>
          </div>
        ))}
      </div>

      {/* Recomendación general */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🎯</span>
          <div>
            <h3 className="font-semibold text-purple-800 mb-1">
              Estrategia del día
            </h3>
            <p className="text-sm text-purple-700">
              Promociona más tu <strong>Bandeja Paisa</strong> y <strong>Arepa con Queso</strong> - son tus platos más rentables. 
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};