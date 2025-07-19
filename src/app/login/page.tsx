'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import RecuperarContrasenaModal from './components/recuperarcontrasenaModal';
import { useAuth } from '@/context/postgres-authcontext';

// Importar Google Identity Services
declare global {
  interface Window {
    google: any;
  }
}

// Definición del componente
const LoginPage = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [datosFormulario, setDatosFormulario] = useState({
    correo: '',
    contrasena: ''
  });
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  // Manejador de cambios en el formulario
  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDatosFormulario(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  // Cargar Google Identity Services - Deshabilitado temporalmente
  useEffect(() => {
    // TODO: Configurar Google Client ID en variables de entorno
    // const loadGoogleScript = () => {
    //   const script = document.createElement('script');
    //   script.src = 'https://accounts.google.com/gsi/client';
    //   script.async = true;
    //   script.defer = true;
    //   script.onload = () => {
    //     if (window.google) {
    //       window.google.accounts.id.initialize({
    //         client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id-here',
    //         callback: handleGoogleCallback,
    //       });
    //     }
    //   };
    //   document.head.appendChild(script);
    // };

    // loadGoogleScript();
  }, []);

  // Callback para manejar la respuesta de Google
  const handleGoogleCallback = async (response: any) => {
    try {
      setCargando(true);
      console.log('🔐 Procesando respuesta de Google...');
      // TODO: Implementar Google Sign-In con auth context
      toast.error('Google Sign-In no implementado aún');
    } catch (error: any) {
      console.error('Error en Google Sign-In:', error);
      setError(error.message);
      toast.error(error.message);
      setCargando(false);
    }
  };

  // Manejador para el inicio de sesión con Google
  const handleGoogleSignIn = async () => {
    try {
      if (window.google) {
        window.google.accounts.id.prompt();
      } else {
        toast.error('Google Sign-In no está disponible. Recarga la página.');
      }
    } catch (error: any) {
      console.error('Error al inicializar Google Sign-In:', error);
      toast.error('Error al inicializar Google Sign-In');
    }
  };

  // Manejador para el envío del formulario de inicio de sesión
  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    try {
      console.log('🔐 Intentando login con:', datosFormulario.correo);

      // Usar el auth context en lugar de AuthService
      await login(datosFormulario.correo, datosFormulario.contrasena);

      toast.success('¡Bienvenido!');
      
      // ✅ VERIFICAR SI TIENE RESTAURANTE ANTES DE REDIRIGIR
      console.log('🔍 Verificando configuración de restaurante...');
      
      try {
        // Obtener el token que acabamos de guardar
        const token = localStorage.getItem('auth_token');
        
        const restaurantResponse = await fetch('/api/auth/current-user/restaurant', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (restaurantResponse.status === 404) {
          // Usuario no tiene restaurante - redirigir a configuración
          console.log('❌ Usuario no tiene restaurante, redirigiendo a configuración...');
          toast.success('¡Bienvenido! Vamos a configurar tu restaurante.');
          router.push('/config-restaurante');
        } else if (restaurantResponse.ok) {
          // Usuario tiene restaurante - ir al dashboard
          const restaurantData = await restaurantResponse.json();
          console.log('✅ Usuario tiene restaurante:', restaurantData.restaurantName);
          toast.success(`¡Bienvenido de vuelta a ${restaurantData.restaurantName || 'tu restaurante'}!`);
          router.push('/dashboard');
        } else {
          // Error al verificar - ir al dashboard por defecto
          console.warn('⚠️ Error al verificar restaurante, redirigiendo al dashboard...');
          router.push('/dashboard');
        }
      } catch (restaurantError) {
        console.error('❌ Error al verificar restaurante:', restaurantError);
        // En caso de error, ir al dashboard (el dashboard manejará la validación)
        router.push('/dashboard');
      }
      
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      const mensajeError = err.message || 'Error al iniciar sesión';
      setError(mensajeError);
      toast.error(mensajeError);
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Toaster position="top-right" />
      {/* Columna izquierda - Información de Spoon */}
      <div className="hidden md:flex w-1/2 relative">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/images/fondologinusr.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'brightness(0.7)'
          }}
        />
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="relative z-20 w-full flex flex-col justify-center p-12">
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold text-white mb-6">
              Conecta con más clientes en tu zona
            </h1>
            <p className="text-xl text-white/90 mb-10">
              Expande tu negocio con nuestra plataforma de gestión de restaurantes y domicilios
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
                <h3 className="text-spoon-primary font-semibold mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                  Geolocalización
                </h3>
                <p className="text-white/90">Alcanza clientes en cualquier zona y optimiza tus entregas</p>
              </div>

              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
                <h3 className="text-spoon-primary font-semibold mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                  Sistema de Reseñas
                </h3>
                <p className="text-white/90">Mejora tu servicio con feedback real de los clientes</p>
              </div>

              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
                <h3 className="text-spoon-primary font-semibold mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                  Notificaciones
                </h3>
                <p className="text-white/90">Mantén informados a tus clientes sobre sus pedidos</p>
              </div>

              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
                <h3 className="text-spoon-primary font-semibold mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                  Gestión de Domicilios
                </h3>
                <p className="text-white/90">Control total sobre tus entregas y repartidores</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Columna derecha - Formulario */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <img
              src="/images/spoon-logo.jpg"
              alt="Spoon Logo"
              className="mx-auto h-[150px] w-auto mb-6"
            />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bienvenido de nuevo
            </h2>
            <p className="text-gray-600">
              Ingresa a tu cuenta para gestionar tu restaurante
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Mensaje de desarrollo */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-blue-700 text-sm">
              <strong>Credenciales de prueba:</strong> <br />
              Email: <strong>admin@spoon.com</strong> <br />
              Contraseña: <strong>admin123</strong>
            </p>
          </div>

          <form onSubmit={manejarEnvio} className="space-y-6">
            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-gray-700">
                Usuario
              </label>
              <input
                id="correo"
                name="correo"
                type="text"
                required
                value={datosFormulario.correo}
                onChange={manejarCambio}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] focus:border-spoon-primary transition-colors"
                placeholder="Ingresa tu usuario"
              />
            </div>

            <div>
              <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="relative mt-1">
                <input
                  id="contrasena"
                  name="contrasena"
                  type={mostrarContrasena ? 'text' : 'password'}
                  required
                  value={datosFormulario.contrasena}
                  onChange={manejarCambio}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] focus:border-spoon-primary transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasena(!mostrarContrasena)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {mostrarContrasena ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setModalAbierto(true)}
                className="text-sm font-medium text-spoon-primary hover:text-spoon-primary transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <button
              type="submit"
              disabled={cargando}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-spoon-primary hover:bg-spoon-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9933] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                'Iniciar sesión'
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O continúa con</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toast.error('Google Sign-In estará disponible próximamente')}
              disabled={true}
              className="w-full flex items-center justify-center gap-3 bg-gray-100 text-gray-400 font-medium py-3 px-4 border border-gray-200 rounded-lg shadow-sm cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#9CA3AF"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#9CA3AF"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#9CA3AF"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#9CA3AF"/>
              </svg>
              <span>Continuar con Google (Próximamente)</span>
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            ¿Necesitas ayuda?{' '}
            <Link href="/soporte" className="font-medium text-spoon-primary hover:text-spoon-primary transition-colors">
              Contacta soporte
            </Link>
          </p>
        </div>
      </div>

      <RecuperarContrasenaModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
      />
    </div>
  );
};

export default LoginPage;
