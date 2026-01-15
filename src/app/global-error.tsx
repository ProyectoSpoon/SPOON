'use client';

import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
          <div className="text-center max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h1 className="text-4xl font-bold text-red-600 mb-4">Error Fatal</h1>
            <h2 className="text-2xl font-semibold mb-4">La aplicación no pudo cargar</h2>

            <p className="mb-6 text-gray-600">
              Ha ocurrido un error crítico al cargar la aplicación.
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

            <div className="space-y-4">
              <button
                onClick={() => reset()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Intentar cargar de nuevo
              </button>

              <div className="flex items-center justify-center">
                <div className="w-full h-px bg-gray-200"></div>
                <span className="px-2 text-gray-500 text-sm">o</span>
                <div className="w-full h-px bg-gray-200"></div>
              </div>

              <Link
                href="/"
                className="block w-full px-4 py-2 text-center bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html >
  );
}


























