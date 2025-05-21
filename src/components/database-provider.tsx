'use client';

import { useEffect, useState } from 'react';
import { initDatabase } from '@/config/db-init';

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const success = await initDatabase();
        if (success) {
          console.log('Base de datos PostgreSQL inicializada con éxito');
          setIsInitialized(true);
        } else {
          setError('Error al inicializar la base de datos PostgreSQL');
        }
      } catch (err) {
        console.error('Error al inicializar la base de datos:', err);
        setError('Error al conectar con la base de datos PostgreSQL');
      }
    };

    initialize();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="p-8 bg-white rounded-lg shadow-xl text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error de Base de Datos</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Por favor, asegúrese de que PostgreSQL esté en ejecución y que las credenciales sean correctas.
          </p>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Conectando a la base de datos PostgreSQL...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
