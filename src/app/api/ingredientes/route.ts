import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/config/database';

// Manejador de la solicitud GET
export async function GET(request: NextRequest) {
  try {
    // Obtener el restaurante_id del query string
    const { searchParams } = new URL(request.url);
    const restauranteId = searchParams.get('restauranteId');
    
    if (!restauranteId) {
      return NextResponse.json(
        { error: 'Se requiere el ID del restaurante' },
        { status: 400 }
      );
    }
    
    // Consultar ingredientes desde la base de datos
    const result = await query(
      'SELECT * FROM ingredientes WHERE restaurante_id = $1 ORDER BY nombre',
      [restauranteId]
    );
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener ingredientes:', error);
    return NextResponse.json(
      { error: 'Error al obtener ingredientes' },
      { status: 500 }
    );
  }
}

// Manejador de la solicitud POST para crear un nuevo ingrediente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar campos requeridos
    if (!body.name || !body.unidad_medida || !body.restaurant_id) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos (nombre, unidad_medida, restaurante_id)' },
        { status: 400 }
      );
    }
    
    // Insertar nuevo ingrediente
    const result = await query(
      `INSERT INTO ingredientes (
        nombre, unidad_medida, stock, precio_unitario, restaurante_id
      ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        body.name,
        body.unidad_medida,
        body.stock || 0,
        body.precio_unitario || 0,
        body.restaurant_id
      ]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear ingrediente:', error);
    return NextResponse.json(
      { error: 'Error al crear ingrediente' },
      { status: 500 }
    );
  }
}
