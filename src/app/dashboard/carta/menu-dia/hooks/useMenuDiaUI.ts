'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

export function useMenuDiaUI(todosLosProductos: any[], updateSeleccion: any) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // ✅ CORREGIDO: ID real de Entradas de la BD PostgreSQL
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('494fbac6-59ed-42af-af24-039298ba16b6');
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [cacheTimeRemaining, setCacheTimeRemaining] = useState<number>(60);

  // ✅ OPTIMIZACIÓN 1: Memoizar función de filtrado para evitar recreación
  const filtrarProductosPorTermino = useCallback((term: string, productos: any[]) => {
    if (!term.trim()) return [];
    const termLower = term.toLowerCase();
    return productos.filter((p: any) =>
      p.nombre?.toLowerCase().includes(termLower) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(termLower))
    );
  }, []);

  // ✅ OPTIMIZACIÓN 2: Memoizar todosLosProductos para evitar filtrados innecesarios
  const productosStables = useMemo(() => todosLosProductos, [todosLosProductos]);

  // ✅ OPTIMIZACIÓN 3: Debounce search effect optimizado
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const debounceTimeout = setTimeout(() => {
      const sugerencias = filtrarProductosPorTermino(searchTerm, productosStables);
      setSearchSuggestions(sugerencias);
      setShowSuggestions(sugerencias.length > 0);
    }, 150);
    
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, productosStables, filtrarProductosPorTermino]);

  // ✅ OPTIMIZACIÓN 4: Callbacks memoizados para handlers
  const handleSelectSuggestion = useCallback((producto: any) => {
    setSearchTerm(producto.nombre);
    setShowSuggestions(false);
    setSelectedCategoryTab(producto.categoriaId);
    updateSeleccion(producto.categoriaId, null);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }, [updateSeleccion]);

  const handleViewProductDetails = useCallback((producto: any) => {
    setSelectedProduct(producto);
    setShowProductModal(true);
  }, []);

  // ✅ NUEVA FUNCIONALIDAD: Debug para verificar filtrado
  useEffect(() => {
    console.log('🔍 Debug - selectedCategoryTab:', selectedCategoryTab);
    console.log('🔍 Debug - productos totales:', productosStables.length);
    const productosFiltrados = productosStables.filter(p => p.categoriaId === selectedCategoryTab);
    console.log('🔍 Debug - productos filtrados:', productosFiltrados.length);
    if (productosFiltrados.length > 0) {
      console.log('🔍 Debug - primer producto filtrado:', productosFiltrados[0].nombre);
    }
  }, [selectedCategoryTab, productosStables]);

  // ✅ OPTIMIZACIÓN 5: Memoizar objeto de retorno para evitar re-renders
  return useMemo(() => ({
    searchTerm, setSearchTerm, searchSuggestions, setSearchSuggestions,
    showSuggestions, setShowSuggestions, selectedCategoryTab, setSelectedCategoryTab,
    showProductModal, setShowProductModal, selectedProduct, setSelectedProduct,
    showFavorites, setShowFavorites, cacheTimeRemaining, setCacheTimeRemaining,
    handleSelectSuggestion, handleViewProductDetails, filtrarProductosPorTermino
  }), [
    searchTerm, searchSuggestions, showSuggestions, selectedCategoryTab,
    showProductModal, selectedProduct, showFavorites, cacheTimeRemaining,
    handleSelectSuggestion, handleViewProductDetails, filtrarProductosPorTermino
  ]);
}
