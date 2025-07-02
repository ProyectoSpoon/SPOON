'use server'

import { NextRequest, NextResponse } from 'next/server';
import { crearUsuario, obtenerUsuarios } from '@/services/postgres/usuario.service';
import { NuevoUsuario } from '@/app/dashboard/usuarios/types/usuarios.types';

export async function GET() {
  try {
    const usuarios = await obtenerUsuarios();
    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { message: 'Error al obtener usuarios', error: String(error) }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as NuevoUsuario;
    
    // Validar datos mínimos
    if (!data.name || !data.apellido || !data.email || !data.password || !data.rol) {
      return NextResponse.json(
        { message: 'Datos incompletos' }, 
        { status: 400 }
      );
    }
    
    const usuario = await crearUsuario(data);
    return NextResponse.json(usuario);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json(
      { message: 'Error al crear usuario', error: String(error) }, 
      { status: 500 }
    );
  }
}
