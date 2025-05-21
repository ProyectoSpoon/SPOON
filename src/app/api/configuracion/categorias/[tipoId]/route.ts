import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { tipoId: string } }
) {
  try {
    const tipoId = params.tipoId;
    
    // Path to the categorias file for the specified tipo
    const filePath = path.join(process.cwd(), 'test-data', 'configuracion', 'categorias', `${tipoId}.json`);
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.error(`El archivo de categorías para el tipo ${tipoId} no existe:`, filePath);
      return NextResponse.json(
        { error: `El archivo de categorías para el tipo ${tipoId} no existe` },
        { status: 404 }
      );
    }
    
    // Read the file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Parse the JSON content
    const categorias = JSON.parse(fileContent);
    
    // Return the categorias
    return NextResponse.json(categorias);
  } catch (error) {
    console.error(`Error al leer el archivo de categorías:`, error);
    return NextResponse.json(
      { error: 'Error al leer el archivo de categorías' },
      { status: 500 }
    );
  }
}
