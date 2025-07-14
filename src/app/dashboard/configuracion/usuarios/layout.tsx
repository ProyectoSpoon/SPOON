// src/app/dashboard/usuarios/layout.tsx
'use client'

import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/Tabs';
import { usePathname, useRouter } from 'next/navigation';

export default function UsuariosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div>
      <div className="border-b">
        <Tabs value={pathname === '/dashboard/usuarios/roles' ? 'roles' : 'usuarios'} 
              onValueChange={(value) => {
                if (value === 'roles') {
                  router.push('/dashboard/usuarios/roles');
                } else {
                  router.push('/dashboard/usuarios');
                }
              }}>
          <TabsList>
            <TabsTrigger value="usuarios">Lista de Usuarios</TabsTrigger>
            <TabsTrigger value="roles">Roles y Permisos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {children}
    </div>
  );
}



























