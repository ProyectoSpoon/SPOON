'use client';
import { useState } from 'react';
import { XIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const RecuperarContrasenaModal = ({ isOpen, onClose }: Props) => {
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success('Se ha enviado un correo para restablecer tu contraseña');
        onClose();
        setEmail('');
      } else {
        const errorData = await response.json();
        let mensajeError = 'Error al enviar el correo de recuperación.';
        if (errorData.code === 'user-not-found') {
          mensajeError = 'No existe una cuenta con este correo electrónico.';
        }
        toast.error(mensajeError);
      }
    } catch (err: any) {
      toast.error('Error al enviar el correo de recuperación.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
          >
            <XIcon className="h-5 w-5" />
          </button>

          {/* Contenido */}
          <div className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Recuperar contraseña
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Ingresa tu correo electrónico y te enviaremos las instrucciones
                para restablecer tu contraseña.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#FF9933] focus:border-spoon-primary"
                  placeholder="ejemplo@correo.com"
                />
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-spoon-primary hover:bg-spoon-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9933] disabled:opacity-50"
              >
                {cargando ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Enviando...</span>
                  </div>
                ) : (
                  'Enviar instrucciones'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecuperarContrasenaModal;



























