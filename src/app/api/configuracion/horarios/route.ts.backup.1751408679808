import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/test-data/configuracion/horarios.json');

/**
 * GET: Obtener los horarios del restaurante
 */
export async function GET() {
  try {
    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'No se encontró el archivo de horarios' },
        { status: 404 }
      );
    }

    // Leer el archivo
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error al leer los horarios:', error);
    return NextResponse.json(
      { error: 'Error al leer los horarios' },
      { status: 500 }
    );
  }
}

/**
 * POST: Guardar los horarios del restaurante
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener los datos del request
    const data = await request.json();

    // Validar los datos
    if (!data.horarioRegular) {
      return NextResponse.json(
        { error: 'Faltan los horarios regulares' },
        { status: 400 }
      );
    }

    // Validar que horarioRegular tenga todos los días de la semana
    const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    for (const dia of diasSemana) {
      if (!data.horarioRegular[dia] || !Array.isArray(data.horarioRegular[dia])) {
        return NextResponse.json(
          { error: `Falta el horario para el día ${dia}` },
          { status: 400 }
        );
      }
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
    console.error('Error al guardar los horarios:', error);
    return NextResponse.json(
      { error: 'Error al guardar los horarios' },
      { status: 500 }
    );
  }
}
