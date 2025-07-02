// src/app/dashboard/carta/menu-dia/page.tsx
'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useMenuCache } from '@/hooks/useMenuCache';
import { Producto } from '@/utils/menuCache.utils';
import { toast } from 'sonner';
import { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';
import { Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Menu, GripVertical, Coffee, Soup, Beef, Salad, Utensils } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { categoriasService } from '@/services/categorias.service';

// Componentes
import { MenuDiarioRediseno } from '@/app/dashboard/carta/components/menu-diario/MenuDiarioRediseno';
import ListaProductosRediseno from '@/app/dashboard/carta/components/productos/ListaProductosRediseno';
import { ListaCategoriasRediseno } from '@/app/dashboard/carta/components/categorias/ListaCategoriasRediseno';

/**
 * Función para convertir un Producto a VersionedProduct
 */
const convertToVersionedProduct = (producto: Producto): VersionedProduct => {
  // Asegurarse de que producto.stock no es undefined antes de acceder a sus propiedades
  const stockStatus = producto.stock?.status as 'in_stock' | 'low_stock' | 'out_of_stock' | undefined || 'out_of_stock';
  const stockData = producto.stock || { currentQuantity: 0, minQuantity: 0, maxQuantity: 0, status: 'out_of_stock', lastUpdated: new Date() };

  return {
    id: producto.id,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    currentPrice: producto.precio || 0, // Agregar currentPrice
    categoriaId: producto.categoriaId,
    currentVersion: producto.currentVersion,
    priceHistory: Array.isArray(producto.priceHistory) ? producto.priceHistory : [], // Asegurar array
    versions: Array.isArray(producto.versions) ? producto.versions : [], // Asegurar array
    stock: {
      ...stockData,
      status: stockStatus,
    },
    status: producto.status as 'active' | 'draft' | 'archived' | 'discontinued' || 'archived',
    metadata: producto.metadata || { createdAt: new Date(), createdBy: 'unknown', lastModified: new Date(), lastModifiedBy: 'unknown' }, // Asegurar metadata
    imagen: producto.imagen,
    esFavorito: producto.esFavorito,
    esEspecial: producto.esEspecial
  };
};

/**
 * Función para convertir un VersionedProduct a Producto
 */
const convertToProducto = (versionedProduct: VersionedProduct): Producto => {
  return {
    id: versionedProduct.id,
    nombre: versionedProduct.nombre,
    descripcion: versionedProduct.descripcion,
    precio: versionedProduct.currentPrice, // Agregar precio
    categoriaId: versionedProduct.categoriaId,
    currentVersion: versionedProduct.currentVersion,
    priceHistory: versionedProduct.priceHistory,
    versions: versionedProduct.versions,
    stock: versionedProduct.stock,
    status: versionedProduct.status,
    metadata: versionedProduct.metadata,
    imagen: versionedProduct.imagen,
    esFavorito: versionedProduct.esFavorito,
    esEspecial: versionedProduct.esEspecial
  };
};

export default function MenuDiaPage() {
  const {
    menuData,
    isLoaded,
    updateCategorias, // Asegúrate de estar usando estas funciones si modificas localmente
    updateProductosSeleccionados, // y quieres persistir los cambios.
    updateProductosMenu,
    addProductoToMenu,
    removeProductoFromMenu,
    addProductoToFavoritos,
    removeProductoFromFavoritos,
    updateSeleccion,
    updateSubmenuActivo,
    hasCache,
    getCacheRemainingTime,
    // Nuevas propiedades para categorías desde API
    loadCategoriasFromAPI,
    categoriasLoading,
    categoriasError,
    categoriasFromAPI,
    idMapping
  } = useMenuCache();

  // Estados para datos desde la base de datos
  const [menuDiaDB, setMenuDiaDB] = useState<any>(null);
  const [categoriasDB, setCategoriasDB] = useState<any[]>([]);
  const [productosDB, setProductosDB] = useState<any[]>([]);
  const [loadingDB, setLoadingDB] = useState(true);
  const [errorDB, setErrorDB] = useState<string | null>(null);

  // Cargar datos desde la base de datos
  useEffect(() => {
    const cargarDatosDB = async () => {
      try {
        console.log('🔄 Cargando menú del día desde la base de datos...');
        const response = await fetch('/api/menu-dia');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📊 Datos de BD recibidos:', data);
        
        setMenuDiaDB(data.menuDia);
        setCategoriasDB(data.categorias || []);
        setProductosDB(data.todosLosProductos || []);
        
        // Convertir productos de la BD a formato VersionedProduct para el menú
        const productosMenuBD = (data.menuDia?.productos || []).map((producto: any) => convertToVersionedProduct({
          id: producto.id,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          precio: producto.precio || 0,
          categoriaId: producto.categoriaId,
          imagen: producto.imagen,
          cantidad: producto.cantidad || 0,
          stock: {
            currentQuantity: producto.cantidad || 0,
            minQuantity: 0,
            maxQuantity: 100,
            status: 'in_stock' as const,
            lastUpdated: new Date()
          },
          status: 'active' as const,
          currentVersion: '1.0.0',
          priceHistory: [],
          versions: [],
          metadata: {
            createdAt: new Date(),
            createdBy: 'system',
            lastModified: new Date(),
            lastModifiedBy: 'system'
          }
        }));
        
        // Actualizar el menú con los datos de la BD
        updateProductosMenu(productosMenuBD.map(convertToProducto));
        
      } catch (err) {
        console.error('❌ Error al cargar datos de BD:', err);
        setErrorDB(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoadingDB(false);
      }
    };

    cargarDatosDB();
  }, []); // Solo ejecutar una vez al montar

  // Log para inspeccionar menuData - solo una vez al cargar
  useEffect(() => {
    if (isLoaded) {
      console.log("MenuDiaPage - menuData RECIBIDO:", JSON.parse(JSON.stringify(menuData))); // Usar JSON.stringify para una copia profunda
      if (menuData) {
        console.log("MenuDiaPage - typeof menuData.productosMenu:", typeof menuData.productosMenu, ", isArray:", Array.isArray(menuData.productosMenu));
        console.log("MenuDiaPage - typeof menuData.productosSeleccionados:", typeof menuData.productosSeleccionados, ", isArray:", Array.isArray(menuData.productosSeleccionados));
      }
    }
  }, [isLoaded]); // Solo depende de isLoaded para evitar bucles infinitos

  // ... (otros estados como showCacheIndicator, cacheTimeRemaining, etc.)
  const [showCacheIndicator, setShowCacheIndicator] = useState(true);
  const [cacheTimeRemaining, setCacheTimeRemaining] = useState<number>(60); 
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<VersionedProduct[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>('almuerzo'); // Iniciar con almuerzo seleccionado
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('todas');
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<VersionedProduct | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);

  // useEffect para el tiempo de caché y notificación - con dependencias memoizadas
  useEffect(() => {
    if (!isLoaded) return; // No hacer nada si los datos no están cargados
    
    // Establecer el tiempo inicial
    setCacheTimeRemaining(getCacheRemainingTime()); 
    
    // Configurar el intervalo para actualizar cada minuto
    const interval = setInterval(() => {
      const remainingTime = getCacheRemainingTime();
      setCacheTimeRemaining(remainingTime);
      
      // Verificar si el caché ha expirado
      if (remainingTime <= 0) {
        toast.error('El tiempo de caché ha expirado.');
      }
    }, 60000);
    
    // Limpiar el intervalo al desmontar
    return () => clearInterval(interval);
  }, [isLoaded, getCacheRemainingTime]); // getCacheRemainingTime está memoizado, es seguro usarlo como dependencia

  // Usar una referencia para evitar múltiples notificaciones toast - con dependencias memoizadas
  const toastShownRef = useRef(false);
  
  useEffect(() => {
    if (isLoaded && !toastShownRef.current) {
      toastShownRef.current = true;
      
      if (hasCache()) {
        toast.success(
          `Datos cargados desde caché (expira en ${getCacheRemainingTime()} minutos)`,
          { duration: 4000 }
        );
      } else {
        toast.info(
          `No se encontraron datos en caché. Se usará el estado inicial o datos frescos.`,
          { duration: 4000 }
        );
      }
    }
  }, [isLoaded, hasCache, getCacheRemainingTime]); // hasCache y getCacheRemainingTime están memoizados

  // Establecer el submenú activo solo una vez al montar el componente
  useEffect(() => {
    updateSubmenuActivo('menu-dia');
  }, [updateSubmenuActivo]); // updateSubmenuActivo está memoizado, es seguro usarlo como dependencia

  const handleCategoriaSeleccionada = (categoriaId: string) => {
    updateSeleccion(categoriaId, null);
    console.log(`Categoría seleccionada: ${categoriaId}`);
  };

  const handleAgregarAlMenu = (versionedProduct: VersionedProduct) => {
    const producto = convertToProducto(versionedProduct);
    addProductoToMenu(producto);
    toast.success(`${producto.nombre} agregado al menú del día`);
  };

  const handleRemoveFromMenu = (productoId: string) => {
    const producto = menuData?.productosMenu?.find(p => p.id === productoId);
    if (producto) {
      removeProductoFromMenu(productoId);
      toast.success(`${producto.nombre} eliminado del menú del día`);
    }
  };

  const handleToggleFavorite = (versionedProduct: VersionedProduct) => {
    const producto = convertToProducto(versionedProduct);
    
    // Verificar si ya está en favoritos
    const isFavorite = menuData?.productosFavoritos?.some(p => p.id === producto.id);
    
    if (isFavorite) {
      // Si ya es favorito, quitarlo
      removeProductoFromFavoritos(producto.id);
      toast.success(`${producto.nombre} eliminado de favoritos`);
    } else {
      // Si no es favorito, agregarlo
      addProductoToFavoritos(producto);
      toast.success(`${producto.nombre} agregado a favoritos`);
    }
  };

  const handleViewProductDetails = (producto: VersionedProduct) => {
    setSelectedProduct(producto);
    setShowProductModal(true);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(prev => (prev === categoryId ? null : categoryId));
  };

  // --- INICIO DE CORRECCIÓN Y VERIFICACIÓN ---
  // Verificar y corregir si menuData.productosMenu no es un array
  useEffect(() => {
    if (menuData && !Array.isArray(menuData.productosMenu)) {
      console.warn("menuData.productosMenu no es un array. Corrigiendo...");
      updateProductosMenu([]);
    }
    if (menuData && !Array.isArray(menuData.productosSeleccionados)) {
      console.warn("menuData.productosSeleccionados no es un array. Corrigiendo...");
      updateProductosSeleccionados([]);
    }
  }, [menuData, updateProductosMenu, updateProductosSeleccionados]);

  // Usar useMemo para evitar recreaciones innecesarias de estos arrays
  const versionedProductosMenu = useMemo(() => 
    menuData && Array.isArray(menuData.productosMenu) 
      ? menuData.productosMenu.map(convertToVersionedProduct) 
      : []
  , [menuData?.productosMenu]);

  const versionedProductosSeleccionados = useMemo(() => 
    menuData && Array.isArray(menuData.productosSeleccionados)
      ? menuData.productosSeleccionados.map(convertToVersionedProduct)
      : []
  , [menuData?.productosSeleccionados]);
  // --- FIN DE CORRECCIÓN Y VERIFICACIÓN ---

  // Usar useMemo para evitar recreaciones innecesarias
  const todosLosProductos = useMemo(() => versionedProductosSeleccionados, [versionedProductosSeleccionados]);

  // Memoizar la función de filtrado para evitar recreaciones innecesarias
  const filtrarProductosPorTermino = useCallback((term: string, productos: VersionedProduct[]) => {
    if (!term.trim()) return [];
    
    const termLower = term.toLowerCase();
    return productos.filter(producto => 
      producto.nombre.toLowerCase().includes(termLower) || 
      (producto.descripcion && producto.descripcion.toLowerCase().includes(termLower))
    );
  }, []);

  // Usar el callback memoizado para filtrar productos con debounce corto
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    // Debounce corto (150ms) para dar sensación de inmediatez pero evitar demasiadas actualizaciones
    const debounceTimeout = setTimeout(() => {
      const sugerencias = filtrarProductosPorTermino(searchTerm, todosLosProductos);
      setSearchSuggestions(sugerencias);
      setShowSuggestions(sugerencias.length > 0);
    }, 150);
    
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, todosLosProductos, filtrarProductosPorTermino]); // Dependencias estables
  
  const handleSelectSuggestion = (producto: VersionedProduct) => {
    // Actualizar el término de búsqueda y ocultar sugerencias
    setSearchTerm(producto.nombre);
    setShowSuggestions(false);
    
    // Determinar el tipo de comida basado en la categoría
    let tipoComida = 'almuerzo'; // Valor por defecto
    
    // Mapeo de categorías a tipos de comida
    if (['CAT_001', 'CAT_005'].includes(producto.categoriaId)) {
      tipoComida = 'desayuno';
    } else if (['CAT_001', 'CAT_002', 'CAT_003', 'CAT_004', 'CAT_005'].includes(producto.categoriaId)) {
      tipoComida = 'almuerzo';
    } else if (['CAT_002', 'CAT_003', 'CAT_004'].includes(producto.categoriaId)) {
      tipoComida = 'cena';
    } else if (['CAT_003', 'CAT_004'].includes(producto.categoriaId)) {
      tipoComida = 'rapidas';
    }
    
    // Actualizar la UI para mostrar la categoría correcta
    setSelectedTab(tipoComida);
    setSelectedCategoryTab(producto.categoriaId);
    setExpandedCategory(producto.categoriaId);
    
    // Actualizar la selección en el contexto del menú
    updateSeleccion(producto.categoriaId, null);
    
    // Hacer scroll hacia la categoría del producto (opcional)
    setTimeout(() => {
      const categoriaElement = document.getElementById(`categoria-${producto.categoriaId}`);
      if (categoriaElement) {
        categoriaElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Usar las categorías desde la API, con fallback a categorías hardcodeadas solo si hay error
  const categoriasList = useMemo(() => {
    if (categoriasFromAPI.length > 0) {
      return categoriasFromAPI;
    }
    
    // Solo usar fallback si hay error de carga
    if (categoriasError) {
      console.warn('Usando categorías hardcodeadas debido a error:', categoriasError);
      return [
        { id: 'CAT_001', nombre: 'Entradas', tipo: 'principal' as const },
        { id: 'CAT_002', nombre: 'Principio', tipo: 'principal' as const },
        { id: 'CAT_003', nombre: 'Proteína', tipo: 'principal' as const },
        { id: 'CAT_004', nombre: 'Acompañamientos', tipo: 'principal' as const },
        { id: 'CAT_005', nombre: 'Bebida', tipo: 'principal' as const }
      ];
    }
    
    // Si está cargando, devolver array vacío
    return [];
  }, [categoriasFromAPI, categoriasError]);

  const contarProductosPorCategoria = () => {
      const conteos: Record<string, number> = {};
      
      if (menuData && Array.isArray(menuData.productosSeleccionados)) {
        menuData.productosSeleccionados.forEach(producto => {
          if (producto.categoriaId) {
            // Convertir ID antiguo a nuevo usando el mapeo
            const idNuevo = categoriasService.obtenerIdNuevo(producto.categoriaId, idMapping);
            conteos[idNuevo] = (conteos[idNuevo] || 0) + 1;
          }
        });
      }
      
      return conteos;
  };
  const conteoProductos = contarProductosPorCategoria();
  const categorias = categoriasList.map(cat => ({
    ...cat,
    count: conteoProductos[cat.id] || 0
  }));

  // Mostrar indicador de carga si los datos no están listos
  if (!isLoaded || categoriasLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F4821F] mb-4"></div>
        <p className="text-gray-600">
          {categoriasLoading ? 'Cargando categorías desde la base de datos...' : 'Cargando datos del menú...'}
        </p>
        {categoriasError && (
          <p className="text-red-500 mt-2 text-sm">
            Error al cargar categorías: {categoriasError}
          </p>
        )}
      </div>
    );
  }

  // Si no hay categorías disponibles, mostrar mensaje
  if (categoriasList.length === 0 && !categoriasLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No hay categorías disponibles</h2>
          <p className="text-gray-500 mb-4">
            {categoriasError 
              ? 'Error al cargar las categorías desde la base de datos.' 
              : 'No se encontraron categorías en la base de datos.'}
          </p>
          <button 
            onClick={() => loadCategoriasFromAPI()}
            className="px-4 py-2 bg-[#F4821F] hover:bg-[#E67812] text-white rounded-md"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
 
    <div className="flex flex-col space-y-4 h-screen bg-gray-50">
      {/* Encabezado principal */}
      <div className="flex justify-between items-center bg-gray-50 p-4">
        <h1 className="text-2xl font-bold text-gray-700">Menu - Almuerzos</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar producto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-3 pr-10 py-2 border border-gray-200 rounded-md w-64 text-sm"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            
            {showSuggestions && (
              <div className="absolute z-10 mt-1 w-96 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-auto">
                {searchSuggestions.length > 0 ? (
                  searchSuggestions.map((producto) => (
                    <div
                      key={producto.id}
                      id={`sugerencia-${producto.id}`}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => handleSelectSuggestion(producto)}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Imagen del producto */}
                        <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                          {producto.imagen ? (
                            <img 
                              src={producto.imagen} 
                              alt={producto.nombre} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {producto.categoriaId === 'CAT_001' && <Soup className="h-8 w-8 text-orange-500" />}
                              {producto.categoriaId === 'CAT_002' && <Utensils className="h-8 w-8 text-yellow-500" />}
                              {producto.categoriaId === 'CAT_003' && <Beef className="h-8 w-8 text-red-500" />}
                              {producto.categoriaId === 'CAT_004' && <Salad className="h-8 w-8 text-green-500" />}
                              {producto.categoriaId === 'CAT_005' && <Coffee className="h-8 w-8 text-blue-500" />}
                            </div>
                          )}
                        </div>
                        
                        {/* Información del producto */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {producto.nombre}
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {categoriasList.find(c => c.id === producto.categoriaId)?.nombre || 'Categoría'}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                            {producto.descripcion}
                          </p>
                          
                          {/* Acciones rápidas */}
                          <div className="mt-2 flex justify-between items-center">
                            <div className="text-xs text-gray-500">
                              {producto.stock.status === 'in_stock' ? (
                                <span className="text-green-600">Disponible</span>
                              ) : producto.stock.status === 'low_stock' ? (
                                <span className="text-yellow-600">Stock bajo</span>
                              ) : (
                                <span className="text-red-600">No disponible</span>
                              )}
                            </div>
                            <button
                              className="text-xs bg-[#F4821F] hover:bg-[#E67812] text-white px-2 py-1 rounded"
                              onClick={(e) => {
                                e.stopPropagation(); // Evitar que se active el onClick del div padre
                                handleAgregarAlMenu(producto);
                                setShowSuggestions(false);
                              }}
                            >
                              Agregar al menú
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No se encontraron productos
                  </div>
                )}
              </div>
            )}
          </div>
      </div>

      {/* Navegación principal - Tipo de comida */}
      <div className="flex items-center border-b border-gray-200 bg-white shadow-sm">
        <button className="p-2 rounded-full border border-gray-200 mx-2">
          <ChevronLeft className="h-4 w-4 text-gray-500" />
        </button>
        
        <div className="flex space-x-4 overflow-x-auto py-2 px-4">
          <button 
            className={`px-3 py-1 font-medium text-sm ${selectedTab === 'desayuno' 
              ? 'text-[#F4821F] border-b-2 border-[#F4821F]' 
              : 'text-gray-700 hover:text-[#F4821F]'}`}
            onClick={() => {
              setSelectedTab('desayuno');
              setExpandedCategory(null);
              setSelectedCategoryTab('todas');
            }}
          >
            Desayuno
          </button>
          <button 
            className={`px-3 py-1 font-medium text-sm ${selectedTab === 'almuerzo' 
              ? 'text-[#F4821F] border-b-2 border-[#F4821F]' 
              : 'text-gray-700 hover:text-[#F4821F]'}`}
            onClick={() => {
              setSelectedTab('almuerzo');
              setExpandedCategory(null);
              setSelectedCategoryTab('todas');
            }}
          >
            Almuerzo
          </button>
          <button 
            className={`px-3 py-1 font-medium text-sm ${selectedTab === 'cena' 
              ? 'text-[#F4821F] border-b-2 border-[#F4821F]' 
              : 'text-gray-700 hover:text-[#F4821F]'}`}
            onClick={() => {
              setSelectedTab('cena');
              setExpandedCategory(null);
              setSelectedCategoryTab('todas');
            }}
          >
            Cena
          </button>
          <button 
            className={`px-3 py-1 font-medium text-sm ${selectedTab === 'rapidas' 
              ? 'text-[#F4821F] border-b-2 border-[#F4821F]' 
              : 'text-gray-700 hover:text-[#F4821F]'}`}
            onClick={() => {
              setSelectedTab('rapidas');
              setExpandedCategory(null);
              setSelectedCategoryTab('todas');
            }}
          >
            Comidas Rápidas
          </button>
        </div>
        <button className="p-2 rounded-full border border-gray-200 mx-2">
          <ChevronRight className="h-4 w-4 text-gray-500" />
        </button>
      </div>
      
      {/* Barra de pestañas de subcategorías */}
      <div className="flex items-center border-b border-gray-200 bg-white shadow-sm">
        <div className="flex space-x-4 overflow-x-auto py-2 px-4 w-full">
          {/* Mostrar subcategorías para Almuerzo */}
          {selectedTab === 'almuerzo' && (
            <>
              <button 
                className={`px-3 py-1 text-sm ${selectedCategoryTab === 'todas' 
                  ? 'text-[#F4821F] border-b-2 border-[#F4821F]' 
                  : 'text-gray-700 hover:text-[#F4821F]'}`}
                onClick={() => {
                  setSelectedCategoryTab('todas');
                  // No necesitamos expandir categorías aquí, lo haremos en el renderizado
                }}
              >
                Todas
              </button>
              
              {categorias
                .filter(categoria => ['CAT_001', 'CAT_002', 'CAT_003', 'CAT_004', 'CAT_005'].includes(categoria.id))
                .map((cat) => (
                  <button 
                    key={cat.id}
                    className={`px-3 py-1 text-sm ${selectedCategoryTab === cat.id 
                      ? 'text-[#F4821F] border-b-2 border-[#F4821F]' 
                      : 'text-gray-700 hover:text-[#F4821F]'}`}
                    onClick={() => {
                      setSelectedCategoryTab(cat.id);
                      setExpandedCategory(cat.id);
                      handleCategoriaSeleccionada(cat.id);
                    }}
                  >
                    {cat.nombre}
                  </button>
                ))}
            </>
          )}
        </div>
      </div>

      {/* Sección de acordeón/lista de categorías */}
      <div className="space-y-1 overflow-y-auto" style={{maxHeight: 'calc(100vh - 300px)' /* Ajusta según necesidad */}}>
        {categorias
          .filter(categoria => {
            // Filtrar por tipo de comida
            if (selectedTab === 'desayuno') {
              return ['CAT_001', 'CAT_005'].includes(categoria.id);
            }
            if (selectedTab === 'almuerzo') {
              return ['CAT_001', 'CAT_002', 'CAT_003', 'CAT_004', 'CAT_005'].includes(categoria.id);
            }
            if (selectedTab === 'cena') {
              return ['CAT_002', 'CAT_003', 'CAT_004'].includes(categoria.id);
            }
            if (selectedTab === 'rapidas') {
              return ['CAT_003', 'CAT_004'].includes(categoria.id);
            }
            
            return false;
          })
          .map((categoria) => (
            <div key={categoria.id} id={`categoria-${categoria.id}`} className="border-b border-gray-200 bg-white">
              <div 
                className="flex items-center justify-between py-3 px-4 cursor-pointer"
                onClick={() => toggleCategory(categoria.id)}
              >
                <div className="flex items-center space-x-3">
                  <Menu className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-sm">{categoria.nombre}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{categoria.count}</span>
                  {expandedCategory === categoria.id || (selectedCategoryTab === 'todas') ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </div>
              </div>
              
              {/* Mostrar productos siempre cuando selectedCategoryTab es 'todas' o cuando la categoría está expandida */}
              {(expandedCategory === categoria.id || selectedCategoryTab === 'todas') && (
                <div className="px-4 py-3 bg-gray-50">
                  {/* Tabla de productos con encabezados claros */}
                  <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    {/* Encabezados de la tabla */}
                    <div className="grid grid-cols-12 bg-gray-50 text-xs font-medium text-gray-500 border-b border-gray-200">
                      <div className="col-span-2 p-3 text-center">IMAGEN</div>
                      <div className="col-span-5 p-3">PRODUCTO</div>
                      <div className="col-span-3 p-3 text-center">AGREGAR A MENU DÍA</div>
                      <div className="col-span-2 p-3 text-center">ACCIONES</div>
                    </div>
                    
                    {/* Contenido de la tabla - Productos */}
                    <div className="divide-y divide-gray-200">
                            {versionedProductosSeleccionados
                        .filter((producto: VersionedProduct) => {
                          // Convertir ID del producto (antiguo) a nuevo usando el mapeo
                          const idNuevoProducto = categoriasService.obtenerIdNuevo(producto.categoriaId, idMapping);
                          return idNuevoProducto === categoria.id;
                        })
                        .map((producto: VersionedProduct) => (
                          <div key={producto.id} className="grid grid-cols-12 items-center py-2 hover:bg-gray-50">
                            {/* Imagen */}
                            <div className="col-span-2 flex justify-center">
                              <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                                {producto.imagen ? (
                                  <img 
                                    src={producto.imagen} 
                                    alt={producto.nombre} 
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="text-gray-400">
                                    {producto.categoriaId === 'CAT_001' && <Soup className="h-6 w-6" />}
                                    {producto.categoriaId === 'CAT_002' && <Utensils className="h-6 w-6" />}
                                    {producto.categoriaId === 'CAT_003' && <Beef className="h-6 w-6" />}
                                    {producto.categoriaId === 'CAT_004' && <Salad className="h-6 w-6" />}
                                    {producto.categoriaId === 'CAT_005' && <Coffee className="h-6 w-6" />}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Información del producto */}
                            <div className="col-span-5 px-3">
                              <div className="font-medium text-sm text-gray-800">{producto.nombre}</div>
                              <div className="text-xs text-gray-500 mt-1 line-clamp-2">{producto.descripcion}</div>
                            </div>
                            
                            {/* Botón de agregar al menú */}
                            <div className="col-span-3 flex justify-center">
                              <button 
                                className="px-3 py-1 bg-[#F4821F] hover:bg-[#E67812] text-white text-xs rounded-md"
                                onClick={() => handleAgregarAlMenu(producto)}
                              >
                                Agregar
                              </button>
                            </div>
                            
                            {/* Acciones adicionales */}
                            <div className="col-span-2 flex justify-center space-x-2">
                              <button 
                                className="p-1 rounded-md hover:bg-gray-100"
                                onClick={() => handleViewProductDetails(producto)}
                                title="Ver detalles"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button 
                                className={`p-1 rounded-md hover:bg-gray-100 ${
                                  menuData?.productosFavoritos?.some(p => p.id === producto.id) 
                                    ? 'text-red-500' 
                                    : 'text-gray-500'
                                }`}
                                onClick={() => handleToggleFavorite(producto)}
                                title="Agregar/quitar de favoritos"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={
                                  menuData?.productosFavoritos?.some(p => p.id === producto.id) 
                                    ? 'currentColor' 
                                    : 'none'
                                } viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Modal para detalles del producto */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedProduct.nombre}</h2>
              <button 
                onClick={() => setShowProductModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex justify-center items-center">
                {selectedProduct.imagen ? (
                  <img 
                    src={selectedProduct.imagen} 
                    alt={selectedProduct.nombre} 
                    className="max-h-64 object-contain rounded-lg"
                  />
                ) : (
                  <div className="h-64 w-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-gray-400">
                      {selectedProduct.categoriaId === 'CAT_001' && <Soup className="h-16 w-16" />}
                      {selectedProduct.categoriaId === 'CAT_002' && <Utensils className="h-16 w-16" />}
                      {selectedProduct.categoriaId === 'CAT_003' && <Beef className="h-16 w-16" />}
                      {selectedProduct.categoriaId === 'CAT_004' && <Salad className="h-16 w-16" />}
                      {selectedProduct.categoriaId === 'CAT_005' && <Coffee className="h-16 w-16" />}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Detalles</h3>
                <p className="text-gray-700 mb-4">{selectedProduct.descripcion}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Categoría:</span>
                    <span className="font-medium">{
                      categoriasList.find(c => c.id === selectedProduct.categoriaId)?.nombre || 'No especificada'
                    }</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`font-medium ${
                      selectedProduct.stock.status === 'in_stock' ? 'text-green-600' :
                      selectedProduct.stock.status === 'low_stock' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {selectedProduct.stock.status === 'in_stock' ? 'Disponible' :
                       selectedProduct.stock.status === 'low_stock' ? 'Stock bajo' :
                       'No disponible'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cantidad disponible:</span>
                    <span className="font-medium">{selectedProduct.stock.currentQuantity}</span>
                  </div>
                </div>
                
                <div className="mt-6 flex space-x-4">
                  <button 
                    className="px-4 py-2 bg-[#F4821F] hover:bg-[#E67812] text-white rounded-md flex-1"
                    onClick={() => {
                      handleAgregarAlMenu(selectedProduct);
                      setShowProductModal(false);
                    }}
                  >
                    Agregar al menú
                  </button>
                  
                  <button 
                    className={`px-4 py-2 rounded-md flex-1 ${
                      menuData?.productosFavoritos?.some(p => p.id === selectedProduct.id)
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                    onClick={() => handleToggleFavorite(selectedProduct)}
                  >
                    {menuData?.productosFavoritos?.some(p => p.id === selectedProduct.id)
                      ? 'Quitar de favoritos'
                      : 'Agregar a favoritos'
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sección "Menu del Día" */}
      <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Menu del Día</h2>
          <div className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
            <span className="text-gray-600 mr-1">Caché:</span>
            <span className={`font-medium ${cacheTimeRemaining <= 5 ? 'text-red-500' : 'text-green-600'}`}>
              {cacheTimeRemaining} min
            </span>
          </div>
        </div>
        <MenuDiarioRediseno 
          productos={versionedProductosMenu}
          onRemoveProduct={handleRemoveFromMenu}
          onUpdateCantidad={(productoId: string, cantidad: number) => {
            const productoOriginal = menuData?.productosMenu?.find(p => p.id === productoId);
            if (productoOriginal) {
              const productoActualizado = {
                ...productoOriginal,
                stock: { ...productoOriginal.stock, currentQuantity: cantidad }
              };
              updateProductosMenu(
                menuData.productosMenu.map(p => p.id === productoId ? productoActualizado : p)
              );
              toast.success(`Cantidad de ${productoOriginal.nombre} actualizada a ${cantidad}`);
            }
          }}
        />
        <div className="flex justify-between items-center mt-6">
          <div>
            <button 
              className={`px-4 py-2 rounded-md mr-2 ${showFavorites ? 'bg-[#F4821F] text-white' : 'bg-gray-200 text-gray-800'}`}
              onClick={() => setShowFavorites(!showFavorites)}
            >
              {showFavorites ? 'Ocultar favoritos' : 'Mostrar favoritos'}
            </button>
            
            {showFavorites && (
              <div className="mt-4 border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Productos favoritos</h3>
                {menuData?.productosFavoritos?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {menuData.productosFavoritos.map(producto => (
                      <div key={producto.id} className="border rounded p-2 flex justify-between items-center">
                        <span className="font-medium">{producto.nombre}</span>
                        <div className="flex space-x-2">
                          <button 
                            className="text-[#F4821F] hover:text-[#E67812]"
                            onClick={() => addProductoToMenu(producto)}
                            title="Agregar al menú"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                          <button 
                            className="text-red-500 hover:text-red-600"
                            onClick={() => removeProductoFromFavoritos(producto.id)}
                            title="Quitar de favoritos"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay productos favoritos</p>
                )}
              </div>
            )}
          </div>
          
          <div className="flex space-x-4">
            <Button className="bg-[#F4821F] hover:bg-[#E67812] text-white">Mantener Menu</Button>
            <Button className="bg-[#E67812] hover:bg-[#D56A0F] text-white">Publicar Menu</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
