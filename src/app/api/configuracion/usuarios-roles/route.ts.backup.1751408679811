import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/test-data/configuracion/usuarios-roles.json');

/**
 * GET: Obtener los usuarios y roles
 */
export async function GET() {
  try {
    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'No se encontró el archivo de usuarios y roles' },
        { status: 404 }
      );
    }

    // Leer el archivo
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error al leer los usuarios y roles:', error);
    return NextResponse.json(
      { error: 'Error al leer los usuarios y roles' },
      { status: 500 }
    );
  }
}

/**
 * POST: Guardar los usuarios y roles
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener los datos del request
    const data = await request.json();

    // Validar los datos
    if (!data.usuarios || !Array.isArray(data.usuarios) || !data.roles || !Array.isArray(data.roles)) {
      return NextResponse.json(
        { error: 'Formato de datos inválido' },
        { status: 400 }
      );
    }

    // Crear el directorio si no existe
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Guardar los datos en el archivo
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al guardar los usuarios y roles:', error);
    return NextResponse.json(
      { error: 'Error al guardar los usuarios y roles' },
      { status: 500 }
    );
  }
}
