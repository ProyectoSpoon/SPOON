// Interfaz para los datos del formulario
export interface DatosFormulario {
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
  contrasena: string;
  confirmarContrasena: string;
  tipoPersona: string;
  nombreMarca: string;
  aceptaTerminos: boolean;
  aceptaCondiciones: boolean;
}

// Interfaz para los errores del formulario
export interface ErroresFormulario {
  nombre?: string;
  apellidos?: string;
  correo?: string;
  telefono?: string;
  contrasena?: string;
  confirmarContrasena?: string;
  tipoPersona?: string;
  nombreMarca?: string;
}

// Tipo para el estado de carga
export type EstadoCarga = 'inactivo' | 'cargando' | 'completado' | 'error';

// Interfaz para las opciones del selector de tipo de persona
export interface OpcionTipoPersona {
  valor: string;
  etiqueta: string;
  descripcion?: string;
}

// Interfaz para el país
export interface DatosPais {
  codigo: string;
  nombre: string;
  prefijo: string;
  bandera: string;
}

// Props para los componentes
export interface PropsSelectorPais {
  valorSeleccionado: string;
  alCambiar: (prefijo: string) => void;
  deshabilitado?: boolean;
}

export interface PropsCampoContrasena {
  nombre: string;
  valor: string;
  placeholder: string;
  alCambiar: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  deshabilitado?: boolean;
}

// Resultado del hook usarFormulario
export interface ResultadoFormulario {
  datos: DatosFormulario;
  errores: ErroresFormulario;
  esValido: boolean;
  estadoCarga: EstadoCarga;
  manejarCambio: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  manejarEnvio: (e: React.FormEvent) => Promise<void>;
  reiniciarFormulario: () => void;
}

// Constantes del formulario
export const TIPOS_PERSONA: OpcionTipoPersona[] = [
  {
    valor: 'natural',
    etiqueta: 'Persona Natural',
    descripcion: 'Persona física que ejerce derechos y cumple obligaciones a título personal'
  },
  {
    valor: 'juridica',
    etiqueta: 'Persona Jurídica',
    descripcion: 'Empresa o sociedad legalmente constituida'
  }
];

export const PAISES_DISPONIBLES: DatosPais[] = [
  { codigo: 'CO', nombre: 'Colombia', prefijo: '+57', bandera: '🇨🇴' },
  { codigo: 'MX', nombre: 'México', prefijo: '+52', bandera: '🇲🇽' },
  { codigo: 'PE', nombre: 'Perú', prefijo: '+51', bandera: '🇵🇪' },
  { codigo: 'CL', nombre: 'Chile', prefijo: '+56', bandera: '🇨🇱' },
  { codigo: 'AR', nombre: 'Argentina', prefijo: '+54', bandera: '🇦🇷' }
];

// Mensajes de error
export const MENSAJES_ERROR = {
  CAMPO_REQUERIDO: 'Este campo es requerido',
  EMAIL_INVALIDO: 'El correo electrónico no es válido',
  CONTRASENA_NO_COINCIDE: 'Las contraseñas no coinciden',
  CONTRASENA_DEBIL: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número',
  TELEFONO_INVALIDO: 'El número de teléfono no es válido',
  TERMINOS_REQUERIDOS: 'Debes aceptar los términos y condiciones',
  ERROR_SERVIDOR: 'Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente'
} as const;

// Expresiones regulares para validación
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  TELEFONO: /^\+?[0-9]{10,13}$/,
  CONTRASENA: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
} as const;
