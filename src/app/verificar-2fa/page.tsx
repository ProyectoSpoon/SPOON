'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/Alert';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/authcontext';

export default function Verificar2FA() {
  const router = useRouter();
  const { 
    usuario, 
    sessionInfo, 
    iniciarSesionCon2FA, 
    enviarCodigoVerificacion 
  } = useAuth();
  
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!usuario || !sessionInfo?.is2FAEnabled) {
      router.push('/inicio');
    }
  }, [usuario, sessionInfo, router]);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await iniciarSesionCon2FA(code);
      router.push('/dashboard');
    } catch (err) {
      setError('Código inválido. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    try {
      setLoading(true);
      setError('');
      await enviarCodigoVerificacion();
      
      setCountdown(30); // 30 segundos de espera
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
      setError('Error al reenviar el código. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!usuario || !sessionInfo) {
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
            Verificación de dos factores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-gray-600">
            Ingresa el código de verificación enviado a tu teléfono
            <br />
            <span className="font-medium">
              {sessionInfo.phoneNumber?.replace(/(\d{3})(\d{3})(\d{4})/, '+57 $1 $2 $3')}
            </span>
          </p>

          <form onSubmit={handleVerification} className="space-y-4">
            <div className="space-y-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-3 py-2 text-center text-lg tracking-wider border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF9933] focus:border-transparent"
                placeholder="Ingresa el código de 6 dígitos"
                maxLength={6}
                autoComplete="one-time-code"
                required
              />
              <p className="text-xs text-center text-gray-500">
                El código expirará en 10 minutos
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full py-2 px-4 bg-[#FF9933] text-white rounded-md hover:bg-[#B37B5E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              ) : (
                'Verificar'
              )}
            </button>
          </form>

          <div className="space-y-4">
            <button
              onClick={handleResendCode}
              disabled={countdown > 0 || loading}
              className="w-full text-sm text-gray-600 hover:text-[#FF9933] transition-colors disabled:opacity-50"
            >
              {countdown > 0
                ? `Reenviar código en ${countdown}s`
                : '¿No recibiste el código? Reenviar'
              }
            </button>

            <button
              onClick={() => router.push('/inicio')}
              className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}