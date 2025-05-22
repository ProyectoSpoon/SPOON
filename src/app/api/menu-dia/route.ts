import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Intentar cargar productos de cada categoría
    const categorias = ['CAT_001', 'CAT_002', 'CAT_003', 'CAT_004', 'CAT_005'];
    const nombresCategorias = ['Entradas', 'Principio', 'Proteína', 'Acompañamientos', 'Bebida'];
    
    const menuDia: any = {};
    
    for (let i = 0; i < categorias.length; i++) {
      const categoriaId = categorias[i];
      const nombreCategoria = nombresCategorias[i];
      
      // Mapeo de categorías a nombres de archivo
      const categoryFileMap: {[key: string]: string} = {
        'CAT_001': 'entradas.json',
        'CAT_002': 'principios.json',
        'CAT_003': 'proteinas.json',
        'CAT_004': 'acompañamientos.json',
        'CAT_005': 'bebidas.json'
      };
      
      const fileName = categoryFileMap[categoriaId];
      
      if (!fileName) continue;
      
      // Posibles rutas para buscar el archivo
      const possiblePaths = [
        path.join(process.cwd(), 'test-data', fileName),
        path.join(process.cwd(), 'test-data', 'productos', fileName),
        path.join(process.cwd(), 'test-data', 'menu-dia', fileName)
      ];
      
      let fileFound = false;
      let productos: any[] = [];
      
      for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
          fileFound = true;
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          productos = JSON.parse(fileContent);
          break;
        }
      }
      
      menuDia[nombreCategoria.toLowerCase()] = productos;
    }
    
    // Devolver el menú completo
    return NextResponse.json({ menuDia });
  } catch (error) {
    console.error('Error al leer los archivos del menú del día:', error);
    return NextResponse.json(
      { error: 'Error al leer los archivos del menú del día' },
      { status: 500 }
    );
  }
}