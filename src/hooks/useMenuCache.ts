// src/hooks/useMenuCache.ts
import { useState, useEffect, useCallback, useRef } from 'react';
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
  // ✅ CORREGIDO: Caché deshabilitado por defecto para menú diario
  const [isCacheEnabled, setIsCacheEnabled] = useState<boolean>(false); // Valor predeterminado: false
  
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
  // Devuelve un estado inicial básico. Los productos se cargarán desde la BD.
  return {
    categorias: [],
    productosSeleccionados: [], // Se llenará desde la BD en page.tsx
    productosMenu: [],
    productosFavoritos: [],
    productosEspeciales: [],
    categoriaSeleccionada: null,
    subcategoriaSeleccionada: null,
    submenuActivo: 'menu-dia'
  };
}, []); 
  
  // Memoizar getInitialState para evitar recreaciones innecesarias
  const getInitialStateMemoized = useRef(getInitialState()).current;
  
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
      
      // Fusionar datos de sesión del caché con el estado actual
      setMenuData(prev => ({
        // ✅ CORREGIDO: Usar categorías del caché si existen, sino las de API, sino mantener previas
        categorias: Array.isArray(cachedData.categorias) && cachedData.categorias.length > 0 
          ? cachedData.categorias 
          : (categoriasFromAPI.length > 0 ? categoriasFromAPI : prev.categorias),
        // Mantener productos seleccionados si ya están cargados desde BD, sino usar caché
        productosSeleccionados: prev.productosSeleccionados.length > 0 ? prev.productosSeleccionados : (Array.isArray(cachedData.productosSeleccionados) ? cachedData.productosSeleccionados : []),
        
        // Usar datos de sesión del caché
        productosMenu: Array.isArray(cachedData.productosMenu) ? cachedData.productosMenu : [],
        productosFavoritos: Array.isArray(cachedData.productosFavoritos) ? cachedData.productosFavoritos : [],
        productosEspeciales: Array.isArray(cachedData.productosEspeciales) ? cachedData.productosEspeciales : [],
        
        // Usar selecciones de UI del caché
        categoriaSeleccionada: cachedData.categoriaSeleccionada,
        subcategoriaSeleccionada: cachedData.subcategoriaSeleccionada,
        submenuActivo: cachedData.submenuActivo || 'menu-dia'
      }));
    } else {
      console.log('No hay datos en caché, manteniendo estado actual');
      // No sobrescribir el estado actual si no hay caché
    }
    setIsLoaded(true);
  }, [isCacheEnabled, categoriasFromAPI, getInitialStateMemoized]); // Usar la versión memoizada

  /**
   * Guarda los datos del menú en el caché
   */
  const saveToCache = useCallback(() => {
    if (!isCacheEnabled) {
      console.log('Caché deshabilitado, no se guardarán datos');
      return;
    }
    
    // ✅ CORREGIDO: Guardar categorías en el caché para mantener estado
    const sessionData = {
      // ✅ CAMBIO CRÍTICO: Guardar categorías para mantener el estado entre recargas
      categorias: Array.isArray(menuData.categorias) ? menuData.categorias : [],
      // Guardar productos seleccionados para mantener la lista disponible
      productosSeleccionados: Array.isArray(menuData.productosSeleccionados) ? menuData.productosSeleccionados : [],

      // Guardar datos de sesión importantes
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

  // ✅ CORREGIDO: Cargar categorías y actualizar estado
  useEffect(() => {
    loadCategoriasFromAPI()
      .then(categorias => {
        // ✅ NUEVA FUNCIONALIDAD: Actualizar el estado con las categorías cargadas
        console.log('📂 Actualizando estado con categorías cargadas:', categorias.length);
        setMenuData(prev => ({
          ...prev,
          categorias: categorias
        }));
        setHasUnsavedChanges(true); // Marcar para guardar en cache
      })
      .catch(error => {
        console.error('Error inicial al cargar categorías:', error);
        // Continuar con el flujo normal aunque falle la carga de categorías
      });
  }, []); // Solo ejecutar una vez al montar

  // Cargar datos del caché al montar el componente
  useEffect(() => {
    // Retrasar la carga del caché para permitir que los productos de BD se carguen primero
    const timer = setTimeout(() => {
      if (isCacheEnabled) {
        loadFromCache();
      } else {
        setMenuData(getInitialState());
        setIsLoaded(true);
      }
    }, 100); // Pequeño retraso para permitir que la BD se cargue primero
    
    return () => clearTimeout(timer);
  }, [isCacheEnabled, loadFromCache, getInitialStateMemoized]); // Usar la versión memoizada

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
    console.log('📂 Actualizando categorías manualmente:', categorias.length);
    setMenuData(prev => ({ ...prev, categorias }));
    setHasUnsavedChanges(true);
  }, []);

  /**
   * Actualiza los productos seleccionados en el estado y marca cambios sin guardar
   * @param productos Nuevos productos seleccionados
   */
  const updateProductosSeleccionados = useCallback((productos: Producto[]) => {
    setMenuData(prev => {
      // Solo actualizar si realmente hay productos nuevos o si el array actual está vacío
      if (productos.length > 0 && (prev.productosSeleccionados.length === 0 || productos.length !== prev.productosSeleccionados.length)) {
        console.log('🔄 Actualizando productos seleccionados:', productos.length, 'productos');
        setHasUnsavedChanges(true);
        return { ...prev, productosSeleccionados: productos };
      }
      return prev;
    });
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
    console.log('🍽️ Intentando agregar producto al menú:', producto.nombre || 'Sin nombre', 'ID:', producto.id);
    
    // Verificar si el producto ya está en el menú
    setMenuData(prev => {
      console.log('📋 Productos actuales en menú:', prev.productosMenu?.length || 0);
      console.log('📋 IDs en menú:', prev.productosMenu?.map(p => p.id) || []);
      
      const exists = Array.isArray(prev.productosMenu) && prev.productosMenu.some(p => p.id === producto.id);
      
      if (!exists) {
        console.log('✅ Producto no existe en menú, agregando...');
        setHasUnsavedChanges(true);
        const newMenu = [...(Array.isArray(prev.productosMenu) ? prev.productosMenu : []), producto];
        console.log('📋 Nuevo menú tendrá:', newMenu.length, 'productos');
        return {
          ...prev,
          productosMenu: newMenu
        };
      } else {
        console.log('❌ El producto ya está en el menú - ID duplicado:', producto.id);
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
  
  const getProductosSubmenuActivoMemoized = useRef(getProductosSubmenuActivo).current;
  
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
    getCacheRemainingTime,
    isCacheEnabled,
    toggleCache,
    // Nuevas funciones para categorías desde API
    loadCategoriasFromAPI,
    categoriasLoading,
    categoriasError,
    categoriasFromAPI,
    hasCache,
    idMapping
  };
};