// src/utils/cache.utils.ts
interface CacheData {
  data: any;
  timestamp: number;
}

const CACHE_KEY = 'menu_combinaciones';
const CACHE_TIME = 1000 * 60 * 60; // 1 hora

export const cacheUtils = {
  set: (data: any) => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.log('No se puede guardar en caché en el servidor');
      return;
    }
    
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error al guardar en caché:', error);
    }
  },

  get: (): any | null => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.log('No se puede leer de caché en el servidor');
      return null;
    }
    
    try {
      const cached = window.localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const { data, timestamp }: CacheData = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_TIME) {
        window.localStorage.removeItem(CACHE_KEY);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error al leer de caché:', error);
      return null;
    }
  },

  clear: () => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.log('No se puede limpiar caché en el servidor');
      return;
    }
    
    try {
      window.localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error('Error al limpiar caché:', error);
    }
  }
};
