import { create } from 'zustand';

// Primero definimos o importamos los tipos necesarios
export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoriaId: string;
}

export interface Combinacion {
  id: string;
  entrada: Producto;
  principio: Producto;
  proteina: Producto;
  acompanamiento: Producto[];
  bebida: Producto;
  estado?: 'disponible' | 'agotado';
  cantidad?: number;
}

export interface Categoria {
  id: string;
  nombre: string;
  productos: Producto[];
}

// Luego definimos la interfaz del estado
interface MenuState {
  categorias: Categoria[];
  productos: Producto[];
  combinaciones: Combinacion[]; // Agregamos esta línea
  categoriaSeleccionada: string | null;
  productoSeleccionado: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  setCategorias: (categorias: Categoria[]) => void;
  setProductos: (productos: Producto[]) => void;
  setCombinaciones: (combinaciones: Combinacion[]) => void; // Y esta línea
  seleccionarCategoria: (categoriaId: string | null) => void;
  seleccionarProducto: (productoId: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}
