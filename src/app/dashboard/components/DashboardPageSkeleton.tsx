import React from 'react';
import { DashboardLoading } from './DashboardLoading';

export const DashboardPageSkeleton: React.FC = () => (
  <div className="dashboard-container">
    {/* Header Skeleton */}
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
      <div>
        <div className="h-9 bg-gray-300/80 rounded-lg w-72 mb-2 animate-pulse"></div>
        <div className="h-5 bg-gray-200/90 rounded-md w-96 animate-pulse"></div>
      </div>
      <div className="flex gap-3">
        <div className="h-10 bg-gray-300/80 rounded-lg w-32 animate-pulse"></div>
        <div className="h-10 bg-gray-300/80 rounded-lg w-40 animate-pulse"></div>
      </div>
    </div>
    <DashboardLoading />
  </div>
);
