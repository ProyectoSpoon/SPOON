// src/app/dashboard/carta/services/role-manager.service.ts
import { AuditService } from '@/shared/services/audit.service';
import { AuditEventType, AuditEventSeverity } from '@/shared/types/audit.types';
import { MenuPermission, MenuAuditMetadata } from '../types/permissions.types';
import { auth } from '@/firebase/config';

export class MenuRoleManager {
  static async checkPermission(permission: MenuPermission, context: Record<string, any> = {}): Promise<boolean> {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;

    const metadata: Partial<MenuAuditMetadata> = {
      userId: currentUser.uid,
      collectionName: 'menu_permissions',
      details: { permission, ...context }
    };

    await AuditService.logEvent(
      AuditEventType.DOCUMENT_READ,
      `Verificación de permiso de menú: ${permission}`,
      metadata
    );

    return true;
  }

  static async validateMenuOperation(
    operation: MenuPermission,
    details: Record<string, any>
  ): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Usuario no autenticado');

    const eventType = this.getAuditEventType(operation);
    const metadata: Partial<MenuAuditMetadata> = {
      userId: currentUser.uid,
      collectionName: 'menu',
      details: { menuOperation: operation, ...details }
    };

    await AuditService.logEvent(
      eventType,
      `Operación de menú: ${operation}`,
      metadata,
      AuditEventSeverity.MEDIUM
    );
  }

  private static getAuditEventType(operation: MenuPermission): AuditEventType {
    switch (operation) {
      case MenuPermission.CREATE_COMBINATION:
        return AuditEventType.DOCUMENT_WRITE;
      case MenuPermission.UPDATE_COMBINATION:
        return AuditEventType.DOCUMENT_UPDATE;
      case MenuPermission.DELETE_COMBINATION:
        return AuditEventType.DOCUMENT_DELETE;
      default:
        return AuditEventType.DOCUMENT_READ;
    }
  }
}