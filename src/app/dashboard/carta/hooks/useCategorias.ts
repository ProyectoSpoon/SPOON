// src/app/dashboard/carta/hooks/useCategorias.ts
import { useState, useCallback } from 'react';
import { categoriasAPI } from '@/services/api.service';

// Definición de la interfaz Categoria
interface Categoria {
  id: string;
  nombre: string;
  tipo: string;
  orden: number;
  descripcion?: string;
  horarios?: {
    inicio: string;
    fin: string;
    dias: string[];
  };
  createdAt?: Date;
  updatedAt?: Date;
  activo: boolean;
  restauranteId: string;
}

interface UseCategoriasProps {
  restauranteId: string;
}

export function useCategorias({ restauranteId }: UseCategoriasProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerCategorias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('RestauranteId usado:', restauranteId);
      console.log('Cargando categorías desde PostgreSQL API...');
      
      // Cargar categorías principales
      const categoriasResponse = await categoriasAPI.getCategorias({
        tipo: 'categoria',
        restauranteId
      });
      console.log('Categorías cargadas desde API:', categoriasResponse.data);
      
      // Cargar subcategorías
      const subcategoriasResponse = await categoriasAPI.getCategorias({
        tipo: 'subcategoria',
        restauranteId
      });
      console.log('Subcategorías cargadas desde API:', subcategoriasResponse.data);
      
      // Combinar categorías y subcategorías
      const categoriasData = [
        ...categoriasResponse.data,
        ...subcategoriasResponse.data
      ];
      
      console.log('Total de categorías y subcategorías cargadas:', categoriasData.length);
      
      // Mantener el ordenamiento
      const categoriasOrdenadas = categoriasData.sort((a, b) => {
        if (a.orden !== undefined && b.orden !== undefined) {
          return a.orden - b.orden;
        }
        return a.nombre.localeCompare(b.nombre);
      });
      
      console.log('Categorías ordenadas:', categoriasOrdenadas);
      setCategorias(categoriasOrdenadas);
      return categoriasOrdenadas;
    } catch (err) {
      const errorMsg = 'Error al cargar las categorías';
      setError(errorMsg);
      console.error(err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [restauranteId]);

  const agregarCategoria = useCallback(async (datos: Omit<Categoria, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      // Simulación de agregar categoría con archivos JSON
      console.log('Simulando agregar categoría en archivos JSON:', datos);
      
      // Generar un ID único para la nueva categoría
      const nuevoId = `CAT_${Date.now()}`;
      
      // Crear la nueva categoría
      const nuevaCategoria: Categoria = {
        id: nuevoId,
        ...datos,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        restauranteId
      };
      
      // En una implementación real, aquí se guardaría en el archivo JSON
      console.log('Nueva categoría creada (simulación):', nuevaCategoria);
      
      // Actualizar el estado local
      setCategorias(prev => {
        const nuevasCategorias = [...prev, nuevaCategoria];
        return nuevasCategorias.sort((a, b) => {
          if (a.orden !== undefined && b.orden !== undefined) {
            return a.orden - b.orden;
          }
          return a.nombre.localeCompare(b.nombre);
        });
      });
  
      return nuevaCategoria;
    } catch (err) {
      const errorMsg = 'Error al crear la categoría';
      setError(errorMsg);
      console.error(err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [categorias.length, restauranteId]);

  const actualizarCategoria = useCallback(async (id: string, datos: Partial<Categoria>) => {
    setLoading(true);
    setError(null);
    try {
      // Simulación de actualizar categoría con archivos JSON
      console.log('Simulando actualizar categoría en archivos JSON:', { id, datos });
      
      // En una implementación real, aquí se actualizaría el archivo JSON
      console.log('Categoría actualizada (simulación):', { id, ...datos });
  
      // Actualizar estado local
      setCategorias(prev => {
        const nuevasCategorias = prev.map(cat => 
          cat.id === id 
            ? { 
                ...cat, 
                ...datos, 
                updatedAt: new Date() 
              } 
            : cat
        );
        return nuevasCategorias.sort((a, b) => {
          if (a.orden !== undefined && b.orden !== undefined) {
            return a.orden - b.orden;
          }
          return a.nombre.localeCompare(b.nombre);
        });
      });
  
      return { id, ...datos, updatedAt: new Date() };
    } catch (err) {
      const errorMsg = 'Error al actualizar la categoría';
      setError(errorMsg);
      console.error(err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const eliminarCategoria = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // Simulación de eliminar categoría con archivos JSON
      console.log('Simulando eliminar categoría en archivos JSON:', id);
      
      // En una implementación real, aquí se actualizaría el archivo JSON
      console.log('Categoría eliminada (simulación):', id);
  
      // Actualizar estado local
      setCategorias(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      const errorMsg = 'Error al eliminar la categoría';
      setError(errorMsg);
      console.error(err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    categorias,
    loading,
    error,
    obtenerCategorias,
    agregarCategoria,
    actualizarCategoria,
    eliminarCategoria
  };
}
