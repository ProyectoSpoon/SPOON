'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { ProductoFavorito, FavoritosResponse, ToggleFavoritoResponse } from '../types/menu-dia.types';

/**
 * Hook para gestionar favoritos del restaurante
 * Funciona con la nueva tabla restaurant.favorite_products
 */
export function useFavoritos(userId: string, restaurantId?: string) {
  const [favoritos, setFavoritos] = useState<ProductoFavorito[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carga los favoritos del restaurante desde la API
   */
  const loadFavoritos = useCallback(async () => {
    if (!userId) {
      console.warn('⚠️ useFavoritos: userId no proporcionado');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando favoritos para:', { userId, restaurantId });
      
      // Construir URL con parámetros
      const params = new URLSearchParams({
        userId: userId
      });
      
      if (restaurantId) {
        params.append('restaurantId', restaurantId);
      }
      
      const url = `/api/menu-dia/favoritos?${params.toString()}`;
      console.log('📡 URL de favoritos:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(`Error ${response.status}: ${errorData.error || response.statusText}`);
      }
      
      const data: FavoritosResponse = await response.json();
      console.log('✅ Favoritos cargados:', {
        total: data.total,
        productos: data.favoritos.map(f => f.product_name)
      });
      
      setFavoritos(data.favoritos || []);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar favoritos';
      console.error('❌ Error al cargar favoritos:', err);
      setError(errorMessage);
      
      // Solo mostrar toast si es un error real (no 404 inicial)
      if (!errorMessage.includes('404')) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, restaurantId]);

  /**
   * Agrega un producto a favoritos
   */
  const addFavorito = useCallback(async (productId: string): Promise<boolean> => {
    if (!userId || !productId) {
      console.warn('⚠️ addFavorito: userId o productId no proporcionados');
      return false;
    }

    try {
      console.log('➕ Agregando favorito:', { userId, productId, restaurantId });
      
      const response = await fetch('/api/menu-dia/favoritos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          productId,
          restaurantId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al agregar favorito');
      }

      const result: ToggleFavoritoResponse = await response.json();
      console.log('✅ Favorito agregado:', result);
      
      // Recargar favoritos para mantener sincronización
      await loadFavoritos();
      
      return true;
    } catch (err) {
      console.error('❌ Error al agregar favorito:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar favorito';
      toast.error(errorMessage);
      return false;
    }
  }, [userId, restaurantId, loadFavoritos]);

  /**
   * Elimina un producto de favoritos
   */
  const removeFavorito = useCallback(async (productId: string): Promise<boolean> => {
    if (!userId || !productId) {
      console.warn('⚠️ removeFavorito: userId o productId no proporcionados');
      return false;
    }

    try {
      console.log('➖ Eliminando favorito:', { userId, productId, restaurantId });
      
      // Construir URL con parámetros
      const params = new URLSearchParams({
        productId: productId
      });
      
      if (restaurantId) {
        params.append('restaurantId', restaurantId);
      }
      
      const response = await fetch(`/api/menu-dia/favoritos?${params.toString()}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al eliminar favorito');
      }

      const result: ToggleFavoritoResponse = await response.json();
      console.log('✅ Favorito eliminado:', result);
      
      // Recargar favoritos para mantener sincronización
      await loadFavoritos();
      
      return true;
    } catch (err) {
      console.error('❌ Error al eliminar favorito:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar favorito';
      toast.error(errorMessage);
      return false;
    }
  }, [userId, restaurantId, loadFavoritos]);

  /**
   * Toggle (agregar/eliminar) un producto de favoritos
   */
  const toggleFavorito = useCallback(async (productId: string): Promise<boolean> => {
    const esFavorito = isFavorito(productId);
    
    if (esFavorito) {
      return await removeFavorito(productId);
    } else {
      return await addFavorito(productId);
    }
  }, [addFavorito, removeFavorito]);

  /**
   * Verifica si un producto es favorito
   */
  const isFavorito = useCallback((productId: string): boolean => {
    return favoritos.some(f => f.product_id === productId);
  }, [favoritos]);

  /**
   * Refresca la lista de favoritos
   */
  const refreshFavoritos = useCallback(() => {
    return loadFavoritos();
  }, [loadFavoritos]);

  /**
   * Obtiene los favoritos por categoría
   */
  const getFavoritosPorCategoria = useCallback((categoriaId: string): ProductoFavorito[] => {
    return favoritos.filter(f => f.category_id === categoriaId);
  }, [favoritos]);

  /**
   * Efecto para cargar favoritos al montar el componente
   */
  useEffect(() => {
    if (userId) {
      loadFavoritos();
    }
  }, [userId, loadFavoritos]);

  // Estado de favoritos actualizado
  useEffect(() => {
    console.log('🔄 Estado de favoritos actualizado:', {
      total: favoritos.length,
      productos: favoritos.map(f => f.product_name || f.product_id),
      loading,
      error: error || 'ninguno'
    });
  }, [favoritos, loading, error]);

  return {
    favoritos,
    loading,
    error,
    addFavorito,
    removeFavorito,
    toggleFavorito,
    isFavorito,
    refreshFavoritos,
    getFavoritosPorCategoria,
    // Funciones de utilidad
    totalFavoritos: favoritos.length,
    hasFavoritos: favoritos.length > 0,
    // Para compatibilidad con código existente
    reloadFavoritos: refreshFavoritos
  };
}