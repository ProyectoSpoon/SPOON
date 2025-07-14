'use client';

import { useEffect, useState } from 'react';

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log('Simulando inicialización de base de datos...');
        
        // Simular delay de inicialización
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Base de datos inicializada (simulación)');
        setIsInitialized(true);
      } catch (err) {
        console.error('Error inicializando base de datos:', err);
        setError('Error al inicializar la base de datos');
        setIsInitialized(true); // Continuar de todas formas
      }
    };

    initializeDatabase();
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando base de datos...</p>
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}



























