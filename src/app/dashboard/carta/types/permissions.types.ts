// src/app/dashboard/carta/types/permissions.types.ts
import { AuditEventMetadata } from '@/shared/types/audit.types';

export enum MenuPermission {
  CREATE_COMBINATION = 'menu:combination:create',
  READ_COMBINATION = 'menu:combination:read',
  UPDATE_COMBINATION = 'menu:combination:update',
  DELETE_COMBINATION = 'menu:combination:delete',
  SCHEDULE_COMBINATION = 'menu:combination:schedule',
  MARK_SPECIAL = 'menu:combination:special',
  MARK_FAVORITE = 'menu:combination:favorite'
}

export interface RolePermissions {
  code: string;
  name: string;
  permissions: MenuPermission[];
}

export interface MenuAuditMetadata extends AuditEventMetadata {
  menuOperation?: MenuPermission;
  details?: Record<string, any>;
}
