// Types for user management in the dashboard

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  rol: 'super_admin' | 'owner' | 'manager' | 'kitchen' | 'waiter' | 'customer';
  estado: 'active' | 'inactive' | 'pending' | 'suspended';
  emailVerified: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  ultimoAcceso?: Date;
  restaurantId?: string;
}

export interface NuevoUsuario {
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  rol: 'super_admin' | 'owner' | 'manager' | 'kitchen' | 'waiter' | 'customer';
  password: string;
  restaurantId?: string;
}

export interface ActualizarUsuario {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  rol?: 'super_admin' | 'owner' | 'manager' | 'kitchen' | 'waiter' | 'customer';
  estado?: 'active' | 'inactive' | 'pending' | 'suspended';
  restaurantId?: string;
}

export interface FiltrosUsuario {
  rol?: string;
  estado?: string;
  restaurantId?: string;
  busqueda?: string;
  page?: number;
  limit?: number;
}

export interface RespuestaUsuarios {
  usuarios: Usuario[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PermisoUsuario {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
}

export interface RolUsuario {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: PermisoUsuario[];
}

export interface SesionUsuario {
  id: string;
  userId: string;
  token: string;
  fechaCreacion: Date;
  fechaExpiracion: Date;
  activa: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export interface EstadisticasUsuarios {
  totalUsuarios: number;
  usuariosActivos: number;
  usuariosInactivos: number;
  usuariosPendientes: number;
  usuariosSuspendidos: number;
  usuariosPorRol: {
    [key: string]: number;
  };
  registrosRecientes: number;
  ultimosAccesos: number;
}

// Form validation types
export interface ErroresFormularioUsuario {
  email?: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  password?: string;
  rol?: string;
  general?: string;
}

export interface ConfiguracionUsuario {
  notificacionesEmail: boolean;
  notificacionesPush: boolean;
  idioma: 'es' | 'en';
  zonaHoraria: string;
  temaOscuro: boolean;
}

// API Response types
export interface RespuestaAPI<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: ErroresFormularioUsuario;
}

export interface PaginacionAPI {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface RespuestaPaginada<T> extends RespuestaAPI<T[]> {
  pagination: PaginacionAPI;
}
