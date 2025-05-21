import { Producto } from '@/utils/menuCache.utils';

export interface PriceHistory {
  id: string;  // Añadir ID para referencia
  value: number;
  effectiveDate: Date;
  expirationDate?: Date;
  reason?: string;
  createdBy: string;
  restaurantId: string;  // Añadir para filtraje
  previousPrice?: number;  // Añadir para tracking de cambios
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
    changeReason?: string;  // Añadir para tracking de cambios
  }[];
  metadata: {
    createdAt: Date;
    createdBy: string;
    publishedAt?: Date;
    status: 'draft' | 'published' | 'archived';
    approvedBy?: string;  // Añadir para flujo de aprobación
    approvedAt?: Date;
  };
  restaurantId: string;  // Añadir para filtraje
}

export interface StockUpdate {
  id: string;  // Añadir ID para referencia
  quantity: number;
  type: 'increment' | 'decrement' | 'set';
  reason?: string;
  timestamp: Date;
  updatedBy: string;
  location?: string;
  batchNumber?: string;  // Añadir para tracking de lotes
  productId: string;  // Referencia al producto
  restaurantId: string;  // Añadir para filtraje
}

export interface ProductStock {
  currentQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  location?: string;
  lastUpdated: Date;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  alerts?: {  // Añadir sistema de alertas
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
    publishHistory?: {  // Añadir historial de publicaciones
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
