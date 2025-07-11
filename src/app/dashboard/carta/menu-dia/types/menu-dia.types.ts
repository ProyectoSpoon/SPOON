// src/app/dashboard/carta/menu-dia/types/menu-dia.types.ts

/**
 * Tipos específicos del módulo Menu del Día
 * Todo autocontenido dentro del módulo
 */

// ========= PRODUCTOS =========
export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoriaId: string;
  imagen?: string;
  currentVersion: number;
  stock: {
    currentQuantity: number;
    minQuantity: number;
    maxQuantity: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
    lastUpdated: Date;
  };
  status: 'active' | 'draft' | 'archived' | 'discontinued';
  priceHistory: any[];
  versions: any[];
  metadata: {
    createdAt: Date;
    createdBy: string;
    lastModified: Date;
    lastModifiedBy: string;
  };
  esFavorito?: boolean;
  esEspecial?: boolean;
}

// ========= FAVORITOS =========
export interface ProductoFavorito {
  id: string;
  user_id: string;
  product_id: string;
  favorite_type: 'product';
  is_active: boolean;
  favorite_count: number;
  last_ordered?: Date;
  created_at: Date;
  updated_at: Date;
  // Datos del producto (join)
  product_name?: string;
  product_description?: string;
  product_image?: string;
  category_id?: string;
}

export interface CreateFavoritoRequest {
  user_id: string;
  product_id: string;
}

export interface FavoritosResponse {
  favoritos: ProductoFavorito[];
  total: number;
}

export interface ToggleFavoritoResponse {
  isNowFavorite: boolean;
  favorito?: ProductoFavorito;
  message: string;
}

// ========= CATEGORÍAS =========
export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  parentId?: string;
  tipo: 'principal' | 'subcategoria';
  icono?: string;
  color?: string;
  orden: number;
}

// ========= MENÚ DEL DÍA =========
export interface MenuDia {
  id: string;
  fecha: string;
  restauranteId: string;
  productos: Producto[];
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductoMenu {
  producto: Producto;
  cantidad: number;
  precioVenta: number;
  disponible: boolean;
}

// ========= ESTADOS DE LOADING =========
export interface LoadingState {
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

export interface FavoritosState extends LoadingState {
  favoritos: ProductoFavorito[];
}

export interface ProductosState extends LoadingState {
  productos: Producto[];
  categorias: Categoria[];
}

export interface MenuDiaState extends LoadingState {
  menuDia: MenuDia | null;
  productosMenu: Producto[];
}

// ========= API REQUESTS =========
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FavoritosApiRequest {
  userId: string;
  productId: string;
  action: 'add' | 'remove' | 'toggle';
}

// ========= FILTROS Y BÚSQUEDA =========
export interface FiltrosProductos {
  categoriaId?: string;
  busqueda?: string;
  soloActivos?: boolean;
  soloDisponibles?: boolean;
}

export interface ProductoConCategoria extends Producto {
  categoriaNombre: string;
  categoriaColor?: string;
  categoriaIcono?: string;
}

// ========= ESTADÍSTICAS =========
export interface EstadisticasFavoritos {
  total: number;
  por_categoria: Array<{ 
    category_name: string; 
    count: number; 
  }>;
  mas_favoriteados: Array<{ 
    product_name: string; 
    favorite_count: number; 
  }>;
}

// ========= CONFIGURACIÓN =========
export interface ConfiguracionModulo {
  userId: string;
  restauranteId: string;
  cacheEnabled: boolean;
  cacheTimeoutMinutes: number;
}

// ========= ENUMS =========
export enum CategoriaMenu {
  ENTRADA = 'entrada',
  PRINCIPIO = 'principio', 
  PROTEINA = 'proteina',
  ACOMPANAMIENTO = 'acompanamiento',
  BEBIDA = 'bebida'
}

export enum EstadoProducto {
  ACTIVO = 'active',
  BORRADOR = 'draft',
  ARCHIVADO = 'archived',
  DESCONTINUADO = 'discontinued'
}

export enum EstadoStock {
  DISPONIBLE = 'in_stock',
  STOCK_BAJO = 'low_stock',
  AGOTADO = 'out_of_stock'
}

// ========= CONSTANTES =========
export const CATEGORIAS_MENU_ORDEN = [
  'b4e792ba-b00d-4348-b9e3-f34992315c23', // Entradas
  '2d4c3ea8-843e-4312-821e-54d1c4e79dce', // Principios
  '342f0c43-7f98-48fb-b0ba-e4c5d3ee72b3', // Proteínas
  'a272bc20-464c-443f-9283-4b5e7bfb71cf', // Acompañamientos
  '6feba136-57dc-4448-8357-6f5533177cfd'  // Bebidas
] as const;

export const CATEGORIAS_MENU_CONFIG = [
  { id: 'b4e792ba-b00d-4348-b9e3-f34992315c23', nombre: 'Entradas', enum: CategoriaMenu.ENTRADA },
  { id: '2d4c3ea8-843e-4312-821e-54d1c4e79dce', nombre: 'Principios', enum: CategoriaMenu.PRINCIPIO },
  { id: '342f0c43-7f98-48fb-b0ba-e4c5d3ee72b3', nombre: 'Proteínas', enum: CategoriaMenu.PROTEINA },
  { id: 'a272bc20-464c-443f-9283-4b5e7bfb71cf', nombre: 'Acompañamientos', enum: CategoriaMenu.ACOMPANAMIENTO },
  { id: '6feba136-57dc-4448-8357-6f5533177cfd', nombre: 'Bebidas', enum: CategoriaMenu.BEBIDA }
] as const;