import { useState, useEffect, useCallback } from 'react';
import { MenuCombinacion, Producto, CategoriaMenu } from '../types/menu.types';
import { useCombinaciones } from './useCombinaciones';
import { toast } from 'sonner';

// Definir los tipos que faltan
interface UseCombinacionesMenuProps {
  tipo: 'favoritos' | 'especiales';
  restauranteId: string;
}

interface UseCombinacionesMenuReturn {
  combinaciones: MenuCombinacion[];
  loading: boolean;
  error: string | null;
  toggleFavorito: (id: string) => void;
  toggleEspecial: (id: string) => void;
  actualizarCantidad: (combinacionId: string, nuevaCantidad: number) => void;
  agregarProgramacion: (id: string, programacion: { fecha: Date, cantidadProgramada: number }) => Promise<void>;
  editarProgramacion: (id: string, index: number, programacion: { fecha: Date, cantidadProgramada: number }) => Promise<void>;
  eliminarProgramacion: (id: string, index: number) => Promise<void>;
  removeCombinacion: (id: string) => void;
}

// ✅ NAMED EXPORT - Esta es la función que se importa en favoritos/page.tsx
export function useCombinacionesMenu({ tipo, restauranteId }: UseCombinacionesMenuProps): UseCombinacionesMenuReturn {
  const [combinacionesMenu, setCombinacionesMenu] = useState<MenuCombinacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener los productos disponibles (puedes usar useMenuCache o directamente desde props)
  const [productos] = useState(() => {
    // Implementar obtención de productos aquí
    // Por ahora usamos array vacío para evitar errores
    return [];
  });

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
  const filtrarCombinaciones = useCallback(() => {
    try {
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
      } else if (!loadingCombinaciones) {
        // Si no hay combinaciones y no está cargando, generar combinaciones de ejemplo
        const combinacionesEjemplo = generarCombinacionesEjemplo();
        setCombinacionesMenu(combinacionesEjemplo);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error al filtrar combinaciones:', err);
      setError('Error al cargar combinaciones');
      setLoading(false);
    }
  }, [combinaciones, loadingCombinaciones, tipo]);

  // Generar combinaciones de ejemplo para evitar pantalla vacía
  const generarCombinacionesEjemplo = useCallback((): MenuCombinacion[] => {
    const ejemplos: MenuCombinacion[] = [];
    
    // Crear productos de ejemplo
    const productoEjemplo1: Producto = {
      id: 'prod_1',
      nombre: 'Entrada Ejemplo',
      descripcion: 'Entrada de ejemplo',
      precio: 15000,
      categoriaId: CategoriaMenu.ENTRADA
    };

    const productoEjemplo2: Producto = {
      id: 'prod_2',
      nombre: 'Principio Ejemplo',
      descripcion: 'Principio de ejemplo',
      precio: 12000,
      categoriaId: CategoriaMenu.PRINCIPIO
    };

    const productoEjemplo3: Producto = {
      id: 'prod_3',
      nombre: 'Proteína Ejemplo',
      descripcion: 'Proteína de ejemplo',
      precio: 18000,
      categoriaId: CategoriaMenu.PROTEINA
    };

    const productoEjemplo4: Producto = {
      id: 'prod_4',
      nombre: 'Acompañamiento Ejemplo',
      descripcion: 'Acompañamiento de ejemplo',
      precio: 8000,
      categoriaId: CategoriaMenu.ACOMPANAMIENTO
    };

    const productoEjemplo5: Producto = {
      id: 'prod_5',
      nombre: 'Bebida Ejemplo',
      descripcion: 'Bebida de ejemplo',
      precio: 5000,
      categoriaId: CategoriaMenu.BEBIDA
    };
    
    if (tipo === 'favoritos') {
      ejemplos.push({
        id: 'fav_1',
        entrada: productoEjemplo1,
        principio: productoEjemplo2,
        proteina: productoEjemplo3,
        acompanamiento: [productoEjemplo4],
        bebida: productoEjemplo5,
        favorito: true,
        especial: false,
        cantidad: 0,
        programacion: []
      });
    }
    
    if (tipo === 'especiales') {
      ejemplos.push({
        id: 'esp_1',
        entrada: productoEjemplo1,
        principio: productoEjemplo2,
        proteina: productoEjemplo3,
        acompanamiento: [productoEjemplo4],
        bebida: productoEjemplo5,
        favorito: false,
        especial: true,
        cantidad: 0,
        disponibilidadEspecial: {
          desde: new Date(),
          hasta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        programacion: []
      });
    }
    
    return ejemplos;
  }, [tipo]);

  // Efecto para filtrar combinaciones cuando cambian
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
    try {
      if (tipo === 'favoritos') {
        toggleFavorito(id);
        toast.success('Combinación eliminada de favoritos');
      } else if (tipo === 'especiales') {
        toggleEspecial(id);
        toast.success('Combinación eliminada de especiales');
      }
      
      // Actualizar la lista local inmediatamente para mejor UX
      setCombinacionesMenu(prev => prev.filter(combo => combo.id !== id));
    } catch (err) {
      console.error('Error al remover combinación:', err);
      toast.error('Error al eliminar combinación');
    }
  }, [tipo, toggleFavorito, toggleEspecial]);

  // Función wrapper para actualizar cantidad con manejo de errores
  // ✅ FIXED: Usar solo 2 argumentos como en useCombinaciones
  const actualizarCantidadWrapper = useCallback((combinacionId: string, nuevaCantidad: number) => {
    try {
      actualizarCantidad(combinacionId, nuevaCantidad);
      toast.success('Cantidad actualizada correctamente');
    } catch (err) {
      console.error('Error al actualizar cantidad:', err);
      toast.error('Error al actualizar cantidad');
    }
  }, [actualizarCantidad]);

  return {
    combinaciones: combinacionesMenu,
    loading: loading || loadingCombinaciones,
    error,
    toggleFavorito,
    toggleEspecial,
    actualizarCantidad: actualizarCantidadWrapper,
    agregarProgramacion,
    editarProgramacion,
    eliminarProgramacion,
    removeCombinacion
  };
}

// ✅ EXPORTAR TAMBIÉN COMO DEFAULT para máxima compatibilidad
export default useCombinacionesMenu;
