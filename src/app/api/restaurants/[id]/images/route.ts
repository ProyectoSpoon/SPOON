// src/app/api/restaurants/[id]/images/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// GET - Obtener URLs de imágenes
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    console.log(`🔍 GET /api/restaurants/${id}/images`);
    
    const query = `
      SELECT logo_url, cover_image_url
      FROM restaurant.restaurants 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      console.log(`❌ Restaurante no encontrado: ${id}`);
      return NextResponse.json(
        { error: 'Restaurante no encontrado' },
        { status: 404 }
      );
    }
    
    const restaurant = result.rows[0];
    
    console.log(`✅ Imágenes obtenidas:`, {
      logoUrl: restaurant.logo_url,
      coverImageUrl: restaurant.cover_image_url
    });
    
    return NextResponse.json({
      logoUrl: restaurant.logo_url,
      coverImageUrl: restaurant.cover_image_url
    });
    
  } catch (error) {
    console.error('❌ Error al obtener imágenes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Subir nueva imagen
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log(`📤 POST /api/restaurants/${id}/images - Iniciando subida`);
    
    const formData = await request.formData();
    
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'logo' o 'cover'
    
    console.log(`📄 Archivo recibido:`, {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      imageType: type
    });
    
    if (!file) {
      console.log('❌ No se encontró archivo en FormData');
      return NextResponse.json(
        { error: 'No se encontró archivo' },
        { status: 400 }
      );
    }
    
    if (!['logo', 'cover'].includes(type)) {
      console.log(`❌ Tipo de imagen inválido: ${type}`);
      return NextResponse.json(
        { error: 'Tipo de imagen inválido' },
        { status: 400 }
      );
    }
    
    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.log(`❌ Tipo de archivo no permitido: ${file.type}`);
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Use JPEG, PNG o WebP' },
        { status: 400 }
      );
    }
    
    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      console.log(`❌ Archivo demasiado grande: ${file.size} bytes`);
      return NextResponse.json(
        { error: 'Archivo demasiado grande (máximo 5MB)' },
        { status: 400 }
      );
    }
    
    // Generar nombre único
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const fileName = `${type}_${id}_${timestamp}.${extension}`;
    
    console.log(`📝 Nombre de archivo generado: ${fileName}`);
    
    // Crear directorio si no existe
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'restaurants');
    
    console.log(`📁 Directorio de uploads: ${uploadsDir}`);
    
    try {
      // Verificar si el directorio existe
      if (!existsSync(uploadsDir)) {
        console.log(`🔨 Creando directorio: ${uploadsDir}`);
        await mkdir(uploadsDir, { recursive: true });
        console.log(`✅ Directorio creado exitosamente`);
      } else {
        console.log(`✅ Directorio ya existe`);
      }
    } catch (mkdirError) {
      console.error('❌ Error creando directorio:', mkdirError);
      const errorMessage = mkdirError instanceof Error ? mkdirError.message : 'Error desconocido al crear directorio';
      return NextResponse.json(
        { error: `Error creando directorio de uploads: ${errorMessage}` },
        { status: 500 }
      );
    }
    
    // Guardar archivo
    const filePath = join(uploadsDir, fileName);
    console.log(`💾 Ruta completa del archivo: ${filePath}`);
    
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      console.log(`💾 Escribiendo archivo... ${buffer.length} bytes`);
      await writeFile(filePath, buffer);
      console.log(`✅ Archivo guardado exitosamente en: ${filePath}`);
      
    } catch (writeError) {
      console.error('❌ Error escribiendo archivo:', writeError);
      const errorMessage = writeError instanceof Error ? writeError.message : 'Error desconocido al escribir archivo';
      return NextResponse.json(
        { error: `Error al guardar archivo: ${errorMessage}` },
        { status: 500 }
      );
    }
    
    // URL pública del archivo
    const fileUrl = `/uploads/restaurants/${fileName}`;
    console.log(`🔗 URL pública generada: ${fileUrl}`);
    
    // Actualizar base de datos
    const column = type === 'logo' ? 'logo_url' : 'cover_image_url';
    const updateQuery = `
      UPDATE restaurant.restaurants 
      SET ${column} = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING ${column}
    `;
    
    console.log(`🗄️ Actualizando base de datos - columna: ${column}, URL: ${fileUrl}`);
    
    const result = await pool.query(updateQuery, [fileUrl, id]);
    
    if (result.rows.length === 0) {
      console.log(`❌ Restaurante no encontrado para actualizar: ${id}`);
      return NextResponse.json(
        { error: 'Restaurante no encontrado' },
        { status: 404 }
      );
    }
    
    console.log(`✅ Base de datos actualizada:`, result.rows[0]);
    
    return NextResponse.json({
      success: true,
      url: fileUrl,
      message: `${type === 'logo' ? 'Logo' : 'Portada'} actualizada correctamente`
    });
    
  } catch (error) {
    console.error('❌ Error general en POST /images:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: `Error interno del servidor: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// PUT - Actualizar URLs de imágenes (para uso con servicios externos)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { logoUrl, coverImageUrl } = body;
    
    console.log(`🔄 PUT /api/restaurants/${id}/images`, { logoUrl, coverImageUrl });
    
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    if (logoUrl !== undefined) {
      updates.push(`logo_url = $${paramIndex}`);
      values.push(logoUrl);
      paramIndex++;
    }
    
    if (coverImageUrl !== undefined) {
      updates.push(`cover_image_url = $${paramIndex}`);
      values.push(coverImageUrl);
      paramIndex++;
    }
    
    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No hay datos para actualizar' },
        { status: 400 }
      );
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const query = `
      UPDATE restaurant.restaurants 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING logo_url, cover_image_url
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Restaurante no encontrado' },
        { status: 404 }
      );
    }
    
    console.log(`✅ URLs actualizadas:`, result.rows[0]);
    
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Error al actualizar URLs:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}