'use client';

import { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react';
import { useMenuCache } from '@/hooks/useMenuCache';
import { toast } from 'sonner';
import { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';
import { useCategorias } from '@/app/dashboard/carta/hooks/useCategorias';
import { CategoriaMenu } from '@/app/dashboard/carta/types/menu.types';

// ✅ IMPORTACIONES REFACTORIZADAS
import { useFavoritos } from './hooks/useFavoritos';
import type { Producto } from './types/menu-dia.types';
import { convertToVersionedProduct, convertToProducto } from './utils/menu-dia.utils';
import { useMenuDiaData } from './hooks/useMenuDiaData';
import { useMenuDiaUI } from './hooks/useMenuDiaUI';
import { useMenuDiaActions } from './hooks/useMenuDiaActions';

// ✅ COMPONENTES LIGEROS (carga inmediata)
import { HeaderSection } from './components/HeaderSection';
import { SearchSection } from './components/SearchSection';
import { NavigationSection } from './components/NavigationSection';
import { CategoryTabs } from './components/CategoryTabs';
import { ProductTable } from './components/ProductTable';

// ✅ COMPONENTES PESADOS (lazy loading)
import { ProductModal, FavoritesSection, MenuSection } from './components/LazyComponents';

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

// Funciones de validación optimizadas
const validarYLimpiarDatos = (productos: any[]): any[] => {
  if (!Array.isArray(productos)) return [];
  return productos.filter((producto: any) => {
    return producto && producto.id && producto.nombre && producto.categoriaId;
  });
};

export default function MenuDiaPage() {
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
    publicando, manteniendoMenu, handlePublicarMenu, handleMantenerMenu, limpiarCacheCorrupto
  } = useMenuDiaActions(versionedProductosMenu, hasCache, clearCache, saveToCache, refreshFavoritos);

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
    addProductoToMenu(producto);
    toast.success(`${producto?.nombre || 'Producto'} agregado al menú del día`, { duration: 2000 });
  }, [addProductoToMenu]);

  const handleRemoveFromMenu = useCallback((productoId: string) => {
    const producto = menuData?.productosMenu?.find((p: Producto) => p.id === productoId);
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
    <div className="flex flex-col space-y-4 h-screen bg-gray-50">
      {/* Componentes ligeros - carga inmediata */}
      <HeaderSection restaurantId={restaurantId} userId={userId} />
      
      <SearchSection 
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
      />
      
      <NavigationSection />
      
      <CategoryTabs 
        selectedCategoryTab={selectedCategoryTab}
        setSelectedCategoryTab={setSelectedCategoryTab}
        handleCategoriaSeleccionada={handleCategoriaSeleccionada}
      />
      
      {/* Componente pesado - lazy loading con skeleton */}
      <Suspense fallback={<FavoritesSkeleton />}>
        <FavoritesSection 
          showFavorites={showFavorites}
          favoritos={favoritos}
          favoritosLoading={favoritosLoading}
          handleAgregarAlMenu={handleAgregarAlMenu}
          removeFavorito={removeFavorito}
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
      
      {/* Sección pesada - lazy loading con skeleton */}
      <Suspense fallback={<MenuSectionSkeleton />}>
        <MenuSection 
          versionedProductosMenu={versionedProductosMenu}
          categoriasPostgreSQL={categoriasPostgreSQL}
          handleRemoveFromMenu={handleRemoveFromMenu}
          menuData={menuData}
          updateProductosMenu={updateProductosMenu}
          cacheTimeRemaining={cacheTimeRemaining}
          limpiarCacheCorrupto={limpiarCacheCorrupto}
          handleMantenerMenu={handleMantenerMenu}
          manteniendoMenu={manteniendoMenu}
          handlePublicarMenu={handlePublicarMenu}
          publicando={publicando}
        />
      </Suspense>
    </div>
  );
}
