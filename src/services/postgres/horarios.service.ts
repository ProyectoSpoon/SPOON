'use client';

import { query } from '@/config/database';
import { HorariosSemanales } from '@/app/dashboard/horario-comercial/types/horarios.types';

/**
 * Guarda los horarios en la configuración inicial y valida los datos
 */
export const guardarHorarioInicial = async (
  idRestaurante: string,
  horarios: HorariosSemanales
): Promise<boolean> => {
  try {
    // Crear tabla si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS horarios (
        id SERIAL PRIMARY KEY,
        restaurante_id VARCHAR(50) NOT NULL,
        horario_regular JSONB NOT NULL,
        horarios_especiales JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Verificar si ya existen horarios para este restaurante
    const existingHorarios = await query(
      'SELECT id FROM horarios WHERE restaurante_id = $1',
      [idRestaurante]
    );
    
    if (existingHorarios && existingHorarios.rowCount && existingHorarios.rowCount > 0) {
      // Actualizar horarios existentes
      await query(
        `UPDATE horarios 
         SET horario_regular = $1, updated_at = CURRENT_TIMESTAMP
         WHERE restaurante_id = $2`,
        [JSON.stringify(horarios), idRestaurante]
      );
    } else {
      // Insertar nuevos horarios
      await query(
        `INSERT INTO horarios (restaurante_id, horario_regular)
         VALUES ($1, $2)`,
        [idRestaurante, JSON.stringify(horarios)]
      );
    }
    
    return true;
  } catch (error) {
    console.error('Error al guardar horarios:', error);
    return false;
  }
};

/**
 * Obtiene los horarios con lógica adicional de negocio
 */
export const obtenerHorarios = async (idRestaurante: string): Promise<HorariosSemanales | null> => {
  try {
    const result = await query(
      'SELECT horario_regular FROM horarios WHERE restaurante_id = $1',
      [idRestaurante]
    );
    
    if (!result || !result.rowCount || result.rowCount === 0) {
      return null;
    }
    
    return result.rows[0].horario_regular;
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    return null;
  }
};

/**
 * Actualiza los horarios desde el dashboard con validaciones
 */
export const actualizarHorarios = async (
  idRestaurante: string,
  horarios: { horarioRegular: HorariosSemanales }
): Promise<boolean> => {
  try {
    const result = await query(
      `UPDATE horarios 
       SET horario_regular = $1, updated_at = CURRENT_TIMESTAMP
       WHERE restaurante_id = $2`,
      [JSON.stringify(horarios.horarioRegular), idRestaurante]
    );
    
    return result.rowCount ? result.rowCount > 0 : false;
  } catch (error) {
    console.error('Error al actualizar horarios:', error);
    return false;
  }
};
