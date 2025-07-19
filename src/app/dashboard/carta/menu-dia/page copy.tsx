'use client';

import { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react';
import { useMenuCache } from '@/hooks/useMenuCache';
import { toast } from 'sonner';
import { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';
import { useCategorias } from '@/app/dashboard/carta/hooks/useCategorias';
import { CategoriaMenu } from '@/app/dashboard/carta/types/menu.types';

// ✅ IMPORTAR EL HOOK DEL TÍTULO DINÁMICO
import { useSetPageTitle } from '@/shared/Context/page-title-context';

// ✅ IMPORTACIONES REFACTORIZADAS - Con tipos específicos para evitar conflictos
import { useFavoritos } from './hooks/useFavoritos';
import type { ProductoFavorito } from './types/menu-dia.types';
import { convertToVersionedProduct, convertToProducto } from './utils/menu-dia.utils';
import { useMenuDiaData } from './hooks/useMenuDiaData';
import { useMenuDiaUI } from './hooks/useMenuDiaUI';
import { useMenuDiaActions } from './hooks/useMenuDiaActions';

// ✅ NUEVO IMPORT: Hook para gestionar el modal del menú
import { useMenuDiaGestor } from './hooks/useMenuDiaGestor';

// ✅ COMPONENTES LIGEROS (carga inmediata)
import { CategoryTabs } from './components/CategoryTabs';
import { ProductTable } from './components/ProductTable';

// ✅ COMPONENTES PESADOS (lazy loading) - INCLUYENDO EL NUEVO MODAL
import { ProductModal, FavoritesSection, MenuSection, ModalVerMenuDia } from './components/LazyComponents';

// ✅ TIPOS ADAPTERS PARA RESOLVER CONFLICTOS
type MenuCacheProducto = import('@/utils/menuCache.utils').Producto;
type MenuDiaProducto = import('./types/menu-dia.types').Producto;

// ✅ FUNCIÓN ADAPTER PARA CONVERTIR TIPOS
const adaptProductoToMenuCache = (producto: MenuDiaProducto): MenuCacheProducto => ({
  ...producto,
  descripcion: producto.descripcion || '', // Convertir undefined a string vacío
  currentVersion: producto.currentVersion || 1.0, // Asegurar que sea número
});

// ✅ FUNCIÓN ADAPTER PARA REMOVEFAVORITO
const adaptRemoveFavorito = (removeFn: (id: string) => Promise<boolean>) => 
  async (id: string): Promise<void> => {
    await removeFn(id);
    // No retornamos nada para cumplir con Promise<void>
  };

// ✅ DEFINICIÓN DE TIPOS PARA EL COMPONENTE INTEGRADO ACTUALIZADO - SIN DATOS DE RESTAURANTE
interface IntegratedHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchSuggestions: VersionedProduct[];
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  handleSelectSuggestion: (producto: VersionedProduct) => void;
  handleAgregarAlMenu: (producto: VersionedProduct) => void;
  showFavorites: boolean;
  setShowFavorites: (show: boolean) => void;
  favoritos: ProductoFavorito[];
  favoritosLoading: boolean;
  // ✅ NUEVAS PROPS PARA EL MENÚ DEL DÍA
  onVerMenuDia: () => void;
  menuDiaLoading: boolean;
  tieneMenuGuardado: boolean;
}

// ✅ OPTIMIZACIÓN: Loading skeletons
const FavoritesSkeleton = () => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mx-4 animate-pulse">
    <div className="h-6 bg-yellow-200 rounded w-1/3 mb-3"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white border border-yellow-200 rounded-lg p-3 h-16"></div>
      ))}
    </div>
  </div>
);

const MenuSectionSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm p-4 mt-4 animate-pulse">
    <div className="flex justify-between items-center mb-4">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="h-6 bg-gray-200 rounded w-20"></div>
    </div>
    <div className="h-64 bg-gray-100 rounded"></div>
  </div>
);

const ProductModalSkeleton = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-2xl w-full animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  </div>
);

// ✅ NUEVO SKELETON: Para el modal del menú del día
const ModalMenuDiaSkeleton = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg max-w-6xl w-full h-5/6 flex flex-col mx-4 animate-pulse">
      {/* Header skeleton */}
      <div className="flex justify-between items-center p-6 border-b">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="w-6 h-6 bg-gray-200 rounded"></div>
      </div>
      
      {/* Content skeleton */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 border-r p-4 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-32 mb-3"></div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded"></div>
          ))}
        </div>
        
        <div className="w-1/2 p-4 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-40 mb-3"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-blue-100 rounded"></div>
          ))}
        </div>
      </div>
      
      {/* Footer skeleton */}
      <div className="p-6 border-t bg-gray-50 flex justify-between">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="flex space-x-3">
          <div className="h-10 bg-gray-200 rounded w-20"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    </div>
  </div>
);

// ✅ HEADER LIMPIO - SIN TÍTULO NI INFORMACIÓN DE RESTAURANTE
const IntegratedHeader: React.FC<IntegratedHeaderProps> = ({ 
  searchTerm,
  setSearchTerm,
  searchSuggestions,
  showSuggestions,
  setShowSuggestions,
  handleSelectSuggestion,
  handleAgregarAlMenu,
  showFavorites,
  setShowFavorites,
  favoritos,
  favoritosLoading,
  // ✅ NUEVAS PROPS
  onVerMenuDia,
  menuDiaLoading,
  tieneMenuGuardado
}) => (
  <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-3">
    <div className="flex items-center justify-end"> {/* ✅ CAMBIO: justify-end en lugar de justify-between */}
      {/* ✅ SOLO BOTONES Y BÚSQUEDA - SIN TÍTULO NI INFO DE RESTAURANTE */}
      <div className="flex items-center gap-4">
        
        {/* ✅ BOTÓN: Ver Menú Día */}
        <button
          onClick={onVerMenuDia}
          disabled={menuDiaLoading}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200
            ${tieneMenuGuardado
              ? 'bg-green-50 border-green-300 text-green-700 shadow-sm hover:bg-green-100' 
              : 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm hover:bg-blue-100'
            }
            ${menuDiaLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {menuDiaLoading ? (
            <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
          )}
          <span className="hidden sm:inline">
            {menuDiaLoading ? 'Cargando...' : 'Ver Menú Día'}
          </span>
          {tieneMenuGuardado && (
            <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
              ✓
            </span>
          )}
        </button>

        {/* Botón de Favoritos */}
        <button
          onClick={() => setShowFavorites(!showFavorites)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200
            ${showFavorites 
              ? 'bg-yellow-50 border-yellow-300 text-yellow-700 shadow-sm' 
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }
          `}
          disabled={favoritosLoading}
        >
          <svg 
            className="w-5 h-5" 
            fill={showFavorites ? "currentColor" : "none"} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
          <span className="hidden sm:inline">
            {showFavorites ? 'Ocultar favoritos' : 'Mostrar favoritos'}
          </span>
          {favoritos.length > 0 && (
            <span className="bg-yellow-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
              {favoritos.length}
            </span>
          )}
        </button>

        {/* Campo de Búsqueda */}
        <div className="relative">
          <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              className="bg-transparent outline-none flex-1 text-gray-700 placeholder-gray-500 min-w-[250px]"
            />
          </div>
          
          {/* Sugerencias de búsqueda */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {searchSuggestions.map((producto: VersionedProduct, index: number) => (
                <div
                  key={`${producto.id}-${index}`}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSelectSuggestion(producto)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                      <span className="text-xs text-gray-500">IMG</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{producto.nombre}</p>
                      <p className="text-xs text-gray-500">Categoría</p>
                    </div>
                  </div>
                  <button
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      handleAgregarAlMenu(producto);
                      setShowSuggestions(false);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs transition-colors"
                  >
                    Agregar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Funciones de validación optimizadas
const validarYLimpiarDatos = (productos: any[]): any[] => {
  if (!Array.isArray(productos)) return [];
  return productos.filter((producto: any) => {
    return producto && producto.id && producto.nombre && producto.categoriaId;
  });
};

export default function MenuDiaPage() {
  // ✅ ESTABLECER TÍTULO DINÁMICO DE LA PÁGINA
  useSetPageTitle('Menú del Día', 'Gestión del menú diario del restaurante');

  // ✅ HOOKS EXISTENTES
  const {
    menuData, isLoaded, updateProductosSeleccionados, updateProductosMenu,
    addProductoToMenu, removeProductoFromMenu, updateSeleccion, updateSubmenuActivo,
    hasCache, getCacheRemainingTime, saveToCache, clearCache
  } = useMenuCache();

  const {
    categorias: categoriasPostgreSQL,
    loading: categoriasLoading,
    error: categoriasError,
    obtenerCategorias,
  } = useCategorias();

  // ✅ HOOKS REFACTORIZADOS
  const { restaurantId, userId, menuDiaDB, productosDB, loadingDB, errorDB } = useMenuDiaData(
    updateProductosMenu, 
    updateProductosSeleccionados
  );
  
  const {
    favoritos, loading: favoritosLoading, addFavorito, removeFavorito,
    toggleFavorito, isFavorito, refreshFavoritos
  } = useFavoritos(userId, restaurantId);

  // ✅ NUEVO HOOK: Gestor del modal del menú del día
  const {
    showModal: showMenuModal,
    loading: menuDiaLoading,
    abrirModal: abrirMenuModal,
    cerrarModal: cerrarMenuModal,
    cargarMenuGuardado,
    sincronizarMenu,
    verificarMenuGuardado
  } = useMenuDiaGestor();

  // ✅ NUEVO ESTADO: Verificar si hay menú guardado
  const [tieneMenuGuardado, setTieneMenuGuardado] = useState(false);

  // ✅ OPTIMIZACIÓN: Memoizar datos procesados con dependencias estables
  const versionedProductosMenu = useMemo(() =>
    menuData && Array.isArray(menuData.productosMenu)
      ? validarYLimpiarDatos(menuData.productosMenu).map(convertToVersionedProduct)
      : [],
  [menuData?.productosMenu]);

  const versionedProductosSeleccionados = useMemo(() =>
    menuData && Array.isArray(menuData.productosSeleccionados)
      ? validarYLimpiarDatos(menuData.productosSeleccionados).map(convertToVersionedProduct)
      : [],
  [menuData?.productosSeleccionados]);

  const todosLosProductos = useMemo(() => {
    return versionedProductosSeleccionados;
  }, [versionedProductosSeleccionados]);

  // ✅ HOOKS UI Y ACCIONES REFACTORIZADOS (memoizados)
  const {
    searchTerm, setSearchTerm, searchSuggestions, showSuggestions, setShowSuggestions,
    selectedCategoryTab, setSelectedCategoryTab, showProductModal, setShowProductModal,
    selectedProduct, setSelectedProduct, showFavorites, setShowFavorites,
    cacheTimeRemaining, setCacheTimeRemaining, handleSelectSuggestion, handleViewProductDetails
  } = useMenuDiaUI(todosLosProductos, updateSeleccion);

  const {
    publicando, setPublicando, manteniendoMenu, setManteniendoMenu,
    handlePublicarMenu, handleMantenerMenu, limpiarCacheCorrupto
  } = useMenuDiaActions(versionedProductosMenu, hasCache, clearCache, saveToCache, refreshFavoritos);

  // ✅ NUEVO: Verificar menú guardado al cargar
  useEffect(() => {
    const verificarMenu = async () => {
      if (restaurantId) {
        const tieneMenu = await verificarMenuGuardado();
        setTieneMenuGuardado(tieneMenu);
      }
    };
    verificarMenu();
  }, [restaurantId, verificarMenuGuardado, versionedProductosMenu.length]);

  // ✅ NUEVAS FUNCIONES: Gestión del modal del menú
  const handleVerMenuDia = useCallback(() => {
    console.log('📖 Abriendo modal del menú del día');
    abrirMenuModal();
  }, [abrirMenuModal]);

  const handleProductoAgregadoDesdeModal = useCallback((producto: VersionedProduct) => {
    console.log('➕ Producto agregado desde modal:', producto.nombre);
    // El modal ya actualiza su propio estado, aquí solo notificamos
    toast.success(`${producto.nombre} será agregado al menú actual`);
  }, []);

  // ✅ OPTIMIZACIÓN: Effects memoizados
  useEffect(() => {
    obtenerCategorias().catch(() => toast.error('Error al cargar categorías'));
  }, [obtenerCategorias]);

  useEffect(() => {
    if (!isLoaded) return;
    setCacheTimeRemaining(getCacheRemainingTime());
    const interval = setInterval(() => {
      setCacheTimeRemaining(getCacheRemainingTime());
    }, 60000);
    return () => clearInterval(interval);
  }, [isLoaded, getCacheRemainingTime, setCacheTimeRemaining]);

  useEffect(() => {
    updateSubmenuActivo('menu-dia');
  }, [updateSubmenuActivo]);

  // ✅ OPTIMIZACIÓN: Funciones memoizadas con useCallback
  const handleCategoriaSeleccionada = useCallback((categoriaId: string) => {
    updateSeleccion(categoriaId, null);
  }, [updateSeleccion]);

  const handleAgregarAlMenu = useCallback((versionedProduct: VersionedProduct) => {
    const producto = convertToProducto(versionedProduct);
    // ✅ ADAPTER: Convertir el producto antes de agregarlo al menú
    const productoAdaptado = adaptProductoToMenuCache(producto);
    addProductoToMenu(productoAdaptado as any);
    toast.success(`${producto?.nombre || 'Producto'} agregado al menú del día`, { duration: 2000 });
  }, [addProductoToMenu]);

  const handleRemoveFromMenu = useCallback((productoId: string) => {
    // ✅ FIX: Usar tipo any para evitar conflicto entre tipos Producto diferentes
    const producto = menuData?.productosMenu?.find((p: any) => p.id === productoId);
    if (producto) {
      removeProductoFromMenu(productoId);
      toast.success(`${producto.nombre} eliminado del menú del día`);
    }
  }, [menuData?.productosMenu, removeProductoFromMenu]);

  const handleToggleFavorite = useCallback(async (versionedProduct: VersionedProduct) => {
    if (!restaurantId) {
      toast.error('No se ha cargado el ID del restaurante');
      return;
    }
    try {
      const success = await toggleFavorito(versionedProduct.id);
      if (success) {
        const esFavorito = isFavorito(versionedProduct.id);
        const mensaje = esFavorito
          ? `${versionedProduct.nombre} agregado a favoritos del restaurante`
          : `${versionedProduct.nombre} eliminado de favoritos del restaurante`;
        toast.success(mensaje);
      }
    } catch (error) {
      toast.error('Error al actualizar favoritos');
    }
  }, [restaurantId, toggleFavorito, isFavorito]);

  // Loading state
  if (!isLoaded || categoriasLoading || loadingDB || !restaurantId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spoon-primary mb-4"></div>
        <p className="text-gray-600">
          {!restaurantId ? 'Cargando configuración del restaurante...' : 'Cargando datos del menú...'}
        </p>
        {categoriasError && <p className="text-red-500 mt-2 text-sm">Error: {categoriasError}</p>}
      </div>
    );
  }

  // ✅ RENDER OPTIMIZADO CON LAZY LOADING Y SUSPENSE
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ✅ HEADER LIMPIO - SIN TÍTULO NI INFO DE RESTAURANTE */}
      <IntegratedHeader 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchSuggestions={searchSuggestions}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        handleSelectSuggestion={handleSelectSuggestion}
        handleAgregarAlMenu={handleAgregarAlMenu}
        showFavorites={showFavorites}
        setShowFavorites={setShowFavorites}
        favoritos={favoritos}
        favoritosLoading={favoritosLoading}
        // ✅ NUEVAS PROPS PARA EL MENÚ DEL DÍA
        onVerMenuDia={handleVerMenuDia}
        menuDiaLoading={menuDiaLoading}
        tieneMenuGuardado={tieneMenuGuardado}
      />
      
      {/* Pestañas de categorías */}
      <div className="px-6 py-4">
        <CategoryTabs 
          selectedCategoryTab={selectedCategoryTab}
          setSelectedCategoryTab={setSelectedCategoryTab}
          handleCategoriaSeleccionada={handleCategoriaSeleccionada}
        />
      </div>
      
      {/* Resto del contenido con padding lateral */}
      <div className="flex-1 px-6 space-y-4 overflow-hidden">
        {/* Componente pesado - lazy loading con skeleton */}
        <Suspense fallback={<FavoritesSkeleton />}>
          <FavoritesSection 
            showFavorites={showFavorites}
            favoritos={favoritos}
            favoritosLoading={favoritosLoading}
            handleAgregarAlMenu={handleAgregarAlMenu}
            removeFavorito={adaptRemoveFavorito(removeFavorito)}
          />
        </Suspense>
        
        <ProductTable 
          versionedProductosSeleccionados={versionedProductosSeleccionados}
          selectedCategoryTab={selectedCategoryTab}
          handleAgregarAlMenu={handleAgregarAlMenu}
          handleViewProductDetails={handleViewProductDetails}
          handleToggleFavorite={handleToggleFavorite}
          isFavorito={isFavorito}
          favoritosLoading={favoritosLoading}
        />
        
        {/* ✅ SECCIÓN CORREGIDA: Sin props de mantenerMenu */}
        <Suspense fallback={<MenuSectionSkeleton />}>
          <MenuSection 
            versionedProductosMenu={versionedProductosMenu}
            categoriasPostgreSQL={categoriasPostgreSQL}
            handleRemoveFromMenu={handleRemoveFromMenu}
            menuData={menuData}
            updateProductosMenu={(productos: MenuDiaProducto[]) => {
              // ✅ ADAPTER: Convertir tipos antes de pasar a useMenuCache
              const productosAdaptados = productos.map(adaptProductoToMenuCache);
              updateProductosMenu(productosAdaptados as any);
            }}
            cacheTimeRemaining={cacheTimeRemaining}
            limpiarCacheCorrupto={limpiarCacheCorrupto}
            handlePublicarMenu={handlePublicarMenu}
            publicando={publicando}
          />
        </Suspense>
      </div>
      
      {/* Modal pesado - lazy loading con skeleton */}
      <Suspense fallback={showProductModal ? <ProductModalSkeleton /> : null}>
        <ProductModal 
          showProductModal={showProductModal}
          selectedProduct={selectedProduct}
          setShowProductModal={setShowProductModal}
          handleAgregarAlMenu={handleAgregarAlMenu}
          handleToggleFavorite={handleToggleFavorite}
          isFavorito={isFavorito}
          favoritosLoading={favoritosLoading}
        />
      </Suspense>

      {/* ✅ NUEVO MODAL: Ver Menú del Día - Con lazy loading y skeleton */}
      <Suspense fallback={showMenuModal ? <ModalMenuDiaSkeleton /> : null}>
        <ModalVerMenuDia
          show={showMenuModal}
          onClose={cerrarMenuModal}
          onProductoAgregado={handleProductoAgregadoDesdeModal}
          restaurantId={restaurantId}
        />
      </Suspense>
    </div>
  );
}