// src/services/postgres/usuarios-roles.service.ts
import { query } from '@/config/database';

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
  usuariosAsignados?: number; // Conteo de usuarios con este rol
}

// Interfaz simplificada - roles son solo del sistema

export interface UsuariosRolesData {
  usuarios: Usuario[];
  roles: Rol[]; // Roles del sistema (solo lectura)
}

/**
 * Obtener todos los usuarios con sus roles desde auth.users
 */
export async function obtenerUsuarios(): Promise<Usuario[]> {
  try {
    const result = await query(`
      SELECT 
        id,
        CONCAT(first_name, ' ', last_name) as nombre,
        email,
        role as rol,
        CASE WHEN status = 'active' THEN true ELSE false END as activo,
        created_at,
        updated_at
      FROM auth.users 
      ORDER BY created_at DESC
    `);

    return result.rows;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw new Error('Error al obtener usuarios de la base de datos');
  }
}

/**
 * Obtener todos los roles del ENUM (disponibles en el sistema)
 */
export async function obtenerTodosLosRolesEnum(): Promise<string[]> {
  try {
    const result = await query(`
      SELECT unnest(enum_range(NULL::auth_role_enum)) as role_name
    `);

    return result.rows.map(row => row.role_name);
  } catch (error) {
    console.error('Error al obtener roles del ENUM:', error);
    return ['super_admin', 'admin', 'owner', 'manager', 'staff', 'waiter', 'kitchen', 'cashier'];
  }
}

/**
 * Obtener descripción amigable para un rol
 */
function obtenerDescripcionRol(rol: string): string {
  const descripciones: Record<string, string> = {
    'super_admin': 'Administrador del sistema con acceso completo',
    'admin': 'Administrador con permisos de gestión avanzada',
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
 * Obtener todos los roles disponibles del sistema (SOLO LECTURA)
 * Con conteo de usuarios asignados a cada rol
 */
export async function obtenerRoles(): Promise<Rol[]> {
  try {
    const result = await query(`
      SELECT 
        role_name,
        COUNT(u.id) as usuarios_asignados
      FROM (
        SELECT unnest(enum_range(NULL::auth_role_enum)) as role_name
      ) all_roles
      LEFT JOIN auth.users u ON u.role = all_roles.role_name AND u.status = 'active'
      GROUP BY role_name
      ORDER BY 
        CASE role_name 
          WHEN 'super_admin' THEN 1 
          WHEN 'admin' THEN 2 
          WHEN 'owner' THEN 3 
          WHEN 'manager' THEN 4
          ELSE 5 
        END
    `);

    return result.rows.map(row => ({
      id: row.role_name,
      nombre: obtenerNombreAmigableRol(row.role_name),
      descripcion: obtenerDescripcionRol(row.role_name),
      permisos: [], // Los permisos son parte del sistema, no editables
      usuariosAsignados: parseInt(row.usuarios_asignados)
    }));
  } catch (error) {
    console.error('Error al obtener roles:', error);
    throw new Error('Error al obtener roles del sistema');
  }
}

/**
 * Obtener nombre amigable para mostrar en la interfaz
 */
function obtenerNombreAmigableRol(rol: string): string {
  const nombres: Record<string, string> = {
    'super_admin': 'Super Administrador',
    'admin': 'Administrador',
    'owner': 'Propietario',
    'manager': 'Gerente',
    'staff': 'Personal',
    'waiter': 'Mesero',
    'kitchen': 'Cocina',
    'cashier': 'Cajero'
  };

  return nombres[rol] || rol.charAt(0).toUpperCase() + rol.slice(1).replace('_', ' ');
}

// Las siguientes funciones se eliminaron porque los roles son SOLO LECTURA:
// - obtenerRolesDisponibles()
// - asegurarSuperAdminRestaurante() 
// - agregarRolRestaurante()
// - eliminarRolRestaurante()

/**
 * Los roles son SOLO LECTURA - no se pueden crear, editar o eliminar
 * Solo se pueden mostrar los roles disponibles del sistema
 */

/**
 * Obtener datos completos de usuarios y roles (simplificado)
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

    // Validar que el rol existe en el ENUM
    const rolesEnum = await obtenerTodosLosRolesEnum();
    if (!rolesEnum.includes(userData.rol)) {
      throw new Error(`El rol "${userData.rol}" no es válido`);
    }

    const result = await query(`
      INSERT INTO auth.users 
      (first_name, last_name, email, role, status, password_hash, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, CONCAT(first_name, ' ', last_name) as nombre, email, role as rol, 
                CASE WHEN status = 'active' THEN true ELSE false END as activo,
                created_at, updated_at
    `, [
      firstName,
      lastName,
      userData.email,
      userData.rol,
      userData.activo !== false ? 'active' : 'inactive',
      userData.password ? `hashed_${userData.password}` : 'temp_password_change_required',
      false
    ]);

    return result.rows[0];
  } catch (error: any) {
    console.error('Error al crear usuario:', error);
    
    if (error.code === '23505') {
      throw new Error('El email ya está registrado en el sistema');
    }
    
    if (error.code === '22P02') {
      throw new Error('El rol especificado no es válido');
    }
    
    throw new Error('Error al crear usuario en la base de datos');
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
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (userData.nombre) {
      const nombrePartes = userData.nombre.trim().split(' ');
      const firstName = nombrePartes[0];
      const lastName = nombrePartes.slice(1).join(' ') || '';
      
      updates.push(`first_name = $${paramCount++}`, `last_name = $${paramCount++}`);
      values.push(firstName, lastName);
    }

    if (userData.email) {
      updates.push(`email = $${paramCount++}`);
      values.push(userData.email);
    }

    if (userData.rol) {
      const rolesEnum = await obtenerTodosLosRolesEnum();
      if (!rolesEnum.includes(userData.rol)) {
        throw new Error(`El rol "${userData.rol}" no es válido`);
      }
      
      updates.push(`role = $${paramCount++}`);
      values.push(userData.rol);
    }

    if (userData.activo !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(userData.activo ? 'active' : 'inactive');
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(`
      UPDATE auth.users 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, CONCAT(first_name, ' ', last_name) as nombre, email, role as rol,
                CASE WHEN status = 'active' THEN true ELSE false END as activo,
                created_at, updated_at
    `, values);

    if (result.rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    return result.rows[0];
  } catch (error: any) {
    console.error('Error al actualizar usuario:', error);
    
    if (error.code === '23505') {
      throw new Error('El email ya está registrado en el sistema');
    }
    
    if (error.code === '22P02') {
      throw new Error('El rol especificado no es válido');
    }
    
    throw new Error('Error al actualizar usuario en la base de datos');
  }
}

/**
 * Eliminar un usuario
 */
export async function eliminarUsuario(id: string): Promise<void> {
  try {
    const result = await query(`
      DELETE FROM auth.users 
      WHERE id = $1
    `, [id]);

    if (result.rowCount === 0) {
      throw new Error('Usuario no encontrado');
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
    const result = await query(`
      UPDATE auth.users 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, CONCAT(first_name, ' ', last_name) as nombre, email, role as rol,
                CASE WHEN status = 'active' THEN true ELSE false END as activo,
                created_at, updated_at
    `, [activo ? 'active' : 'inactive', id]);

    if (result.rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);
    throw new Error('Error al cambiar estado del usuario');
  }
}