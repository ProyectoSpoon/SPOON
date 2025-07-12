'use client';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, ChevronLeft, Info } from 'lucide-react';
import {
  DatosFormulario,
  EstadoCarga,
  TIPOS_PERSONA,
  MENSAJES_ERROR
} from './types/formulario.tipos';



const CrearTiendaPage = () => {
  const [datosFormulario, setDatosFormulario] = useState<DatosFormulario>({
    nombre: '',
    apellidos: '',
    correo: '',
    telefono: '',
    contrasena: '',
    confirmarContrasena: '',
    tipoPersona: '',
    nombreMarca: '',
    aceptaTerminos: false,
    aceptaCondiciones: false
  });

  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmarContrasena, setMostrarConfirmarContrasena] = useState(false);
  const [formularioValido, setFormularioValido] = useState(false);

  useEffect(() => {
    const esValido = 
      datosFormulario.nombre !== '' &&
      datosFormulario.apellidos !== '' &&
      datosFormulario.correo !== '' &&
      datosFormulario.telefono !== '' &&
      datosFormulario.contrasena !== '' &&
      datosFormulario.confirmarContrasena !== '' &&
      datosFormulario.contrasena === datosFormulario.confirmarContrasena &&
      datosFormulario.tipoPersona !== '' &&
      datosFormulario.nombreMarca !== '' &&
      datosFormulario.aceptaTerminos &&
      datosFormulario.aceptaCondiciones;
    
    setFormularioValido(esValido);
  }, [datosFormulario]);

  const manejarCambioCampo = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDatosFormulario(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const manejarCambioCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setDatosFormulario(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formularioValido) {
      try {
        // Aquí iría la lógica para crear la cuenta
        console.log('Cuenta creada', datosFormulario);
      } catch (error) {
        console.error('Error al crear la cuenta:', error);
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Columna Izquierda con Logo */}
      <div className="w-1/3 bg-white p-8">
        <div className="h-full flex flex-col">
         
          <div className="flex-grow flex items-center justify-center">
            <img 
              src="/images/spoon-logo.jpg
            " 
              alt="Spoon Icon" 
              className="max-w-[80%] h-auto"
            />
          </div>
        </div>
      </div>

      {/* Columna Derecha con Formulario */}
      <div className="w-2/3 bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header de navegación */}
          <div className="flex items-center justify-between mb-8">
            <button className="flex items-center text-gray-600 hover:text-gray-900">
              <ChevronLeft className="w-5 h-5 mr-2" />
              Crea tu cuenta
            </button>
            <a href="#" className="text-emerald-500 hover:text-emerald-600">
              ¿Tu negocio es un restaurante? Haz clic aquí
            </a>
          </div>

          {/* Banner de bienvenida */}
          <div className="bg-blue-50 p-4 rounded-lg mb-8">
            <div className="flex gap-4 items-center">
              <div className="flex-shrink-0">
                <img 
                  src="/images/spoon-logo.jpg" 
                  alt="Spoon" 
                  className="w-12 h-12"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  ¡Regístrate y empieza a vender!
                </h1>
                <p className="text-gray-600">
                 
                </p>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={manejarEnvio} className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Completa tus datos</h2>
            
            {/* Nombre y Apellidos */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                onChange={manejarCambioCampo}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <input
                type="text"
                name="apellidos"
                placeholder="Apellidos"
                onChange={manejarCambioCampo}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Correo electrónico */}
            <input
              type="email"
              name="correo"
              placeholder="Correo electrónico"
              onChange={manejarCambioCampo}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />

            {/* Teléfono con selector de país */}
            <div className="flex gap-2">
              <select className="px-3 py-2 border border-gray-300 rounded-lg bg-white">
                <option value="+57">🇨🇴 +57</option>
              </select>
              <input
                type="tel"
                name="telefono"
                placeholder="Teléfono"
                onChange={manejarCambioCampo}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <p className="text-sm text-gray-500">* El número debe estar habilitado para recibir mensajes en WhatsApp</p>

            {/* Contraseña */}
            <div className="relative">
              <input
                type={mostrarContrasena ? "text" : "password"}
                name="contrasena"
                placeholder="Contraseña"
                onChange={manejarCambioCampo}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setMostrarContrasena(!mostrarContrasena)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {mostrarContrasena ? 
                  <EyeOff className="w-5 h-5 text-gray-400" /> : 
                  <Eye className="w-5 h-5 text-gray-400" />
                }
              </button>
            </div>

            {/* Confirmar Contraseña */}
            <div className="relative">
              <input
                type={mostrarConfirmarContrasena ? "text" : "password"}
                name="confirmarContrasena"
                placeholder="Confirmar contraseña"
                onChange={manejarCambioCampo}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmarContrasena(!mostrarConfirmarContrasena)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {mostrarConfirmarContrasena ? 
                  <EyeOff className="w-5 h-5 text-gray-400" /> : 
                  <Eye className="w-5 h-5 text-gray-400" />
                }
              </button>
            </div>

            {/* Tipo de persona */}
            <div className="relative">
              <select
                name="tipoPersona"
                onChange={manejarCambioCampo}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
              >
                <option value="">Tipo de persona</option>
                {TIPOS_PERSONA.map(tipo => (
                  <option key={tipo.valor} value={tipo.valor}>
                    {tipo.etiqueta}
                  </option>
                ))}
              </select>
              <Info className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            {/* Nombre de marca */}
            <div className="relative">
              <input
                type="text"
                name="nombreMarca"
                placeholder="Nombre de tu marca"
                onChange={manejarCambioCampo}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <Info className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            {/* Términos y condiciones */}
            <div className="space-y-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="aceptaTerminos"
                  onChange={manejarCambioCheckbox}
                  className="mt-1 mr-2"
                />
                <span className="text-sm text-gray-600">
                  Acepto expresamente la autorización de{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    tratamiento de datos personales
                  </a>
                  {' '}y la Política de Tratamiento de Datos Personales de Spoon S.A.S.
                </span>
              </label>

              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="aceptaCondiciones"
                  onChange={manejarCambioCheckbox}
                  className="mt-1 mr-2"
                />
                <span className="text-sm text-gray-600">
                  Acepto expresamente las{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    condiciones de activación
                  </a>
                  {' '}de mi cuenta al interior de "Mi Tienda"
                </span>
              </label>
            </div>

            {/* Botón de crear cuenta */}
            <button
              type="submit"
              disabled={!formularioValido}
              className={`w-full py-3 rounded-lg transition-colors ${
                formularioValido
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Crear cuenta
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearTiendaPage;
