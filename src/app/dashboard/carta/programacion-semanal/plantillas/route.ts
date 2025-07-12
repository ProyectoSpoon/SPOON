import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuración de la base de datos
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'spoon_db',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Tipos para las plantillas
interface PlantillaData {
  id: string;
  nombre: string;
  descripcion: string;
  programacion: Record<string, string[]>; // día -> combinationIds
  fechaCreacion: string;
  esActiva: boolean;
}

interface PlantillaRequest {
  restaurantId: string;
  plantilla: {
    nombre: string;
    descripcion: string;
    programacion: Record<string, string[]>;
    fechaCreacion: string;
    esActiva: boolean;
  };
}

// Constantes
const RESTAURANT_ID_DEFAULT = 'rest-test-001';

// Función para generar clave única de plantilla
function generatePlantillaKey(nombre: string): string {
  const timestamp = Date.now();
  const cleanName = nombre.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  return `plantilla_programacion_${cleanName}_${timestamp}`;
}

// GET - Obtener todas las plantillas de un restaurante
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId') || RESTAURANT_ID_DEFAULT;
    
    console.log('🔍 GET /api/programacion-semanal/plantillas:', { restaurantId });

    const client = await pool.connect();
    
    try {
      const query = `
        SELECT 
          id,
          setting_key,
          setting_value,
          description,
          created_at,
          updated_at
        FROM config.system_settings
        WHERE restaurant_id = $1 
          AND setting_key LIKE 'plantilla_programacion_%'
          AND setting_type = 'json'
        ORDER BY created_at DESC
      `;
      
      const result = await client.query(query, [restaurantId]);
      
      const plantillas: PlantillaData[] = result.rows.map(row => {
        const plantillaData = row.setting_value;
        return {
          id: row.id,
          nombre: plantillaData.nombre,
          descripcion: plantillaData.descripcion || '',
          programacion: plantillaData.programacion || {},
          fechaCreacion: plantillaData.fechaCreacion || row.created_at,
          esActiva: plantillaData.esActiva !== undefined ? plantillaData.esActiva : true
        };
      });

      console.log('✅ Plantillas obtenidas:', plantillas.length);

      return NextResponse.json({
        success: true,
        data: plantillas
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Error en GET /api/programacion-semanal/plantillas:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener plantillas' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva plantilla
export async function POST(request: NextRequest) {
  try {
    const body: PlantillaRequest = await request.json();
    const { restaurantId, plantilla } = body;
    
    console.log('💾 POST /api/programacion-semanal/plantillas:', { 
      restaurantId, 
      nombre: plantilla.nombre 
    });

    // Validaciones
    if (!plantilla.nombre || plantilla.nombre.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'El nombre de la plantilla es requerido' },
        { status: 400 }
      );
    }

    if (!plantilla.programacion || Object.keys(plantilla.programacion).length === 0) {
      return NextResponse.json(
        { success: false, error: 'La programación de la plantilla no puede estar vacía' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Verificar si ya existe una plantilla con el mismo nombre
      const existingQuery = `
        SELECT id FROM config.system_settings
        WHERE restaurant_id = $1 
          AND setting_key LIKE 'plantilla_programacion_%'
          AND setting_value->>'nombre' = $2
      `;
      
      const existingResult = await client.query(existingQuery, [restaurantId, plantilla.nombre]);
      
      if (existingResult.rows.length > 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { success: false, error: 'Ya existe una plantilla con ese nombre' },
          { status: 409 }
        );
      }

      // Generar clave única para la plantilla
      const plantillaKey = generatePlantillaKey(plantilla.nombre);
      
      // Preparar datos de la plantilla
      const plantillaCompleta = {
        nombre: plantilla.nombre.trim(),
        descripcion: plantilla.descripcion?.trim() || '',
        programacion: plantilla.programacion,
        fechaCreacion: plantilla.fechaCreacion || new Date().toISOString(),
        esActiva: plantilla.esActiva !== undefined ? plantilla.esActiva : true,
        version: '1.0',
        createdBy: 'system', // TODO: Obtener del usuario actual
        metadata: {
          totalCombinaciones: Object.values(plantilla.programacion).flat().length,
          diasProgramados: Object.keys(plantilla.programacion).length
        }
      };

      // Insertar la plantilla en config.system_settings
      const insertQuery = `
        INSERT INTO config.system_settings (
          restaurant_id,
          setting_key,
          setting_value,
          setting_type,
          description,
          is_public,
          created_at,
          updated_at,
          updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $7)
        RETURNING id, created_at
      `;
      
      const insertResult = await client.query(insertQuery, [
        restaurantId,
        plantillaKey,
        JSON.stringify(plantillaCompleta),
        'json',
        `Plantilla de programación semanal: ${plantilla.nombre}`,
        false,
        'system' // TODO: Obtener del usuario actual
      ]);

      const plantillaCreada = insertResult.rows[0];

      // Registrar en audit log
      const auditQuery = `
        INSERT INTO audit.activity_logs (
          restaurant_id,
          user_id,
          action,
          resource_type,
          resource_id,
          new_values,
          description,
          severity,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      `;
      
      await client.query(auditQuery, [
        restaurantId,
        null, // TODO: Obtener user_id del usuario actual
        'create',
        'plantilla_programacion',
        plantillaCreada.id,
        JSON.stringify(plantillaCompleta),
        `Plantilla de programación creada: ${plantilla.nombre}`,
        'info'
      ]);

      await client.query('COMMIT');

      // Preparar respuesta
      const plantillaRespuesta: PlantillaData = {
        id: plantillaCreada.id,
        nombre: plantillaCompleta.nombre,
        descripcion: plantillaCompleta.descripcion,
        programacion: plantillaCompleta.programacion,
        fechaCreacion: plantillaCompleta.fechaCreacion,
        esActiva: plantillaCompleta.esActiva
      };

      console.log('✅ Plantilla creada exitosamente:', plantillaRespuesta.id);

      return NextResponse.json({
        success: true,
        message: 'Plantilla creada exitosamente',
        plantilla: plantillaRespuesta
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Error en POST /api/programacion-semanal/plantillas:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear plantilla' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar plantilla existente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId, plantillaId, plantilla } = body;
    
    console.log('🔄 PUT /api/programacion-semanal/plantillas:', { 
      restaurantId, 
      plantillaId, 
      nombre: plantilla.nombre 
    });

    // Validaciones
    if (!plantillaId) {
      return NextResponse.json(
        { success: false, error: 'ID de plantilla requerido' },
        { status: 400 }
      );
    }

    if (!plantilla.nombre || plantilla.nombre.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'El nombre de la plantilla es requerido' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Verificar que la plantilla existe y pertenece al restaurante
      const existingQuery = `
        SELECT id, setting_value FROM config.system_settings
        WHERE id = $1 AND restaurant_id = $2 AND setting_key LIKE 'plantilla_programacion_%'
      `;
      
      const existingResult = await client.query(existingQuery, [plantillaId, restaurantId]);
      
      if (existingResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { success: false, error: 'Plantilla no encontrada' },
          { status: 404 }
        );
      }

      const plantillaExistente = existingResult.rows[0].setting_value;

      // Verificar nombre único (excluyendo la plantilla actual)
      const duplicateQuery = `
        SELECT id FROM config.system_settings
        WHERE restaurant_id = $1 
          AND setting_key LIKE 'plantilla_programacion_%'
          AND setting_value->>'nombre' = $2
          AND id != $3
      `;
      
      const duplicateResult = await client.query(duplicateQuery, [
        restaurantId, 
        plantilla.nombre, 
        plantillaId
      ]);
      
      if (duplicateResult.rows.length > 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { success: false, error: 'Ya existe otra plantilla con ese nombre' },
          { status: 409 }
        );
      }

      // Preparar datos actualizados
      const plantillaActualizada = {
        ...plantillaExistente,
        nombre: plantilla.nombre.trim(),
        descripcion: plantilla.descripcion?.trim() || '',
        programacion: plantilla.programacion || plantillaExistente.programacion,
        esActiva: plantilla.esActiva !== undefined ? plantilla.esActiva : plantillaExistente.esActiva,
        updatedBy: 'system', // TODO: Obtener del usuario actual
        lastUpdated: new Date().toISOString(),
        metadata: {
          ...plantillaExistente.metadata,
          totalCombinaciones: Object.values(plantilla.programacion || plantillaExistente.programacion).flat().length,
          diasProgramados: Object.keys(plantilla.programacion || plantillaExistente.programacion).length
        }
      };

      // Actualizar la plantilla
      const updateQuery = `
        UPDATE config.system_settings
        SET 
          setting_value = $1,
          description = $2,
          updated_at = CURRENT_TIMESTAMP,
          updated_by = $3
        WHERE id = $4 AND restaurant_id = $5
        RETURNING id, updated_at
      `;
      
      const updateResult = await client.query(updateQuery, [
        JSON.stringify(plantillaActualizada),
        `Plantilla de programación semanal: ${plantilla.nombre}`,
        'system', // TODO: Obtener del usuario actual
        plantillaId,
        restaurantId
      ]);

      // Registrar en audit log
      const auditQuery = `
        INSERT INTO audit.activity_logs (
          restaurant_id,
          user_id,
          action,
          resource_type,
          resource_id,
          old_values,
          new_values,
          description,
          severity,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      `;
      
      await client.query(auditQuery, [
        restaurantId,
        null, // TODO: Obtener user_id del usuario actual
        'update',
        'plantilla_programacion',
        plantillaId,
        JSON.stringify(plantillaExistente),
        JSON.stringify(plantillaActualizada),
        `Plantilla de programación actualizada: ${plantilla.nombre}`,
        'info'
      ]);

      await client.query('COMMIT');

      // Preparar respuesta
      const plantillaRespuesta: PlantillaData = {
        id: plantillaId,
        nombre: plantillaActualizada.nombre,
        descripcion: plantillaActualizada.descripcion,
        programacion: plantillaActualizada.programacion,
        fechaCreacion: plantillaActualizada.fechaCreacion,
        esActiva: plantillaActualizada.esActiva
      };

      console.log('✅ Plantilla actualizada exitosamente:', plantillaId);

      return NextResponse.json({
        success: true,
        message: 'Plantilla actualizada exitosamente',
        plantilla: plantillaRespuesta
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Error en PUT /api/programacion-semanal/plantillas:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar plantilla' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar plantilla
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const plantillaId = searchParams.get('id');
    const restaurantId = searchParams.get('restaurantId') || RESTAURANT_ID_DEFAULT;
    
    console.log('🗑️ DELETE /api/programacion-semanal/plantillas:', { plantillaId, restaurantId });

    if (!plantillaId) {
      return NextResponse.json(
        { success: false, error: 'ID de plantilla requerido' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Verificar que la plantilla existe y obtener datos para audit
      const existingQuery = `
        SELECT id, setting_value FROM config.system_settings
        WHERE id = $1 AND restaurant_id = $2 AND setting_key LIKE 'plantilla_programacion_%'
      `;
      
      const existingResult = await client.query(existingQuery, [plantillaId, restaurantId]);
      
      if (existingResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { success: false, error: 'Plantilla no encontrada' },
          { status: 404 }
        );
      }

      const plantillaExistente = existingResult.rows[0].setting_value;

      // Eliminar la plantilla
      const deleteQuery = `
        DELETE FROM config.system_settings
        WHERE id = $1 AND restaurant_id = $2
      `;
      
      await client.query(deleteQuery, [plantillaId, restaurantId]);

      // Registrar en audit log
      const auditQuery = `
        INSERT INTO audit.activity_logs (
          restaurant_id,
          user_id,
          action,
          resource_type,
          resource_id,
          old_values,
          description,
          severity,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      `;
      
      await client.query(auditQuery, [
        restaurantId,
        null, // TODO: Obtener user_id del usuario actual
        'delete',
        'plantilla_programacion',
        plantillaId,
        JSON.stringify(plantillaExistente),
        `Plantilla de programación eliminada: ${plantillaExistente.nombre}`,
        'warning'
      ]);

      await client.query('COMMIT');

      console.log('✅ Plantilla eliminada exitosamente:', plantillaId);

      return NextResponse.json({
        success: true,
        message: 'Plantilla eliminada exitosamente'
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Error en DELETE /api/programacion-semanal/plantillas:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar plantilla' },
      { status: 500 }
    );
  }
}
