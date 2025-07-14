'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error en la aplicación:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Error</h1>
        <h2 className="text-2xl font-semibold mb-4">Algo salió mal</h2>
        
        <p className="mb-6 text-gray-600">
          Lo sentimos, ha ocurrido un error al procesar tu solicitud.
        </p>
        
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 text-left overflow-hidden">
          <p className="text-sm text-red-800 truncate">
            <strong>Error:</strong> {error.message || 'Error desconocido'}
          </p>
          {error.digest && (
            <p className="text-sm text-red-700 mt-1">
              <strong>ID:</strong> {error.digest}
            </p>
          )}
        </div>
        
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 text-left">
          <p className="text-sm text-amber-800">
            <strong>Nota:</strong> El sistema está en proceso de migración de Firebase a PostgreSQL. 
            Este error puede estar relacionado con este proceso.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Intentar de nuevo
          </button>
          
          <Link 
            href="/"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}


























