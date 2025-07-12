// src/app/dashboard/configuracion/types/usuarios-roles.types.ts

/**
 * Tipos de roles disponibles en el sistema (basados en auth_role_enum)
 */
export type RoleSistema = 
  | 'super_admin' 
  | 'admin' 
  | 'owner' 
  | 'manager' 
  | 'staff' 
  | 'waiter' 
  | 'kitchen' 
  | 'cashier';

/**
 * Estados posibles de un usuario (basados en user_status_enum)
 */
export type EstadoUsuario = 
  | 'active' 
  | 'inactive' 
  | 'suspended' 
  | 'pending' 
  | 'locked';

/**
 * Interfaz para representar un usuario en el sistema
 */
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: RoleSistema;
  activo: boolean;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Interfaz para representar un rol con sus permisos (solo lectura)
 */
export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: string[];
  usuariosAsignados?: number; // Conteo de usuarios asignados a este rol
}

/**
 * Interfaz para representar un permiso del sistema
 */
export interface Permiso {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

/**
 * Interfaz para la respuesta completa de usuarios y roles (simplificada)
 */
export interface UsuariosRolesData {
  usuarios: Usuario[];
  roles: Rol[]; // Roles del sistema (solo lectura)
}

/**
 * Interfaz para crear un nuevo usuario
 */
export interface NuevoUsuario {
  nombre: string;
  email: string;
  rol: RoleSistema;
  password?: string;
  activo?: boolean;
}

/**
 * Interfaz para actualizar un usuario existente
 */
export interface ActualizarUsuario {
  id: string;
  nombre?: string;
  email?: string;
  rol?: RoleSistema;
  activo?: boolean;
}

/**
 * Interfaz para las operaciones CRUD de la API (solo usuarios, roles son solo lectura)
 */
export interface UsuarioApiRequest {
  action: 'crear_usuario' | 'actualizar_usuario' | 'eliminar_usuario' | 'cambiar_estado_usuario' | 'guardar_todos';
  data: any;
}

/**
 * Interfaz para las respuestas de la API
 */
export interface UsuarioApiResponse {
  success: boolean;
  message: string;
  usuario?: Usuario;
  error?: string;
  warning?: string;
}

/**
 * Interfaz para representar los datos de un usuario desde la base de datos PostgreSQL
 */
export interface UsuarioPostgreSQL {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: RoleSistema;
  status: EstadoUsuario;
  email_verified: boolean;
  phone?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Interfaz para los filtros de búsqueda de usuarios
 */
export interface FiltroUsuarios {
  busqueda?: string;
  rol?: RoleSistema;
  estado?: EstadoUsuario;
  fechaDesde?: Date;
  fechaHasta?: Date;
}

/**
 * Interfaz para las estadísticas de usuarios
 */
export interface EstadisticasUsuarios {
  total: number;
  activos: number;
  inactivos: number;
  porRol: Record<RoleSistema, number>;
  nuevosUltimoMes: number;
}

// NOTA: Los roles son SOLO LECTURA del sistema
// No se pueden crear, modificar o eliminar roles personalizados
// Solo se pueden asignar roles existentes del ENUM a los usuarios

/**
 * Tipo para las acciones que se pueden realizar sobre un usuario (roles son solo lectura)
 */
export type AccionUsuario = 
  | 'ver' 
  | 'editar' 
  | 'eliminar' 
  | 'activar' 
  | 'desactivar' 
  | 'cambiar_rol' 
  | 'resetear_password';

/**
 * Interfaz para el contexto de permisos del usuario actual (roles son solo lectura)
 */
export interface ContextoPermisos {
  usuarioActual: Usuario;
  puedeGestionarUsuarios: boolean;
  puedeCrearUsuarios: boolean;
  puedeEliminarUsuarios: boolean;
  puedeAsignarRoles: boolean; // Solo asignar roles existentes, no crear nuevos
  rolesPermitidos: RoleSistema[];
}

/**
 * Constantes para roles y sus descripciones
 */
export const DESCRIPCIONES_ROLES: Record<RoleSistema, string> = {
  super_admin: 'Administrador del sistema con acceso completo',
  admin: 'Administrador con permisos de gestión avanzada',
  owner: 'Propietario del restaurante',
  manager: 'Gerente con permisos de supervisión',
  staff: 'Personal con permisos básicos',
  waiter: 'Mesero con acceso a órdenes y clientes',
  kitchen: 'Cocina con acceso a preparación de alimentos',
  cashier: 'Cajero con acceso a facturación y pagos'
};

/**
 * Constantes para estados de usuario
 */
export const DESCRIPCIONES_ESTADOS: Record<EstadoUsuario, string> = {
  active: 'Usuario activo y operativo',
  inactive: 'Usuario inactivo temporalmente',
  suspended: 'Usuario suspendido por incumplimiento',
  pending: 'Usuario pendiente de activación',
  locked: 'Usuario bloqueado por seguridad'
};

/**
 * Jerarquía de roles (de mayor a menor privilegio)
 */
export const JERARQUIA_ROLES: RoleSistema[] = [
  'super_admin',
  'admin', 
  'owner',
  'manager',
  'staff',
  'waiter',
  'kitchen',
  'cashier'
];

/**
 * Permisos base por rol (esto se puede expandir según necesidades)
 */
export const PERMISOS_BASE_POR_ROL: Record<RoleSistema, string[]> = {
  super_admin: ['*'], // Todos los permisos
  admin: ['usuarios.gestionar', 'sistema.configurar', 'reportes.ver'],
  owner: ['restaurante.gestionar', 'usuarios.ver', 'reportes.ver'],
  manager: ['menu.gestionar', 'ordenes.gestionar', 'staff.supervisar'],
  staff: ['ordenes.ver', 'menu.ver'],
  waiter: ['ordenes.crear', 'ordenes.actualizar', 'clientes.atender'],
  kitchen: ['ordenes.cocinar', 'menu.preparar', 'inventario.usar'],
  cashier: ['pagos.procesar', 'facturas.generar', 'ordenes.cerrar']
};