// src/shared/components/ui/CacheTimer/cacheTimer.tsx
'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CacheTimerProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export const CacheTimer = ({ variant = 'default', className = '' }: CacheTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [hasCache, setHasCache] = useState<boolean>(false);
  const CACHE_KEY = 'menu_combinaciones';

  useEffect(() => {
    const updateTimer = () => {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { timestamp } = JSON.parse(cached);
          const expirationTime = timestamp + (1000 * 60 * 60); // 1 hora
          const now = Date.now();
          const remaining = expirationTime - now;

          if (remaining > 0) {
            const mins = Math.floor(remaining / 60000);
            const secs = Math.floor((remaining % 60000) / 1000);
            setMinutes(mins);
            setSeconds(secs);
            setTimeLeft(`${mins}m ${secs}s`);
            setHasCache(true);
          } else {
            setTimeLeft('Expirado');
            setMinutes(0);
            setSeconds(0);
            setHasCache(false);
            localStorage.removeItem(CACHE_KEY);
          }
        } catch (error) {
          console.error('Error al parsear el caché:', error);
          setTimeLeft('Error');
          setHasCache(false);
        }
      } else {
        setTimeLeft('No activo');
        setHasCache(false);
      }
    };

    // Actualizar inmediatamente
    updateTimer();
    
    // Actualizar cada segundo
    const timer = setInterval(updateTimer, 1000);
    
    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(timer);
  }, []);

  if (!hasCache) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center border rounded-lg px-3 py-1 bg-white ${className}`}>
        <Clock className="h-3 w-3 mr-2 text-[#F4821F]" />
        <div className="text-xs text-gray-700">
          Tiempo restante caché: <span className="font-semibold">{minutes}m {seconds}s</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-4 rounded-lg border border-gray-200 ${className}`}>
      <div className="text-sm font-medium text-gray-500">Tiempo restante caché</div>
      <div className="flex items-center mt-1">
        <Clock className="h-4 w-4 mr-2 text-[#F4821F]" />
        <div className="text-2xl font-semibold text-gray-900">
          {timeLeft}
        </div>
      </div>
    </div>
  );
};

export default CacheTimer;
