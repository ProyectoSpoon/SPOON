// src/types/group-config.types.ts

// Mock interface for IEmpresa (to be replaced with actual Firebase types later)
interface IEmpresa {
  id: string;
  nombre: string;
  // Add other properties as needed
}

export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF'
}

export enum Permission {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  MANAGE = 'manage'
}

export interface TarjetaConfiguracion {
  id: string;
  titulo: string;
  descripcion: string;
  ruta: string;
  icono?: string;
  estado: 'no_iniciado' | 'incompleto' | 'completo';
  camposRequeridos: {
    id: string;
    nombre: string;
    completado: boolean;
  }[];
}

export interface ConfigTemplate {
  id: string;
  nombre: string;
  descripcion: string;
  version: string;
  campos: ConfigField[];
  heredaDe?: string;
}

export interface ConfigField {
  id: string;
  etiqueta: string;
  tipo: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
  requerido: boolean;
  valor: any;
  opciones?: { etiqueta: string; valor: any }[];
  validacion?: {
    min?: number;
    max?: number;
    patron?: string;
    personalizado?: (valor: any) => boolean;
  };
}

export interface ConfigSection {
  id: string;
  titulo: string;
  descripcion: string;
  orden: number;
  campos: ConfigField[];
  estado: 'pendiente' | 'incompleto' | 'completo';
  plantilla?: string;
}

export interface RestaurantConfig {
  id: string;
  empresaId: string;
  secciones: ConfigSection[];
  heredadoDe?: string;
  sobreescrituras: {
    [key: string]: {
      campoId: string;
      valor: any;
    };
  };
  metadata: {
    creadoEn: Date;
    actualizadoEn: Date;
    version: string;
  };
}

export interface GroupConfig {
  id: string;
  nombre: string;
  plantilla: ConfigTemplate;
  configPredeterminada: Partial<RestaurantConfig>;
  sobreescrituras: {
    [empresaId: string]: {
      [campoId: string]: any;
    };
  };
}

export interface ConfigurationState {
  progreso: number;
  tarjetas: TarjetaConfiguracion[];
  puedeAvanzar: boolean;
  templates: ConfigTemplate[];
  groupConfigs: GroupConfig[];
  restaurantConfigs: RestaurantConfig[];
  activeConfig: RestaurantConfig | null;
  loading: boolean;
  error: string | null;
}
