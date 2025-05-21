/**
 * Representa los días de la semana disponibles para operación.
 * Se usa en configuración de horarios y programación semanal.
 */
export type Dia = 
  | 'lunes' 
  | 'martes' 
  | 'miercoles' 
  | 'jueves' 
  | 'viernes' 
  | 'sabado' 
  | 'domingo';

/**
 * Enumeración de las categorías disponibles en el menú.
 * Define la estructura básica de una combinación del menú.
 */
export enum CategoriaMenu {
  /** Platos de entrada, como sopas o ensaladas */
  ENTRADA = 'entrada',
  /** Platos principales que acompañan la proteína */
  PRINCIPIO = 'principio',
  /** Proteína principal del plato */
  PROTEINA = 'proteina',
  /** Acompañamientos adicionales */
  ACOMPANAMIENTO = 'acompanamiento',
  /** Bebidas incluidas o adicionales */
  BEBIDA = 'bebida'
}

/**
 * Define un rango horario para la operación.
 * Se usa tanto en horarios regulares como en excepciones.
 */
export interface RangoHorario {
  /** Hora de inicio en formato HH:mm */
  inicio: string;
  /** Hora de fin en formato HH:mm */
  fin: string;
}

/**
 * Define una excepción para fechas específicas en el horario.
 * Permite manejar días festivos, eventos especiales, etc.
 */
export interface FechaExcepcion {
  /** Fecha específica de la excepción */
  fecha: Date;
  /** Rangos horarios específicos para esta fecha, si es diferente al horario normal */
  rangos?: RangoHorario[];
  /** Indica si el establecimiento está cerrado en esta fecha */
  cerrado: boolean;
}

/**
 * Configura el horario de operación.
 * Se puede aplicar a nivel de restaurante o categoría específica.
 */
export interface Horario {
  /** Días de la semana en que aplica este horario */
  dias: Dia[];
  /** Rangos horarios para los días especificados */
  rangos: RangoHorario[];
  /** Lista de excepciones para fechas específicas */
  excepciones?: FechaExcepcion[];
  /** Estado del horario (activo/inactivo) */
  activo: boolean;
}

/**
 * Información nutricional detallada de un producto.
 * Todos los campos son opcionales para flexibilidad.
 */
export interface InformacionNutricional {
  /** Cantidad de calorías del producto */
  calorias?: number;
  /** Cantidad de proteínas en gramos */
  proteinas?: number;
  /** Cantidad de carbohidratos en gramos */
  carbohidratos?: number;
  /** Cantidad de grasas en gramos */
  grasas?: number;
  /** Cantidad de sodio en miligramos */
  sodio?: number;
  /** Cantidad de azúcares en gramos */
  azucares?: number;
}

/**
 * Define una opción configurable para un producto.
 * Permite personalización de productos con múltiples variantes.
 */
export interface OpcionProducto {
  /** Nombre de la opción (ej: "Tamaño", "Temperatura") */
  nombre: string;
  /** Indica si es obligatorio seleccionar esta opción */
  obligatorio: boolean;
  /** Indica si se pueden seleccionar múltiples valores */
  multiple: boolean;
  /** Cantidad mínima de opciones a seleccionar cuando es multiple */
  minSelecciones?: number;
  /** Cantidad máxima de opciones a seleccionar cuando es multiple */
  maxSelecciones?: number;
  /** Lista de opciones disponibles */
  opciones: {
    /** Identificador único de la opción */
    id: string;
    /** Nombre de la opción (ej: "Grande", "Caliente") */
    nombre: string;
    /** Precio adicional por esta opción */
    precio?: number;
    /** Indica si la opción está disponible actualmente */
    disponible: boolean;
  }[];
}

/**
 * Restricciones aplicables a un producto.
 * Importante para cumplimiento legal y seguridad alimentaria.
 */
export interface RestriccionesProducto {
  /** Edad mínima requerida para consumir el producto */
  edadMinima?: number;
  /** Lista de alérgenos presentes en el producto */
  alergenos?: string[];
}

/**
 * Configuración para las imágenes de productos.
 * Asegura consistencia en el manejo de imágenes.
 */
export interface ConfiguracionImagen {
  /** Tipos de archivo permitidos (ej: ['jpg', 'png']) */
  formatosPermitidos: string[];
  /** Tamaño máximo del archivo en bytes */
  tamanoMaximo: number;
  /** Dimensiones permitidas para la imagen */
  dimensiones: {
    /** Ancho máximo en píxeles */
    ancho: number;
    /** Alto máximo en píxeles */
    alto: number;
  };
}

/**
 * Representa un producto individual en el menú.
 * Base para construcción de combinaciones y ofertas.
 */
export interface Producto {
  /** Identificador único del producto */
  id: string;
  /** Nombre del producto */
  nombre: string;
  /** Descripción detallada del producto */
  descripcion: string;
  /** Precio base del producto */
  precio: number;
  /** Identificador de la categoría a la que pertenece */
  categoriaId: CategoriaMenu;
  /** URL de la imagen del producto */
  imagen?: string;
  /** Información nutricional detallada */
  informacionNutricional?: InformacionNutricional;
  /** Restricciones del producto */
  restricciones?: RestriccionesProducto;
  /** Opciones configurables del producto */
  opciones?: OpcionProducto[];
  /** Estado actual del producto */
  disponible?: boolean;
  /** Fecha de creación del registro */
  createdAt?: Date;
  /** Fecha de última actualización */
  updatedAt?: Date;
}

/**
 * Define una categoría del menú.
 * Agrupa productos relacionados y define su disponibilidad.
 */
export interface Categoria {
  /** Identificador único de la categoría */
  id: string;
  /** Nombre de la categoría */
  nombre: string;
  /** Horarios específicos de disponibilidad */
  horarios?: Horario;
  /** Lista de productos en esta categoría */
  productos: Producto[];
  /** ID del restaurante al que pertenece */
  restauranteId: string;
  /** Estado de la categoría */
  activo: boolean;
  /** Posición de la categoría en el menú */
  orden: number;
  /** Fecha de creación del registro */
  createdAt: Date;
  /** Fecha de última actualización */
  updatedAt: Date;
}

/**
 * Estructura para agrupar productos por categoría.
 * Utilizado en vistas y reportes.
 */
export interface ProductosPorCategoria {
  /** Índice dinámico que mapea categorías a sus productos */
  [key: string]: {
    /** Nombre de la categoría */
    nombre: string;
    /** Lista de productos en la categoría */
    productos: Producto[];
  };
}

/**
 * Define la programación de una combinación específica.
 * Usado en programación diaria y semanal.
 */
export interface ProgramacionCombinacion {
  /** Fecha de la programación */
  fecha: Date;
  /** Cantidad programada para la fecha */
  cantidadProgramada: number;
}

/**
 * Define una combinación completa del menú.
 * Representa un plato completo con todos sus componentes.
 */
export interface MenuCombinacion {
  /** Identificador único de la combinación */
  id: string;
  /** Plato de entrada */
  entrada: Producto;
  /** Plato principal */
  principio: Producto;
  /** Proteína del plato */
  proteina: Producto;
  /** Lista de acompañamientos */
  acompanamiento: Producto[];
  /** Bebida incluida */
  bebida: Producto;
  /** Indica si es un plato especial */
  especial?: boolean;
  /** Indica si es un favorito */
  favorito?: boolean;
  /** Cantidad disponible actualmente */
  cantidad?: number;
  /** Precio especial si aplica */
  precioEspecial?: number;
  /** Período de disponibilidad especial */
  disponibilidadEspecial?: {
    /** Fecha de inicio de disponibilidad */
    desde: Date;
    /** Fecha de fin de disponibilidad */
    hasta: Date;
  };
  /** Programaciones futuras */
  programacion?: ProgramacionCombinacion[];
}