// ventasdia.types.ts
export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoriaId: string;
  disponible: boolean;
}

export interface Adicional {
  productoId: string;
  cantidad: number;
}

export interface Plato {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  disponibles: number;
  estado: 'disponible' | 'agotado';
  categoriaId: string;
  adicionales?: Producto[];
  combinacionOriginal?: any;
}

export interface Venta {
  id: string;
  platoId: string;
  cantidad: number;
  adicionales: Adicional[];
  total: number;
  fecha: Date;
}

export interface Categoria {
  id: string;
  nombre: string;
}
