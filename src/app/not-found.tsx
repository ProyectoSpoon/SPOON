'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-red-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Página no encontrada</h2>
        
        <p className="mb-6 text-gray-600">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 text-left">
          <p className="text-sm text-amber-800">
            <strong>Nota:</strong> El sistema está en proceso de migración de Firebase a PostgreSQL. 
            Algunas rutas pueden no estar disponibles temporalmente.
          </p>
        </div>
        
        <Link 
          href="/"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}


























