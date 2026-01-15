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
// ✅ CORREGIDO: IDs reales de la base de datos PostgreSQL
export const CATEGORIAS_MENU_ORDEN = [
  '494fbac6-59ed-42af-af24-039298ba16b6', // Entradas
  'de7f4731-3eb3-4d41-b830-d35e5125f4a3', // Principios
  '299b1ba0-0678-4e0e-ba53-90e5d95e5543', // Proteínas
  '8b0751ae-1332-409e-a710-f229be0b9758', // Acompañamientos
  'c77ffc73-b65a-4f03-adb1-810443e61799'  // Bebidas
] as const;

// ✅ CORREGIDO: Configuración con IDs reales de system.categories + PASO FINAL
export const CATEGORIAS_MENU_CONFIG = [
  { id: '494fbac6-59ed-42af-af24-039298ba16b6', nombre: 'Entradas', enum: CategoriaMenu.ENTRADA },
  { id: 'de7f4731-3eb3-4d41-b830-d35e5125f4a3', nombre: 'Principios', enum: CategoriaMenu.PRINCIPIO },
  { id: '299b1ba0-0678-4e0e-ba53-90e5d95e5543', nombre: 'Proteínas', enum: CategoriaMenu.PROTEINA },
  { id: '8b0751ae-1332-409e-a710-f229be0b9758', nombre: 'Acompañamientos', enum: CategoriaMenu.ACOMPANAMIENTO },
  { id: 'c77ffc73-b65a-4f03-adb1-810443e61799', nombre: 'Bebidas', enum: CategoriaMenu.BEBIDA },
  { id: 'configuracion-final', nombre: 'Configuración Final', enum: 'configuracion' as any }
] as const;
