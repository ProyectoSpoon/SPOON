'use client';

import { query } from '@/config/database';

// Tipo para representar a un usuario en el sistema
export interface NuevoUsuario {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: 'super_admin' | 'owner' | 'manager' | 'kitchen' | 'waiter' | 'customer';
  telefono?: string;
  restaurantId?: string;
}

// Tipo para representar a un usuario existente
export interface Usuario {
  uid: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'super_admin' | 'owner' | 'manager' | 'kitchen' | 'waiter' | 'customer';
  telefono?: string;
  estado: 'active' | 'inactive' | 'pending' | 'suspended';
  fechaCreacion: Date;
  ultimoAcceso?: Date;
  restaurantId?: string;
}

/**
 * Crea un nuevo usuario en la base de datos PostgreSQL
 */
export async function crearUsuario(usuario: NuevoUsuario): Promise<Usuario> {
  try {
    // Generar un UID único para el usuario
    const uid = `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Insertar el usuario en la base de datos
    const result = await query(
      `INSERT INTO usuarios (
        uid, email, nombre, apellido, rol, 
        telefono, estado, fecha_creacion, restaurant_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, $8)
      RETURNING *`,
      [
        uid,
        usuario.email,
        usuario.nombre,
        usuario.apellido,
        usuario.rol,
        usuario.telefono || null,
        'active',
        usuario.restaurantId || null
      ]
    );
    
    // Manejar las credenciales de autenticación por separado (seguridad)
    await query(
      `INSERT INTO auth_credenciales (
        uid, email, password_hash
      ) VALUES ($1, $2, $3)`,
      [
        uid,
        usuario.email,
        // En una implementación real, aquí se usaría bcrypt o similar para hashear la contraseña
        // Por ahora, usamos un hash simulado para demostración
        `hashed_${usuario.password}`
      ]
    );
    
    // Devolver el usuario creado
    return {
      uid,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: usuario.rol,
      telefono: usuario.telefono,
      estado: 'active',
      fechaCreacion: new Date(),
      restaurantId: usuario.restaurantId
    };
  } catch (error) {
    console.error('Error al crear usuario en PostgreSQL:', error);
    throw new Error('No se pudo crear el usuario. ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Obtiene la lista de usuarios desde PostgreSQL
 */
// Interfaz para las filas devueltas por la consulta SQL
interface UsuarioRow {
  uid: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
  telefono: string | null;
  estado: string;
  fechaCreacion: string; // Fecha en formato string que luego convertiremos a Date
  ultimoAcceso: string | null;
  restaurantId: string | null;
}

export async function obtenerUsuarios(): Promise<Usuario[]> {
  try {
    const result = await query(
      `SELECT uid, email, nombre, apellido, rol, telefono, 
              estado, fecha_creacion as "fechaCreacion", 
              ultimo_acceso as "ultimoAcceso", restaurant_id as "restaurantId"
       FROM usuarios
       ORDER BY fecha_creacion DESC`
    );
    
    return result.rows.map((row: UsuarioRow) => ({
      ...row,
      rol: row.rol as 'super_admin' | 'owner' | 'manager' | 'kitchen' | 'waiter' | 'customer',
      estado: row.estado as 'active' | 'inactive' | 'pending' | 'suspended',
      fechaCreacion: new Date(row.fechaCreacion),
      ultimoAcceso: row.ultimoAcceso ? new Date(row.ultimoAcceso) : undefined,
      restaurantId: row.restaurantId || undefined
    }));
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw new Error('No se pudieron obtener los usuarios');
  }
}
