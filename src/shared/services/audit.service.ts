// src/shared/services/audit.service.ts
import { 
  AuditEvent, 
  AuditEventType, 
  AuditEventSeverity, 
  AuditFilter,
  AuditQueryResult,
  AuditEventMetadata,
  ErrorDetails 
} from '@/shared/types/audit.types';

export class AuditService {
    private static readonly PAGE_SIZE = 50;
  
    private static getCurrentUserId(): string {
      // Get user ID from session/token or return 'system'
      return 'system'; // TODO: Implement proper user session management
    }
    
    static async logEvent(
      type: AuditEventType,
      description: string,
      metadata: Omit<AuditEventMetadata, 'timestamp' | 'path'>,
      severity: AuditEventSeverity = AuditEventSeverity.INFO,
      error?: Error
    ): Promise<string> {
      try {
        const currentUserId = this.getCurrentUserId();
        const safeMetadata = {
          ...metadata,
          userId: metadata.userId ?? currentUserId,
          timestamp: new Date().toISOString(),
          path: typeof window !== 'undefined' ? window.location.pathname : '/'
        };
    
        const auditEvent: Omit<AuditEvent, 'id'> = {
          type,
          description,
          severity,
          status: error ? 'ERROR' : 'SUCCESS',
          metadata: safeMetadata,
          ...(error && { error: this.normalizeError(error) })
        };
    
        console.log('Audit Event to save:', JSON.stringify(auditEvent, null, 2));
    
        const response = await fetch('/api/audit/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(auditEvent),
        });

        if (!response.ok) {
          throw new Error('Failed to log audit event');
        }

        const result = await response.json();
        return result.id;
      } catch (error) {
        console.error('[AuditService] Error logging event:', error);
        throw error;
      }
    }
  
    private static normalizeError(error: Error): ErrorDetails {
      return {
        name: error.name || 'UnknownError',
        message: error.message || 'No error message provided',
        stack: error.stack,
        ...(error as Record<string, any>)
      };
    }
  
    static async logCollectionExplore(
      collectionName: string, 
      documentsCount: number,
      userId?: string
    ): Promise<string> {
      const metadata: Omit<AuditEventMetadata, 'timestamp' | 'path'> = {
        collectionName,
        userId: userId || this.getCurrentUserId(),
        changes: { documentsCount }
      };
  
      return this.logEvent(
        AuditEventType.COLLECTION_EXPLORE,
        `Exploración de colección ${collectionName} (${documentsCount} documentos)`,
        metadata,
        AuditEventSeverity.LOW
      );
    }
  
    static async logCollectionRead(
      collectionName: string,
      filter?: Record<string, any>,
      userId?: string
    ): Promise<string> {
      const metadata: Omit<AuditEventMetadata, 'timestamp' | 'path'> = {
        collectionName,
        userId: userId || this.getCurrentUserId(),
        changes: filter || {}
      };
  
      return this.logEvent(
        AuditEventType.COLLECTION_READ,
        `Lectura de colección ${collectionName}`,
        metadata,
        AuditEventSeverity.LOW
      );
    }
  
    static async logDocumentWrite(
      collectionName: string,
      documentId: string,
      data: Record<string, any>,
      userId?: string
    ): Promise<string> {
      const metadata: Omit<AuditEventMetadata, 'timestamp' | 'path'> = {
        collectionName,
        documentId,
        userId: userId || this.getCurrentUserId(),
        changes: data
      };
  
      return this.logEvent(
        AuditEventType.DOCUMENT_WRITE,
        `Escritura en documento ${documentId} de ${collectionName}`,
        metadata,
        AuditEventSeverity.MEDIUM
      );
    }
  
    static async logSystemError(
      error: Error,
      context: Record<string, any>,
      userId?: string
    ): Promise<string> {
      const metadata: Omit<AuditEventMetadata, 'timestamp' | 'path'> = {
        userId: userId || this.getCurrentUserId(),
        changes: context
      };
  
      return this.logEvent(
        AuditEventType.SYSTEM_ERROR,
        error.message || 'Error desconocido',
        metadata,
        AuditEventSeverity.HIGH,
        error
      );
    }

    static async queryEvents(
      filter: AuditFilter,
      page: number = 0
    ): Promise<AuditQueryResult> {
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: this.PAGE_SIZE.toString(),
          ...(filter.startDate && { startDate: filter.startDate.toISOString() }),
          ...(filter.endDate && { endDate: filter.endDate.toISOString() }),
          ...(filter.type?.length && { types: filter.type.join(',') }),
          ...(filter.severity?.length && { severities: filter.severity.join(',') }),
          ...(filter.userId && { userId: filter.userId }),
        });

        const response = await fetch(`/api/audit/events?${queryParams}`);
        
        if (!response.ok) {
          throw new Error('Failed to query audit events');
        }

        const result = await response.json();
        return {
          events: result.events as AuditEvent[],
          total: result.total,
          hasMore: result.hasMore
        };
      } catch (error) {
        console.error('[AuditService] Error querying events:', error);
        throw error;
      }
    }
}
