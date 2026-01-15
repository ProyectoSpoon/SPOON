'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/postgres-authcontext';

interface FormularioRegistroProps {
  onBackToLogin: () => void;
}

const FormularioRegistro = ({ onBackToLogin }: FormularioRegistroProps) => {
  const { login } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [estaCargando, setEstaCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

  const validarFormulario = () => {
    if (!formData.first_name.trim()) return 'El nombre es requerido';
    if (!formData.last_name.trim()) return 'El apellido es requerido';
    if (!formData.email.trim()) return 'El correo electrónico es requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      return 'Correo electrónico inválido';
    if (formData.password.length < 6)
      return 'La contraseña debe tener al menos 6 caracteres';
    if (formData.password !== formData.confirmPassword)
      return 'Las contraseñas no coinciden';
    if (!formData.phone.trim())
      return 'El teléfono es requerido';
    if (!/^\d{10}$/.test(formData.phone))
      return 'El teléfono debe tener 10 dígitos';
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
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
      console.log('📝 Iniciando registro...');

      // Llamar a la API de registro
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          role: 'customer' // Rol por defecto para nuevos registros
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar usuario');
      }

      console.log('✅ Registro exitoso:', data);
      toast.success('¡Cuenta creada exitosamente!');

      // Auto-login después del registro exitoso
      console.log('🔐 Iniciando sesión automáticamente...');
      await login(formData.email, formData.password);

      toast.success('¡Bienvenido! Configuremos tu restaurante.');

      // ✅ NUEVA LÓGICA: Verificar configuración después del registro
      try {
        const token = localStorage.getItem('auth_token');

        const restaurantResponse = await fetch('/api/auth/current-user/restaurant', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (restaurantResponse.status === 404) {
          // Usuario nuevo sin restaurante - empezar configuración
          console.log('🆕 Usuario nuevo, empezando configuración...');
          router.push('/config-restaurante');
        } else if (restaurantResponse.ok) {
          // Usuario ya tiene restaurante - verificar completitud
          const restaurantData = await restaurantResponse.json();
          console.log('📊 Datos del restaurante después del registro:', restaurantData);

          if (restaurantData.completeness?.isComplete) {
            // Configuración completa (raro en registro nuevo, pero posible)
            console.log('✅ Configuración ya completa, redirigiendo al dashboard');
            toast.success(`¡Bienvenido a ${restaurantData.restaurantName}!`);
            router.push('/dashboard');
          } else {
            // Configuración incompleta - continuar donde se quedó
            const nextStep = restaurantData.completeness?.nextStep || '/config-restaurante';
            const completedSteps = restaurantData.completeness?.completedSteps || 0;
            const totalSteps = restaurantData.completeness?.totalSteps || 4;

            console.log(`⚠️ Configuración incompleta (${completedSteps}/${totalSteps}), redirigiendo a:`, nextStep);

            toast.success(
              `¡Cuenta creada! Completa la configuración (${completedSteps}/${totalSteps} pasos)`,
              { duration: 4000 }
            );

            router.push(nextStep);
          }
        } else {
          // Error - ir a configuración por defecto
          console.warn('⚠️ Error verificando restaurante, redirigiendo a configuración...');
          router.push('/config-restaurante');
        }
      } catch (restaurantError) {
        console.error('❌ Error verificando restaurante después de registro:', restaurantError);
        router.push('/config-restaurante');
      }

    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      const mensajeError = error.message || 'Error al crear la cuenta';
      setError(mensajeError);
      toast.error(mensajeError);
    } finally {
      setEstaCargando(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header */}
      <div className="text-center">
        <button
          onClick={onBackToLogin}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver al login
        </button>

        <img
          src="/images/spoon-logo.jpg"
          alt="Spoon Logo"
          className="mx-auto h-[120px] w-auto mb-4"
        />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Crear cuenta en Spoon
        </h2>
        <p className="text-gray-600">
          Únete y empieza a gestionar tu restaurante
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre y Apellido */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Apellido
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent"
              required
              maxLength={100}
            />
          </div>
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent"
            required
            maxLength={255}
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Teléfono móvil
          </label>
          <div className="relative mt-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              +57
            </span>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="block w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent"
              placeholder="3001234567"
              maxLength={10}
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Solo números, 10 dígitos</p>
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
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
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
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent"
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

        {/* Términos y Condiciones */}
        <div className="text-xs text-gray-500 text-center">
          Al registrarte, aceptas nuestros{' '}
          <a href="#" className="text-spoon-primary hover:underline">
            términos y condiciones
          </a>{' '}
          y{' '}
          <a href="#" className="text-spoon-primary hover:underline">
            política de privacidad
          </a>
        </div>

        {/* Botón de registro */}
        <button
          type="submit"
          disabled={estaCargando}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-spoon-primary hover:bg-spoon-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9933] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {estaCargando ? (
            <div className="flex items-center">
              <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              <span>Creando cuenta...</span>
            </div>
          ) : (
            'Crear cuenta'
          )}
        </button>
      </form>
    </div>
  );
};

export default FormularioRegistro;