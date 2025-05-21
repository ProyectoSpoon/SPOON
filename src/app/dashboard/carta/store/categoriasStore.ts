// src/app/dashboard/carta/store/categoriasStore.ts
import { create } from 'zustand';
import type { Categoria } from '../types/menu.types';

interface CategoriaState {
  categorias: Categoria[];
  isLoading: boolean;
  error: string | null;
  dialogoNuevaCategoria: boolean;
  dialogoHorarios: boolean;
  categoriaEditar: Categoria | null;
  
  // Acciones
  setCategorias: (categorias: Categoria[]) => void;
  agregarCategoria: (categoria: Categoria) => void;
  actualizarCategoria: (categoriaId: string, datos: Partial<Categoria>) => void;
  eliminarCategoria: (categoriaId: string) => void;
  setDialogoNuevaCategoria: (estado: boolean) => void;
  setDialogoHorarios: (estado: boolean) => void;
  setCategoriaEditar: (categoria: Categoria | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCategoriasStore = create<CategoriaState>((set) => ({
  categorias: [],
  isLoading: false,
  error: null,
  dialogoNuevaCategoria: false,
  dialogoHorarios: false,
  categoriaEditar: null,

  setCategorias: (categorias) => set({ categorias }),
  agregarCategoria: (categoria) => {
    console.log('Agregando categoría:', categoria); // Para debug
    set((state) => {
      const nuevasCategorias = [...state.categorias, categoria];
      console.log('Nuevas categorías:', nuevasCategorias); // Para debug
      return { categorias: nuevasCategorias };
    });
  },
  actualizarCategoria: (categoriaId, datos) =>
    set((state) => ({
      categorias: state.categorias.map((cat) =>
        cat.id === categoriaId ? { ...cat, ...datos } : cat
      ),
    })),
  eliminarCategoria: (categoriaId) =>
    set((state) => ({
      categorias: state.categorias.filter((cat) => cat.id !== categoriaId),
    })),
  setDialogoNuevaCategoria: (estado) => set({ dialogoNuevaCategoria: estado }),
  setDialogoHorarios: (estado) => set({ dialogoHorarios: estado }),
  setCategoriaEditar: (categoria) => set({ categoriaEditar: categoria }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
}));