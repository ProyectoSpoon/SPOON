'use client';

import { useEffect } from 'react';
import { MenuDiaSection } from '@/components/menu/MenuDiaSection';
import { initializeCache } from '@/utils/init-cache';

export default function MenuDiaPage() {
  // Inicializar el caché al cargar la página
  useEffect(() => {
    initializeCache();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Menú del Día</h1>
      
      <div className="mb-8">
        <p className="text-gray-600 mb-4">
          Gestiona los productos del menú del día. Para las proteínas, puedes especificar la cantidad disponible.
        </p>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p className="text-blue-700">
            <strong>Nota:</strong> Las cantidades se guardan automáticamente en localStorage.
          </p>
        </div>
      </div>
      
      <MenuDiaSection />
    </div>
  );
}



























