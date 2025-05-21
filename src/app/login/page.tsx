'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import RecuperarContrasenaModal from './components/recuperarcontrasenaModal';
import Cookies from 'js-cookie';

// Credenciales hardcodeadas para desarrollo
const CREDENCIALES_DESARROLLO = {
  correo: 'admin',
  contrasena: '1234'
};

// Definición del componente
const LoginPage = () => {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [datosFormulario, setDatosFormulario] = useState({
    correo: '',
    contrasena: ''
  });
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [redireccionando, setRedireccionando] = useState(false);

  // Efecto para manejar la redirección después de establecer la cookie
  useEffect(() => {
    if (redireccionando) {
      // Pequeño retraso para asegurar que la cookie se establezca
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [redireccionando, router]);

  // Manejador de cambios en el formulario
  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDatosFormulario(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };
  
  // Manejador para el inicio de sesión con Google (simplificado para desarrollo)
  const handleGoogleSignIn = async () => {
    try {
      setCargando(true);
      
      // Establecer cookie de autenticación para desarrollo
      Cookies.set('dev-auth-token', 'desarrollo-google-auth-token', { expires: 1 }); // Expira en 1 día
      
      toast.success('¡Bienvenido de nuevo!');
      setRedireccionando(true);
  
    } catch (error: any) {
      console.error('Error en Google Sign-In:', error);
      toast.error('No se pudo completar el inicio de sesión con Google');
      setCargando(false);
    }
  };
  
  // Manejador para el envío del formulario de inicio de sesión con credenciales hardcodeadas
  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    
    try {
      // Simulamos un pequeño retraso para dar sensación de procesamiento
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Verificamos las credenciales hardcodeadas
      if (
        datosFormulario.correo === CREDENCIALES_DESARROLLO.correo && 
        datosFormulario.contrasena === CREDENCIALES_DESARROLLO.contrasena
      ) {
        // Credenciales correctas
        // Establecer cookie de autenticación para desarrollo
        Cookies.set('dev-auth-token', 'desarrollo-auth-token', { expires: 1 }); // Expira en 1 día
        
        toast.success('¡Bienvenido!');
        setRedireccionando(true);
      } else {
        // Credenciales incorrectas
        throw new Error('Correo o contraseña incorrectos');
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
                <h3 className="text-[#FF9933] font-semibold mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                  Geolocalización
                </h3>
                <p className="text-white/90">Alcanza clientes en cualquier zona y optimiza tus entregas</p>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
                <h3 className="text-[#FF9933] font-semibold mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                  Sistema de Reseñas
                </h3>
                <p className="text-white/90">Mejora tu servicio con feedback real de los clientes</p>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
                <h3 className="text-[#FF9933] font-semibold mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                  Notificaciones
                </h3>
                <p className="text-white/90">Mantén informados a tus clientes sobre sus pedidos</p>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
                <h3 className="text-[#FF9933] font-semibold mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
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
              <strong>Modo Desarrollo:</strong> Usa las credenciales: <br />
              Usuario: <strong>admin</strong> <br />
              Contraseña: <strong>1234</strong>
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
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] focus:border-[#FF9933] transition-colors"
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
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] focus:border-[#FF9933] transition-colors"
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
                className="text-sm font-medium text-[#FF9933] hover:text-[#F4821F] transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <button
              type="submit"
              disabled={cargando || redireccionando}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#FF9933] hover:bg-[#F4821F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9933] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando || redireccionando ? (
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
              onClick={handleGoogleSignIn}
              disabled={cargando || redireccionando}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 border border-gray-300 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continuar con Google</span>
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            ¿Necesitas ayuda?{' '}
            <Link href="/soporte" className="font-medium text-[#FF9933] hover:text-[#F4821F] transition-colors">
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
