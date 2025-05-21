/**
 * @fileoverview Constantes de colecciones de Firebase para el sistema Spoon.
 * @version 1.0.0
 * @description Define todas las colecciones disponibles en Firestore organizadas por categorías funcionales.
 */

/**
 * Constantes de las colecciones de Firebase.
 * Organiza todas las colecciones disponibles en el sistema agrupadas por su función principal.
 * @namespace
 * @readonly
 * @enum {string}
 * 
 * @property {Object} Colecciones Principales - Colecciones centrales del sistema
 * @property {string} RESTAURANTE - Información principal de los restaurantes
 * @property {string} DUENO_RESTAURANTE - Datos de los propietarios de restaurantes
 * @property {string} MENUS - Configuración de menús activos
 * @property {string} PLATOS - Catálogo de platos disponibles
 * @property {string} RESTAURANTES - Colección legacy de restaurantes
 * 
 * @property {Object} Componentes de Platos - Elementos que componen los platos
 * @property {string} ACOMPAÑAMIENTOS - Acompañamientos disponibles para los platos
 * @property {string} BEBIDA - Catálogo de bebidas disponibles
 * @property {string} ENTRADA - Catálogo de entradas disponibles
 * @property {string} PRINCIPIO - Catálogo de principios o bases
 * @property {string} PROTEINA - Catálogo de proteínas disponibles
 * 
 * @property {Object} Categorización - Colecciones para organización y clasificación
 * @property {string} CATEGORIA_MENU - Categorías disponibles en el menú
 * @property {string} TIPOS_COCINA - Clasificación de tipos de cocina
 * @property {string} TIPOS_COMIDA - Clasificación de tipos de comida
 * 
 * @property {Object} Usuarios y Experiencia - Colecciones relacionadas con usuarios
 * @property {string} COMENSAL - Información de usuarios comensales
 * @property {string} OPINIONES - Reseñas y calificaciones
 * @property {string} RECOMPENSAS - Sistema de recompensas y fidelización
 * 
 * @property {Object} Gestión y Soporte - Colecciones administrativas
 * @property {string} CENTRO_AYUDA - Sistema de tickets y soporte
 * @property {string} REPORTES - Reportes y análisis
 * @property {string} SESSIONS - Gestión de sesiones de usuario
 * 
 * @property {Object} Ubicación - Colecciones geográficas
 * @property {string} CIUDADES_REGIONES - Información de ubicaciones y regiones
 */
export const FIREBASE_COLLECTIONS = {
  // Colecciones principales
  /** @constant {string} Almacena la información principal de los restaurantes */
  RESTAURANTE: 'Restaurante',
  /** @constant {string} Contiene datos de propietarios y administradores */
  DUENO_RESTAURANTE: 'dueno_restaurante',
  /** @constant {string} Gestiona los menús activos y su configuración */
  MENUS: 'Menus',
  /** @constant {string} Catálogo completo de platos disponibles */
  PLATOS: 'Platos',
  /** @constant {string} Colección legacy mantenida por compatibilidad */
  RESTAURANTES: 'Restaurantes',
  
  // Componentes de platos
  /** @constant {string} Catálogo de acompañamientos disponibles */
  ACOMPAÑAMIENTOS: 'Acompañamientos',
  /** @constant {string} Registro de bebidas disponibles */
  BEBIDA: 'Bebida',
  /** @constant {string} Catálogo de entradas disponibles */
  ENTRADA: 'Entrada',
  /** @constant {string} Registro de principios o bases disponibles */
  PRINCIPIO: 'Principio',
  /** @constant {string} Catálogo de proteínas disponibles */
  PROTEINA: 'Proteina',
  
  // Categorización
  /** @constant {string} Define las categorías disponibles en el menú */
  CATEGORIA_MENU: 'Categoria_Menu',
  /** @constant {string} Clasifica los diferentes tipos de cocina */
  TIPOS_COCINA: 'Tipos de cocina',
  /** @constant {string} Categoriza los diferentes tipos de comida */
  TIPOS_COMIDA: 'Tipos de Comida',
  
  // Usuarios y experiencia
  /** @constant {string} Gestiona la información de usuarios comensales */
  COMENSAL: 'Comensal',
  /** @constant {string} Almacena reseñas y calificaciones */
  OPINIONES: 'Opiniones',
  /** @constant {string} Sistema de recompensas y fidelización */
  RECOMPENSAS: 'Recompensas',
  
  // Gestión y soporte
  /** @constant {string} Sistema de tickets y atención al cliente */
  CENTRO_AYUDA: 'Centro de Ayuda',
  /** @constant {string} Almacena reportes y análisis del sistema */
  REPORTES: 'Reportes',
  /** @constant {string} Gestiona las sesiones activas de usuarios */
  SESSIONS: 'sessions',
  
  // Ubicación
  /** @constant {string} Información geográfica y de cobertura */
  CIUDADES_REGIONES: 'Ciudades_Regiones'
} as const;

/**
 * Tipo que representa los nombres válidos de colecciones.
 * @typedef {typeof FIREBASE_COLLECTIONS[keyof typeof FIREBASE_COLLECTIONS]} CollectionName
 */
export type CollectionName = typeof FIREBASE_COLLECTIONS[keyof typeof FIREBASE_COLLECTIONS];

/**
 * Interfaz que define la estructura de un restaurante en el sistema.
 * @interface
 * @property {string} id - Identificador único del restaurante.
 * @property {string} nombre - Nombre comercial del restaurante.
 * @property {'casual' | 'formal' | 'rapida'} tipo - Tipo de servicio que ofrece el restaurante.
 * @property {string} especialidad - Especialidad culinaria principal del restaurante.
 * @property {number} capacidad - Número máximo de comensales que puede atender.
 * @property {'activo' | 'inactivo'} estado - Estado operativo actual del restaurante.
 * @property {string} duenoId - ID del propietario del restaurante (referencia a DuenoRestaurante).
 * @property {string[]} categorias - Lista de categorías a las que pertenece el restaurante.
 * @property {Object} ubicacion - Información de localización del restaurante.
 * @property {string} ubicacion.direccion - Dirección física del restaurante.
 * @property {string} ubicacion.ciudad - Ciudad donde se encuentra.
 * @property {string} ubicacion.region - Región o estado.
 * @property {Object} [ubicacion.coordenadas] - Coordenadas geográficas.
 * @property {number} [ubicacion.coordenadas.lat] - Latitud.
 * @property {number} [ubicacion.coordenadas.lng] - Longitud.
 * @property {Object} [horario] - Horarios de operación por día.
 * @property {Object} configuracion - Configuraciones generales del restaurante.
 * @property {string} configuracion.zonaHoraria - Zona horaria del restaurante.
 * @property {string} configuracion.moneda - Moneda utilizada.
 * @property {Object} configuracion.impuestos - Configuración de impuestos.
 * @property {number} configuracion.impuestos.iva - Porcentaje de IVA.
 * @property {number} [configuracion.impuestos.otros] - Otros impuestos aplicables.
 */

export interface IRestaurante {
  id: string;
  nombre: string;
  tipo: 'casual' | 'formal' | 'rapida';
  especialidad: string;
  capacidad: number;
  estado: 'activo' | 'inactivo';
  duenoId: string;
  categorias: string[];
  ubicacion: {
    direccion: string;
    ciudad: string;
    region: string;
    coordenadas?: {
      lat: number;
      lng: number;
    }
  };
  horario?: {
    [key: string]: {
      apertura: string;
      cierre: string;
    }
  };
  configuracion: {
    zonaHoraria: string;
    moneda: string;
    impuestos: {
      iva: number;
      otros?: number;
    }
  };
}

/**
 * Interfaz que define la estructura de un dueño de restaurante.
 * @interface
 * @property {string} id - Identificador único del dueño.
 * @property {string} nombre - Nombre(s) del dueño.
 * @property {string} apellido - Apellido(s) del dueño.
 * @property {string} email - Correo electrónico principal (único).
 * @property {string} telefono - Número de teléfono de contacto.
 * @property {string} RestauranteID - ID del restaurante que administra.
 * @property {boolean} emailVerified - Indica si el email ha sido verificado.
 * @property {boolean} is2FAEnabled - Indica si tiene habilitada la autenticación de dos factores.
 * @property {number} failedAttempts - Número de intentos fallidos de inicio de sesión.
 * @property {Date | null} lastFailedAttempt - Fecha y hora del último intento fallido.
 * @property {boolean} requiresAdditionalInfo - Indica si se requiere información adicional del dueño.
 * @property {Date} fechaRegistro - Fecha de registro en el sistema.
 * @property {'activo' | 'inactivo' | 'pendiente'} estado - Estado actual de la cuenta.
 */
export interface IDuenoRestaurante {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  RestauranteID: string;
  emailVerified: boolean;
  is2FAEnabled: boolean;
  failedAttempts: number;
  lastFailedAttempt: Date | null;
  requiresAdditionalInfo: boolean;
  fechaRegistro: Date;
  estado: 'activo' | 'inactivo' | 'pendiente';
}

/**
 * Interfaz que define la estructura de un plato en el menú.
 * @interface
 * @property {string} id - Identificador único del plato.
 * @property {string} nombre de plato - Nombre completo del plato.
 * @property {string} tipo de comida referencia - Referencia al tipo de comida al que pertenece.
 * @property {string} [EntradaId] - ID de la entrada asociada (opcional).
 * @property {string} [PrincipioId] - ID del principio asociado (opcional).
 * @property {string} [ProteinaId] - ID de la proteína asociada (opcional).
 * @property {string} [BebidaId] - ID de la bebida asociada (opcional).
 * @property {string} [AcompañamientosId] - ID del acompañamiento asociado (opcional).
 * @property {string[]} ingredientes - Lista de ingredientes utilizados.
 * @property {Object} [Valor Nutricional] - Información nutricional del plato.
 * @property {number} [Valor Nutricional.calorias] - Calorías totales.
 * @property {number} [Valor Nutricional.proteinas] - Gramos de proteínas.
 * @property {number} [Valor Nutricional.carbohidratos] - Gramos de carbohidratos.
 * @property {number} [Valor Nutricional.grasas] - Gramos de grasas.
 * @property {number} [calificación comida] - Calificación promedio del plato.
 * @property {Object[]} [reseñas] - Array de reseñas del plato.
 * @property {string} reseñas[].userId - ID del usuario que hizo la reseña.
 * @property {number} reseñas[].calificacion - Puntuación dada (1-5).
 * @property {string} [reseñas[].comentario] - Comentario de la reseña.
 * @property {Date} reseñas[].fecha - Fecha de la reseña.
 * @property {Object[]} [opciones] - Variaciones disponibles del plato.
 * @property {string} opciones[].nombre - Nombre de la variación.
 * @property {number} [opciones[].precio] - Precio adicional de la variación.
 * @property {boolean} opciones[].disponible - Disponibilidad de la variación.
 */
export interface IPlato {
  id: string;
  'nombre de plato': string;
  'tipo de comida referencia': string;
  EntradaId?: string;
  PrincipioId?: string;
  ProteinaId?: string;
  BebidaId?: string;
  AcompañamientosId?: string;
  ingredientes: string[];
  'Valor Nutricional'?: {
    calorias?: number;
    proteinas?: number;
    carbohidratos?: number;
    grasas?: number;
  };
  'calificación comida'?: number;
  reseñas?: {
    userId: string;
    calificacion: number;
    comentario?: string;
    fecha: Date;
  }[];
  opciones?: {
    nombre: string;
    precio?: number;
    disponible: boolean;
  }[];
}

/**
 * Interfaz que define la estructura del menú.
 * @interface
 * @property {string} id - Identificador único del menú.
 * @property {string} restauranteId - ID del restaurante al que pertenece.
 * @property {string} PlatosId - ID del plato incluido en el menú.
 * @property {string} CategoriamenuId - ID de la categoría del menú.
 * @property {number} precio - Precio del plato en el menú.
 * @property {boolean} activo - Indica si el menú está activo.
 * @property {Date} fecha - Fecha de vigencia del menú.
 * @property {string} Descripción de Plato - Descripción detallada del plato.
 * @property {string} [Imagen Plato] - URL de la imagen del plato.
 * @property {boolean} Especial del Día - Indica si es el plato especial del día.
 * @property {boolean} Recomendado del Día - Indica si es un plato recomendado.
 * @property {boolean} Disponibilidad - Indica si el plato está disponible.
 * @property {string} Categoría - Categoría principal del plato.
 * @property {string} tipo - Tipo de plato.
 * @property {string[]} categorías - Lista de categorías adicionales.
 */
export interface IMenu {
  id: string;
  restauranteId: string;
  PlatosId: string;
  CategoriamenuId: string;
  precio: number;
  activo: boolean;
  fecha: Date;
  'Descripción de Plato': string;
  'Imagen Plato'?: string;
  'Especial del Día': boolean;
  'Recomendado del Día': boolean;
  Disponibilidad: boolean;
  Categoría: string;
  tipo: string;
  categorías: string[];
}

/**
 * Interfaz que define la estructura de una bebida.
 * @interface
 * @property {string} id - Identificador único de la bebida.
 * @property {string} Tipo de Bebida - Clasificación de la bebida (ej: 'gaseosa', 'jugo natural', 'café').
 * @property {string} Descripción - Descripción detallada de la bebida.
 */
export interface IBebida {
  id: string;
  'Tipo de Bebida': string;
  Descripción: string;
}

/**
 * Interfaz que define la estructura de una entrada.
 * @interface
 * @property {string} id - Identificador único de la entrada.
 * @property {string} Entrada - Nombre de la entrada.
 * @property {string} Descripción - Descripción detallada de la entrada.
 */
export interface IEntrada {
  id: string;
  Entrada: string;
  Descripción: string;
}

/**
 * Interfaz que define la estructura de un principio.
 * @interface
 * @property {string} id - Identificador único del principio.
 * @property {string} Principio - Nombre del principio o acompañamiento base.
 * @property {string} Descripción - Descripción detallada del principio.
 */
export interface IPrincipio {
  id: string;
  Principio: string;
  Descripción: string;
}

/**
 * Interfaz que define la estructura de una proteína.
 * @interface
 * @property {string} id - Identificador único de la proteína.
 * @property {string} Tipo de Proteína - Clasificación de la proteína (ej: 'res', 'pollo', 'pescado').
 * @property {string} Descripción - Descripción detallada de la proteína.
 */
export interface IProteina {
  id: string;
  'Tipo de Proteína': string;
  Descripción: string;
}

/**
 * Interfaz que define la estructura de un comensal (usuario cliente).
 * @interface
 * @property {string} id - Identificador único del comensal.
 * @property {string} Nombre - Nombre completo del comensal.
 * @property {Object} Datos Personales - Información personal del comensal.
 * @property {string} Datos Personales.email - Correo electrónico del comensal.
 * @property {string} [Datos Personales.telefono] - Número de teléfono opcional.
 * @property {string} [Datos Personales.direccion] - Dirección de entrega opcional.
 * @property {string[]} [Fotos de Usuario] - Array de URLs de fotos del usuario.
 * @property {string[]} [Códigos Promocionales] - Códigos promocionales disponibles.
 * @property {number} Puntos Fidelidad - Puntos acumulados en el programa de fidelidad.
 * @property {string[]} [Favoritos] - Array de IDs de platos favoritos.
 * @property {Object[]} [Comentarios] - Historial de comentarios realizados.
 * @property {string} Comentarios[].platoId - ID del plato comentado.
 * @property {string} Comentarios[].texto - Texto del comentario.
 * @property {Date} Comentarios[].fecha - Fecha del comentario.
 * @property {Object[]} [Opiniones] - Historial de calificaciones realizadas.
 * @property {string} Opiniones[].platoId - ID del plato calificado.
 * @property {number} Opiniones[].calificacion - Puntuación otorgada.
 * @property {Date} Opiniones[].fecha - Fecha de la calificación.
 */
export interface IComensal {
  id: string;
  Nombre: string;
  'Datos Personales': {
    email: string;
    telefono?: string;
    direccion?: string;
  };
  'Fotos de Usuario'?: string[];
  'Códigos Promocionales'?: string[];
  'Puntos Fidelidad': number;
  Favoritos?: string[];
  Comentarios?: {
    platoId: string;
    texto: string;
    fecha: Date;
  }[];
  Opiniones?: {
    platoId: string;
    calificacion: number;
    fecha: Date;
  }[];
}

/**
 * Interfaz que define la estructura de un acompañamiento.
 * @interface
 * @property {string} id - Identificador único del acompañamiento.
 * @property {string} nombre - Nombre del acompañamiento.
 * @property {string} descripcion - Descripción detallada del acompañamiento.
 * @property {string} tipo - Clasificación del tipo de acompañamiento.
 * @property {boolean} disponible - Estado de disponibilidad.
 * @property {number} [tiempoPreparacion] - Tiempo estimado de preparación en minutos.
 * @property {string[]} [alergenos] - Lista de alérgenos presentes.
 * @property {Object} [nutricion] - Información nutricional detallada.
 * @property {number} nutricion.calorias - Calorías por porción.
 * @property {number} nutricion.proteinas - Gramos de proteínas.
 * @property {number} nutricion.carbohidratos - Gramos de carbohidratos.
 * @property {number} nutricion.grasas - Gramos de grasas.
 */
export interface IAcompañamiento {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  disponible: boolean;
  tiempoPreparacion?: number;
  alergenos?: string[];
  nutricion?: {
    calorias: number;
    proteinas: number;
    carbohidratos: number;
    grasas: number;
  };
}

/**
 * Interfaz que define la estructura de una categoría del menú.
 * @interface
 * @property {string} id - Identificador único de la categoría.
 * @property {string} nombre - Nombre de la categoría.
 * @property {string} descripcion - Descripción detallada de la categoría.
 * @property {number} orden - Número que determina el orden de visualización en el menú.
 * @property {boolean} activa - Estado de activación de la categoría.
 * @property {string} [imagen] - URL de la imagen representativa de la categoría.
 * @property {Object} [horarioDisponible] - Configuración de disponibilidad horaria.
 * @property {string} horarioDisponible.inicio - Hora de inicio (formato HH:mm).
 * @property {string} horarioDisponible.fin - Hora de fin (formato HH:mm).
 * @property {string[]} horarioDisponible.dias - Días de la semana aplicables.
 * @property {string[]} [subcategorias] - IDs de las subcategorías relacionadas.
 * @property {string[]} [etiquetas] - Etiquetas para filtrado y búsqueda.
 */
export interface ICategoriaMenu {
  id: string;
  nombre: string;
  descripcion: string;
  orden: number;
  activa: boolean;
  imagen?: string;
  horarioDisponible?: {
    inicio: string;
    fin: string;
    dias: string[];
  };
  subcategorias?: string[];
  etiquetas?: string[];
}

/**
 * Interfaz que define la estructura de una opinión o reseña.
 * @interface
 * @property {string} id - Identificador único de la opinión.
 * @property {string} platoId - ID del plato reseñado.
 * @property {string} comensalId - ID del comensal que realizó la reseña.
 * @property {string} restauranteId - ID del restaurante.
 * @property {number} calificacion - Puntuación de 1 a 5 estrellas.
 * @property {string} [comentario] - Texto de la reseña.
 * @property {Date} fecha - Fecha y hora de la reseña.
 * @property {string[]} [imagenes] - URLs de imágenes adjuntas.
 * @property {Object} [respuesta] - Respuesta del restaurante a la reseña.
 * @property {string} respuesta.texto - Contenido de la respuesta.
 * @property {Date} respuesta.fecha - Fecha de la respuesta.
 * @property {string} respuesta.autorId - ID del personal que respondió.
 * @property {string[]} [etiquetas] - Categorías de la reseña.
 * @property {boolean} verificado - Indica si la reseña es de una compra verificada.
 * @property {number} likes - Número de "me gusta" recibidos.
 * @property {'publicado' | 'pendiente' | 'reportado'} estado - Estado de la reseña.
 */
export interface IOpiniones {
  id: string;
  platoId: string;
  comensalId: string;
  restauranteId: string;
  calificacion: number;
  comentario?: string;
  fecha: Date;
  imagenes?: string[];
  respuesta?: {
    texto: string;
    fecha: Date;
    autorId: string;
  };
  etiquetas?: string[];
  verificado: boolean;
  likes: number;
  estado: 'publicado' | 'pendiente' | 'reportado';
}

/**
 * Interfaz que define la estructura de una recompensa.
 * @interface
 * @property {string} id - Identificador único de la recompensa.
 * @property {string} nombre - Nombre de la recompensa.
 * @property {string} descripcion - Descripción detallada de la recompensa.
 * @property {'descuento' | 'producto' | 'puntos' | 'especial'} tipo - Tipo de recompensa.
 * @property {number} valor - Valor de la recompensa (monto descuento, puntos, etc.).
 * @property {Object} condiciones - Requisitos para obtener la recompensa.
 * @property {number} [condiciones.puntosNecesarios] - Puntos requeridos para canjear.
 * @property {number} [condiciones.visitasNecesarias] - Número de visitas requeridas.
 * @property {number} [condiciones.montoMinimo] - Monto mínimo de compra.
 * @property {Date} condiciones.fechaInicio - Fecha de inicio de la promoción.
 * @property {Date} condiciones.fechaFin - Fecha de finalización.
 * @property {string[]} [condiciones.diasDisponibles] - Días en que aplica.
 * @property {string[]} [condiciones.platosAplicables] - IDs de platos incluidos.
 * @property {string[]} [condiciones.restricciones] - Restricciones adicionales.
 * @property {'activa' | 'inactiva' | 'agotada'} estado - Estado de la recompensa.
 * @property {number} [cantidadDisponible] - Stock disponible.
 * @property {number} usosPorUsuario - Límite de usos por usuario.
 * @property {string} restauranteId - ID del restaurante que ofrece la recompensa.
 */
export interface IRecompensas {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: 'descuento' | 'producto' | 'puntos' | 'especial';
  valor: number;
  condiciones: {
    puntosNecesarios?: number;
    visitasNecesarias?: number;
    montoMinimo?: number;
    fechaInicio: Date;
    fechaFin: Date;
    diasDisponibles?: string[];
    platosAplicables?: string[];
    restricciones?: string[];
  };
  estado: 'activa' | 'inactiva' | 'agotada';
  cantidadDisponible?: number;
  usosPorUsuario: number;
  restauranteId: string;
}

/**
 * Interfaz que define la estructura de reportes del sistema.
 * @interface
 * @property {string} id - Identificador único del reporte.
 * @property {string} restauranteId - ID del restaurante relacionado.
 * @property {'ventas' | 'inventario' | 'clientes' | 'empleados' | 'financiero'} tipo - Tipo de reporte.
 * @property {Object} periodo - Rango de fechas del reporte.
 * @property {Date} periodo.inicio - Fecha de inicio del período.
 * @property {Date} periodo.fin - Fecha de fin del período.
 * @property {Object} datos - Datos y métricas del reporte.
 * @property {Object} datos.metricas - Métricas numéricas clave-valor.
 * @property {Object} datos.tendencias - Arrays de valores para análisis de tendencias.
 * @property {Object} datos.comparativas - Comparaciones con períodos anteriores.
 * @property {Object} resumen - Conclusiones y recomendaciones del reporte.
 * @property {string[]} resumen.conclusiones - Lista de conclusiones principales.
 * @property {string[]} resumen.recomendaciones - Lista de recomendaciones.
 * @property {string} generadoPor - ID del usuario que generó el reporte.
 * @property {Date} fechaGeneracion - Fecha y hora de generación.
 * @property {'borrador' | 'finalizado'} estado - Estado del reporte.
 */
export interface IReportes {
  id: string;
  restauranteId: string;
  tipo: 'ventas' | 'inventario' | 'clientes' | 'empleados' | 'financiero';
  periodo: {
    inicio: Date;
    fin: Date;
  };
  datos: {
    metricas: {
      [key: string]: number;
    };
    tendencias: {
      [key: string]: number[];
    };
    comparativas: {
      [key: string]: {
        actual: number;
        anterior: number;
        variacion: number;
      };
    };
  };
  resumen: {
    conclusiones: string[];
    recomendaciones: string[];
  };
  generadoPor: string;
  fechaGeneracion: Date;
  estado: 'borrador' | 'finalizado';
}

/**
 * Interfaz que define la estructura de tipos de cocina.
 * @interface
 * @property {string} id - Identificador único del tipo de cocina.
 * @property {string} nombre - Nombre del tipo de cocina.
 * @property {string} descripcion - Descripción detallada del tipo de cocina.
 * @property {string} [pais] - País de origen de la cocina.
 * @property {string} [region] - Región específica de origen.
 * @property {string[]} caracteristicas - Características distintivas.
 * @property {string[]} ingredientesPrincipales - Ingredientes típicos.
 * @property {string[]} tecnicasComunes - Técnicas de cocina características.
 * @property {string[]} platosRepresentativos - Platos emblemáticos.
 * @property {string} [imagen] - URL de imagen representativa.
 * @property {'basico' | 'intermedio' | 'avanzado'} nivel - Nivel de complejidad.
 * @property {number} tiempoPreparacionPromedio - Tiempo promedio en minutos.
 * @property {number} complejidad - Nivel de dificultad (1-5).
 * @property {Object} [restricciones] - Restricciones alimentarias.
 * @property {string[]} [restricciones.alergenos] - Alérgenos comunes.
 * @property {string[]} [restricciones.dietas] - Dietas compatibles/incompatibles.
 */
export interface ITiposCocina {
  id: string;
  nombre: string;
  descripcion: string;
  pais?: string;
  region?: string;
  caracteristicas: string[];
  ingredientesPrincipales: string[];
  tecnicasComunes: string[];
  platosRepresentativos: string[];
  imagen?: string;
  nivel: 'basico' | 'intermedio' | 'avanzado';
  tiempoPreparacionPromedio: number;
  complejidad: number;
  restricciones?: {
    alergenos?: string[];
    dietas?: string[];
  };
}

/**
 * Interfaz que define la estructura de ciudades y regiones.
 * @interface
 * @property {string} id - Identificador único de la ubicación.
 * @property {string} País - Nombre del país.
 * @property {string} Nombre-Región - Nombre de la región o estado.
 * @property {string} Nombre-Ciudad - Nombre de la ciudad.
 * @property {Object} [coordenadas] - Coordenadas geográficas.
 * @property {number} coordenadas.lat - Latitud.
 * @property {number} coordenadas.lng - Longitud.
 * @property {string} zonaHoraria - Zona horaria de la ubicación.
 * @property {Object} [restriccionesEntrega] - Configuración de entregas.
 * @property {number} restriccionesEntrega.radio - Radio de entrega en km.
 * @property {number} restriccionesEntrega.tiempoEstimado - Tiempo estimado en minutos.
 * @property {number} restriccionesEntrega.costoMinimo - Costo mínimo de pedido.
 * @property {Object} [datosLogisticos] - Información logística adicional.
 * @property {string[]} datosLogisticos.zonasCobertura - Zonas de cobertura.
 * @property {Object} datosLogisticos.tiemposPromedio - Tiempos por zona.
 * @property {Object} [datosLogisticos.restriccionesHorario] - Horarios de entrega.
 */
export interface ICiudadesRegiones {
  id: string;
  País: string;
  'Nombre-Región': string;
  'Nombre-Ciudad': string;
  coordenadas?: {
    lat: number;
    lng: number;
  };
  zonaHoraria: string;
  restriccionesEntrega?: {
    radio: number;
    tiempoEstimado: number;
    costoMinimo: number;
  };
  datosLogisticos?: {
    zonasCobertura: string[];
    tiemposPromedio: {
      [zona: string]: number;
    };
    restriccionesHorario?: {
      inicio: string;
      fin: string;
      dias: string[];
    };
  };
}

/**
 * Interfaz que define la estructura del centro de ayuda.
 * @interface
 * @property {string} id - Identificador único del ticket.
 * @property {string} Usuario - ID del usuario que creó el ticket.
 * @property {string} Descripción - Descripción general del problema.
 * @property {string} Consulta - Detalle de la consulta.
 * @property {string} Referencia - ID de referencia relacionada.
 * @property {'pendiente' | 'en_proceso' | 'resuelto' | 'cerrado'} Estado - Estado actual del ticket.
 * @property {'baja' | 'media' | 'alta' | 'urgente'} prioridad - Nivel de prioridad.
 * @property {string} categoria - Categoría de la consulta.
 * @property {string} [subcategoria] - Subcategoría específica.
 * @property {Object[]} conversacion - Historial de mensajes.
 * @property {Date} conversacion[].fecha - Fecha del mensaje.
 * @property {string} conversacion[].mensaje - Contenido del mensaje.
 * @property {string} conversacion[].autor - ID del autor.
 * @property {'usuario' | 'soporte'} conversacion[].tipo - Tipo de mensaje.
 * @property {string[]} [conversacion[].adjuntos] - Archivos adjuntos.
 * @property {string} [asignadoA] - ID del agente asignado.
 * @property {Date} fechaCreacion - Fecha de creación del ticket.
 * @property {Date} fechaActualizacion - Última actualización.
 * @property {Date} [fechaCierre] - Fecha de cierre.
 * @property {Object} [calificacion] - Calificación del servicio.
 * @property {Object} [seguimiento] - Información de seguimiento.
 */
export interface ICentroAyuda {
  id: string;
  Usuario: string;
  Descripción: string;
  Consulta: string;
  Referencia: string;
  Estado: 'pendiente' | 'en_proceso' | 'resuelto' | 'cerrado';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  categoria: string;
  subcategoria?: string;
  conversacion: {
    fecha: Date;
    mensaje: string;
    autor: string;
    tipo: 'usuario' | 'soporte';
    adjuntos?: string[];
  }[];
  asignadoA?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  fechaCierre?: Date;
  calificacion?: {
    puntuacion: number;
    comentario?: string;
  };
  seguimiento?: {
    requiereSeguimiento: boolean;
    fechaSeguimiento?: Date;
    notas?: string;
  };
}