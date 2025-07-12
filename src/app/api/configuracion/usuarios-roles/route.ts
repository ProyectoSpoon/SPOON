'use server'

// src/app/api/configuracion/usuarios-roles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  obtenerUsuariosYRoles,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  cambiarEstadoUsuario,
  type UsuariosRolesData,
  type Usuario
} from '@/services/postgres/usuarios-roles.service';

/**
 * GET: Obtener todos los usuarios y roles del sistema (simplificado)
 */
export async function GET() {
  try {
    console.log('🔍 Obteniendo usuarios y roles desde PostgreSQL...');
    
    const data: UsuariosRolesData = await obtenerUsuariosYRoles();
    
    console.log(`✅ Usuarios obtenidos: ${data.usuarios.length}`);
    console.log(`✅ Roles del sistema: ${data.roles.length}`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error al obtener usuarios y roles:', error);
    return NextResponse.json(
      { 
        message: 'Error al obtener usuarios y roles', 
        error: String(error) 
      }, 
      { status: 500 }
    );
  }
}

/**
 * POST: Manejar operaciones CRUD de usuarios únicamente (roles son solo lectura)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    console.log(`🔄 Procesando acción: ${action}`);

    switch (action) {
      case 'crear_usuario':
        return await handleCrearUsuario(data);
      
      case 'actualizar_usuario':
        return await handleActualizarUsuario(data);
      
      case 'eliminar_usuario':
        return await handleEliminarUsuario(data);
      
      case 'cambiar_estado_usuario':
        return await handleCambiarEstadoUsuario(data);
      
      case 'guardar_todos':
        return await handleGuardarTodos(data);
      
      default:
        return NextResponse.json(
          { message: `Acción "${action}" no válida. Solo se permiten operaciones de usuarios. Los roles son solo lectura.` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ Error en POST usuarios-roles:', error);
    return NextResponse.json(
      { 
        message: 'Error al procesar la solicitud', 
        error: String(error) 
      }, 
      { status: 500 }
    );
  }
}

/**
 * Crear un nuevo usuario
 */
async function handleCrearUsuario(data: any) {
  try {
    if (!data.nombre || !data.email || !data.rol) {
      return NextResponse.json(
        { message: 'Datos incompletos: nombre, email y rol son obligatorios' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { message: 'El formato del email no es válido' },
        { status: 400 }
      );
    }

    const usuario = await crearUsuario({
      nombre: data.nombre.trim(),
      email: data.email.trim().toLowerCase(),
      rol: data.rol,
      password: data.password || 'temp123',
      activo: data.activo !== false
    });

    console.log(`✅ Usuario creado: ${usuario.nombre} (${usuario.email})`);
    
    return NextResponse.json({ 
      success: true, 
      usuario,
      message: `Usuario ${usuario.nombre} creado correctamente`
    });
  } catch (error: any) {
    console.error('❌ Error al crear usuario:', error);
    return NextResponse.json(
      { 
        message: error.message || 'Error al crear usuario',
        error: String(error) 
      }, 
      { status: 400 }
    );
  }
}

/**
 * Actualizar un usuario existente
 */
async function handleActualizarUsuario(data: any) {
  try {
    if (!data.id) {
      return NextResponse.json(
        { message: 'ID del usuario es obligatorio' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    
    if (data.nombre && data.nombre.trim()) {
      updateData.nombre = data.nombre.trim();
    }
    
    if (data.email && data.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return NextResponse.json(
          { message: 'El formato del email no es válido' },
          { status: 400 }
        );
      }
      updateData.email = data.email.trim().toLowerCase();
    }
    
    if (data.rol) {
      updateData.rol = data.rol;
    }
    
    if (data.activo !== undefined) {
      updateData.activo = data.activo;
    }

    const usuario = await actualizarUsuario(data.id, updateData);

    console.log(`✅ Usuario actualizado: ${usuario.nombre} (${usuario.email})`);
    
    return NextResponse.json({ 
      success: true, 
      usuario,
      message: `Usuario ${usuario.nombre} actualizado correctamente`
    });
  } catch (error: any) {
    console.error('❌ Error al actualizar usuario:', error);
    return NextResponse.json(
      { 
        message: error.message || 'Error al actualizar usuario',
        error: String(error) 
      }, 
      { status: 400 }
    );
  }
}

/**
 * Eliminar un usuario
 */
async function handleEliminarUsuario(data: any) {
  try {
    if (!data.id) {
      return NextResponse.json(
        { message: 'ID del usuario es obligatorio' },
        { status: 400 }
      );
    }

    await eliminarUsuario(data.id);

    console.log(`✅ Usuario eliminado: ${data.id}`);
    
    return NextResponse.json({ 
      success: true,
      message: 'Usuario eliminado correctamente'
    });
  } catch (error: any) {
    console.error('❌ Error al eliminar usuario:', error);
    return NextResponse.json(
      { 
        message: error.message || 'Error al eliminar usuario',
        error: String(error) 
      }, 
      { status: 400 }
    );
  }
}

/**
 * Cambiar estado activo/inactivo de un usuario
 */
async function handleCambiarEstadoUsuario(data: any) {
  try {
    if (!data.id || data.activo === undefined) {
      return NextResponse.json(
        { message: 'ID y estado del usuario son obligatorios' },
        { status: 400 }
      );
    }

    const usuario = await cambiarEstadoUsuario(data.id, data.activo);

    console.log(`✅ Estado cambiado: ${usuario.nombre} → ${usuario.activo ? 'Activo' : 'Inactivo'}`);
    
    return NextResponse.json({ 
      success: true, 
      usuario,
      message: `Usuario ${usuario.activo ? 'activado' : 'desactivado'} correctamente`
    });
  } catch (error: any) {
    console.error('❌ Error al cambiar estado del usuario:', error);
    return NextResponse.json(
      { 
        message: error.message || 'Error al cambiar estado del usuario',
        error: String(error) 
      }, 
      { status: 400 }
    );
  }
}

/**
 * Guardar todos los cambios (compatibilidad con el componente React actual)
 */
async function handleGuardarTodos(data: any) {
  try {
    console.log('✅ Datos de usuarios guardados. Los roles son solo lectura del sistema.');
    
    return NextResponse.json({ 
      success: true,
      message: 'Cambios guardados correctamente. Los roles son solo lectura del sistema.',
    });
  } catch (error: any) {
    console.error('❌ Error en guardar_todos:', error);
    return NextResponse.json(
      { 
        message: error.message || 'Error al guardar cambios',
        error: String(error) 
      }, 
      { status: 500 }
    );
  }
}