// src/hooks/useMenuCache.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  menuCacheUtils,  
  MenuCrearMenuData, 
  Categoria, 
  Producto 
} from '@/utils/menuCache.utils';
import { todosLosProductosBase } from '@/data/staticMenuData';
import { categoriasService } from '@/services/categorias.service';

// Clave para almacenar el estado de activación del caché en localStorage
const CACHE_ENABLED_KEY = 'menu_cache_enabled';

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

/**
 * Hook para gestionar el caché del menú en la página de creación de menú
 */
export const useMenuCache = () => {
  // Estado para controlar si el caché está habilitado o deshabilitado
  const [isCacheEnabled, setIsCacheEnabled] = useState<boolean>(true); // Valor predeterminado: true
  
  // Estados para categorías desde API
  const [categoriasLoading, setCategoriasLoading] = useState<boolean>(false);
  const [categoriasError, setCategoriesError] = useState<string | null>(null);
  const [categoriasFromAPI, setCategoriasFromAPI] = useState<Categoria[]>([]);
  const [idMapping, setIdMapping] = useState<Record<string, string>>({});
  
  // Inicializar el estado desde localStorage (solo en el cliente)
  useEffect(() => {
    const savedState = safeLocalStorage.getItem(CACHE_ENABLED_KEY);
    if (savedState !== null) {
      setIsCacheEnabled(savedState === 'true');
    }
  }, []);

  // Función para obtener el estado inicial con datos base importados directamente
  const getInitialState = useCallback((): MenuCrearMenuData => {
    return {
      categorias: categoriasFromAPI.length > 0 ? categoriasFromAPI : [],
      productosSeleccionados: todosLosProductosBase,
      productosMenu: [],
      productosFavoritos: [],
      productosEspeciales: [],
      categoriaSeleccionada: null,
      subcategoriaSeleccionada: null,
      submenuActivo: 'menu-dia'
    };
  }, [categoriasFromAPI]);

  // Estado para almacenar los datos del menú
  const [menuData, setMenuData] = useState<MenuCrearMenuData>(getInitialState());
  
  // Estado para controlar si los datos se han cargado desde el caché
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Estado para controlar si hay cambios sin guardar
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  /**
   * Carga las categorías desde la API
   */
  const loadCategoriasFromAPI = useCallback(async () => {
    setCategoriasLoading(true);
    setCategoriesError(null);
    
    try {
      console.log('🔄 Cargando categorías desde API...');
      const categorias = await categoriasService.obtenerCategorias();
      
      // Crear mapeo de compatibilidad
      const mapeo = categoriasService.crearMapeoCompatibilidad(categorias);
      
      setCategoriasFromAPI(categorias);
      setIdMapping(mapeo);
      setCategoriesError(null);
      
      console.log('✅ Categorías cargadas exitosamente:', categorias.length);
      
      return categorias;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error al cargar categorías:', errorMessage);
      setCategoriesError(errorMessage);
      
      // En caso de error, usar array vacío
      setCategoriasFromAPI([]);
      setIdMapping({});
      
      throw error;
    } finally {
      setCategoriasLoading(false);
    }
  }, []);

  /**
   * Carga los datos del menú desde el caché
   */
  const loadFromCache = useCallback(() => {
    if (!isCacheEnabled) {
      console.log('Caché deshabilitado, usando estado inicial');
      setMenuData(getInitialState());
      setIsLoaded(true);
      return;
    }
    
    const cachedData = menuCacheUtils.get();
    if (cachedData) {
      console.log('Cargando datos del menú desde caché');
      
      // Fusionar datos de sesión del caché con los datos base importados
      const sessionData = {
        // Usar categorías desde API o array vacío si no están cargadas
        categorias: categoriasFromAPI.length > 0 ? categoriasFromAPI : [],
        productosSeleccionados: todosLosProductosBase,
        
        // Usar datos de sesión del caché o arrays vacíos si no existen
        productosMenu: Array.isArray(cachedData.productosMenu) ? cachedData.productosMenu : [],
        productosFavoritos: Array.isArray(cachedData.productosFavoritos) ? cachedData.productosFavoritos : [],
        productosEspeciales: Array.isArray(cachedData.productosEspeciales) ? cachedData.productosEspeciales : [],
        
        // Usar selecciones de UI del caché
        categoriaSeleccionada: cachedData.categoriaSeleccionada,
        subcategoriaSeleccionada: cachedData.subcategoriaSeleccionada,
        submenuActivo: cachedData.submenuActivo || 'menu-dia'
      };
      
      setMenuData(sessionData);
    } else {
      console.log('No hay datos en caché, usando estado inicial');
      setMenuData(getInitialState());
    }
    setIsLoaded(true);
  }, [isCacheEnabled, getInitialState]);

  /**
   * Guarda los datos del menú en el caché
   */
  const saveToCache = useCallback(() => {
    if (!isCacheEnabled) {
      console.log('Caché deshabilitado, no se guardarán datos');
      return;
    }
    
    // Solo guardar los datos de sesión del usuario, no los datos base
    const sessionData = {
      // No guardar los datos base completos
      categorias: [], // No guardar en caché, se cargan desde staticMenuData
      productosSeleccionados: [], // No guardar en caché, se cargan desde staticMenuData
      
      // Guardar solo los datos de sesión
      productosMenu: Array.isArray(menuData.productosMenu) ? menuData.productosMenu : [],
      productosFavoritos: Array.isArray(menuData.productosFavoritos) ? menuData.productosFavoritos : [],
      productosEspeciales: Array.isArray(menuData.productosEspeciales) ? menuData.productosEspeciales : [],
      
      // Guardar selecciones de UI
      categoriaSeleccionada: menuData.categoriaSeleccionada,
      subcategoriaSeleccionada: menuData.subcategoriaSeleccionada,
      submenuActivo: menuData.submenuActivo
    };
    
    console.log('Guardando datos de sesión del menú en caché');
    menuCacheUtils.set(sessionData);
  }, [isCacheEnabled, menuData]);

  // Cargar categorías desde API al montar el componente
  useEffect(() => {
    loadCategoriasFromAPI().catch(error => {
      console.error('Error inicial al cargar categorías:', error);
      // Continuar con el flujo normal aunque falle la carga de categorías
    });
  }, []); // Solo ejecutar una vez al montar

  // Actualizar menuData cuando se cargan las categorías
  useEffect(() => {
    if (categoriasFromAPI.length > 0) {
      setMenuData(prev => ({
        ...prev,
        categorias: categoriasFromAPI
      }));
    }
  }, [categoriasFromAPI]);

  // Cargar datos del caché al montar el componente
  useEffect(() => {
    if (isCacheEnabled) {
      loadFromCache();
    } else {
      setMenuData(getInitialState());
      setIsLoaded(true);
    }
  }, [isCacheEnabled, loadFromCache, getInitialState]);

  // Guardar en caché cuando hay cambios
  useEffect(() => {
    if (isLoaded && hasUnsavedChanges && isCacheEnabled) {
      // Usar un timeout para evitar múltiples guardados en ciclos rápidos
      const timeoutId = setTimeout(() => {
        saveToCache();
        setHasUnsavedChanges(false);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [hasUnsavedChanges, isLoaded, isCacheEnabled, saveToCache]);

  /**
   * Actualiza las categorías en el estado y marca cambios sin guardar
   * @param categorias Nuevas categorías
   */
  const updateCategorias = useCallback((categorias: Categoria[]) => {
    setMenuData(prev => ({ ...prev, categorias }));
    setHasUnsavedChanges(true);
  }, []);

  /**
   * Actualiza los productos seleccionados en el estado y marca cambios sin guardar
   * @param productos Nuevos productos seleccionados
   */
  const updateProductosSeleccionados = useCallback((productos: Producto[]) => {
    setMenuData(prev => ({ ...prev, productosSeleccionados: productos }));
    setHasUnsavedChanges(true);
  }, []);

  /**
   * Actualiza los productos del menú del día en el estado y marca cambios sin guardar
   * @param productos Nuevos productos del menú
   */
  const updateProductosMenu = useCallback((productos: Producto[]) => {
    setMenuData(prev => ({ ...prev, productosMenu: productos }));
    setHasUnsavedChanges(true);
  }, []);

  /**
   * Actualiza los productos favoritos en el estado y marca cambios sin guardar
   * @param productos Nuevos productos favoritos
   */
  const updateProductosFavoritos = useCallback((productos: Producto[]) => {
    setMenuData(prev => ({ ...prev, productosFavoritos: productos }));
    setHasUnsavedChanges(true);
  }, []);

  /**
   * Actualiza los productos especiales en el estado y marca cambios sin guardar
   * @param productos Nuevos productos especiales
   */
  const updateProductosEspeciales = useCallback((productos: Producto[]) => {
    setMenuData(prev => ({ ...prev, productosEspeciales: productos }));
    setHasUnsavedChanges(true);
  }, []);

  /**
   * Agrega un producto al menú del día
   * @param producto Producto a agregar
   */
  const addProductoToMenu = useCallback((producto: Producto) => {
    // Verificar si el producto ya está en el menú
    setMenuData(prev => {
      const exists = Array.isArray(prev.productosMenu) && prev.productosMenu.some(p => p.id === producto.id);
      if (!exists) {
        setHasUnsavedChanges(true);
        return {
          ...prev,
          productosMenu: [...(Array.isArray(prev.productosMenu) ? prev.productosMenu : []), producto]
        };
      } else {
        console.log('El producto ya está en el menú');
        return prev;
      }
    });
  }, []);

  /**
   * Agrega un producto a favoritos
   * @param producto Producto a agregar
   */
  const addProductoToFavoritos = useCallback((producto: Producto) => {
    // Verificar si el producto ya está en favoritos
    setMenuData(prev => {
      const exists = Array.isArray(prev.productosFavoritos) && prev.productosFavoritos.some(p => p.id === producto.id);
      if (!exists) {
        const productoConFavorito = { ...producto, esFavorito: true };
        setHasUnsavedChanges(true);
        return {
          ...prev,
          productosFavoritos: [...(Array.isArray(prev.productosFavoritos) ? prev.productosFavoritos : []), productoConFavorito]
        };
      } else {
        console.log('El producto ya está en favoritos');
        return prev;
      }
    });
  }, []);

  /**
   * Agrega un producto a especiales
   * @param producto Producto a agregar
   */
  const addProductoToEspeciales = useCallback((producto: Producto) => {
    // Verificar si el producto ya está en especiales
    setMenuData(prev => {
      const exists = Array.isArray(prev.productosEspeciales) && prev.productosEspeciales.some(p => p.id === producto.id);
      if (!exists) {
        const productoConEspecial = { ...producto, esEspecial: true };
        setHasUnsavedChanges(true);
        return {
          ...prev,
          productosEspeciales: [...(Array.isArray(prev.productosEspeciales) ? prev.productosEspeciales : []), productoConEspecial]
        };
      } else {
        console.log('El producto ya está en especiales');
        return prev;
      }
    });
  }, []);

  /**
   * Elimina un producto del menú del día
   * @param productoId ID del producto a eliminar
   */
  const removeProductoFromMenu = useCallback((productoId: string) => {
    setMenuData(prev => ({
      ...prev,
      productosMenu: Array.isArray(prev.productosMenu) 
        ? prev.productosMenu.filter(p => p.id !== productoId)
        : []
    }));
    setHasUnsavedChanges(true);
  }, []);

  /**
   * Elimina un producto de favoritos
   * @param productoId ID del producto a eliminar
   */
  const removeProductoFromFavoritos = useCallback((productoId: string) => {
    setMenuData(prev => ({
      ...prev,
      productosFavoritos: Array.isArray(prev.productosFavoritos)
        ? prev.productosFavoritos.filter(p => p.id !== productoId)
        : []
    }));
    setHasUnsavedChanges(true);
  }, []);

  /**
   * Elimina un producto de especiales
   * @param productoId ID del producto a eliminar
   */
  const removeProductoFromEspeciales = useCallback((productoId: string) => {
    setMenuData(prev => ({
      ...prev,
      productosEspeciales: Array.isArray(prev.productosEspeciales)
        ? prev.productosEspeciales.filter(p => p.id !== productoId)
        : []
    }));
    setHasUnsavedChanges(true);
  }, []);

  /**
   * Actualiza la categoría y subcategoría seleccionadas
   * @param categoriaId ID de la categoría seleccionada
   * @param subcategoriaId ID de la subcategoría seleccionada
   */
  const updateSeleccion = useCallback((categoriaId: string | null, subcategoriaId: string | null) => {
    setMenuData(prev => ({
      ...prev,
      categoriaSeleccionada: categoriaId,
      subcategoriaSeleccionada: subcategoriaId
    }));
    setHasUnsavedChanges(true);
  }, []);

  /**
   * Actualiza el submenú activo
   * @param submenu Submenú activo
   */
  const updateSubmenuActivo = useCallback((submenu: 'menu-dia' | 'favoritos' | 'especiales') => {
    setMenuData(prev => ({
      ...prev,
      submenuActivo: submenu
    }));
    setHasUnsavedChanges(true);
  }, []);

  /**
   * Limpia el caché y reinicia el estado
   */
  const clearCache = useCallback(() => {
    menuCacheUtils.clear();
    setMenuData(getInitialState());
    setHasUnsavedChanges(false);
  }, [getInitialState]);

  /**
   * Verifica si hay datos en el caché
   */
  const hasCache = useCallback(() => {
    return isCacheEnabled && menuCacheUtils.hasCache();
  }, [isCacheEnabled]);

  /**
   * Obtiene el tiempo restante de validez del caché en minutos
   */
  const getCacheRemainingTime = useCallback(() => {
    return isCacheEnabled ? menuCacheUtils.getRemainingTime() : 0;
  }, [isCacheEnabled]);
  
  /**
   * Activa o desactiva el caché
   * @param enabled Estado de activación del caché
   */
  const toggleCache = useCallback((enabled: boolean) => {
    console.log('toggleCache llamado con valor:', enabled);
    console.log('Estado actual de isCacheEnabled antes de cambiar:', isCacheEnabled);
    
    // Actualizar el estado
    setIsCacheEnabled(enabled);
    
    // Guardar en localStorage (seguro)
    safeLocalStorage.setItem(CACHE_ENABLED_KEY, enabled.toString());
    console.log('Guardado en localStorage:', CACHE_ENABLED_KEY, '=', enabled.toString());
    
    if (!enabled) {
      // Si se desactiva el caché, eliminar SOLO los datos del caché del menú
      // pero NO eliminar otros datos como combinaciones.json
      console.log('Caché deshabilitado, eliminando datos del caché del menú');
      
      // Eliminar solo el caché del menú, no otros datos
      safeLocalStorage.removeItem('menu_crear_menu');
      
      // No reiniciar el estado actual para mantener la UI consistente
      // pero evitar que se guarden nuevos datos
    } else {
      console.log('Caché habilitado');
      // Si hay cambios sin guardar, guardarlos ahora
      if (hasUnsavedChanges) {
        saveToCache();
        setHasUnsavedChanges(false);
      }
    }
    
    // Verificar si los datos se eliminaron correctamente
    setTimeout(() => {
      console.log('Verificando estado de caché después de timeout');
      const currentValue = safeLocalStorage.getItem(CACHE_ENABLED_KEY);
      console.log('Valor actual en localStorage para CACHE_ENABLED_KEY:', currentValue);
      
      // Verificar si los datos del caché se eliminaron
      const cacheData = safeLocalStorage.getItem('menu_crear_menu');
      console.log('Datos en caché del menú después de toggle:', cacheData ? 'Existen datos' : 'No hay datos');
    }, 100);
  }, [isCacheEnabled, hasUnsavedChanges, saveToCache]);

  /**
   * Obtiene los productos del submenú activo
   */
  const getProductosSubmenuActivo = useCallback(() => {
    if (!menuData) return [];
    
    switch (menuData.submenuActivo) {
      case 'menu-dia':
        return Array.isArray(menuData.productosMenu) ? menuData.productosMenu : [];
      case 'favoritos':
        return Array.isArray(menuData.productosFavoritos) ? menuData.productosFavoritos : [];
      case 'especiales':
        return Array.isArray(menuData.productosEspeciales) ? menuData.productosEspeciales : [];
      default:
        return Array.isArray(menuData.productosMenu) ? menuData.productosMenu : [];
    }
  }, [menuData]);

  return {
    menuData,
    isLoaded,
    hasUnsavedChanges,
    loadFromCache,
    saveToCache,
    updateCategorias,
    updateProductosSeleccionados,
    updateProductosMenu,
    updateProductosFavoritos,
    updateProductosEspeciales,
    addProductoToMenu,
    addProductoToFavoritos,
    addProductoToEspeciales,
    removeProductoFromMenu,
    removeProductoFromFavoritos,
    removeProductoFromEspeciales,
    updateSeleccion,
    updateSubmenuActivo,
    getProductosSubmenuActivo,
    clearCache,
    hasCache,
    getCacheRemainingTime,
    isCacheEnabled,
    toggleCache,
    // Nuevas funciones para categorías desde API
    loadCategoriasFromAPI,
    categoriasLoading,
    categoriasError,
    categoriasFromAPI,
    idMapping
  };
};
