//src/shared/types/audit.types.ts

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

export interface AuditEventMetadata {
  collectionName?: string;
  documentId?: string;
  userId?: string;
  timestamp: Date;
  path: string;
  changes?: Record<string, any>;
  before?: Record<string, any>;
  after?: Record<string, any>;
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

export interface AuditFilter {
  startDate?: Date;
  endDate?: Date;
  type?: AuditEventType[];
  severity?: AuditEventSeverity[];
  collectionName?: string;
  userId?: string;
  status?: 'SUCCESS' | 'ERROR' | 'WARNING';
}

export interface AuditQueryResult {
  events: AuditEvent[];
  total: number;
  hasMore: boolean;
}