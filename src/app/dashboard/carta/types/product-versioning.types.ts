// src/app/dashboard/carta/types/product-versioning.types.ts

/**
 * Tipos para el sistema de versionado de productos
 * Definiciones completas para manejo de versiones, precios e inventario
 */

// ========== INTERFACES PRINCIPALES ==========

export interface PriceHistory {
  id: string;  // ID para referencia
  value: number;
  effectiveDate: Date;
  expirationDate?: Date;
  reason?: string;
  createdBy: string;
  restaurantId: string;  // Para filtraje por restaurante
  previousPrice?: number;  // Para tracking de cambios
}

export interface ProductVersion {
  id: string;
  productId: string;
  version: number;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
    changedBy: string;
    timestamp: Date;
    changeReason?: string;  // Para tracking de cambios
  }[];
  metadata: {
    createdAt: Date;
    createdBy: string;
    publishedAt?: Date;
    status: 'draft' | 'published' | 'archived';
    approvedBy?: string;  // Para flujo de aprobación
    approvedAt?: Date;
  };
  restaurantId: string;  // Para filtraje por restaurante
}

export interface StockUpdate {
  id: string;  // ID para referencia
  quantity: number;
  type: 'increment' | 'decrement' | 'set';
  reason?: string;
  timestamp: Date;
  updatedBy: string;
  location?: string;
  batchNumber?: string;  // Para tracking de lotes
  productId: string;  // Referencia al producto
  restaurantId: string;  // Para filtraje por restaurante
}

export interface ProductStock {
  currentQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  location?: string;
  lastUpdated: Date;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  alerts?: {  // Sistema de alertas
    lowStock: boolean;
    overStock: boolean;
    thresholds: {
      low: number;
      high: number;
    };
  };
  reservedQuantity?: number;  // Para sistema de reservas
}

export interface VersionedProduct {
  id: string;
  nombre: string;
  descripcion: string;
  currentPrice: number;
  categoriaId: string;
  currentVersion: number;
  priceHistory: PriceHistory[];
  versions: ProductVersion[];
  stock: ProductStock;
  status: 'active' | 'draft' | 'archived' | 'discontinued';
  metadata: {
    createdAt: Date;
    createdBy: string;
    lastModified: Date;
    lastModifiedBy: string;
    publishHistory?: {  // Historial de publicaciones
      publishedAt: Date;
      publishedBy: string;
      version: number;
    }[];
  };
  categoryPath?: string[];  // Para categorías jerárquicas
  tags?: string[];  // Para mejor búsqueda
  seasonality?: {  // Para productos estacionales
    startDate?: Date;
    endDate?: Date;
    isAvailable: boolean;
  };
  imagen?: string;
  esFavorito?: boolean;
  esEspecial?: boolean;
}

// ========== TIPOS AUXILIARES ==========

/**
 * Estados posibles de un producto
 */
export type ProductStatus = 'active' | 'draft' | 'archived' | 'discontinued';

/**
 * Estados de stock
 */
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

/**
 * Tipos de actualización de stock
 */
export type StockUpdateType = 'increment' | 'decrement' | 'set';

/**
 * Estados de versión
 */
export type VersionStatus = 'draft' | 'published' | 'archived';

// ========== INTERFACES PARA OPERACIONES ==========

/**
 * Request para crear una nueva versión de producto
 */
export interface CreateProductVersionRequest {
  productId: string;
  changes: ProductVersion['changes'];
  reason?: string;
  createdBy: string;
  restaurantId: string;
}

/**
 * Request para actualizar precio
 */
export interface UpdatePriceRequest {
  productId: string;
  newPrice: number;
  effectiveDate: Date;
  expirationDate?: Date;
  reason?: string;
  createdBy: string;
  restaurantId: string;
}

/**
 * Request para actualizar stock
 */
export interface UpdateStockRequest {
  productId: string;
  quantity: number;
  type: StockUpdateType;
  reason?: string;
  updatedBy: string;
  location?: string;
  batchNumber?: string;
  restaurantId: string;
}

/**
 * Response para operaciones de versionado
 */
export interface VersionOperationResponse {
  success: boolean;
  data?: VersionedProduct;
  version?: number;
  error?: string;
  warnings?: string[];
}

// ========== INTERFACES PARA CONSULTAS ==========

/**
 * Filtros para consultar productos versionados
 */
export interface ProductVersionFilter {
  restaurantId?: string;
  status?: ProductStatus[];
  stockStatus?: StockStatus[];
  categoryId?: string;
  tags?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    from: Date;
    to: Date;
  };
  seasonality?: {
    includeOutOfSeason: boolean;
    currentDate?: Date;
  };
}

/**
 * Opciones de ordenamiento
 */
export interface ProductSortOptions {
  field: 'nombre' | 'currentPrice' | 'currentVersion' | 'lastModified' | 'stock.currentQuantity';
  direction: 'asc' | 'desc';
}

/**
 * Resultado paginado de productos
 */
export interface PaginatedProductsResponse {
  products: VersionedProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: ProductVersionFilter;
  sort: ProductSortOptions;
}

// ========== INTERFACES PARA REPORTES ==========

/**
 * Estadísticas de producto
 */
export interface ProductStatistics {
  productId: string;
  nombre: string;
  stats: {
    totalVersions: number;
    priceChanges: number;
    stockUpdates: number;
    averagePrice: number;
    currentStock: number;
    daysInStock: number;
    lastSaleDate?: Date;
  };
  alerts: {
    lowStock: boolean;
    priceFluctuation: boolean;
    outOfSeason: boolean;
  };
}

/**
 * Reporte de inventario
 */
export interface InventoryReport {
  restaurantId: string;
  generatedAt: Date;
  summary: {
    totalProducts: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
  };
  products: ProductStatistics[];
  recommendations: {
    reorder: string[];
    overstock: string[];
    priceAdjustment: string[];
  };
}

// ========== INTERFACES PARA AUDIT ==========

/**
 * Log de auditoría para cambios de producto
 */
export interface ProductAuditLog {
  id: string;
  productId: string;
  action: 'created' | 'updated' | 'deleted' | 'price_changed' | 'stock_updated' | 'version_created';
  userId: string;
  userName: string;
  timestamp: Date;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  reason?: string;
  ip?: string;
  userAgent?: string;
  restaurantId: string;
}

/**
 * Configuración de alertas de producto
 */
export interface ProductAlertConfig {
  productId: string;
  restaurantId: string;
  alerts: {
    lowStock: {
      enabled: boolean;
      threshold: number;
      recipients: string[];
    };
    overStock: {
      enabled: boolean;
      threshold: number;
      recipients: string[];
    };
    priceChange: {
      enabled: boolean;
      percentageThreshold: number;
      recipients: string[];
    };
    outOfSeason: {
      enabled: boolean;
      daysBefore: number;
      recipients: string[];
    };
  };
}

// ========== CONSTANTES Y ENUMS ==========

/**
 * Valores por defecto para configuración
 */
export const PRODUCT_VERSION_DEFAULTS = {
  LOW_STOCK_THRESHOLD: 10,
  HIGH_STOCK_THRESHOLD: 1000,
  PRICE_CHANGE_ALERT_PERCENTAGE: 20,
  OUT_OF_SEASON_ALERT_DAYS: 7,
  MAX_VERSIONS_PER_PRODUCT: 50,
  DEFAULT_STOCK_LOCATION: 'main'
} as const;

/**
 * Campos que pueden ser versionados
 */
export const VERSIONABLE_FIELDS = [
  'nombre',
  'descripcion',
  'currentPrice',
  'categoriaId',
  'imagen',
  'tags',
  'seasonality'
] as const;

/**
 * Acciones de auditoría válidas
 */
export const AUDIT_ACTIONS = [
  'created',
  'updated',
  'deleted',
  'price_changed',
  'stock_updated',
  'version_created'
] as const;

// ========== TIPOS DERIVADOS ==========

export type VersionableField = typeof VERSIONABLE_FIELDS[number];
export type AuditAction = typeof AUDIT_ACTIONS[number];

/**
 * Diferencia entre dos versiones de producto
 */
export interface VersionDiff {
  field: VersionableField;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'modified' | 'removed';
}

/**
 * Comparación completa entre versiones
 */
export interface VersionComparison {
  fromVersion: number;
  toVersion: number;
  productId: string;
  differences: VersionDiff[];
  summary: {
    totalChanges: number;
    significantChanges: number;
    priceChange?: {
      amount: number;
      percentage: number;
    };
  };
}
