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
  status: string; // 'in_stock', 'out_of_stock', 'low_stock'
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
  precio: number;
  categoriaId: string;
  currentVersion: number;
  priceHistory: any[];
  versions: any[];
  stock: ProductoStock;
  status: string; // 'active', 'draft', 'archived', 'discontinued'
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

export const MENU_CACHE_KEY = 'menu_crear_menu'; // Exportado para posible uso externo
const MENU_CACHE_TIME = 1000 * 60 * 30; // 30 minutos

export const menuCacheUtils = {
  set: (data: MenuCrearMenuData) => {
    try {
      if (!data || typeof data !== 'object') {
        console.error('Datos inválidos para guardar en caché (no es un objeto):', data);
        return;
      }
      
      // Asegurarse de que todos los arrays estén inicializados correctamente
      const safeData = {
        ...data,
        categorias: Array.isArray(data.categorias) ? data.categorias : [],
        productosSeleccionados: Array.isArray(data.productosSeleccionados) ? data.productosSeleccionados : [],
        productosMenu: Array.isArray(data.productosMenu) ? data.productosMenu : [],
        productosFavoritos: Array.isArray(data.productosFavoritos) ? data.productosFavoritos : [],
        productosEspeciales: Array.isArray(data.productosEspeciales) ? data.productosEspeciales : []
      };

      // Verificar si hay un caché actual y comparar para evitar guardados redundantes
      let shouldSave = true;
      const currentCache = safeLocalStorage.getItem(MENU_CACHE_KEY);
      
      if (currentCache) {
        try {
          const parsedCache = JSON.parse(currentCache) as CacheData;
          
          if (parsedCache && parsedCache.data) {
            const cachedData = parsedCache.data;
            
            // Verificación extremadamente rigurosa antes de intentar comparar
            // Verificar que productosMenu sea un array válido en ambos objetos
            const isValidProductosMenuInSafeData = 
              safeData && 
              typeof safeData === 'object' && 
              'productosMenu' in safeData && 
              Array.isArray(safeData.productosMenu);
              
            const isValidProductosMenuInCachedData = 
              cachedData && 
              typeof cachedData === 'object' && 
              'productosMenu' in cachedData && 
              Array.isArray(cachedData.productosMenu);
            
            // Verificar que categorias sea un array válido en ambos objetos
            const isValidCategoriasInSafeData = 
              safeData && 
              typeof safeData === 'object' && 
              'categorias' in safeData && 
              Array.isArray(safeData.categorias);
              
            const isValidCategoriasInCachedData = 
              cachedData && 
              typeof cachedData === 'object' && 
              'categorias' in cachedData && 
              Array.isArray(cachedData.categorias);
            
            // Solo intentar comparar si ambos son arrays válidos
            if (isValidProductosMenuInSafeData && isValidProductosMenuInCachedData) {
              try {
                // Verificar que cada elemento tenga un id antes de mapear
                const allProductosHaveIds = 
                  safeData.productosMenu.every(p => p && typeof p === 'object' && 'id' in p) &&
                  cachedData.productosMenu.every((p: any) => p && typeof p === 'object' && 'id' in p);
                
                if (allProductosHaveIds) {
                  const productosMenuIdsMatch = 
                    JSON.stringify(safeData.productosMenu.map(p => p.id).sort()) === 
                    JSON.stringify(cachedData.productosMenu.map((p: any) => p.id).sort());
                  
                  if (productosMenuIdsMatch) {
                    console.log('Los productos del menú son iguales a los que ya están en caché');
                    shouldSave = false;
                  }
                }
              } catch (error) {
                console.warn('Error al comparar productos del menú, se procederá a guardar:', error);
                shouldSave = true;
              }
            }
            
            // Solo intentar comparar categorías si productosMenu coincidió y ambas categorías son arrays válidos
            if (!shouldSave && isValidCategoriasInSafeData && isValidCategoriasInCachedData) {
              try {
                // Verificar que cada categoría tenga un id antes de mapear
                const allCategoriasHaveIds = 
                  safeData.categorias.every(c => c && typeof c === 'object' && 'id' in c) &&
                  cachedData.categorias.every((c: any) => c && typeof c === 'object' && 'id' in c);
                
                if (allCategoriasHaveIds) {
                  const categoriasIdsMatch = 
                    JSON.stringify(safeData.categorias.map(c => c.id).sort()) ===
                    JSON.stringify(cachedData.categorias.map((c: any) => c.id).sort());
                  
                  // Solo mantener shouldSave=false si ambas comparaciones son iguales
                  if (!categoriasIdsMatch) {
                    shouldSave = true;
                  } else {
                    console.log('Las categorías son iguales a las que ya están en caché');
                  }
                } else {
                  shouldSave = true;
                }
              } catch (error) {
                console.warn('Error al comparar categorías, se procederá a guardar:', error);
                shouldSave = true;
              }
            }
          }
        } catch (compareError) {
          console.warn('Error al comparar con caché existente, se procederá a guardar:', compareError);
          // Continuar con el guardado si hay un error en la comparación
          shouldSave = true;
        }
      }
      
      if (shouldSave) {
        console.log('Guardando en caché del menú');
        
        // Crear una copia segura para serialización
        let dataToCache;
        try {
          // Usar JSON.parse(JSON.stringify(data)) es una forma de asegurar una copia profunda
          // y de que las fechas se serialicen a strings ISO para localStorage.
          dataToCache = JSON.parse(JSON.stringify(safeData));
        } catch (serializeError) {
          console.error('Error al serializar datos para caché:', serializeError);
          // Intentar una versión simplificada si falla la serialización completa
          dataToCache = { 
            categorias: [], 
            productosSeleccionados: [], 
            productosMenu: safeData.productosMenu || [],
            productosFavoritos: safeData.productosFavoritos || [],
            productosEspeciales: safeData.productosEspeciales || [],
            categoriaSeleccionada: safeData.categoriaSeleccionada,
            subcategoriaSeleccionada: safeData.subcategoriaSeleccionada,
            submenuActivo: safeData.submenuActivo || 'menu-dia'
          };
        }
        
        safeLocalStorage.setItem(MENU_CACHE_KEY, JSON.stringify({
          data: dataToCache,
          timestamp: Date.now()
        }));
        console.log('Datos guardados en caché del menú correctamente');
      }
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
        console.log('No hay datos en caché del menú (menuCacheUtils.get)');
        return null;
      }
      
      let parsedCache;
      try {
        parsedCache = JSON.parse(cached);
      } catch (parseError) {
        console.error('Error al parsear JSON del caché:', parseError);
        safeLocalStorage.removeItem(MENU_CACHE_KEY);
        return null;
      }
      
      if (!parsedCache || typeof parsedCache !== 'object') {
        console.error('Datos de caché inválidos (no es un objeto)');
        safeLocalStorage.removeItem(MENU_CACHE_KEY);
        return null;
      }
      
      const { data, timestamp } = parsedCache as CacheData;
      
      if (!data || typeof data !== 'object') {
        console.error('Datos de caché inválidos (data no es un objeto)');
        safeLocalStorage.removeItem(MENU_CACHE_KEY);
        return null;
      }
      
      console.log('Datos encontrados en caché del menú, timestamp:', new Date(timestamp));
      
      if (Date.now() - timestamp > MENU_CACHE_TIME) {
        console.log('Caché del menú expirado');
        safeLocalStorage.removeItem(MENU_CACHE_KEY);
        return null;
      }
      
      // Asegurarse de que todos los arrays estén inicializados correctamente
      const parsedData = {
        ...data,
        categorias: Array.isArray(data.categorias) ? data.categorias : [],
        productosSeleccionados: Array.isArray(data.productosSeleccionados) ? data.productosSeleccionados : [],
        productosMenu: Array.isArray(data.productosMenu) ? data.productosMenu : [],
        productosFavoritos: Array.isArray(data.productosFavoritos) ? data.productosFavoritos : [],
        productosEspeciales: Array.isArray(data.productosEspeciales) ? data.productosEspeciales : []
      };
      
      // Función helper para convertir strings de fecha a objetos Date
      const convertirFechasEnProductos = (productos: any): void => {
        // Verificar explícitamente que productos sea un array antes de intentar iterar
        if (!Array.isArray(productos)) {
          console.warn('convertirFechasEnProductos fue llamado con un valor que no es un array:', productos);
          return; // Salir temprano si no es un array
        }
        
        try {
          for (let i = 0; i < productos.length; i++) {
            const producto = productos[i];
            if (!producto || typeof producto !== 'object') {
              console.warn('Se encontró un elemento no válido en el array de productos:', producto);
              continue; // Continuar con el siguiente producto
            }
            
            if (producto.metadata) {
              if (producto.metadata.createdAt) {
                producto.metadata.createdAt = new Date(producto.metadata.createdAt);
              }
              if (producto.metadata.lastModified) {
                producto.metadata.lastModified = new Date(producto.metadata.lastModified);
              }
            }
            
            if (producto.stock && producto.stock.lastUpdated) {
              producto.stock.lastUpdated = new Date(producto.stock.lastUpdated);
            }
          }
        } catch (error) {
          console.error('Error al procesar fechas en productos:', error);
          // No lanzar el error, simplemente registrarlo para no interrumpir el flujo
        }
      };
      
      // Función para asegurar que una propiedad sea un array
      const asegurarArray = (data: any, propiedad: string): void => {
        if (!data[propiedad] || !Array.isArray(data[propiedad])) {
          console.warn(`La propiedad ${propiedad} no es un array. Inicializando como array vacío.`);
          data[propiedad] = [];
        }
      };
      
      // Asegurar que todas las propiedades que deben ser arrays lo sean
      asegurarArray(parsedData, 'productosSeleccionados');
      asegurarArray(parsedData, 'productosMenu');
      asegurarArray(parsedData, 'productosFavoritos');
      asegurarArray(parsedData, 'productosEspeciales');
      asegurarArray(parsedData, 'categorias');
      
      // Aplicar la conversión de fechas a todos los arrays de productos relevantes
      convertirFechasEnProductos(parsedData.productosSeleccionados);
      convertirFechasEnProductos(parsedData.productosMenu);
      convertirFechasEnProductos(parsedData.productosFavoritos);
      convertirFechasEnProductos(parsedData.productosEspeciales);
      
      console.log('Datos recuperados y procesados de caché del menú:', parsedData);
      return parsedData;
      
    } catch (error) {
      console.error('Error al obtener datos de caché del menú:', error);
      // Si hay un error al parsear o procesar, es mejor limpiar el caché corrupto.
      safeLocalStorage.removeItem(MENU_CACHE_KEY);
      return null;
    }
  }, // <-- Aquí termina la ÚNICA definición del método get

  /**
   * Actualiza parcialmente los datos del menú en el caché
   * @param partialData Datos parciales a actualizar
   */
  update: (partialData: Partial<MenuCrearMenuData>) => {
    try {
      const currentData = menuCacheUtils.get();
      
      if (!currentData) {
         console.log('No hay datos base en caché para actualizar. Se creará una nueva entrada con datos parciales.');
         const initialEmpty: MenuCrearMenuData = {
            categorias: [], productosSeleccionados: [], productosMenu: [],
            productosFavoritos: [], productosEspeciales: [],
            categoriaSeleccionada: null, subcategoriaSeleccionada: null, submenuActivo: 'menu-dia'
         };
         const newData = { ...initialEmpty, ...partialData };
         menuCacheUtils.set(newData); // Llama a set para crear la entrada
         return;
      }

      // Si currentData existe, fusionar y guardar
      const updatedData = {
        ...currentData,
        ...partialData
      };
      
      menuCacheUtils.set(updatedData); // Llama a set para actualizar/guardar
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
      console.log('Limpiando caché del menú (menuCacheUtils.clear)');
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
      // No es necesario un console.error aquí, ya que es una verificación y puede fallar silenciosamente
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
