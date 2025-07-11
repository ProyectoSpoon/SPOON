// src/utils/init-cache.ts

/**
 * Configuración e inicialización del sistema de caché global
 */

export interface CacheConfig {
  defaultTTL: number; // Time to live en minutos
  maxSize: number; // Tamaño máximo estimado en MB
  enableAutoCleanup: boolean;
  enableCompression: boolean;
}

const DEFAULT_CONFIG: CacheConfig = {
  defaultTTL: 60, // 60 minutos
  maxSize: 50, // 50MB
  enableAutoCleanup: true,
  enableCompression: false
};

/**
 * Función principal para inicializar el sistema de caché
 * Se ejecuta al cargar la aplicación desde CacheInitializer
 */
export function initializeCache(config: Partial<CacheConfig> = {}): void {
  // Guard SSR: Solo ejecutar en el cliente
  if (typeof window === 'undefined') {
    console.log('🔒 initializeCache: Skipping en servidor (SSR)');
    return;
  }

  try {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    console.log('🚀 Inicializando sistema de caché...', finalConfig);

    // 1. Limpiar caché corrupto o expirado
    cleanupExpiredCache();

    // 2. Validar integridad del localStorage
    validateLocalStorageIntegrity();

    // 3. Configurar limpieza automática si está habilitada
    if (finalConfig.enableAutoCleanup) {
      setupAutoCleanup(finalConfig.defaultTTL);
    }

    // 4. Registrar eventos de limpieza
    setupStorageEventListeners();

    console.log('✅ Sistema de caché inicializado correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar sistema de caché:', error);
    // No lanzar error para no romper la aplicación
  }
}

/**
 * Limpia elementos expirados del caché
 */
function cleanupExpiredCache(): void {
  if (typeof window === 'undefined') return;

  try {
    const keysToCheck = [
      'menu_crear_menu',
      'menu_dia',
      'combinaciones_cache',
      'categorias_cache',
      'productos_cache'
    ];

    let itemsRemoved = 0;

    keysToCheck.forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          
          // Verificar si tiene timestamp y TTL
          if (parsed.timestamp && parsed.ttl) {
            const isExpired = Date.now() - parsed.timestamp > (parsed.ttl * 60 * 1000);
            if (isExpired) {
              localStorage.removeItem(key);
              itemsRemoved++;
              console.log(`🗑️ Eliminado caché expirado: ${key}`);
            }
          }
        }
      } catch (parseError) {
        // Si no se puede parsear, probablemente está corrupto
        localStorage.removeItem(key);
        itemsRemoved++;
        console.log(`🗑️ Eliminado caché corrupto: ${key}`);
      }
    });

    if (itemsRemoved > 0) {
      console.log(`🧹 Limpieza inicial: ${itemsRemoved} elementos eliminados`);
    }
  } catch (error) {
    console.error('❌ Error en limpieza de caché:', error);
  }
}

/**
 * Valida que localStorage esté funcionando correctamente
 */
function validateLocalStorageIntegrity(): void {
  if (typeof window === 'undefined') return;

  try {
    // Test write/read
    const testKey = '__cache_test__';
    const testValue = JSON.stringify({ test: true, timestamp: Date.now() });
    
    localStorage.setItem(testKey, testValue);
    const retrieved = localStorage.getItem(testKey);
    
    if (retrieved !== testValue) {
      throw new Error('localStorage write/read mismatch');
    }
    
    localStorage.removeItem(testKey);
    console.log('✅ localStorage integrity validated');
  } catch (error) {
    console.error('❌ localStorage integrity failed:', error);
    // Intentar limpiar localStorage corrupto
    try {
      localStorage.clear();
      console.log('🧹 localStorage cleared due to corruption');
    } catch (clearError) {
      console.error('❌ Could not clear localStorage:', clearError);
    }
  }
}

/**
 * Configura limpieza automática periódica
 */
function setupAutoCleanup(defaultTTL: number): void {
  // Limpiar cada 30 minutos
  const cleanupInterval = 30 * 60 * 1000; // 30 minutos

  setInterval(() => {
    console.log('🔄 Ejecutando limpieza automática de caché...');
    cleanupExpiredCache();
  }, cleanupInterval);

  console.log(`⏰ Auto-cleanup configurado cada ${cleanupInterval / 60000} minutos`);
}

/**
 * Configura listeners para eventos de storage
 */
function setupStorageEventListeners(): void {
  if (typeof window === 'undefined') return;

  // Listener para cambios en localStorage desde otras pestañas
  window.addEventListener('storage', (event) => {
    if (event.key && event.key.includes('menu_') || event.key?.includes('cache')) {
      console.log('📡 Storage change detected:', event.key);
      
      // Opcional: Sincronizar con otros tabs o mostrar notificación
      if (event.newValue === null) {
        console.log('🗑️ Cache cleared in another tab:', event.key);
      }
    }
  });

  // Listener para beforeunload (opcional: guardar datos críticos)
  window.addEventListener('beforeunload', () => {
    console.log('💾 Page unloading, cache state preserved');
  });
}

/**
 * Utilidades adicionales para gestión de caché
 */
export const cacheInitUtils = {
  /**
   * Fuerza una limpieza completa del caché
   */
  forceCleanup(): void {
    cleanupExpiredCache();
  },

  /**
   * Obtiene estadísticas del caché
   */
  getCacheStats(): {
    totalItems: number;
    totalSize: number;
    keys: string[];
  } {
    if (typeof window === 'undefined') {
      return { totalItems: 0, totalSize: 0, keys: [] };
    }

    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.includes('menu_') || key.includes('cache')
      );
      
      let totalSize = 0;
      keys.forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += new Blob([item]).size;
        }
      });

      return {
        totalItems: keys.length,
        totalSize: Math.round(totalSize / 1024), // KB
        keys: keys
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { totalItems: 0, totalSize: 0, keys: [] };
    }
  },

  /**
   * Verifica si el caché está saludable
   */
  isHealthy(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      // Test basic functionality
      const testKey = '__health_check__';
      localStorage.setItem(testKey, 'test');
      const result = localStorage.getItem(testKey) === 'test';
      localStorage.removeItem(testKey);
      return result;
    } catch {
      return false;
    }
  }
};