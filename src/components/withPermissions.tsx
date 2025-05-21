// src/components/withPermissions.tsx

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Permission } from '@/types/auth';
import { usePermissions } from '@/hooks/usePermissions';
import { Loader2 } from 'lucide-react';

interface WithPermissionsProps {
  requiredPermissions: Permission[];
  requireAll?: boolean;
}

export const withPermissions = (
  WrappedComponent: React.ComponentType,
  { requiredPermissions, requireAll = true }: WithPermissionsProps
) => {
  return function PermissionGuard(props: any) {
    const router = useRouter();
    const { hasAllPermissions, hasAnyPermission, loading, error } = usePermissions();

    useEffect(() => {
      if (!loading && !error) {
        const hasAccess = requireAll
          ? hasAllPermissions(requiredPermissions)
          : hasAnyPermission(requiredPermissions);

        if (!hasAccess) {
          router.push('/unauthorized');
        }
      }
    }, [loading, error, router]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF9933]" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-screen text-red-500">
          Error al verificar permisos
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};