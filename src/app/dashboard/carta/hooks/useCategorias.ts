// src/app/dashboard/carta/hooks/useCategorias.ts
import { useState, useCallback } from 'react';
import { CategoriasService } from '@/services/categorias.service';
import { Categoria } from '@/utils/menuCache.utils'; // ✅ Usar la interfaz existente

interface UseCategoriasProps {
  restauranteId?: string;   // Opcional
}

export function useCategorias({ restauranteId }: UseCategoriasProps = {}) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerCategorias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Cargando categorías desde PostgreSQL...');
      
      // Usar el servicio que ya funciona
      const categoriasData = await CategoriasService.obtenerCategorias(restauranteId);
      
      console.log('✅ Categorías cargadas:', {
        total: categoriasData.length,
        principales: categoriasData.filter(c => c.tipo === 'principal').length,
        subcategorias: categoriasData.filter(c => c.tipo === 'subcategoria').length
      });
      
      // Las categorías ya vienen en el formato correcto
      setCategorias(categoriasData);
      return categoriasData;
    } catch (err) {
      const errorMsg = 'Error al cargar las categorías desde PostgreSQL';
      setError(errorMsg);
      console.error('❌', errorMsg, err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [restauranteId]);

  // Funciones helper para filtrar por tipo
  const obtenerCategoriasPrincipales = useCallback(() => {
    return categorias.filter(cat => cat.tipo === 'principal');
  }, [categorias]);

  const obtenerSubcategorias = useCallback((parentId: string) => {
    return categorias.filter(cat => cat.parentId === parentId);
  }, [categorias]);

  // Operaciones CRUD simplificadas (por ahora solo lectura)
  const agregarCategoria = useCallback(async (datos: Omit<Categoria, 'id'>) => {
    console.log('🚧 agregarCategoria pendiente de implementar:', datos);
    throw new Error('Operación pendiente de implementar');
  }, []);

  const actualizarCategoria = useCallback(async (id: string, datos: Partial<Categoria>) => {
    console.log('🚧 actualizarCategoria pendiente de implementar:', { id, datos });
    throw new Error('Operación pendiente de implementar');
  }, []);

  const eliminarCategoria = useCallback(async (id: string) => {
    console.log('🚧 eliminarCategoria pendiente de implementar:', id);
    throw new Error('Operación pendiente de implementar');
  }, []);

  return {
    categorias,
    loading,
    error,
    obtenerCategorias,
    obtenerCategoriasPrincipales,
    obtenerSubcategorias,
    agregarCategoria,
    actualizarCategoria,
    eliminarCategoria
  };
}