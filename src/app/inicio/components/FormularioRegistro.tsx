'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { Alert, AlertDescription } from '@/shared/components/ui/Alert';
import { useAuth } from '@/context/authcontext';

// Mock implementation for Firebase functions
const mockFirebase = {
  getDoc: async () => ({ exists: () => false }),
  setDoc: async () => Promise.resolve(),
  doc: () => ({})
};

const FormularioRegistro = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState('registro'); // 'registro' | 'verificacion'
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    password: '',
    confirmPassword: '',
    enable2FA: false
  });

  const [error, setError] = useState('');
  const [estaCargando, setEstaCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
  const [verificationId, setVerificationId] = useState('');

  const validarFormulario = () => {
    if (!formData.nombre.trim()) return 'El nombre es requerido';
    if (!formData.apellido.trim()) return 'El apellido es requerido';
    if (!formData.email.trim()) return 'El correo electrónico es requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) 
      return 'Correo electrónico inválido';
    if (formData.password.length < 6) 
      return 'La contraseña debe tener al menos 6 caracteres';
    if (formData.password !== formData.confirmPassword) 
      return 'Las contraseñas no coinciden';
    if (formData.enable2FA && !formData.telefono) 
      return 'El teléfono es requerido para 2FA';
    if (formData.telefono && !/^\d{10}$/.test(formData.telefono)) 
      return 'El teléfono debe tener 10 dígitos';
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGoogleSignIn = async () => {
    try {
      setEstaCargando(true);
      setError('');
      
      // Usar el método login en lugar de signInWithGoogle
      await login('dev@example.com', 'password');
      
      // Redirigir al usuario
      router.push('/config-restaurante');
    } catch (error: any) {
      console.error('Error al iniciar sesión con Google:', error);
      setError('Error al iniciar sesión con Google. Por favor, intente nuevamente.');
    } finally {
      setEstaCargando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validarFormulario();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setEstaCargando(true);

    try {
      // Verificar si el usuario ya existe (mock implementation)
      const docSnap = await mockFirebase.getDoc();
      
      if (docSnap.exists()) {
        setError('Esta cuenta ya existe. Por favor, inicia sesión.');
        return;
      }

      // Datos base del usuario
      const datosAGuardar = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        telefono: formData.telefono,
        fechaRegistro: new Date(),
        RestauranteID: '',
        is2FAEnabled: formData.enable2FA,
        failedAttempts: 0,
        lastFailedAttempt: null,
        requiresAdditionalInfo: true
      };

      await mockFirebase.setDoc();

      if (formData.enable2FA) {
        setStep('verificacion');
      } else {
        router.push('/verificar-email');
      }

    } catch (error) {
      console.error('ERROR en el proceso de registro:', error);
      setError('Error al registrar. Por favor, intente nuevamente.');
    } finally {
      setEstaCargando(false);
    }
  };
  const handleVerificationCode = async (code: string) => {
    setEstaCargando(true);
    try {
      // Aquí iría la lógica de verificación 2FA
      router.push('/verificar-email');
    } catch (error) {
      setError('Error en la verificación. Por favor, intente nuevamente.');
    } finally {
      setEstaCargando(false);
    }
  };

  if (step === 'verificacion') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-xl font-semibold text-center">Verificación de dos factores</h2>
          <p className="text-sm text-gray-600 text-center">
            Se ha enviado un código de verificación al número {formData.telefono}
          </p>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md text-center text-lg tracking-wider"
            maxLength={6}
            placeholder="Ingrese el código"
            onChange={(e) => handleVerificationCode(e.target.value)}
          />
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent"
                required
              />
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Apellido
              </label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent"
                required
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Teléfono móvil {formData.enable2FA && <span className="text-red-500">*</span>}
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  +57
                </span>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent"
                  maxLength={10}
                  required={formData.enable2FA}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="relative mt-1">
                <input
                  type={mostrarPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña
              </label>
              <div className="relative mt-1">
                <input
                  type={mostrarConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {mostrarConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Opción 2FA */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="enable2FA"
                id="enable2FA"
                checked={formData.enable2FA}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-spoon-primary focus:ring-[#FF9933]"
              />
              <label htmlFor="enable2FA" className="text-sm text-gray-700">
                Activar autenticación de dos factores (2FA)
              </label>
            </div>

            {/* Botón de registro */}
            <button
              type="submit"
              disabled={estaCargando}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-spoon-primary hover:bg-spoon-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9933] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {estaCargando ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Registrarse'
              )}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">O</span>
            </div>
          </div>

          {/* Botón de Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={estaCargando}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9933]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continuar con Google
          </button>

          <p className="mt-4 text-xs text-center text-gray-500">
            Al registrarte, aceptas nuestros términos y condiciones
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default FormularioRegistro;



























