// src/shared/services/audit.service.ts
import { auth, db } from '@/firebase/config';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  startAfter,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
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
    private static readonly COLLECTION_NAME = 'audit_logs';
    private static readonly PAGE_SIZE = 50;
  
    private static getCurrentUserId(): string {
      return auth.currentUser?.uid ?? 'system';  // Usando el operador nullish
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
          userId: metadata.userId ?? currentUserId, // Aseguramos que nunca sea undefined
          timestamp: serverTimestamp(),
          path: window.location.pathname || '/'
        };
    
        const auditEvent: Omit<AuditEvent, 'id'> = {
          type,
          description,
          severity,
          status: error ? 'ERROR' : 'SUCCESS',
          metadata: safeMetadata,
          ...(error && { error: this.normalizeError(error) })
        };
    
        // Verificación adicional
        console.log('Audit Event to save:', JSON.stringify(auditEvent, null, 2));
    
        const docRef = await addDoc(
          collection(db, this.COLLECTION_NAME), 
          auditEvent
        );
    
        return docRef.id;
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
      lastDoc?: QueryDocumentSnapshot<DocumentData>
    ): Promise<AuditQueryResult> {
      try {
        let q = query(
          collection(db, this.COLLECTION_NAME),
          orderBy('metadata.timestamp', 'desc')
        );

        if (filter.startDate) {
          q = query(q, where('metadata.timestamp', '>=', filter.startDate));
        }
        if (filter.endDate) {
          q = query(q, where('metadata.timestamp', '<=', filter.endDate));
        }
        if (filter.type?.length) {
          q = query(q, where('type', 'in', filter.type));
        }
        if (filter.severity?.length) {
          q = query(q, where('severity', 'in', filter.severity));
        }
        if (filter.userId) {
          q = query(q, where('metadata.userId', '==', filter.userId));
        }

        q = query(q, limit(this.PAGE_SIZE));
        if (lastDoc) {
          q = query(q, startAfter(lastDoc));
        }

        const snapshot = await getDocs(q);
        return {
          events: snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as AuditEvent[],
          total: snapshot.size,
          hasMore: snapshot.size === this.PAGE_SIZE
        };
      } catch (error) {
        console.error('[AuditService] Error querying events:', error);
        throw error;
      }
    }
}