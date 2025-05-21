// src/hooks/useMenuCache.ts
import { useState, useEffect } from 'react';
import { 
  menuCacheUtils, 
  MenuCrearMenuData, 
  Categoria, 
  Producto 
} from '@/utils/menuCache.utils';

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
  
  // Inicializar el estado desde localStorage (solo en el cliente)
  useEffect(() => {
    const savedState = safeLocalStorage.getItem(CACHE_ENABLED_KEY);
    if (savedState !== null) {
      setIsCacheEnabled(savedState === 'true');
    }
  }, []);
  // Estado inicial vacío
  const initialState: MenuCrearMenuData = {
    categorias: [],
    productosSeleccionados: [],
    productosMenu: [],
    productosFavoritos: [],
    productosEspeciales: [],
    categoriaSeleccionada: null,
    subcategoriaSeleccionada: null,
    submenuActivo: 'menu-dia'
  };

  // Estado para almacenar los datos del menú
  const [menuData, setMenuData] = useState<MenuCrearMenuData>(initialState);
  
  // Estado para controlar si los datos se han cargado desde el caché
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Estado para controlar si hay cambios sin guardar
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Cargar datos del caché al montar el componente
  useEffect(() => {
    if (isCacheEnabled) {
      loadFromCache();
    } else {
      setMenuData(initialState);
      setIsLoaded(true);
    }
  }, [isCacheEnabled]);

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
  }, [hasUnsavedChanges, isLoaded, isCacheEnabled]);

  /**
   * Carga los datos del menú desde el caché
   */
  const loadFromCache = () => {
    if (!isCacheEnabled) {
      console.log('Caché deshabilitado, usando estado inicial');
      setMenuData(initialState);
      setIsLoaded(true);
      return;
    }
    
    const cachedData = menuCacheUtils.get();
    if (cachedData) {
      console.log('Cargando datos del menú desde caché');
      setMenuData(cachedData);
    } else {
      console.log('No hay datos en caché, usando estado inicial');
      setMenuData(initialState);
    }
    setIsLoaded(true);
  };

  /**
   * Guarda los datos del menú en el caché
   */
  const saveToCache = () => {
    if (!isCacheEnabled) {
      console.log('Caché deshabilitado, no se guardarán datos');
      return;
    }
    
    console.log('Guardando datos del menú en caché');
    menuCacheUtils.set(menuData);
  };

  /**
   * Actualiza las categorías en el estado y marca cambios sin guardar
   * @param categorias Nuevas categorías
   */
  const updateCategorias = (categorias: Categoria[]) => {
    setMenuData(prev => ({ ...prev, categorias }));
    setHasUnsavedChanges(true);
  };

  /**
   * Actualiza los productos seleccionados en el estado y marca cambios sin guardar
   * @param productos Nuevos productos seleccionados
   */
  const updateProductosSeleccionados = (productos: Producto[]) => {
    setMenuData(prev => ({ ...prev, productosSeleccionados: productos }));
    setHasUnsavedChanges(true);
  };

  /**
   * Actualiza los productos del menú del día en el estado y marca cambios sin guardar
   * @param productos Nuevos productos del menú
   */
  const updateProductosMenu = (productos: Producto[]) => {
    setMenuData(prev => ({ ...prev, productosMenu: productos }));
    setHasUnsavedChanges(true);
  };

  /**
   * Actualiza los productos favoritos en el estado y marca cambios sin guardar
   * @param productos Nuevos productos favoritos
   */
  const updateProductosFavoritos = (productos: Producto[]) => {
    setMenuData(prev => ({ ...prev, productosFavoritos: productos }));
    setHasUnsavedChanges(true);
  };

  /**
   * Actualiza los productos especiales en el estado y marca cambios sin guardar
   * @param productos Nuevos productos especiales
   */
  const updateProductosEspeciales = (productos: Producto[]) => {
    setMenuData(prev => ({ ...prev, productosEspeciales: productos }));
    setHasUnsavedChanges(true);
  };

  /**
   * Agrega un producto al menú del día
   * @param producto Producto a agregar
   */
  const addProductoToMenu = (producto: Producto) => {
    // Verificar si el producto ya está en el menú
    const exists = menuData.productosMenu.some(p => p.id === producto.id);
    if (!exists) {
      setMenuData(prev => ({
        ...prev,
        productosMenu: [...prev.productosMenu, producto]
      }));
      setHasUnsavedChanges(true);
    } else {
      console.log('El producto ya está en el menú');
    }
  };

  /**
   * Agrega un producto a favoritos
   * @param producto Producto a agregar
   */
  const addProductoToFavoritos = (producto: Producto) => {
    // Verificar si el producto ya está en favoritos
    const exists = menuData.productosFavoritos.some(p => p.id === producto.id);
    if (!exists) {
      const productoConFavorito = { ...producto, esFavorito: true };
      setMenuData(prev => ({
        ...prev,
        productosFavoritos: [...prev.productosFavoritos, productoConFavorito]
      }));
      setHasUnsavedChanges(true);
    } else {
      console.log('El producto ya está en favoritos');
    }
  };

  /**
   * Agrega un producto a especiales
   * @param producto Producto a agregar
   */
  const addProductoToEspeciales = (producto: Producto) => {
    // Verificar si el producto ya está en especiales
    const exists = menuData.productosEspeciales.some(p => p.id === producto.id);
    if (!exists) {
      const productoConEspecial = { ...producto, esEspecial: true };
      setMenuData(prev => ({
        ...prev,
        productosEspeciales: [...prev.productosEspeciales, productoConEspecial]
      }));
      setHasUnsavedChanges(true);
    } else {
      console.log('El producto ya está en especiales');
    }
  };

  /**
   * Elimina un producto del menú del día
   * @param productoId ID del producto a eliminar
   */
  const removeProductoFromMenu = (productoId: string) => {
    setMenuData(prev => ({
      ...prev,
      productosMenu: prev.productosMenu.filter(p => p.id !== productoId)
    }));
    setHasUnsavedChanges(true);
  };

  /**
   * Elimina un producto de favoritos
   * @param productoId ID del producto a eliminar
   */
  const removeProductoFromFavoritos = (productoId: string) => {
    setMenuData(prev => ({
      ...prev,
      productosFavoritos: prev.productosFavoritos.filter(p => p.id !== productoId)
    }));
    setHasUnsavedChanges(true);
  };

  /**
   * Elimina un producto de especiales
   * @param productoId ID del producto a eliminar
   */
  const removeProductoFromEspeciales = (productoId: string) => {
    setMenuData(prev => ({
      ...prev,
      productosEspeciales: prev.productosEspeciales.filter(p => p.id !== productoId)
    }));
    setHasUnsavedChanges(true);
  };

  /**
   * Actualiza la categoría y subcategoría seleccionadas
   * @param categoriaId ID de la categoría seleccionada
   * @param subcategoriaId ID de la subcategoría seleccionada
   */
  const updateSeleccion = (categoriaId: string | null, subcategoriaId: string | null) => {
    setMenuData(prev => ({
      ...prev,
      categoriaSeleccionada: categoriaId,
      subcategoriaSeleccionada: subcategoriaId
    }));
    setHasUnsavedChanges(true);
  };

  /**
   * Actualiza el submenú activo
   * @param submenu Submenú activo
   */
  const updateSubmenuActivo = (submenu: 'menu-dia' | 'favoritos' | 'especiales') => {
    setMenuData(prev => ({
      ...prev,
      submenuActivo: submenu
    }));
    setHasUnsavedChanges(true);
  };

  /**
   * Limpia el caché y reinicia el estado
   */
  const clearCache = () => {
    menuCacheUtils.clear();
    setMenuData(initialState);
    setHasUnsavedChanges(false);
  };

  /**
   * Verifica si hay datos en el caché
   */
  const hasCache = () => {
    return isCacheEnabled && menuCacheUtils.hasCache();
  };

  /**
   * Obtiene el tiempo restante de validez del caché en minutos
   */
  const getCacheRemainingTime = () => {
    return isCacheEnabled ? menuCacheUtils.getRemainingTime() : 0;
  };
  
  /**
   * Activa o desactiva el caché
   * @param enabled Estado de activación del caché
   */
  const toggleCache = (enabled: boolean) => {
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
  };

  /**
   * Obtiene los productos del submenú activo
   */
  const getProductosSubmenuActivo = () => {
    switch (menuData.submenuActivo) {
      case 'menu-dia':
        return menuData.productosMenu;
      case 'favoritos':
        return menuData.productosFavoritos;
      case 'especiales':
        return menuData.productosEspeciales;
      default:
        return menuData.productosMenu;
    }
  };

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
    toggleCache
  };
};
