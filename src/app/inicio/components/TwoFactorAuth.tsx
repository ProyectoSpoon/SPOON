// src/app/inicio/components/TwoFactorAuth.tsx
'use client'

import React, { useState } from 'react';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { Alert, AlertDescription } from '@/shared/components/ui/Alert';
import { Loader2 } from 'lucide-react';

interface TwoFactorAuthProps {
  onVerified: (code: string) => Promise<void>;
  sessionData: {
    phoneNumber?: string;
  };
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ onVerified, sessionData }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onVerified(code);
    } catch (err) {
      setError('Código inválido. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="space-y-4 p-6">
        <h2 className="text-xl font-semibold text-center">
          Verificación de dos factores
        </h2>
        
        <p className="text-sm text-gray-600 text-center">
          Se ha enviado un código de verificación al número{' '}
          <span className="font-medium">
            {sessionData.phoneNumber?.replace(/(\d{3})(\d{3})(\d{4})/, '+57 $1 $2 $3')}
          </span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Ingrese el código de 6 dígitos"
              className="w-full px-3 py-2 text-center text-lg tracking-wider border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent"
              maxLength={6}
              pattern="\d{6}"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
            />
            <p className="text-xs text-gray-500 text-center">
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
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${loading || code.length !== 6
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-spoon-primary hover:bg-spoon-primary-dark'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9933] disabled:opacity-50`}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Verificar código'
            )}
          </button>

          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={() => onVerified('resend')}
              className="text-sm text-gray-600 hover:text-spoon-primary transition-colors"
            >
              ¿No recibiste el código? Reenviar
            </button>
            <p className="text-xs text-gray-500">
              Si no recibes el código, verifica que el número de teléfono sea correcto
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TwoFactorAuth;



























