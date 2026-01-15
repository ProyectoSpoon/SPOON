// hooks/usePermissions.ts
'use client';

import { useAuth } from '@/context/postgres-authcontext';
import { useMemo } from 'react';

export enum Permission {
  MENU_READ = 'MENU_READ',
  MENU_WRITE = 'MENU_WRITE',
  SETTINGS_READ = 'SETTINGS_READ',
  SETTINGS_WRITE = 'SETTINGS_WRITE',
  USERS_READ = 'USERS_READ',
  USERS_WRITE = 'USERS_WRITE',
  ORDERS_READ = 'ORDERS_READ',
  ORDERS_WRITE = 'ORDERS_WRITE',
  REPORTS_READ = 'REPORTS_READ'
}

export function usePermissions() {
  const { user, loading } = useAuth();

  // Función para obtener permisos basados en rol (fallback)
  const getPermissionsByRole = (role: string): string[] => {
    const roleMap: { [key: string]: string[] } = {
      'super_admin': [
        Permission.MENU_READ,
        Permission.MENU_WRITE,
        Permission.SETTINGS_READ,
        Permission.SETTINGS_WRITE,
        Permission.USERS_READ,
        Permission.USERS_WRITE,
        Permission.ORDERS_READ,
        Permission.ORDERS_WRITE,
        Permission.REPORTS_READ
      ],
      'admin': [
        Permission.MENU_READ,
        Permission.MENU_WRITE,
        Permission.SETTINGS_READ,
        Permission.ORDERS_READ,
        Permission.REPORTS_READ
      ],
      'staff': [
        Permission.MENU_READ,
        Permission.ORDERS_READ
      ],
      'customer': [
        Permission.MENU_READ
      ]
    };

    return roleMap[role] || [Permission.MENU_READ];
  };

  // Obtener permisos efectivos
  const getEffectivePermissions = (): string[] => {
    if (!user) return [];

    // 1. Intentar obtener del JWT directamente
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const payload = token.split('.')[1];
        if (payload) {
          const jwtData = JSON.parse(atob(payload));
          if (jwtData.permissions && Array.isArray(jwtData.permissions) && jwtData.permissions.length > 0) {
            console.log('🔑 Usando permisos del JWT:', jwtData.permissions);
            return jwtData.permissions;
          }
        }
      }
    } catch (error) {
      console.error('❌ Error obteniendo permisos del JWT:', error);
    }

    // 2. Fallback: permisos basados en rol
    if (user.role) {
      const rolePermissions = getPermissionsByRole(user.role);
      console.log('👑 Usando permisos por rol:', rolePermissions);
      return rolePermissions;
    }

    console.log('❌ No se pudieron obtener permisos');
    return [];
  };

  // Memoizar los permisos efectivos
  const permissions = useMemo(() => {
    return getEffectivePermissions();
  }, [user?.role, user?.uid]);

  // Función para verificar un permiso específico
  const hasPermission = (permission: Permission | string): boolean => {
    const hasAccess = permissions.includes(permission.toString());
    
    console.log(`🔍 Verificando permiso "${permission}":`, {
      hasAccess,
      userPermissions: permissions,
      userRole: user?.role
    });
    
    return hasAccess;
  };

  // Función para verificar si tiene alguno de varios permisos
  const hasAnyPermission = (requiredPermissions: (Permission | string)[]): boolean => {
    return requiredPermissions.some(permission => 
      permissions.includes(permission.toString())
    );
  };

  // Función para verificar si tiene todos los permisos requeridos
  const hasAllPermissions = (requiredPermissions: (Permission | string)[]): boolean => {
    return requiredPermissions.every(permission => 
      permissions.includes(permission.toString())
    );
  };

  // Función para verificar acceso a rutas específicas
  const canAccessRoute = (route: string): boolean => {
    const routePermissions: { [key: string]: Permission[] } = {
      '/dashboard': [Permission.MENU_READ],
      '/dashboard/carta': [Permission.MENU_READ],
      '/dashboard/configuracion': [Permission.SETTINGS_READ],
      '/dashboard/usuarios': [Permission.USERS_READ],
      '/dashboard/estadisticas': [Permission.REPORTS_READ],
      '/dashboard/ordenes': [Permission.ORDERS_READ]
    };

    const requiredPermissions = routePermissions[route];
    if (!requiredPermissions) return true; // Ruta no protegida

    return hasAnyPermission(requiredPermissions);
  };

  return {
    permissions,
    loading,
    error: null,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
    user
  };
}