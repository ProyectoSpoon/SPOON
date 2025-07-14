'use client';

import { useState, useEffect, useCallback } from 'react';

export function useMenuDiaUI(todosLosProductos: any[], updateSeleccion: any) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('b4e792ba-b00d-4348-b9e3-f34992315c23');
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [cacheTimeRemaining, setCacheTimeRemaining] = useState<number>(60);

  const filtrarProductosPorTermino = useCallback((term: string, productos: any[]) => {
    if (!term.trim()) return [];
    const termLower = term.toLowerCase();
    return productos.filter((p: any) =>
      p.nombre?.toLowerCase().includes(termLower) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(termLower))
    );
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const debounceTimeout = setTimeout(() => {
      const sugerencias = filtrarProductosPorTermino(searchTerm, todosLosProductos);
      setSearchSuggestions(sugerencias);
      setShowSuggestions(sugerencias.length > 0);
    }, 150);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, todosLosProductos, filtrarProductosPorTermino]);

  const handleSelectSuggestion = (producto: any) => {
    setSearchTerm(producto.nombre);
    setShowSuggestions(false);
    setSelectedCategoryTab(producto.categoriaId);
    updateSeleccion(producto.categoriaId, null);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleViewProductDetails = (producto: any) => {
    setSelectedProduct(producto);
    setShowProductModal(true);
  };

  return {
    searchTerm, setSearchTerm, searchSuggestions, setSearchSuggestions,
    showSuggestions, setShowSuggestions, selectedCategoryTab, setSelectedCategoryTab,
    showProductModal, setShowProductModal, selectedProduct, setSelectedProduct,
    showFavorites, setShowFavorites, cacheTimeRemaining, setCacheTimeRemaining,
    handleSelectSuggestion, handleViewProductDetails, filtrarProductosPorTermino
  };
}
