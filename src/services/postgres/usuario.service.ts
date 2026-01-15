// src/services/postgres/usuario.service.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente con service role para operaciones administrativas
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Tipo para representar a un usuario en el sistema
export interface NuevoUsuario {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: 'super_admin' | 'restaurant_owner' | 'manager' | 'kitchen' | 'waiter' | 'customer';
  telefono?: string;
  restaurantId?: string;
}

// Tipo para representar a un usuario existente
export interface Usuario {
  uid: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'super_admin' | 'restaurant_owner' | 'manager' | 'kitchen' | 'waiter' | 'customer';
  telefono?: string;
  estado: 'active' | 'inactive' | 'pending' | 'suspended';
  fechaCreacion: Date;
  ultimoAcceso?: Date;
  restaurantId?: string;
}

/**
 * Crea un nuevo usuario en la base de datos usando Supabase SDK
 */
export async function crearUsuario(usuario: NuevoUsuario): Promise<Usuario> {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        first_name: usuario.nombre,
        last_name: usuario.apellido,
        email: usuario.email,
        role: usuario.rol,
        phone: usuario.telefono || null,
        is_active: true,
        restaurant_id: usuario.restaurantId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id, first_name, last_name, email, role, phone, is_active, restaurant_id, created_at, last_login')
      .single();

    if (error) {
      console.error('Error al crear usuario:', error);

      if (error.code === '23505') {
        throw new Error('El email ya está registrado en el sistema');
      }

      throw new Error('No se pudo crear el usuario');
    }

    return {
      uid: data.id,
      email: data.email,
      nombre: data.first_name,
      apellido: data.last_name,
      rol: data.role as any,
      telefono: data.phone || undefined,
      estado: data.is_active ? 'active' : 'inactive',
      fechaCreacion: new Date(data.created_at),
      ultimoAcceso: data.last_login ? new Date(data.last_login) : undefined,
      restaurantId: data.restaurant_id || undefined
    };
  } catch (error) {
    console.error('Error al crear usuario en Supabase:', error);
    throw error instanceof Error ? error : new Error('No se pudo crear el usuario');
  }
}

/**
 * Obtiene la lista de usuarios desde Supabase
 */
export async function obtenerUsuarios(): Promise<Usuario[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, first_name, last_name, email, role, phone, is_active, restaurant_id, created_at, last_login, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener usuarios:', error);
      throw new Error('No se pudieron obtener los usuarios');
    }

    return (data || []).map(user => ({
      uid: user.id,
      email: user.email,
      nombre: user.first_name,
      apellido: user.last_name,
      rol: user.role as any,
      telefono: user.phone || undefined,
      estado: user.is_active ? 'active' : 'inactive',
      fechaCreacion: new Date(user.created_at),
      ultimoAcceso: user.last_login ? new Date(user.last_login) : undefined,
      restaurantId: user.restaurant_id || undefined
    }));
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw new Error('No se pudieron obtener los usuarios');
  }
}

/**
 * Obtiene un usuario por su ID
 */
export async function obtenerUsuarioPorId(uid: string): Promise<Usuario | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, first_name, last_name, email, role, phone, is_active, restaurant_id, created_at, last_login')
      .eq('id', uid)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Usuario no encontrado
      }
      throw error;
    }

    return {
      uid: data.id,
      email: data.email,
      nombre: data.first_name,
      apellido: data.last_name,
      rol: data.role as any,
      telefono: data.phone || undefined,
      estado: data.is_active ? 'active' : 'inactive',
      fechaCreacion: new Date(data.created_at),
      ultimoAcceso: data.last_login ? new Date(data.last_login) : undefined,
      restaurantId: data.restaurant_id || undefined
    };
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error);
    throw new Error('No se pudo obtener el usuario');
  }
}

/**
 * Actualiza un usuario existente
 */
export async function actualizarUsuario(uid: string, datos: Partial<NuevoUsuario>): Promise<Usuario> {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (datos.nombre) updateData.first_name = datos.nombre;
    if (datos.apellido) updateData.last_name = datos.apellido;
    if (datos.email) updateData.email = datos.email;
    if (datos.rol) updateData.role = datos.rol;
    if (datos.telefono !== undefined) updateData.phone = datos.telefono;
    if (datos.restaurantId !== undefined) updateData.restaurant_id = datos.restaurantId;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', uid)
      .select('id, first_name, last_name, email, role, phone, is_active, restaurant_id, created_at, last_login')
      .single();

    if (error) {
      console.error('Error al actualizar usuario:', error);
      throw new Error('No se pudo actualizar el usuario');
    }

    return {
      uid: data.id,
      email: data.email,
      nombre: data.first_name,
      apellido: data.last_name,
      rol: data.role as any,
      telefono: data.phone || undefined,
      estado: data.is_active ? 'active' : 'inactive',
      fechaCreacion: new Date(data.created_at),
      ultimoAcceso: data.last_login ? new Date(data.last_login) : undefined,
      restaurantId: data.restaurant_id || undefined
    };
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error instanceof Error ? error : new Error('No se pudo actualizar el usuario');
  }
}
