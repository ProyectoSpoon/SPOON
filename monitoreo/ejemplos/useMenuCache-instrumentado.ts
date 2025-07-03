/**
 * EJEMPLO: useMenuCache.ts instrumentado con métricas
 * 
 * Este archivo muestra cómo agregar métricas a tu hook useMenuCache existente
 * sin modificar la lógica de negocio, solo agregando observabilidad.
 * 
 * Para implementar:
 * 1. Copia este código a tu archivo useMenuCache.ts existente
 * 2. Ajusta las importaciones según tu estructura
 * 3. Las métricas se registrarán automáticamente
 */

import { useCallback, useEffect, useState } from 'react';
// Importar métricas de monitoreo
import { 
  registrarOperacionMenu,
  registrarTiempoCarga,
  registrarErrorMenu,
  actualizarProductosMenu
} from '../../monitoreo/metricas/menu-metricas';
import { 
  registrarOperacionCache,
  medirOperacionCache,
  actualizarTamanoCache
} from '../../monitoreo/metricas/cache-metricas';

// Tus tipos existentes
interface VersionedProduct {
  id: string;
  nombre: string;
  categoria: string;
  // ... otros campos
}

interface MenuCache {
  categorias: any[];
  productos: VersionedProduct[];
  timestamp: number;
  version: string;
}

export const useMenuCache = () => {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [productos, setProductos] = useState<VersionedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Función instrumentada para cargar categorías
  const loadCategoriasFromAPI = useCallback(async () => {
    const inicioTiempo = Date.now();
    
    try {
      setLoading(true);
      
      // Tu lógica existente
      const response = await fetch('/api/categorias');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCategorias(data);
      
      // Registrar métricas de éxito
      const tiempoSegundos = (Date.now() - inicioTiempo) / 1000;
      registrarTiempoCarga('api', 'cargar_categorias', tiempoSegundos, 'api');
      registrarOperacionMenu('cargar_categorias', 'current_restaurant', 'exitoso', 'datos');
      
      console.log(`✅ Categorías cargadas en ${tiempoSegundos}s`);
      return data;
      
    } catch (error) {
      // Registrar métricas de error
      const tiempoSegundos = (Date.now() - inicioTiempo) / 1000;
      registrarTiempoCarga('api', 'cargar_categorias', tiempoSegundos, 'api');
      registrarOperacionMenu('cargar_categorias', 'current_restaurant', 'error', 'datos');
      registrarErrorMenu(
        error instanceof Error ? error.name : 'UnknownError',
        'api',
        'cargar_categorias',
        'current_restaurant'
      );
      
      console.error('❌ Error cargando categorías:', error);
      throw error;
      
    } finally {
      setLoading(false);
    }
  }, []);

  // Función instrumentada para cargar productos
  const loadProductosFromAPI = useCallback(async () => {
    const inicioTiempo = Date.now();
    
    try {
      setLoading(true);
      
      // Tu lógica existente
      const response = await fetch('/api/productos');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setProductos(data);
      
      // Registrar métricas de éxito
      const tiempoSegundos = (Date.now() - inicioTiempo) / 1000;
      registrarTiempoCarga('api', 'cargar_productos', tiempoSegundos, 'api');
      registrarOperacionMenu('cargar_productos', 'current_restaurant', 'exitoso', 'datos');
      
      // Actualizar métricas de productos por categoría
      const productosPorCategoria = data.reduce((acc: any, producto: VersionedProduct) => {
        acc[producto.categoria] = (acc[producto.categoria] || 0) + 1;
        return acc;
      }, {});
      
      Object.entries(productosPorCategoria).forEach(([categoria, cantidad]) => {
        actualizarProductosMenu('current_restaurant', categoria, cantidad as number);
      });
      
      console.log(`✅ ${data.length} productos cargados en ${tiempoSegundos}s`);
      return data;
      
    } catch (error) {
      // Registrar métricas de error
      const tiempoSegundos = (Date.now() - inicioTiempo) / 1000;
      registrarTiempoCarga('api', 'cargar_productos', tiempoSegundos, 'api');
      registrarOperacionMenu('cargar_productos', 'current_restaurant', 'error', 'datos');
      registrarErrorMenu(
        error instanceof Error ? error.name : 'UnknownError',
        'api',
        'cargar_productos',
        'current_restaurant'
      );
      
      console.error('❌ Error cargando productos:', error);
      throw error;
      
    } finally {
      setLoading(false);
    }
  }, []);

  // Función instrumentada para guardar en cache
  const saveToCache = useCallback(() => {
    const medicion = medirOperacionCache('write', 'menu');
    
    try {
      const cacheData: MenuCache = {
        categorias,
        productos,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      const dataString = JSON.stringify(cacheData);
      const tamanoBytes = new Blob([dataString]).size;
      
      // Tu lógica existente de cache
      localStorage.setItem('spoon_menu_cache', dataString);
      
      // Registrar métricas de cache
      registrarOperacionCache('set', 'exitoso', 'menu', 'localStorage');
      actualizarTamanoCache(tamanoBytes, 'menu', 'localStorage');
      
      medicion.finalizar();
      console.log(`💾 Cache guardado (${tamanoBytes} bytes)`);
      
    } catch (error) {
      registrarOperacionCache('set', 'error', 'menu', 'localStorage');
      medicion.finalizar();
      
      console.error('❌ Error guardando cache:', error);
      throw error;
    }
  }, [categorias, productos]);

  // Función instrumentada para cargar desde cache
  const loadFromCache = useCallback((): MenuCache | null => {
    const medicion = medirOperacionCache('read', 'menu');
    
    try {
      const cached = localStorage.getItem('spoon_menu_cache');
      
      if (!cached) {
        registrarOperacionCache('get', 'no_encontrado', 'menu', 'localStorage');
        medicion.finalizar();
        return null;
      }
      
      const data = JSON.parse(cached) as MenuCache;
      
      // Verificar si el cache está expirado (ejemplo: 30 minutos)
      const ahora = Date.now();
      const tiempoExpiracion = 30 * 60 * 1000; // 30 minutos
      
      if (ahora - data.timestamp > tiempoExpiracion) {
        registrarOperacionCache('get', 'expirado', 'menu', 'localStorage');
        medicion.finalizar();
        return null;
      }
      
      // Cache válido
      registrarOperacionCache('get', 'exitoso', 'menu', 'localStorage');
      medicion.finalizar();
      
      console.log(`💾 Cache cargado (${Object.keys(data).length} claves)`);
      return data;
      
    } catch (error) {
      registrarOperacionCache('get', 'error', 'menu', 'localStorage');
      medicion.finalizar();
      
      console.error('❌ Error cargando cache:', error);
      return null;
    }
  }, []);

  // Función instrumentada para agregar producto al menú
  const addProductoToMenu = useCallback((producto: VersionedProduct) => {
    const inicioTiempo = Date.now();
    
    try {
      // Tu lógica existente
      setProductos(prev => [...prev, producto]);
      setHasUnsavedChanges(true);
      
      // Registrar métricas
      const tiempoSegundos = (Date.now() - inicioTiempo) / 1000;
      registrarTiempoCarga('ui', 'agregar_producto', tiempoSegundos, 'local');
      registrarOperacionMenu('agregar_producto', 'current_restaurant', 'exitoso', producto.categoria);
      
      // Actualizar contador de productos por categoría
      const productosCategoria = productos.filter(p => p.categoria === producto.categoria).length + 1;
      actualizarProductosMenu('current_restaurant', producto.categoria, productosCategoria);
      
      console.log(`✅ Producto "${producto.nombre}" agregado al menú`);
      
    } catch (error) {
      const tiempoSegundos = (Date.now() - inicioTiempo) / 1000;
      registrarTiempoCarga('ui', 'agregar_producto', tiempoSegundos, 'local');
      registrarOperacionMenu('agregar_producto', 'current_restaurant', 'error', producto.categoria);
      registrarErrorMenu(
        error instanceof Error ? error.name : 'UnknownError',
        'ui',
        'agregar_producto',
        'current_restaurant'
      );
      
      console.error('❌ Error agregando producto:', error);
      throw error;
    }
  }, [productos]);

  // Función instrumentada para publicar menú
  const publishMenu = useCallback(async () => {
    const inicioTiempo = Date.now();
    
    try {
      // Tu lógica existente de publicación
      const response = await fetch('/api/menu-dia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productos })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setHasUnsavedChanges(false);
      
      // Registrar métricas de éxito
      const tiempoSegundos = (Date.now() - inicioTiempo) / 1000;
      registrarTiempoCarga('api', 'publicar_menu', tiempoSegundos, 'api');
      registrarOperacionMenu('publicar_menu', 'current_restaurant', 'exitoso', 'menu_completo');
      
      console.log(`✅ Menú publicado en ${tiempoSegundos}s`);
      return result;
      
    } catch (error) {
      // Registrar métricas de error
      const tiempoSegundos = (Date.now() - inicioTiempo) / 1000;
      registrarTiempoCarga('api', 'publicar_menu', tiempoSegundos, 'api');
      registrarOperacionMenu('publicar_menu', 'current_restaurant', 'error', 'menu_completo');
      registrarErrorMenu(
        error instanceof Error ? error.name : 'UnknownError',
        'api',
        'publicar_menu',
        'current_restaurant'
      );
      
      console.error('❌ Error publicando menú:', error);
      throw error;
    }
  }, [productos]);

  // Efecto para cargar datos iniciales (instrumentado)
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Intentar cargar desde cache primero
        const cached = loadFromCache();
        
        if (cached) {
          setCategorias(cached.categorias);
          setProductos(cached.productos);
          console.log('💾 Datos cargados desde cache');
        } else {
          // Cargar desde API si no hay cache válido
          await Promise.all([
            loadCategoriasFromAPI(),
            loadProductosFromAPI()
          ]);
          
          // Guardar en cache después de cargar
          saveToCache();
        }
        
      } catch (error) {
        console.error('❌ Error inicializando datos:', error);
      }
    };

    initializeData();
  }, [loadCategoriasFromAPI, loadProductosFromAPI, loadFromCache, saveToCache]);

  // Auto-save con métricas
  useEffect(() => {
    if (hasUnsavedChanges) {
      const timer = setTimeout(() => {
        try {
          saveToCache();
          console.log('💾 Auto-save ejecutado');
        } catch (error) {
          console.error('❌ Error en auto-save:', error);
        }
      }, 300); // Debounce de 300ms

      return () => clearTimeout(timer);
    }
  }, [hasUnsavedChanges, saveToCache]);

  return {
    // Estado
    categorias,
    productos,
    loading,
    hasUnsavedChanges,
    
    // Funciones
    loadCategoriasFromAPI,
    loadProductosFromAPI,
    addProductoToMenu,
    publishMenu,
    saveToCache,
    loadFromCache,
    
    // Setters
    setCategorias,
    setProductos,
    setHasUnsavedChanges
  };
};

/**
 * INSTRUCCIONES DE IMPLEMENTACIÓN:
 * 
 * 1. Reemplaza tu useMenuCache.ts existente con este código
 * 2. Ajusta las importaciones según tu estructura de carpetas
 * 3. Modifica los nombres de funciones si son diferentes
 * 4. Ajusta los endpoints de API según tu configuración
 * 5. Las métricas se registrarán automáticamente
 * 
 * MÉTRICAS QUE SE REGISTRARÁN:
 * - Tiempo de carga de categorías y productos
 * - Operaciones de cache (hit/miss/save)
 * - Errores en cada operación
 * - Productos activos por categoría
 * - Tiempo de publicación de menú
 * 
 * DASHBOARDS DONDE APARECERÁN:
 * - Flujo de Menú del Restaurante
 * - Performance y Cache
 * - Errores del Sistema
 */
