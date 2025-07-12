import { useState, useCallback, useMemo } from 'react';
import debounce from 'lodash/debounce';
import type { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';

interface UseProductFiltersProps {
  products: VersionedProduct[];
  initialFilters?: {
    search?: string;
    category?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
  };
}

export function useProductFilters({ products, initialFilters = {} }: UseProductFiltersProps) {
  const [filters, setFilters] = useState(initialFilters);
  const [debouncedSearch, setDebouncedSearch] = useState(initialFilters.search || '');

  const updateSearch = useMemo(
    () => debounce((value: string) => setDebouncedSearch(value), 300),
    []
  );

  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (key === 'search') {
      updateSearch(value);
    }
  }, [updateSearch]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Búsqueda por texto
      if (debouncedSearch && !product.nombre.toLowerCase().includes(debouncedSearch.toLowerCase())) {
        return false;
      }
      
      // Filtro por categoría
      if (filters.category && product.categoriaId !== filters.category) {
        return false;
      }

      // Filtro por estado
      if (filters.status && product.status !== filters.status) {
        return false;
      }

      // Filtro por precio
      if (filters.minPrice && product.currentPrice < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && product.currentPrice > filters.maxPrice) {
        return false;
      }

      return true;
    });
  }, [products, debouncedSearch, filters]);

  return {
    filters,
    filteredProducts,
    handleFilterChange
  };
}
