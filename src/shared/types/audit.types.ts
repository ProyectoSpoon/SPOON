//src/shared/types/audit.types.ts - VERSIÓN EXTENDIDA
export enum AuditEventType {
  // Eventos de Colección
  COLLECTION_READ = 'COLLECTION_READ',
  COLLECTION_WRITE = 'COLLECTION_WRITE',
  COLLECTION_DELETE = 'COLLECTION_DELETE',
  COLLECTION_EXPLORE = 'COLLECTION_EXPLORE',
  
  // Eventos de Documentos
  DOCUMENT_READ = 'DOCUMENT_READ',
  DOCUMENT_WRITE = 'DOCUMENT_WRITE',
  DOCUMENT_DELETE = 'DOCUMENT_DELETE',
  DOCUMENT_UPDATE = 'DOCUMENT_UPDATE',
  
  // 🆕 EVENTOS DE ÓRDENES - AGREGADOS
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_UPDATED = 'ORDER_UPDATED',
  ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED',
  ORDER_ITEM_ADDED = 'ORDER_ITEM_ADDED',
  ORDER_ITEM_REMOVED = 'ORDER_ITEM_REMOVED',
  ORDER_COMPLETED = 'ORDER_COMPLETED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  ORDER_PAYMENT_PROCESSED = 'ORDER_PAYMENT_PROCESSED',
  
  // 🆕 EVENTOS DE MESAS - AGREGADOS
  TABLE_ASSIGNED = 'TABLE_ASSIGNED',
  TABLE_RELEASED = 'TABLE_RELEASED',
  TABLE_STATUS_CHANGED = 'TABLE_STATUS_CHANGED',
  
  // 🆕 EVENTOS DE PRODUCTOS - AGREGADOS
  PRODUCT_SOLD = 'PRODUCT_SOLD',
  INVENTORY_UPDATED = 'INVENTORY_UPDATED',
  
  // Eventos de Sistema
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  SYSTEM_WARNING = 'SYSTEM_WARNING',
  SYSTEM_INFO = 'SYSTEM_INFO'
}

export enum AuditEventSeverity {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO'
}

export interface ErrorDetails {
  name: string;
  message: string;
  stack?: string;
  code?: string;
  [key: string]: any;
}

// 🆕 METADATA EXTENDIDA PARA ÓRDENES
export interface AuditEventMetadata {
  collectionName?: string;
  documentId?: string;
  userId?: string;
  timestamp: Date;
  path: string;
  changes?: Record<string, any>;
  before?: Record<string, any>;
  after?: Record<string, any>;
  
  // 🆕 CAMPOS ESPECÍFICOS PARA ÓRDENES
  orderId?: string;
  orderNumber?: string;
  tableNumber?: string;
  totalAmount?: number;
  orderType?: 'dine_in' | 'takeout' | 'delivery';
  orderStatus?: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  
  // 🆕 CAMPOS ESPECÍFICOS PARA ITEMS
  productId?: string;
  productName?: string;
  quantity?: number;
  unitPrice?: number;
  
  // 🆕 CAMPOS ESPECÍFICOS PARA PAGOS
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'digital';
  paymentAmount?: number;
  
  // 🆕 INFORMACIÓN DE SESIÓN
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  severity: AuditEventSeverity;
  description: string;
  metadata: AuditEventMetadata;
  status: 'SUCCESS' | 'ERROR' | 'WARNING';
  error?: ErrorDetails;
}

// 🆕 FILTROS EXTENDIDOS
export interface AuditFilter {
  startDate?: Date;
  endDate?: Date;
  type?: AuditEventType[];
  severity?: AuditEventSeverity[];
  collectionName?: string;
  userId?: string;
  status?: 'SUCCESS' | 'ERROR' | 'WARNING';
  
  // 🆕 FILTROS ESPECÍFICOS PARA ÓRDENES
  orderId?: string;
  tableNumber?: string;
  orderType?: string;
  orderStatus?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface AuditQueryResult {
  events: AuditEvent[];
  total: number;
  hasMore: boolean;
}

// 🆕 HELPER PARA CREAR EVENTOS DE ÓRDENES
export interface OrderAuditData {
  orderId: string;
  orderNumber?: string;
  tableNumber?: string;
  orderType?: 'dine_in' | 'takeout' | 'delivery';
  totalAmount?: number;
  orderStatus?: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  items?: Array<{
    productId: string;
    productName?: string;
    quantity: number;
    unitPrice: number;
  }>;
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'digital';
  userId?: string;
  changes?: Record<string, any>;
  before?: Record<string, any>;
  after?: Record<string, any>;
}

// 🆕 CONSTANTES PARA DESCRIPCIONES
export const AUDIT_DESCRIPTIONS = {
  [AuditEventType.ORDER_CREATED]: 'Nueva orden creada',
  [AuditEventType.ORDER_UPDATED]: 'Orden actualizada',
  [AuditEventType.ORDER_STATUS_CHANGED]: 'Estado de orden modificado',
  [AuditEventType.ORDER_ITEM_ADDED]: 'Producto agregado a la orden',
  [AuditEventType.ORDER_ITEM_REMOVED]: 'Producto removido de la orden',
  [AuditEventType.ORDER_COMPLETED]: 'Orden completada y entregada',
  [AuditEventType.ORDER_CANCELLED]: 'Orden cancelada',
  [AuditEventType.ORDER_PAYMENT_PROCESSED]: 'Pago procesado para la orden',
  [AuditEventType.TABLE_ASSIGNED]: 'Mesa asignada a orden',
  [AuditEventType.TABLE_RELEASED]: 'Mesa liberada',
  [AuditEventType.PRODUCT_SOLD]: 'Producto vendido',
} as const;
