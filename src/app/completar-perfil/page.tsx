// src/app/completar-perfil/page.tsx
'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/authcontext';

export default function CompletarPerfil() {
  const router = useRouter();
  const { user: usuario } = useAuth();
  const [telefono, setTelefono] = useState('');
  const [estaCargando, setEstaCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!usuario) {
      router.push('/inicio');
    }
  }, [usuario, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario?.email) return;

    try {
      setEstaCargando(true);
      setError('');

      // API call to update user profile in PostgreSQL
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: usuario.email,
          telefono,
          requiresAdditionalInfo: false
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar perfil');
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setError('Error al actualizar perfil. Por favor, intente nuevamente.');
    } finally {
      setEstaCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-center">Completa tu perfil</h2>
          <p className="mt-2 text-center text-gray-600">
            Solo necesitamos un poco más de información
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono móvil
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">+57</span>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={estaCargando}
            className="w-full bg-[#FF9933] text-white py-2 px-4 rounded-md hover:bg-[#B37B5E] transition-colors font-medium"
          >
            {estaCargando ? 'Guardando...' : 'Completar registro'}
          </button>
        </form>
      </div>
    </div>
  );
}
