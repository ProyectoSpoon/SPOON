// src/hooks/usePermissions.ts

import { useEffect, useState } from 'react';
;
import { db } from '@/firebase/config';
import { useAuth } from '@/context/authcontext';
import { Permission, UserPermissions, DEFAULT_ROLE_PERMISSIONS } from '@/types/auth';

interface PermissionCache {
  [key: string]: {
    permissions: Permission[];
    timestamp: number;
  };
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const permissionsCache: PermissionCache = {};

export const usePermissions = () => {
  const { usuario, sessionInfo } = useAuth();
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario?.uid || !sessionInfo?.restaurantId) {
      setLoading(false);
      return;
    }

    // Verificar cache
    const cachedData = permissionsCache[usuario.uid];
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
      setUserPermissions(cachedData.permissions);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'restaurants', sessionInfo.restaurantId, 'userPermissions', usuario.uid),
      (doc) => {
        try {
          if (doc.exists()) {
            const data = doc.data() as UserPermissions;
            const basePermissions = DEFAULT_ROLE_PERMISSIONS[data.role] || [];
            const allPermissions = [...new Set([...basePermissions, ...(data.customPermissions || [])])];
            
            // Actualizar cache
            permissionsCache[usuario.uid] = {
              permissions: allPermissions,
              timestamp: Date.now()
            };
            
            setUserPermissions(allPermissions);
          } else {
            setUserPermissions([]);
          }
        } catch (err) {
          console.error('Error al procesar permisos:', err);
          setError('Error al cargar permisos');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error en snapshot de permisos:', err);
        setError('Error al suscribirse a permisos');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [usuario?.uid, sessionInfo?.restaurantId]);

  const hasPermission = (permission: Permission): boolean => {
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => userPermissions.includes(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => userPermissions.includes(permission));
  };

  return {
    permissions: userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    loading,
    error
  };
};