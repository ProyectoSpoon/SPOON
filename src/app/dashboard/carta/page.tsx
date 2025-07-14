// src/app/dashboard/carta/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CartaPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a la página de menú del día
    router.push('/dashboard/carta/menu-dia');
  }, [router]);

  // Mostrar un mensaje de carga mientras se redirige
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Redirigiendo a Menú del Día...</p>
    </div>
  );
}


























