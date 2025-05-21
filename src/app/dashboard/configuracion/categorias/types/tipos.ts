// Interfaces para la configuración de categorías

export interface Subcategoria {
  id: string;
  nombre: string;
  descripcion?: string;
  icono?: string;
  color?: string;
  orden: number;
  activo: boolean;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  icono: string;
  color: string;
  orden: number;
  activo: boolean;
  subcategorias: Subcategoria[];
}

export interface TipoRestaurante {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color?: string;
  categorias: Categoria[];
  activo: boolean;
}

export interface PlantillaTipoRestaurante {
  id: string;
  nombre: string;
  descripcion: string;
  categorias: Categoria[];
}

export interface ConfiguracionRestaurante {
  tipoRestauranteId: string;
  categoriasPersonalizadas: Categoria[];
  categoriasGlobalesActivas: string[]; // IDs de categorías globales activas
}
