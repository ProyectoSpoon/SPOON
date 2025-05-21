import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Path to the combinations file
    const filePath = path.join(process.cwd(), 'test-data', 'combinaciones.json');
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'El archivo de combinaciones no existe' },
        { status: 404 }
      );
    }
    
    // Read the file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Parse the JSON content
    const combinaciones = JSON.parse(fileContent);
    
    // Return the combinations
    return NextResponse.json({ combinaciones });
  } catch (error) {
    console.error('Error al leer el archivo de combinaciones:', error);
    return NextResponse.json(
      { error: 'Error al leer el archivo de combinaciones' },
      { status: 500 }
    );
  }
}
