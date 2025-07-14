'use server'
import { NextRequest, NextResponse } from 'next/server';
import { crearUsuario, obtenerUsuarios } from '@/services/postgres/usuario.service';

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
    const data = await request.json();
    
    // Validación temporal omitida - desarrollo en progreso
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
