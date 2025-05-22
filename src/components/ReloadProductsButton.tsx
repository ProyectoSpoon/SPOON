'use client';

import { useState } from 'react';
import { forceInitializeCache } from '@/utils/init-cache';
import { toast } from 'sonner';

export function ReloadProductsButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleReload = async () => {
    setIsLoading(true);
    try {
      // Limpiar todo el caché de localStorage relacionado con el menú
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('menu_')) {
          localStorage.removeItem(key);
          console.log(`Caché '${key}' eliminado`);
        }
      });
      
      // Forzar la inicialización del caché
      await forceInitializeCache();
      
      toast.success('Caché limpiado y reinicializado correctamente. Recargando página...');
      
      // Esperar un momento para que el usuario vea el mensaje
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error al reinicializar caché:', error);
      toast.error('Error al reinicializar caché');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleReload}
      disabled={isLoading}
      className="fixed bottom-4 right-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md shadow-md flex items-center space-x-2 z-50"
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Recargando...</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Recargar Productos</span>
        </>
      )}
    </button>
  );
}
