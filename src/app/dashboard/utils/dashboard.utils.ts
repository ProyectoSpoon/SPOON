// src/app/dashboard/utils/dashboard.utils.ts
export const formatCurrency = (amount: number, compact: boolean = false): string => {
  if (compact && amount >= 1000) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      notation: 'compact',
      compactDisplay: 'short'
    }).format(amount);
  }

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const getTrendIcon = (tendencia: 'up' | 'down' | 'stable') => {
  switch (tendencia) {
    case 'up': return '📈';
    case 'down': return '📉';
    case 'stable': return '➡️';
    default: return '➡️';
  }
};

export const getTrendColor = (tendencia: 'up' | 'down' | 'stable') => {
  switch (tendencia) {
    case 'up': return 'text-green-600';
    case 'down': return 'text-red-600';
    case 'stable': return 'text-gray-600';
    default: return 'text-gray-600';
  }
};

export const getNotificationColor = (tipo: 'success' | 'warning' | 'info' | 'error') => {
  switch (tipo) {
    case 'success': return 'bg-green-100 text-green-800 border-green-200';
    case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'error': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const timeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Hace unos segundos';
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
  return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
};
