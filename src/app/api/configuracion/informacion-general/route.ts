import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/test-data/configuracion/informacion-general.json');

/**
 * GET: Obtener la información general del restaurante
 */
export async function GET() {
  try {
    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'No se encontró el archivo de información general' },
        { status: 404 }
      );
    }

    // Leer el archivo
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error al leer la información general:', error);
    return NextResponse.json(
      { error: 'Error al leer la información general' },
      { status: 500 }
    );
  }
}

/**
 * POST: Guardar la información general del restaurante
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener los datos del request
    const data = await request.json();

    // Validar los datos
    if (!data.nombreRestaurante || !data.direccion || !data.telefono || !data.email) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
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
    console.error('Error al guardar la información general:', error);
    return NextResponse.json(
      { error: 'Error al guardar la información general' },
      { status: 500 }
    );
  }
}
