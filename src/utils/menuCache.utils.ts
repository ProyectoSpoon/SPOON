// src/utils/menuCache.utils.ts

/**
 * Utilidades específicas para el caché del menú del día
 * Compatible con useMenuCache.ts - VERSIÓN CORREGIDA
 */

// ========== INTERFACES ==========

export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  orden?: number;
  activa?: boolean;
  color?: string;
  icono?: string;
  parentId?: string | null;
  restaurant_id?: string;
  created_at?: Date;
  updated_at?: Date;
  // **NEW: Added 'tipo' property to Categoria interface**
  tipo?: 'principal' | 'subcategoria';
  // Para compatibilidad con diferentes sistemas
  category_id?: string;
  name?: string;
  description?: string;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoriaId: string;
  imagen?: string;
  currentVersion?: number;
  stock?: {
    currentQuantity: number;
    minQuantity: number;
    maxQuantity: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
    lastUpdated: Date;
  };
  status?: 'active' | 'draft' | 'archived' | 'discontinued';
  priceHistory?: any[];
  versions?: any[];
  metadata?: {
    createdAt: Date;
    createdBy: string;
    lastModified: Date;
    lastModifiedBy: string;
  };
  esFavorito?: boolean;
  esEspecial?: boolean;
  // Para compatibilidad con diferentes sistemas
  product_id?: string;
  name?: string;
  description?: string;
  current_price?: number;
  category_id?: string;
  image_url?: string;
}

export interface MenuCrearMenuData {
  categorias: Categoria[];
  productosSeleccionados: Producto[];
  productosMenu: Producto[];
  productosFavoritos: Producto[];
  productosEspeciales: Producto[];
  categoriaSeleccionada: string | null;
  subcategoriaSeleccionada: string | null;
  submenuActivo: 'menu-dia' | 'favoritos' | 'especiales';
}

interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en minutos
  version?: string;
}

// ========== CONFIGURACIÓN ==========

const CACHE_KEY = 'menu_crear_menu';
const DEFAULT_TTL = 60; // 60 minutos
const CURRENT_VERSION = '1.0';

// ========== UTILIDADES PRIVADAS ==========

/**
 * Guard para verificar si estamos en el cliente
 */
function isClient(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * Obtiene datos seguros de localStorage
 */
function safeGetItem(key: string): string | null {
  if (!isClient()) {
    console.warn('🔒 safeGetItem: No disponible en servidor');
    return null;
  }

  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`❌ Error al leer localStorage[${key}]:`, error);
    return null;
  }
}

/**
 * Establece datos seguros en localStorage
 */
function safeSetItem(key: string, value: string): boolean {
  if (!isClient()) {
    console.warn('🔒 safeSetItem: No disponible en servidor');
    return false;
  }

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`❌ Error al escribir localStorage[${key}]:`, error);
    // Intentar limpiar espacio si el error es por cuota
    // if (error instanceof DOMException && error.code === 22) { // Removed since DOMException not always defined in all environments
    if (error && typeof error === 'object' && 'code' in error && error.code === 22) { // More robust check
      console.log('🧹 Cuota excedida, intentando limpiar caché antiguo...');
      cleanOldCache();
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (retryError) {
        console.error('❌ Error al reintentar escritura:', retryError);
      }
    }
    return false;
  }
}

/**
 * Elimina datos seguros de localStorage
 */
function safeRemoveItem(key: string): boolean {
  if (!isClient()) {
    console.warn('🔒 safeRemoveItem: No disponible en servidor');
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`❌ Error al eliminar localStorage[${key}]:`, error);
    return false;
  }
}

/**
 * Limpia caché antiguo para liberar espacio
 */
function cleanOldCache(): void {
  if (!isClient()) return;

  const keysToClean = [
    'menu_crear_menu_old',
    'menu_dia_old',
    'combinaciones_cache_old',
    'productos_temp'
  ];

  keysToClean.forEach((key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`❌ Error limpiando ${key}:`, error);
    }
  });
}

/**
 * Valida estructura de datos de menú
 */
function validateMenuData(data: any): data is MenuCrearMenuData {
  if (!data || typeof data !== 'object') {
    console.warn('⚠️ validateMenuData: data no es objeto válido');
    return false;
  }

  const requiredFields = [
    'categorias',
    'productosSeleccionados',
    'productosMenu',
    'productosFavoritos',
    'productosEspeciales'
  ];

  const isValid = requiredFields.every((field: string) => Array.isArray(data[field]));

  if (!isValid) {
    console.warn('⚠️ validateMenuData: campos requeridos faltantes o inválidos');
  }

  return isValid;
}

/**
 * Migra datos de versiones anteriores si es necesario
 */
function migrateDataIfNeeded(cacheItem: CacheItem): CacheItem {
  // Si no hay versión, es una versión antigua
  if (!cacheItem.version) {
    console.log('🔄 Migrando datos de caché a versión actual...');

    // Asegurar que todos los arrays existen
    const migratedData: MenuCrearMenuData = {
      categorias: Array.isArray(cacheItem.data.categorias) ? cacheItem.data.categorias : [],
      productosSeleccionados: Array.isArray(cacheItem.data.productosSeleccionados) ? cacheItem.data.productosSeleccionados : [],
      productosMenu: Array.isArray(cacheItem.data.productosMenu) ? cacheItem.data.productosMenu : [],
      productosFavoritos: Array.isArray(cacheItem.data.productosFavoritos) ? cacheItem.data.productosFavoritos : [],
      productosEspeciales: Array.isArray(cacheItem.data.productosEspeciales) ? cacheItem.data.productosEspeciales : [],
      categoriaSeleccionada: cacheItem.data.categoriaSeleccionada || null,
      subcategoriaSeleccionada: cacheItem.data.subcategoriaSeleccionada || null,
      submenuActivo: cacheItem.data.submenuActivo || 'menu-dia'
    };

    return {
      ...cacheItem,
      data: migratedData,
      version: CURRENT_VERSION
    };
  }

  return cacheItem;
}

// ========== IMPLEMENTACIÓN DEL OBJETO PRINCIPAL ==========

/**
 * Implementación real de las utilidades para gestión del caché del menú
 */
const menuCacheUtilsImplementation = {
  /**
   * Obtiene datos del caché
   */
  get(): MenuCrearMenuData | null {
    // ✅ GUARD CRÍTICO: Verificar entorno del cliente
    if (!isClient()) {
      console.warn('🔒 menuCacheUtils.get(): No disponible en servidor');
      return null;
    }

    const cached = safeGetItem(CACHE_KEY);
    if (!cached) {
      console.log('ℹ️ No hay datos en caché del menú');
      return null;
    }

    try {
      const cacheItem: CacheItem<MenuCrearMenuData> = JSON.parse(cached);

      // Verificar expiración
      const isExpired = Date.now() - cacheItem.timestamp > (cacheItem.ttl * 60 * 1000);
      if (isExpired) {
        console.log('⏰ Caché expirado, eliminando...');
        this.clear();
        return null;
      }

      // Migrar si es necesario
      const migratedItem = migrateDataIfNeeded(cacheItem);

      // Validar estructura
      if (!validateMenuData(migratedItem.data)) {
        console.warn('⚠️ Estructura de caché inválida, eliminando...');
        this.clear();
        return null;
      }

      console.log('✅ Datos cargados desde caché del menú');
      return migratedItem.data;

    } catch (error) {
      console.error('❌ Error al parsear caché del menú:', error);
      this.clear();
      return null;
    }
  },

  /**
   * Guarda datos en el caché
   */
  set(data: MenuCrearMenuData, ttl: number = DEFAULT_TTL): boolean {
    // ✅ GUARD CRÍTICO: Verificar entorno del cliente
    if (!isClient()) {
      console.warn('🔒 menuCacheUtils.set(): No disponible en servidor');
      return false;
    }

    if (!validateMenuData(data)) {
      console.error('❌ Datos inválidos para caché del menú');
      return false;
    }

    const cacheItem: CacheItem<MenuCrearMenuData> = {
      data,
      timestamp: Date.now(),
      ttl,
      version: CURRENT_VERSION
    };

    const success = safeSetItem(CACHE_KEY, JSON.stringify(cacheItem));

    if (success) {
      console.log(`💾 Datos del menú guardados en caché (TTL: ${ttl} min)`);
    }

    return success;
  },

  /**
   * Limpia el caché del menú
   */
  clear(): boolean {
    const success = safeRemoveItem(CACHE_KEY);

    if (success) {
      console.log('🗑️ Caché del menú eliminado');
    }

    return success;
  },

  /**
   * Verifica si existe caché válido
   */
  hasCache(): boolean {
    if (!isClient()) {
      return false;
    }

    const cached = safeGetItem(CACHE_KEY);
    if (!cached) return false;

    try {
      const cacheItem: CacheItem = JSON.parse(cached);

      // Verificar si no está expirado
      const isExpired = Date.now() - cacheItem.timestamp > (cacheItem.ttl * 60 * 1000);
      return !isExpired;

    } catch (error) {
      console.error('❌ Error al verificar caché:', error);
      return false;
    }
  },

  /**
   * Obtiene el tiempo restante de validez del caché en minutos
   */
  getRemainingTime(): number {
    if (!isClient()) {
      return 0;
    }

    const cached = safeGetItem(CACHE_KEY);
    if (!cached) return 0;

    try {
      const cacheItem: CacheItem = JSON.parse(cached);
      const elapsedTime = Date.now() - cacheItem.timestamp;
      const totalTime = cacheItem.ttl * 60 * 1000;
      const remainingTime = Math.max(0, totalTime - elapsedTime);

      return Math.ceil(remainingTime / (60 * 1000)); // Convertir a minutos

    } catch (error) {
      console.error('❌ Error al calcular tiempo restante:', error);
      return 0;
    }
  },

  /**
   * Actualiza el TTL del caché existente
   */
  extendTTL(additionalMinutes: number): boolean {
    if (!isClient()) {
      return false;
    }

    const cached = safeGetItem(CACHE_KEY);
    if (!cached) return false;

    try {
      const cacheItem: CacheItem = JSON.parse(cached);
      cacheItem.ttl += additionalMinutes;

      const success = safeSetItem(CACHE_KEY, JSON.stringify(cacheItem));

      if (success) {
        console.log(`⏱️ TTL del caché extendido en ${additionalMinutes} minutos`);
      }

      return success;

    } catch (error) {
      console.error('❌ Error al extender TTL:', error);
      return false;
    }
  },

  /**
   * Obtiene estadísticas del caché
   */
  getStats(): {
    exists: boolean;
    size: number;
    remainingTime: number;
    lastUpdated: Date | null;
    version: string | null;
  } {
    if (!isClient()) {
      return {
        exists: false,
        size: 0,
        remainingTime: 0,
        lastUpdated: null,
        version: null
      };
    }

    const cached = safeGetItem(CACHE_KEY);

    if (!cached) {
      return {
        exists: false,
        size: 0,
        remainingTime: 0,
        lastUpdated: null,
        version: null
      };
    }

    try {
      const cacheItem: CacheItem = JSON.parse(cached);
      const size = new Blob([cached]).size;

      return {
        exists: true,
        size: Math.round(size / 1024), // KB
        remainingTime: this.getRemainingTime(),
        lastUpdated: new Date(cacheItem.timestamp),
        version: cacheItem.version || 'legacy'
      };

    } catch (error) {
      console.error('❌ Error al obtener stats:', error);
      return {
        exists: false,
        size: 0,
        remainingTime: 0,
        lastUpdated: null,
        version: null
      };
    }
  },

  /**
   * Verifica la salud del caché
   */
  healthCheck(): {
    isHealthy: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (!isClient()) {
      issues.push('No está en el cliente');
      return { isHealthy: false, issues, recommendations };
    }

    const cached = safeGetItem(CACHE_KEY);

    if (!cached) {
      recommendations.push('No hay caché disponible - esto es normal en primera carga');
      return { isHealthy: true, issues, recommendations };
    }

    try {
      const cacheItem: CacheItem = JSON.parse(cached);

      // Verificar estructura
      if (!validateMenuData(cacheItem.data)) {
        issues.push('Estructura de datos inválida');
        recommendations.push('Limpiar y regenerar caché');
      }

      // Verificar tamaño
      const size = new Blob([cached]).size;
      if (size > 5 * 1024 * 1024) { // 5MB
        issues.push('Caché muy grande (>5MB)');
        recommendations.push('Optimizar datos almacenados');
      }

      // Verificar tiempo
      const remainingTime = this.getRemainingTime();
      if (remainingTime < 5) {
        recommendations.push('Caché próximo a expirar');
      }

      // Verificar versión
      if (!cacheItem.version || cacheItem.version !== CURRENT_VERSION) {
        recommendations.push('Actualizar versión de caché');
      }

    } catch (error) {
      issues.push('Error al parsear caché');
      recommendations.push('Limpiar caché corrupto');
    }

    return {
      isHealthy: issues.length === 0,
      issues,
      recommendations
    };
  }
};

// ========== EXPORTACIÓN PRINCIPAL ==========

/**
 * ✅ EXPORTACIÓN CORREGIDA: Asegurar que el objeto esté siempre disponible
 */
export const menuCacheUtils = menuCacheUtilsImplementation;

// Verificar que se exportó correctamente
if (typeof window !== 'undefined') {
  console.log('✅ menuCacheUtils exportado correctamente:', typeof menuCacheUtils);
}

// ========== EXPORTACIONES ADICIONALES ==========

/**
 * Constantes útiles
 */
export const MENU_CACHE_CONSTANTS = {
  CACHE_KEY,
  DEFAULT_TTL,
  CURRENT_VERSION,
  MAX_CACHE_SIZE: 5 * 1024 * 1024, // 5MB
  WARNING_SIZE: 2 * 1024 * 1024 // 2MB
};

/**
 * Tipos para TypeScript
 */
export type MenuSubmenu = 'menu-dia' | 'favoritos' | 'especiales';
export type CacheHealthStatus = 'healthy' | 'warning' | 'error';

/**
 * Factory para crear estado inicial vacío
 */
export function createEmptyMenuData(): MenuCrearMenuData {
  return {
    categorias: [],
    productosSeleccionados: [],
    productosMenu: [],
    productosFavoritos: [],
    productosEspeciales: [],
    categoriaSeleccionada: null,
    subcategoriaSeleccionada: null,
    submenuActivo: 'menu-dia'
  };
}

/**
 * ✅ EXPORTACIÓN ALTERNATIVA: Para casos de emergencia
 */
export default menuCacheUtils;