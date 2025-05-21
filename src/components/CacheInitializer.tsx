'use client';

import { useEffect } from 'react';
import { initializeCache } from '@/utils/init-cache';

export function CacheInitializer() {
  useEffect(() => {
    // Inicializar el caché cuando el componente se monte
    initializeCache();
  }, []);

  // Este componente no renderiza nada
  return null;
}
