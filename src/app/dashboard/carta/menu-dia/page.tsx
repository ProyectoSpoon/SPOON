'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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

// ✅ COMPONENTES REFACTORIZADOS
import { HeaderSection } from './components/HeaderSection';
import { SearchSection } from './components/SearchSection';
import { NavigationSection } from './components/NavigationSection';
import { CategoryTabs } from './components/CategoryTabs';
import { FavoritesSection } from './components/FavoritesSection';
import { ProductTable } from './components/ProductTable';
import { ProductModal } from './components/ProductModal';
import { MenuSection } from './components/MenuSection';

// Funciones de validación
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

  // ✅ HOOKS REFACTORIZADOS - PASANDO updateProductosSeleccionados
  const { restaurantId, userId, menuDiaDB, productosDB, loadingDB, errorDB } = useMenuDiaData(
    updateProductosMenu, 
    updateProductosSeleccionados
  );
  
  const {
    favoritos, loading: favoritosLoading, addFavorito, removeFavorito,
    toggleFavorito, isFavorito, refreshFavoritos
  } = useFavoritos(userId, restaurantId);

  // ✅ DATOS PROCESADOS SIMPLIFICADOS
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

  // ✅ SIMPLIFICAR todosLosProductos - usar directamente versionedProductosSeleccionados
  const todosLosProductos = useMemo(() => {
    console.log('📊 Calculando todosLosProductos:', {
      productosDB: productosDB?.length || 0,
      productosSeleccionados: versionedProductosSeleccionados?.length || 0
    });
    
    return versionedProductosSeleccionados;
  }, [versionedProductosSeleccionados]);

  // ✅ HOOKS UI Y ACCIONES REFACTORIZADOS
  const {
    searchTerm, setSearchTerm, searchSuggestions, showSuggestions, setShowSuggestions,
    selectedCategoryTab, setSelectedCategoryTab, showProductModal, setShowProductModal,
    selectedProduct, setSelectedProduct, showFavorites, setShowFavorites,
    cacheTimeRemaining, setCacheTimeRemaining, handleSelectSuggestion, handleViewProductDetails
  } = useMenuDiaUI(todosLosProductos, updateSeleccion);

  const {
    publicando, manteniendoMenu, handlePublicarMenu, handleMantenerMenu, limpiarCacheCorrupto
  } = useMenuDiaActions(versionedProductosMenu, hasCache, clearCache, saveToCache, refreshFavoritos);

  // Effects esenciales
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

  // ✅ DEBUG: Mostrar estado de productos
  useEffect(() => {
    console.log('🔍 Estado de productos:', {
      isLoaded,
      productosDB: productosDB?.length || 0,
      menuDataProductosSeleccionados: menuData?.productosSeleccionados?.length || 0,
      versionedProductosSeleccionados: versionedProductosSeleccionados?.length || 0,
      todosLosProductos: todosLosProductos?.length || 0
    });
  }, [isLoaded, productosDB, menuData?.productosSeleccionados, versionedProductosSeleccionados, todosLosProductos]);

  // Funciones de manejo
  const handleCategoriaSeleccionada = (categoriaId: string) => {
    updateSeleccion(categoriaId, null);
  };

  const handleAgregarAlMenu = (versionedProduct: VersionedProduct) => {
    const producto = convertToProducto(versionedProduct);
    addProductoToMenu(producto);
    toast.success(`${producto?.nombre || 'Producto'} agregado al menú del día`, { duration: 2000 });
  };

  const handleRemoveFromMenu = (productoId: string) => {
    const producto = menuData?.productosMenu?.find((p: Producto) => p.id === productoId);
    if (producto) {
      removeProductoFromMenu(productoId);
      toast.success(`${producto.nombre} eliminado del menú del día`);
    }
  };

  const handleToggleFavorite = async (versionedProduct: VersionedProduct) => {
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
  };

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

  // ✅ RENDER FINAL CON COMPONENTES - MISMA ESTRUCTURA VISUAL
  return (
    <div className="flex flex-col space-y-4 h-screen bg-gray-50">
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
      
      <FavoritesSection 
        showFavorites={showFavorites}
        favoritos={favoritos}
        favoritosLoading={favoritosLoading}
        handleAgregarAlMenu={handleAgregarAlMenu}
        removeFavorito={removeFavorito}
      />
      
      <ProductTable 
        versionedProductosSeleccionados={versionedProductosSeleccionados}
        selectedCategoryTab={selectedCategoryTab}
        handleAgregarAlMenu={handleAgregarAlMenu}
        handleViewProductDetails={handleViewProductDetails}
        handleToggleFavorite={handleToggleFavorite}
        isFavorito={isFavorito}
        favoritosLoading={favoritosLoading}
      />
      
      <ProductModal 
        showProductModal={showProductModal}
        selectedProduct={selectedProduct}
        setShowProductModal={setShowProductModal}
        handleAgregarAlMenu={handleAgregarAlMenu}
        handleToggleFavorite={handleToggleFavorite}
        isFavorito={isFavorito}
        favoritosLoading={favoritosLoading}
      />
      
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
    </div>
  );
}

