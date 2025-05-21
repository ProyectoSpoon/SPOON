// src/app/dashboard/carta/hooks/useMenuPermissions.ts
import { useState, useCallback } from 'react';
import { MenuPermission } from '../types/permissions.types';
import { MenuRoleManager } from '../services/role-manager.service';

export function useMenuPermissions() {
  const [isChecking, setIsChecking] = useState(false);

  const checkPermission = useCallback(async (
    permission: MenuPermission,
    context: Record<string, any> = {}
  ) => {
    setIsChecking(true);
    try {
      return await MenuRoleManager.checkPermission(permission, context);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const logOperation = useCallback(async (
    operation: MenuPermission,
    details: Record<string, any>
  ) => {
    await MenuRoleManager.validateMenuOperation(operation, details);
  }, []);

  return {
    isChecking,
    checkPermission,
    logOperation
  };
}