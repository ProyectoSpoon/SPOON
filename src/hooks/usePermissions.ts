// Hook simplificado para manejo de permisos sin Firebase

import { useEffect, useState } from 'react';

export function usePermissions(userId?: string) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Simulando carga de permisos para usuario:', userId);
        
        // Simular delay de carga
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Permisos de ejemplo basados en el usuario
        let userPermissions: string[] = [];
        
        if (userId === 'user_1' || userId === 'admin') {
          userPermissions = ['read', 'write', 'delete', 'manage', 'admin'];
        } else if (userId) {
          userPermissions = ['read', 'write'];
        } else {
          userPermissions = ['read'];
        }
        
        setPermissions(userPermissions);
        console.log('Permisos cargados (simulación):', userPermissions);
        
      } catch (err) {
        console.error('Error cargando permisos:', err);
        setError('Error al cargar permisos');
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [userId]);

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some(permission => permissions.includes(permission));
  };

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every(permission => permissions.includes(permission));
  };

  return {
    permissions,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  };
}
