import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { categoriaId: string } }
) {
  try {
    const categoriaId = params.categoriaId;
    
    // Mapeo de categorías a nombres de archivo
    const categoryFileMap: {[key: string]: string} = {
      'CAT_001': 'entradas.json',
      'CAT_002': 'principios.json',
      'CAT_003': 'proteinas.json',
      'CAT_004': 'acompañamientos.json',
      'CAT_005': 'bebidas.json'
    };
    
    const fileName = categoryFileMap[categoriaId];
    
    if (!fileName) {
      return NextResponse.json(
        { error: `Categoría no reconocida: ${categoriaId}` },
        { status: 400 }
      );
    }
    
    // Ruta al archivo de productos para la categoría especificada
    const filePath = path.join(process.cwd(), 'test-data', fileName);
    
    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      console.error(`El archivo de productos para la categoría ${categoriaId} no existe:`, filePath);
      
      // Intentar buscar en ubicaciones alternativas
      const alternativePaths = [
        path.join(process.cwd(), 'test-data', 'productos', fileName),
        path.join(process.cwd(), 'test-data', 'menu-dia', fileName)
      ];
      
      let fileFound = false;
      let actualPath = '';
      
      for (const altPath of alternativePaths) {
        if (fs.existsSync(altPath)) {
          fileFound = true;
          actualPath = altPath;
          break;
        }
      }
      
      if (!fileFound) {
        return NextResponse.json(
          { error: `No se encontró el archivo de productos para la categoría ${categoriaId}` },
          { status: 404 }
        );
      }
      
      // Si encontramos el archivo en una ubicación alternativa, usamos esa ruta
      const fileContent = fs.readFileSync(actualPath, 'utf-8');
      const productos = JSON.parse(fileContent);
      return NextResponse.json({ productos });
    }
    
    // Leer el archivo
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Parsear el contenido JSON
    const productos = JSON.parse(fileContent);
    
    // Devolver los productos
    return NextResponse.json({ productos });
  } catch (error) {
    console.error(`Error al leer el archivo de productos:`, error);
    return NextResponse.json(
      { error: 'Error al leer el archivo de productos' },
      { status: 500 }
    );
  }
}