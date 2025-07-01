'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';

export default function Verificar2FAPage() {
  const router = useRouter();
  const [codigo, setCodigo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const manejarVerificacion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setCargando(true);
      setError(null);
      
      console.log('Simulando verificación 2FA con código:', codigo);
      
      // Simular delay de verificación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular validación del código
      if (codigo === '123456') {
        router.push('/dashboard');
      } else {
        throw new Error('Código de verificación incorrecto');
      }
      
    } catch (err: any) {
      console.error('Error en verificación 2FA:', err);
      setError(err.message || 'Error al verificar el código');
    } finally {
      setCargando(false);
    }
  };

  const reenviarCodigo = async () => {
    try {
      setCargando(true);
      setError(null);
      
      console.log('Simulando reenvío de código 2FA...');
      
      // Simular delay de reenvío
      await new Promise(resolve => setTimeout(resolve, 500));
      
      alert('Código reenviado exitosamente');
      
    } catch (err: any) {
      console.error('Error al reenviar código:', err);
      setError('Error al reenviar el código');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verificación en dos pasos
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa el código de 6 dígitos enviado a tu dispositivo
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={manejarVerificacion} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="codigo" className="block text-sm font-medium text-gray-700">
                Código de verificación
              </label>
              <input
                id="codigo"
                name="codigo"
                type="text"
                required
                maxLength={6}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
                placeholder="000000"
                disabled={cargando}
              />
            </div>

            <div>
              <Button
                type="submit"
                disabled={cargando || codigo.length !== 6}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargando ? 'Verificando...' : 'Verificar código'}
              </Button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={reenviarCodigo}
                disabled={cargando}
                className="text-sm text-orange-600 hover:text-orange-500 disabled:opacity-50"
              >
                ¿No recibiste el código? Reenviar
              </button>
            </div>
          </form>
        </Card>

        <div className="text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-gray-600 hover:text-gray-500"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  );
}
