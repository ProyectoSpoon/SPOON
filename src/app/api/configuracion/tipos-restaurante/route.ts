import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Path to the tipos-restaurante.json file
    const filePath = path.join(process.cwd(), 'test-data', 'configuracion', 'categorias', 'tipos-restaurante.json');
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.error('El archivo de tipos de restaurante no existe:', filePath);
      return NextResponse.json(
        { error: 'El archivo de tipos de restaurante no existe' },
        { status: 404 }
      );
    }
    
    // Read the file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Parse the JSON content
    const tiposRestaurante = JSON.parse(fileContent);
    
    // Return the tipos de restaurante
    return NextResponse.json(tiposRestaurante);
  } catch (error) {
    console.error('Error al leer el archivo de tipos de restaurante:', error);
    return NextResponse.json(
      { error: 'Error al leer el archivo de tipos de restaurante' },
      { status: 500 }
    );
  }
}
