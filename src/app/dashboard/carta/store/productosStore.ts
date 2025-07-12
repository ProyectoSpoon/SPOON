// src/app/dashboard/carta/store/productosStore.ts
import { create } from 'zustand';
import type { Producto } from '../types/menu.types';

interface ProductosState {
  productos: Producto[];
  isLoading: boolean;
  error: string | null;
  dialogoNuevoProducto: boolean;
  productoEditar: Producto | null;
  filtros: {
    busqueda: string;
    categoria: string | null;
    estado: 'todos' | 'activo' | 'inactivo';
  };
  
  // Acciones
  setProductos: (productos: Producto[]) => void;
  agregarProducto: (producto: Producto) => void;
  actualizarProducto: (productoId: string, datos: Partial<Producto>) => void;
  eliminarProducto: (productoId: string) => void;
  setDialogoNuevoProducto: (estado: boolean) => void;
  setProductoEditar: (producto: Producto | null) => void;
  setFiltros: (filtros: Partial<ProductosState['filtros']>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProductosStore = create<ProductosState>((set) => ({
  productos: [],
  isLoading: false,
  error: null,
  dialogoNuevoProducto: false,
  productoEditar: null,
  filtros: {
    busqueda: '',
    categoria: null,
    estado: 'todos'
  },

  setProductos: (productos) => set({ productos }),
  agregarProducto: (producto) =>
    set((state) => ({ productos: [...state.productos, producto] })),
  actualizarProducto: (productoId, datos) =>
    set((state) => ({
      productos: state.productos.map((prod) =>
        prod.id === productoId ? { ...prod, ...datos } : prod
      ),
    })),
  eliminarProducto: (productoId) =>
    set((state) => ({
      productos: state.productos.filter((prod) => prod.id !== productoId),
    })),
  setDialogoNuevoProducto: (estado) => set({ dialogoNuevoProducto: estado }),
  setProductoEditar: (producto) => set({ productoEditar: producto }),
  setFiltros: (filtros) =>
    set((state) => ({ filtros: { ...state.filtros, ...filtros } })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
}));
