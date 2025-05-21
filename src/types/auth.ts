export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
  VIEWER = 'VIEWER'
}

export enum Permission {
  // Menú
  MENU_READ = 'menu:read',
  MENU_WRITE = 'menu:write',
  MENU_DELETE = 'menu:delete',
  
  // Pedidos
  ORDERS_READ = 'orders:read',
  ORDERS_WRITE = 'orders:write',
  ORDERS_DELETE = 'orders:delete',
  
  // Usuarios
  USERS_READ = 'users:read',
  USERS_WRITE = 'users:write',
  USERS_DELETE = 'users:delete',
  
  // Configuración
  SETTINGS_READ = 'settings:read',
  SETTINGS_WRITE = 'settings:write',
  
  // Reportes
  REPORTS_READ = 'reports:read',
  REPORTS_WRITE = 'reports:write'
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

export interface UserPermissions {
  uid: string;
  role: UserRole;
  customPermissions?: Permission[];
  restaurantId: string;
}

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.OWNER]: Object.values(Permission),
  [UserRole.ADMIN]: [
    Permission.MENU_READ, Permission.MENU_WRITE,
    Permission.ORDERS_READ, Permission.ORDERS_WRITE,
    Permission.USERS_READ, Permission.USERS_WRITE,
    Permission.SETTINGS_READ, Permission.REPORTS_READ
  ],
  [UserRole.MANAGER]: [
    Permission.MENU_READ,
    Permission.ORDERS_READ, Permission.ORDERS_WRITE,
    Permission.USERS_READ,
    Permission.SETTINGS_READ, Permission.REPORTS_READ
  ],
  [UserRole.STAFF]: [
    Permission.MENU_READ,
    Permission.ORDERS_READ, Permission.ORDERS_WRITE
  ],
  [UserRole.VIEWER]: [
    Permission.MENU_READ,
    Permission.ORDERS_READ,
    Permission.REPORTS_READ
  ]
};