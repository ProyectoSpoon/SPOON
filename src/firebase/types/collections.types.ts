// src/firebase/types/collections.types.ts

export interface IAuthUser {
  uid: string;
  email: string;
  tipo: 'dueño' | 'empleado';
  estado: 'pendiente' | 'activo' | 'bloqueado';
  ultimoAcceso: Date;
  createdAt: Date;
  failedAttempts: number;
  lastFailedAttempt: Date | null;
  is2FAEnabled: boolean;
  phoneNumber?: string;
  emailVerified: boolean;
}

export interface IPerfil {
  id: string;
  authUserId: string;
  nombre: string;
  apellido: string;
  telefono: string;
  documento: {
    tipo: string;
    numero: string;
  };
  createdAt: Date;
}

export interface IRol {
  id: string;
  nombre: string;
  permisos: {
    menu: boolean;
    ventas: boolean;
    empleados: boolean;
    configuracion: boolean;
    reportes: boolean;
  };
  nivel: number;
  restricciones?: {
    schedule?: {
      start: string;
      end: string;
      days: string[];
    };
    modules?: {
      [module: string]: {
        maxRecords?: number;
        maxValue?: number;
        specifics?: any;
      };
    };
  };
  createdAt: Date;
}

export interface IEmpresa {
  id: string;
  perfilId: string;
  datosFiscales: {
    razonSocial: string;
    nit: string;
    regimenTributario: string;
    actividadEconomica: string;
  };
  documentosLegales: {
    rut: string;
    camaraComercio: string;
    otros?: string[];
  };
  estado: 'pendiente' | 'activo' | 'inactivo';
  createdAt: Date;
}

export interface ISucursal {
  id: string;
  empresaId: string;
  nombre: string;
  tipo: 'principal' | 'sucursal';
  contacto: {
    telefono: string;
    email: string;
    direccion: string;
    ciudad: string;
    coordenadas: {
      lat: number;
      lng: number;
    };
  };
  horario: {
    zonaHoraria: string;
    rangosSemana: {
      [dia: string]: {
        apertura: string;
        cierre: string;
      }[];
    };
  };
  estado: 'activo' | 'inactivo';
  createdAt: Date;
}

export interface IEmpleado {
  id: string;
  sucursalId: string;
  authUserId: string;
  rolId: string;
  datosLaborales: {
    cargo: string;
    fechaIngreso: Date;
    salario?: number;
    turno?: string;
  };
  estado: 'activo' | 'inactivo';
  createdAt: Date;
}

export interface ICategoriaMenu {
  id: string;
  sucursalId: string;
  nombre: string;
  tipo: 'entrada' | 'principio' | 'proteina' | 'acompanamiento' | 'bebida';
  orden: number;
  disponible: boolean;
  createdAt: Date;
}

export interface IProducto {
  id: string;
  sucursalId: string;
  categoriaId: string;
  currentVersion: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  precio: number;
  costo: number;
  etiquetas: string[];
  stock: {
    actual: number;
    minimo: number;
    unidad: string;
  };
  estado: 'disponible' | 'agotado' | 'inactivo';
  createdAt: Date;
  updatedAt: Date;
}

export interface ICombinacion {
  id: string;
  sucursalId: string;
  nombre: string;
  componentes: {
    entradaId: string;
    principioId: string;
    proteinaId: string;
    acompanamientoIds: string[];
    bebidaId: string;
  };
  precios: {
    base: number;
    venta: number;
  };
  disponible: boolean;
  destacado: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMenuDiario {
  id: string;
  sucursalId: string;
  fecha: string;
  combinaciones: {
    combinacionId: string;
    cantidad: number;
    precio: number;
    disponible: boolean;
    vendidos: number;
  }[];
  estado: 'borrador' | 'publicado' | 'finalizado';
  createdAt: Date;
  updatedBy: string;
}

export interface IProgramacionSemanal {
  id: string;
  sucursalId: string;
  semana: string;
  menus: {
    [dia: string]: {
      combinacionId: string;
      cantidad: number;
      precio: number;
    }[];
  };
  estado: 'borrador' | 'activo' | 'completado';
  createdAt: Date;
  updatedAt: Date;
}

export interface IVenta {
  id: string;
  sucursalId: string;
  empleadoId: string;
  numeroOrden: string;
  items: {
    tipo: 'combinacion' | 'producto';
    itemId: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }[];
  pagos: {
    metodo: 'efectivo' | 'tarjeta' | 'transferencia';
    monto: number;
    referencia?: string;
  }[];
  totales: {
    subtotal: number;
    impuestos: number;
    descuentos: number;
    total: number;
  };
  estado: 'pendiente' | 'pagado' | 'anulado';
  createdAt: Date;
}

export interface IEstadisticaDiaria {
  id: string;
  sucursalId: string;
  fecha: string;
  ventas: {
    total: number;
    ordenes: number;
    ticketPromedio: number;
    metodoPago: {
      efectivo: number;
      tarjeta: number;
      transferencia: number;
    };
  };
  productos: {
    productoId: string;
    cantidad: number;
    ingresos: number;
  }[];
  combinaciones: {
    combinacionId: string;
    cantidad: number;
    ingresos: number;
  }[];
  actualizadoAt: Date;
}

// Referencia a nombres de colecciones
export const COLLECTIONS = {
  // Colecciones existentes
  SESSIONS: 'sessions',
  DUENO_RESTAURANTE: 'dueno_restaurante',
  RESTAURANTES: 'Restaurantes',
  
  // Nuevas colecciones
  EMPRESAS: 'empresas',
  CONTACTOS_RESTAURANTE: 'contactos_restaurante',
  CONFIGURACION_RESTAURANTE: 'configuracion_restaurante',
  AUTH_USERS: 'auth_users',
  PERFILES: 'perfiles',
  ROLES: 'roles',
  CATEGORIAS_MENU: 'categorias_menu',
  PRODUCTOS: 'productos',
  PRECIOS_HISTORICOS: 'precios_historicos',
  COMBINACIONES: 'combinaciones',
  MENU_DIARIO: 'menu_diario',
  PROGRAMACION_SEMANAL: 'programacion_semanal',
  VENTAS: 'ventas',
  CAJA_DIARIA: 'caja_diaria',
  ESTADISTICAS_DIARIAS: 'estadisticas_diarias',
  AUDIT_LOGS: 'audit_logs'
} as const;

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];