'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/Alert';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/authcontext';

export default function VerificarEmail() {
  const router = useRouter();
  const { reenviarVerificacionEmail, usuario } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/inicio');
        return;
      }

      if (user.emailVerified) {
        router.push('/completar-perfil');
      } else {
        setIsVerifying(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleResendVerification = async () => {
    if (countdown > 0) return;

    try {
      setIsVerifying(true);
      setError('');
      await reenviarVerificacionEmail();
      setCountdown(60); // 60 segundos de espera
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      setError('Error al reenviar el correo de verificación');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF9933]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Verifica tu correo electrónico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Hemos enviado un correo de verificación a:
              <br />
              <span className="font-medium">{usuario?.email}</span>
            </p>
            
            <p className="text-sm text-gray-500">
              Por favor, revisa tu bandeja de entrada y sigue las instrucciones
              para verificar tu cuenta.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <button
              onClick={handleResendVerification}
              disabled={countdown > 0 || isVerifying}
              className="w-full py-2 px-4 bg-[#FF9933] text-white rounded-md hover:bg-[#B37B5E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {countdown > 0 
                ? `Reenviar en ${countdown}s` 
                : isVerifying 
                  ? <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  : 'Reenviar correo de verificación'
              }
            </button>

            <button
              onClick={() => router.push('/inicio')}
              className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Volver al inicio
            </button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>
              ¿No recibiste el correo? Revisa tu carpeta de spam o solicita un nuevo envío.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}