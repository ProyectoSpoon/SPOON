import { useState } from 'react';
import { Categoria, Subcategoria } from '../types/categorias.tipos';

interface DatosTienda {
  nombre: string;
  direccion: string;
  ciudad: string;
  fechaInicio: string;
  puntosVenta: string;
  empleados: string;
  promedioVentas: string;
}

interface SeleccionProducto {
  categoriaId: string;
  categoriaNombre: string;
  subcategoriaId: string;
  subcategoriaNombre: string;
}

interface ResultadoConfiguracion {
  datosTienda: DatosTienda;
  categoriaActiva: string | null;  // Añadido explícitamente
  subcategoriasSeleccionadas: SeleccionProducto[];
  actualizarDatosTienda: (campo: keyof DatosTienda, valor: string) => void;
  toggleCategoria: (id: string) => void;
  toggleSubcategoria: (categoriaId: string, subcategoriaId: string) => void;
  eliminarCategoria: (categoriaId: string) => void;
  formularioValido: boolean;
  obtenerSubcategoriasPorCategoria: (categoriaId: string) => Subcategoria[];
  esCategoriaSeleccionada: (categoriaId: string) => boolean;
  esSubcategoriaSeleccionada: (categoriaId: string, subcategoriaId: string) => boolean;
}

export const usarConfiguracionTienda = (categorias: Categoria[]): ResultadoConfiguracion => {
  const [datosTienda, setDatosTienda] = useState<DatosTienda>({
    nombre: '',
    direccion: '',
    ciudad: '',
    fechaInicio: '',
    puntosVenta: '',
    empleados: '',
    promedioVentas: ''
  });

  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [subcategoriasSeleccionadas, setSubcategoriasSeleccionadas] = useState<SeleccionProducto[]>([]);

  const actualizarDatosTienda = (campo: keyof DatosTienda, valor: string) => {
    setDatosTienda(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const toggleCategoria = (id: string) => {
    setCategoriaActiva(currentActive => currentActive === id ? null : id);
  };

  const toggleSubcategoria = (categoriaId: string, subcategoriaId: string) => {
    const categoria = categorias.find(c => c.id === categoriaId);
    const subcategoria = categoria?.subcategorias.find(s => s.id === subcategoriaId);
    
    if (!categoria || !subcategoria) return;

    setSubcategoriasSeleccionadas(prev => {
      const existe = prev.some(
        s => s.categoriaId === categoriaId && s.subcategoriaId === subcategoriaId
      );

      if (existe) {
        return prev.filter(
          s => !(s.categoriaId === categoriaId && s.subcategoriaId === subcategoriaId)
        );
      }

      return [...prev, {
        categoriaId,
        categoriaNombre: categoria.nombre,
        subcategoriaId,
        subcategoriaNombre: subcategoria.nombre
      }];
    });
  };

  const eliminarCategoria = (categoriaId: string) => {
    setSubcategoriasSeleccionadas(prev => 
      prev.filter(item => item.categoriaId !== categoriaId)
    );
    if (categoriaActiva === categoriaId) {
      setCategoriaActiva(null);
    }
  };

  const obtenerSubcategoriasPorCategoria = (categoriaId: string): Subcategoria[] => {
    if (categoriaId !== categoriaActiva) return [];
    return categorias.find(c => c.id === categoriaId)?.subcategorias || [];
  };

  const esCategoriaSeleccionada = (categoriaId: string): boolean => {
    return subcategoriasSeleccionadas.some(s => s.categoriaId === categoriaId);
  };

  const esSubcategoriaSeleccionada = (categoriaId: string, subcategoriaId: string): boolean => {
    return subcategoriasSeleccionadas.some(
      s => s.categoriaId === categoriaId && s.subcategoriaId === subcategoriaId
    );
  };

  const formularioValido = Boolean(
    datosTienda.nombre &&
    datosTienda.direccion &&
    datosTienda.ciudad &&
    datosTienda.fechaInicio &&
    datosTienda.puntosVenta &&
    subcategoriasSeleccionadas.length > 0
  );

  return {
    datosTienda,
    categoriaActiva,
    subcategoriasSeleccionadas,
    actualizarDatosTienda,
    toggleCategoria,
    toggleSubcategoria,
    eliminarCategoria,
    formularioValido,
    obtenerSubcategoriasPorCategoria,
    esCategoriaSeleccionada,
    esSubcategoriaSeleccionada
  };
};