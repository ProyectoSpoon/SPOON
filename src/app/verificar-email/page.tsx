'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';

export default function VerificarEmail() {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Simular verificación automática
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleReenviar = async () => {
    try {
      setError('');
      setCountdown(60);
      
      console.log('Simulando reenvío de email de verificación...');
      
      // Simular delay de reenvío
      await new Promise(resolve => setTimeout(resolve, 500));
      
      alert('Email de verificación reenviado exitosamente');
      
    } catch (err: any) {
      console.error('Error al reenviar email:', err);
      setError('Error al reenviar el email de verificación');
    }
  };

  const handleContinuar = () => {
    // Simular que el email fue verificado
    router.push('/dashboard');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando estado del email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verifica tu email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Hemos enviado un enlace de verificación a tu correo electrónico
          </p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Revisa tu bandeja de entrada y haz clic en el enlace de verificación.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-xs text-gray-500">
                  Si no encuentras el email, revisa tu carpeta de spam o correo no deseado.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleContinuar}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                Ya verifiqué mi email
              </Button>

              <Button
                onClick={handleReenviar}
                disabled={countdown > 0}
                variant="outline"
                className="w-full"
              >
                {countdown > 0 
                  ? `Reenviar en ${countdown}s` 
                  : 'Reenviar email de verificación'
                }
              </Button>
            </div>
          </div>
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



























