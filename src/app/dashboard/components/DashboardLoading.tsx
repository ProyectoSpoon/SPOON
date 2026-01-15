import React from 'react';

const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`bg-white/80 shadow-md rounded-2xl p-6 animate-pulse ${className}`}>
    <div className="h-6 bg-gray-300/80 rounded w-1/2 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-300/70 rounded"></div>
      <div className="h-4 bg-gray-300/70 rounded w-5/6"></div>
      <div className="h-4 bg-gray-300/70 rounded w-4/6"></div>
    </div>
  </div>
);

export const DashboardLoading: React.FC = () => (
  <div className="dashboard-grid">
    <SkeletonCard className="grid-area-metricas" />
    <SkeletonCard className="grid-area-estadoMenu" />
    <SkeletonCard className="grid-area-acciones" />
    <SkeletonCard className="grid-area-platosTop" />
    <SkeletonCard className="grid-area-notificaciones" />
    <SkeletonCard className="grid-area-insights" />
  </div>
);
