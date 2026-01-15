// src/services/postgres/usuarios-roles.service.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente con service role para operaciones administrativas
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: string[];
  usuariosAsignados?: number;
}

export interface UsuariosRolesData {
  usuarios: Usuario[];
  roles: Rol[];
}

/**
 * Obtener todos los usuarios desde public.users
 */
export async function obtenerUsuarios(): Promise<Usuario[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, first_name, last_name, email, role, is_active, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener usuarios:', error);
      throw new Error('Error al obtener usuarios de la base de datos');
    }

    return (data || []).map(user => ({
      id: user.id,
      nombre: `${user.first_name} ${user.last_name}`.trim(),
      email: user.email,
      rol: user.role || 'staff',
      activo: user.is_active !== false,
      created_at: user.created_at ? new Date(user.created_at) : undefined,
      updated_at: user.updated_at ? new Date(user.updated_at) : undefined,
    }));
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw new Error('Error al obtener usuarios de la base de datos');
  }
}

/**
 * Obtener descripción amigable para un rol
 */
function obtenerDescripcionRol(rol: string): string {
  const descripciones: Record<string, string> = {
    'super_admin': 'Administrador del sistema con acceso completo',
    'admin': 'Administrador con permisos de gestión avanzada',
    'restaurant_owner': 'Propietario del restaurante',
    'owner': 'Propietario del restaurante',
    'manager': 'Gerente con permisos de supervisión',
    'staff': 'Personal con permisos básicos',
    'waiter': 'Mesero con acceso a órdenes y clientes',
    'kitchen': 'Cocina con acceso a preparación de alimentos',
    'cashier': 'Cajero con acceso a facturación y pagos'
  };

  return descripciones[rol] || 'Rol del sistema';
}

/**
 * Obtener nombre amigable para mostrar en la interfaz
 */
function obtenerNombreAmigableRol(rol: string): string {
  const nombres: Record<string, string> = {
    'super_admin': 'Super Administrador',
    'admin': 'Administrador',
    'restaurant_owner': 'Propietario',
    'owner': 'Propietario',
    'manager': 'Gerente',
    'staff': 'Personal',
    'waiter': 'Mesero',
    'kitchen': 'Cocina',
    'cashier': 'Cajero'
  };

  return nombres[rol] || rol.charAt(0).toUpperCase() + rol.slice(1).replace('_', ' ');
}

/**
 * Obtener todos los roles disponibles del sistema
 */
export async function obtenerRoles(): Promise<Rol[]> {
  try {
    // Roles predefinidos del sistema
    const rolesDisponibles = [
      'super_admin',
      'admin',
      'restaurant_owner',
      'manager',
      'staff',
      'waiter',
      'kitchen',
      'cashier'
    ];

    // Contar usuarios por rol
    const { data: usuarios } = await supabaseAdmin
      .from('users')
      .select('role, is_active')
      .eq('is_active', true);

    const conteoRoles: Record<string, number> = {};
    (usuarios || []).forEach(user => {
      const rol = user.role || 'staff';
      conteoRoles[rol] = (conteoRoles[rol] || 0) + 1;
    });

    return rolesDisponibles.map(rol => ({
      id: rol,
      nombre: obtenerNombreAmigableRol(rol),
      descripcion: obtenerDescripcionRol(rol),
      permisos: [],
      usuariosAsignados: conteoRoles[rol] || 0
    }));
  } catch (error) {
    console.error('Error al obtener roles:', error);
    throw new Error('Error al obtener roles del sistema');
  }
}

/**
 * Obtener datos completos de usuarios y roles
 */
export async function obtenerUsuariosYRoles(): Promise<UsuariosRolesData> {
  try {
    const [usuarios, roles] = await Promise.all([
      obtenerUsuarios(),
      obtenerRoles()
    ]);

    return {
      usuarios,
      roles
    };
  } catch (error) {
    console.error('Error al obtener usuarios y roles:', error);
    throw new Error('Error al obtener datos de usuarios y roles');
  }
}

/**
 * Crear un nuevo usuario
 */
export async function crearUsuario(userData: {
  nombre: string;
  email: string;
  rol: string;
  password?: string;
  activo?: boolean;
}): Promise<Usuario> {
  try {
    // Dividir el nombre en first_name y last_name
    const nombrePartes = userData.nombre.trim().split(' ');
    const firstName = nombrePartes[0];
    const lastName = nombrePartes.slice(1).join(' ') || '';

    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: userData.email,
        role: userData.rol,
        is_active: userData.activo !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id, first_name, last_name, email, role, is_active, created_at, updated_at')
      .single();

    if (error) {
      console.error('Error al crear usuario:', error);

      if (error.code === '23505') {
        throw new Error('El email ya está registrado en el sistema');
      }

      throw new Error('Error al crear usuario en la base de datos');
    }

    return {
      id: data.id,
      nombre: `${data.first_name} ${data.last_name}`.trim(),
      email: data.email,
      rol: data.role || 'staff',
      activo: data.is_active !== false,
      created_at: data.created_at ? new Date(data.created_at) : undefined,
      updated_at: data.updated_at ? new Date(data.updated_at) : undefined,
    };
  } catch (error: any) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
}

/**
 * Actualizar un usuario existente
 */
export async function actualizarUsuario(
  id: string,
  userData: Partial<{
    nombre: string;
    email: string;
    rol: string;
    activo: boolean;
  }>
): Promise<Usuario> {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (userData.nombre) {
      const nombrePartes = userData.nombre.trim().split(' ');
      updateData.first_name = nombrePartes[0];
      updateData.last_name = nombrePartes.slice(1).join(' ') || '';
    }

    if (userData.email) {
      updateData.email = userData.email;
    }

    if (userData.rol) {
      updateData.role = userData.rol;
    }

    if (userData.activo !== undefined) {
      updateData.is_active = userData.activo;
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, first_name, last_name, email, role, is_active, created_at, updated_at')
      .single();

    if (error) {
      console.error('Error al actualizar usuario:', error);

      if (error.code === '23505') {
        throw new Error('El email ya está registrado en el sistema');
      }

      throw new Error('Error al actualizar usuario en la base de datos');
    }

    if (!data) {
      throw new Error('Usuario no encontrado');
    }

    return {
      id: data.id,
      nombre: `${data.first_name} ${data.last_name}`.trim(),
      email: data.email,
      rol: data.role || 'staff',
      activo: data.is_active !== false,
      created_at: data.created_at ? new Date(data.created_at) : undefined,
      updated_at: data.updated_at ? new Date(data.updated_at) : undefined,
    };
  } catch (error: any) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
}

/**
 * Eliminar un usuario
 */
export async function eliminarUsuario(id: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar usuario:', error);
      throw new Error('Error al eliminar usuario de la base de datos');
    }
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw new Error('Error al eliminar usuario de la base de datos');
  }
}

/**
 * Cambiar estado activo/inactivo de un usuario
 */
export async function cambiarEstadoUsuario(id: string, activo: boolean): Promise<Usuario> {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        is_active: activo,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, first_name, last_name, email, role, is_active, created_at, updated_at')
      .single();

    if (error) {
      console.error('Error al cambiar estado del usuario:', error);
      throw new Error('Error al cambiar estado del usuario');
    }

    if (!data) {
      throw new Error('Usuario no encontrado');
    }

    return {
      id: data.id,
      nombre: `${data.first_name} ${data.last_name}`.trim(),
      email: data.email,
      rol: data.role || 'staff',
      activo: data.is_active !== false,
      created_at: data.created_at ? new Date(data.created_at) : undefined,
      updated_at: data.updated_at ? new Date(data.updated_at) : undefined,
    };
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);
    throw new Error('Error al cambiar estado del usuario');
  }
}
