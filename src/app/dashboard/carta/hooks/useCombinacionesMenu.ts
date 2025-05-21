import { useState, useEffect, useCallback } from 'react';
import { MenuCombinacion } from '../types/menu.types';
import { useCombinaciones } from './useCombinaciones';
import { cacheUtils } from '@/utils/cache.utils';
import { toast } from 'sonner';

interface UseCombinacionesMenuProps {
  tipo: 'favoritos' | 'especiales';
  restauranteId: string;
}

export function useCombinacionesMenu({ tipo, restauranteId }: UseCombinacionesMenuProps) {
  const [combinacionesMenu, setCombinacionesMenu] = useState<MenuCombinacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener los productos del caché para generar combinaciones
  // Usamos useState para evitar que se regenere en cada render
  const [productos] = useState(() => cacheUtils.get() || []);

  // Usar el hook de combinaciones para obtener todas las combinaciones
  const { 
    combinaciones, 
    loading: loadingCombinaciones, 
    error: errorCombinaciones,
    toggleFavorito,
    toggleEspecial,
    actualizarCantidad,
    agregarProgramacion,
    editarProgramacion,
    eliminarProgramacion
  } = useCombinaciones({ 
    productos, 
    restauranteId 
  });

  // Filtrar las combinaciones según el tipo (favoritos o especiales)
  // Usamos useCallback para evitar regenerar esta función en cada render
  const filtrarCombinaciones = useCallback(() => {
    if (combinaciones.length > 0 && !loadingCombinaciones) {
      const combinacionesFiltradas = combinaciones.filter(combinacion => {
        if (tipo === 'favoritos') {
          return combinacion.favorito;
        } else if (tipo === 'especiales') {
          return combinacion.especial;
        }
        return false;
      });
      
      setCombinacionesMenu(combinacionesFiltradas);
      setLoading(false);
    }
  }, [combinaciones, loadingCombinaciones, tipo]);

  // Usamos useEffect con dependencias específicas para evitar loops infinitos
  useEffect(() => {
    filtrarCombinaciones();
  }, [filtrarCombinaciones]);

  // Manejar errores
  useEffect(() => {
    if (errorCombinaciones) {
      setError(errorCombinaciones);
      setLoading(false);
    }
  }, [errorCombinaciones]);

  // Función para quitar una combinación de la lista actual
  const removeCombinacion = useCallback((id: string) => {
    if (tipo === 'favoritos') {
      toggleFavorito(id);
      toast.success('Combinación eliminada de favoritos');
    } else if (tipo === 'especiales') {
      toggleEspecial(id);
      toast.success('Combinación eliminada de especiales');
    }
    
    // Actualizar la lista local inmediatamente para mejor UX
    setCombinacionesMenu(prev => prev.filter(combo => combo.id !== id));
  }, [tipo, toggleFavorito, toggleEspecial]);

  return {
    combinaciones: combinacionesMenu,
    loading: loading || loadingCombinaciones,
    error,
    toggleFavorito,
    toggleEspecial,
    actualizarCantidad,
    agregarProgramacion,
    editarProgramacion,
    eliminarProgramacion,
    removeCombinacion
  };
}
