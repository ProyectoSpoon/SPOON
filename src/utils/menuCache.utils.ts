// src/utils/menuCache.utils.ts

// Función segura para acceder a localStorage (solo en el cliente)
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
};

// Interfaces para los datos del menú
export interface Categoria {
  id: string;
  nombre: string;
  tipo: 'principal' | 'subcategoria';
  parentId?: string;
}

export interface ProductoStock {
  currentQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  status: string;
  lastUpdated: Date;
  alerts?: {
    lowStock: boolean;
    overStock: boolean;
    thresholds: { low: number; high: number };
  };
}

export interface ProductoMetadata {
  createdAt: Date;
  createdBy: string;
  lastModified: Date;
  lastModifiedBy: string;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
  currentVersion: number;
  priceHistory: any[];
  versions: any[];
  stock: ProductoStock;
  status: string;
  metadata: ProductoMetadata;
  imagen?: string;
  esFavorito?: boolean;
  esEspecial?: boolean;
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

interface CacheData {
  data: MenuCrearMenuData;
  timestamp: number;
}

const MENU_CACHE_KEY = 'menu_crear_menu';
const MENU_CACHE_TIME = 1000 * 60 * 30; // 30 minutos

export const menuCacheUtils = {
  /**
   * Guarda los datos del menú en el caché
   * @param data Datos del menú a guardar
   */
  set: (data: MenuCrearMenuData) => {
    try {
      // Verificar si los datos son diferentes a los que ya están en caché
      const currentCache = safeLocalStorage.getItem(MENU_CACHE_KEY);
      if (currentCache) {
        const { data: cachedData } = JSON.parse(currentCache);
        // Comparar solo los IDs de los productos para evitar comparaciones profundas
        const areProductosMenuEqual = 
          JSON.stringify(data.productosMenu.map(p => p.id).sort()) === 
          JSON.stringify(cachedData.productosMenu.map((p: any) => p.id).sort());
        
        if (areProductosMenuEqual) {
          console.log('Los datos son iguales a los que ya están en caché, omitiendo guardado');
          return;
        }
      }
      
      console.log('Guardando en caché del menú:', data);
      
      // Asegurarse de que las fechas se serializan correctamente
      const dataToCache = JSON.parse(JSON.stringify(data));
      
      safeLocalStorage.setItem(MENU_CACHE_KEY, JSON.stringify({
        data: dataToCache,
        timestamp: Date.now()
      }));
      
      console.log('Datos guardados en caché del menú correctamente');
    } catch (error) {
      console.error('Error al guardar en caché del menú:', error);
    }
  },

  /**
   * Obtiene los datos del menú del caché
   * @returns Datos del menú o null si no hay caché o está expirado
   */
  get: (): MenuCrearMenuData | null => {
    try {
      const cached = safeLocalStorage.getItem(MENU_CACHE_KEY);
      if (!cached) {
        console.log('No hay datos en caché del menú');
        return null;
      }
      
      const { data, timestamp }: CacheData = JSON.parse(cached);
      console.log('Datos encontrados en caché del menú, timestamp:', new Date(timestamp));
      
      if (Date.now() - timestamp > MENU_CACHE_TIME) {
        console.log('Caché del menú expirado');
        safeLocalStorage.removeItem(MENU_CACHE_KEY);
        return null;
      }
      
      // Convertir las cadenas de fecha de nuevo a objetos Date
      const parsedData = data;
      
      // Convertir fechas en productos
      const convertirFechasEnProductos = (productos: Producto[]) => {
        if (productos) {
          productos.forEach(producto => {
            if (producto.metadata) {
              producto.metadata.createdAt = new Date(producto.metadata.createdAt);
              producto.metadata.lastModified = new Date(producto.metadata.lastModified);
            }
            if (producto.stock) {
              producto.stock.lastUpdated = new Date(producto.stock.lastUpdated);
            }
          });
        }
      };
      
      // Convertir fechas en todos los arrays de productos
      convertirFechasEnProductos(parsedData.productosSeleccionados);
      convertirFechasEnProductos(parsedData.productosMenu);
      convertirFechasEnProductos(parsedData.productosFavoritos);
      convertirFechasEnProductos(parsedData.productosEspeciales);
      
      console.log('Datos recuperados de caché del menú:', parsedData);
      return parsedData;
    } catch (error) {
      console.error('Error al obtener datos de caché del menú:', error);
      return null;
    }
  },

  /**
   * Actualiza parcialmente los datos del menú en el caché
   * @param partialData Datos parciales a actualizar
   */
  update: (partialData: Partial<MenuCrearMenuData>) => {
    try {
      const currentData = menuCacheUtils.get();
      if (!currentData) {
        console.log('No hay datos en caché para actualizar');
        return;
      }
      
      const updatedData = {
        ...currentData,
        ...partialData
      };
      
      menuCacheUtils.set(updatedData);
      console.log('Caché del menú actualizado parcialmente');
    } catch (error) {
      console.error('Error al actualizar caché del menú:', error);
    }
  },

  /**
   * Actualiza solo las categorías en el caché
   * @param categorias Nuevas categorías
   */
  updateCategorias: (categorias: Categoria[]) => {
    menuCacheUtils.update({ categorias });
  },

  /**
   * Actualiza solo los productos seleccionados en el caché
   * @param productos Nuevos productos seleccionados
   */
  updateProductosSeleccionados: (productos: Producto[]) => {
    menuCacheUtils.update({ productosSeleccionados: productos });
  },

  /**
   * Actualiza solo los productos del menú del día en el caché
   * @param productos Nuevos productos del menú
   */
  updateProductosMenu: (productos: Producto[]) => {
    menuCacheUtils.update({ productosMenu: productos });
  },

  /**
   * Actualiza solo los productos favoritos en el caché
   * @param productos Nuevos productos favoritos
   */
  updateProductosFavoritos: (productos: Producto[]) => {
    menuCacheUtils.update({ productosFavoritos: productos });
  },

  /**
   * Actualiza solo los productos especiales en el caché
   * @param productos Nuevos productos especiales
   */
  updateProductosEspeciales: (productos: Producto[]) => {
    menuCacheUtils.update({ productosEspeciales: productos });
  },

  /**
   * Actualiza la categoría y subcategoría seleccionadas en el caché
   * @param categoriaId ID de la categoría seleccionada
   * @param subcategoriaId ID de la subcategoría seleccionada
   */
  updateSeleccion: (categoriaId: string | null, subcategoriaId: string | null) => {
    menuCacheUtils.update({
      categoriaSeleccionada: categoriaId,
      subcategoriaSeleccionada: subcategoriaId
    });
  },

  /**
   * Actualiza el submenú activo en el caché
   * @param submenu Submenú activo
   */
  updateSubmenuActivo: (submenu: 'menu-dia' | 'favoritos' | 'especiales') => {
    menuCacheUtils.update({ submenuActivo: submenu });
  },

  /**
   * Limpia el caché del menú
   */
  clear: () => {
    try {
      console.log('Limpiando caché del menú');
      // Solo eliminar el caché del menú, no otros datos como combinaciones.json
      safeLocalStorage.removeItem(MENU_CACHE_KEY);
      console.log('Caché del menú eliminado correctamente');
    } catch (error) {
      console.error('Error al limpiar caché del menú:', error);
    }
  },

  /**
   * Verifica si hay datos en el caché
   * @returns true si hay datos en caché y no están expirados
   */
  hasCache: (): boolean => {
    try {
      const cached = safeLocalStorage.getItem(MENU_CACHE_KEY);
      if (!cached) {
        return false;
      }
      
      const { timestamp }: CacheData = JSON.parse(cached);
      return Date.now() - timestamp <= MENU_CACHE_TIME;
    } catch (error) {
      console.error('Error al verificar caché del menú:', error);
      return false;
    }
  },

  /**
   * Obtiene el tiempo restante de validez del caché en minutos
   * @returns Minutos restantes o 0 si no hay caché o está expirado
   */
  getRemainingTime: (): number => {
    try {
      const cached = safeLocalStorage.getItem(MENU_CACHE_KEY);
      if (!cached) {
        return 0;
      }
      
      const { timestamp }: CacheData = JSON.parse(cached);
      const remainingMs = MENU_CACHE_TIME - (Date.now() - timestamp);
      
      return remainingMs > 0 ? Math.floor(remainingMs / (1000 * 60)) : 0;
    } catch (error) {
      console.error('Error al obtener tiempo restante del caché:', error);
      return 0;
    }
  }
};
