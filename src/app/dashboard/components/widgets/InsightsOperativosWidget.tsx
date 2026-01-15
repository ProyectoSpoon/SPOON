// app/dashboard/components/widgets/InsightsOperativosWidget.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';

interface InsightOperativo {
  id: string;
  tipo: 'urgente' | 'oportunidad' | 'recomendacion' | 'alerta';
  titulo: string;
  mensaje: string;
  icono: string;
  accion?: string;
  tiempo: string;
  impacto: 'alto' | 'medio' | 'bajo';
}

interface InsightsOperativosProps {
  loading?: boolean;
}

const insights: InsightOperativo[] = [
  {
    id: '1',
    tipo: 'urgente',
    titulo: 'Inventario Bajo',
    mensaje: 'Te quedan solo 3 porciones de pollo. Considerando tus ventas promedio, se agotará en 2 horas.',
    icono: '🚨',
    accion: 'Actualizar menú',
    tiempo: 'Ahora',
    impacto: 'alto'
  },
  {
    id: '2', 
    tipo: 'oportunidad',
    titulo: 'Pico de ventas detectado',
    mensaje: 'Usualmente vendes 40% más entre 12:30-1:30 PM. Son las 12:15 PM - prepárate.',
    icono: '⚡',
    accion: 'Ver detalles',
    tiempo: 'Hace 5 min',
    impacto: 'alto'
  },
  {
    id: '3',
    tipo: 'recomendacion',
    titulo: 'Ajusta precio de Bandeja Paisa',
    mensaje: 'Tu Bandeja Paisa está vendiendo 65% más que el promedio local. Podrías subirle $2,000.',
    icono: '💰',
    accion: 'Simular precio',
    tiempo: 'Hace 1 hora',
    impacto: 'medio'
  }
];

const getTipoStyles = (tipo: string) => {
  const styles = {
    urgente: {
      bg: 'bg-red-50 border-red-200',
      badge: 'bg-red-100 text-red-700',
      button: 'bg-red-500 hover:bg-red-600 text-white'
    },
    oportunidad: {
      bg: 'bg-amber-50 border-amber-200', 
      badge: 'bg-amber-100 text-amber-700',
      button: 'bg-amber-500 hover:bg-amber-600 text-white'
    },
    recomendacion: {
      bg: 'bg-blue-50 border-blue-200',
      badge: 'bg-blue-100 text-blue-700', 
      button: 'bg-blue-500 hover:bg-blue-600 text-white'
    },
    alerta: {
      bg: 'bg-gray-50 border-gray-200',
      badge: 'bg-gray-100 text-gray-700',
      button: 'bg-gray-500 hover:bg-gray-600 text-white'
    }
  };
  
  return styles[tipo as keyof typeof styles] || styles.alerta;
};

const getImpactoColor = (impacto: string) => {
  const colors = {
    alto: 'text-red-600',
    medio: 'text-amber-600', 
    bajo: 'text-green-600'
  };
  return colors[impacto as keyof typeof colors] || colors.bajo;
};

const InsightCard: React.FC<{ insight: InsightOperativo }> = ({ insight }) => {
  const [isProcessed, setIsProcessed] = useState(false);
  const styles = getTipoStyles(insight.tipo);
  
  const handleAction = () => {
    setIsProcessed(true);
    // Aquí iría la lógica real de la acción
  };

  return (
    <Card className={`${styles.bg} border-2 hover:shadow-md transition-all duration-300 ${isProcessed ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{insight.icono}</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-800 text-sm">
                  {insight.titulo}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles.badge}`}>
                  {insight.tipo.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{insight.tiempo}</span>
                <span className={`text-xs font-medium ${getImpactoColor(insight.impacto)}`}>
                  Impacto: {insight.impacto}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje */}
        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
          {insight.mensaje}
        </p>

        {/* Acción */}
        {insight.accion && !isProcessed && (
          <Button
            onClick={handleAction}
            className={`w-full text-xs py-2 ${styles.button}`}
            size="sm"
          >
            {insight.accion}
          </Button>
        )}

        {isProcessed && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <span>✅</span>
            <span>Procesado</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const SkeletonInsights: React.FC = () => (
  <Card className="p-6">
    <div className="mb-6">
      <div className="h-6 bg-gray-200 rounded w-48 animate-pulse mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
    </div>
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="animate-pulse">
            <div className="flex gap-3 mb-3">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="h-12 bg-gray-200 rounded mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </Card>
      ))}
    </div>
  </Card>
);

export const InsightsOperativosWidget: React.FC<InsightsOperativosProps> = ({
  loading = false
}) => {
  const [showAll, setShowAll] = useState(false);
  const visibleInsights = showAll ? insights : insights.slice(0, 3);
  
  if (loading) {
    return <SkeletonInsights />;
  }

  const insightsUrgentes = insights.filter(i => i.tipo === 'urgente' || i.impacto === 'alto').length;

  return (
    <Card className="p-6 shadow-lg">
      {/* Header principal */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
            <span className="text-white text-2xl">🎯</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Insights Operativos
            </h2>
            <p className="text-sm text-gray-600">
              Recomendaciones para optimizar tu restaurante
            </p>
          </div>
        </div>
        
        {insightsUrgentes > 0 && (
          <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
            {insightsUrgentes} urgente{insightsUrgentes > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Lista de insights */}
      <div className="space-y-4">
        {visibleInsights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>

      {/* Ver más/menos */}
      {insights.length > 3 && (
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            {showAll ? 'Ver menos' : `Ver ${insights.length - 3} insights más`}
          </Button>
        </div>
      )}

      {/* Resumen del día */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">
              Resumen inteligente
            </h3>
            <p className="text-sm text-gray-700">
              Tienes <strong>2 oportunidades</strong> para aumentar ventas hoy y <strong>1 alerta</strong> que necesita atención inmediata.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
