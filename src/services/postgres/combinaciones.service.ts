'use client';

import pool, { query } from '@/config/database';
import { MenuCombinacion } from "@/app/dashboard/carta/types/menu.types";

// Estructura para almacenar combinaciones en PostgreSQL
interface CombinacionDB {
  id: string;
  restaurante_id: string;
  combinacion_id: string;
  cantidad: number;
  nombre: string;
  favorito: boolean;
  especial: boolean;
  created_at: Date;
  updated_at: Date;
  programacion: any[];
  precio_especial?: number;
  disponibilidad_especial?: {
    desde: Date;
    hasta: Date;
  };
}

/**
 * Servicio para manejar la persistencia de combinaciones y sus cantidades
 * en la base de datos PostgreSQL
 */
export const combinacionesServicePostgres = {
  /**
   * Inicializa las tablas necesarias para las combinaciones
   */
  async initTables() {
    try {
      // Tabla para almacenar las combinaciones
      await query(`
        CREATE TABLE IF NOT EXISTS menu_combinaciones (
          id SERIAL PRIMARY KEY,
          restaurante_id VARCHAR(50) NOT NULL,
          combinacion_id VARCHAR(50) NOT NULL,
          cantidad INTEGER DEFAULT 0,
          nombre VARCHAR(200) NOT NULL,
          favorito BOOLEAN DEFAULT FALSE,
          especial BOOLEAN DEFAULT FALSE,
          precio_especial NUMERIC(10, 2),
          disponibilidad_desde TIMESTAMP,
          disponibilidad_hasta TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(restaurante_id, combinacion_id)
        )
      `);

      // Tabla para programaciones de combinaciones
      await query(`
        CREATE TABLE IF NOT EXISTS menu_programaciones (
          id SERIAL PRIMARY KEY,
          combinacion_id VARCHAR(50) NOT NULL,
          restaurante_id VARCHAR(50) NOT NULL,
          fecha TIMESTAMP NOT NULL,
          cantidad_programada INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (restaurante_id, combinacion_id) REFERENCES menu_combinaciones(restaurante_id, combinacion_id) ON DELETE CASCADE
        )
      `);

      // Tabla para ventas de combinaciones
      await query(`
        CREATE TABLE IF NOT EXISTS ventas_combinaciones (
          id SERIAL PRIMARY KEY,
          restaurante_id VARCHAR(50) NOT NULL,
          combinacion_id VARCHAR(50) NOT NULL,
          cantidad INTEGER NOT NULL,
          fecha TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (restaurante_id, combinacion_id) REFERENCES menu_combinaciones(restaurante_id, combinacion_id) ON DELETE CASCADE
        )
      `);

      console.log('Tablas de combinaciones inicializadas correctamente');
      return true;
    } catch (error) {
      console.error('Error al inicializar tablas de combinaciones:', error);
      return false;
    }
  },

  /**
   * Guarda o actualiza una combinación en la base de datos
   * @param restauranteId ID del restaurante
   * @param combinacion La combinación a guardar
   */
  async guardarCombinacion(restauranteId: string, combinacion: MenuCombinacion): Promise<void> {
    try {
      // Iniciamos una transacción
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Intentamos actualizar primero
        const updateResult = await client.query(
          `UPDATE menu_combinaciones
           SET cantidad = $1,
               favorito = $2,
               especial = $3,
               precio_especial = $4,
               disponibilidad_desde = $5,
               disponibilidad_hasta = $6,
               updated_at = CURRENT_TIMESTAMP
           WHERE restaurante_id = $7 AND combinacion_id = $8
           RETURNING id`,
          [
            combinacion.cantidad || 0,
            combinacion.favorito || false,
            combinacion.especial || false,
            combinacion.precioEspecial,
            combinacion.disponibilidadEspecial?.desde,
            combinacion.disponibilidadEspecial?.hasta,
            restauranteId,
            combinacion.id
          ]
        );
        
        // Si no encontramos ningún registro, insertamos uno nuevo
        if (updateResult.rowCount === 0) {
          await client.query(
            `INSERT INTO menu_combinaciones 
             (restaurante_id, combinacion_id, cantidad, nombre, favorito, especial, 
              precio_especial, disponibilidad_desde, disponibilidad_hasta)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              restauranteId,
              combinacion.id,
              combinacion.cantidad || 0,
              `${combinacion.principio.nombre} con ${combinacion.proteina.nombre}`,
              combinacion.favorito || false,
              combinacion.especial || false,
              combinacion.precioEspecial,
              combinacion.disponibilidadEspecial?.desde,
              combinacion.disponibilidadEspecial?.hasta
            ]
          );
        }
        
        // Ahora manejamos las programaciones: primero eliminamos las existentes
        await client.query(
          `DELETE FROM menu_programaciones 
           WHERE restaurante_id = $1 AND combinacion_id = $2`,
          [restauranteId, combinacion.id]
        );
        
        // Luego insertamos las nuevas programaciones
        if (combinacion.programacion && combinacion.programacion.length > 0) {
          for (const prog of combinacion.programacion) {
            await client.query(
              `INSERT INTO menu_programaciones 
               (restaurante_id, combinacion_id, fecha, cantidad_programada)
               VALUES ($1, $2, $3, $4)`,
              [
                restauranteId,
                combinacion.id,
                prog.fecha,
                prog.cantidadProgramada
              ]
            );
          }
        }
        
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error al guardar combinación en PostgreSQL:', error);
      throw error;
    }
  },

  /**
   * Guarda múltiples combinaciones en la base de datos
   * @param restauranteId ID del restaurante
   * @param combinaciones Lista de combinaciones a guardar
   */
  async guardarCombinaciones(restauranteId: string, combinaciones: MenuCombinacion[]): Promise<void> {
    try {
      // Usamos una transacción para todas las operaciones
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        for (const combinacion of combinaciones) {
          // Intentamos actualizar primero
          const updateResult = await client.query(
            `UPDATE menu_combinaciones
             SET cantidad = $1,
                 favorito = $2,
                 especial = $3,
                 precio_especial = $4,
                 disponibilidad_desde = $5,
                 disponibilidad_hasta = $6,
                 updated_at = CURRENT_TIMESTAMP
             WHERE restaurante_id = $7 AND combinacion_id = $8
             RETURNING id`,
            [
              combinacion.cantidad || 0,
              combinacion.favorito || false,
              combinacion.especial || false,
              combinacion.precioEspecial,
              combinacion.disponibilidadEspecial?.desde,
              combinacion.disponibilidadEspecial?.hasta,
              restauranteId,
              combinacion.id
            ]
          );
          
          // Si no encontramos ningún registro, insertamos uno nuevo
          if (updateResult.rowCount === 0) {
            await client.query(
              `INSERT INTO menu_combinaciones 
               (restaurante_id, combinacion_id, cantidad, nombre, favorito, especial, 
                precio_especial, disponibilidad_desde, disponibilidad_hasta)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [
                restauranteId,
                combinacion.id,
                combinacion.cantidad || 0,
                `${combinacion.principio.nombre} con ${combinacion.proteina.nombre}`,
                combinacion.favorito || false,
                combinacion.especial || false,
                combinacion.precioEspecial,
                combinacion.disponibilidadEspecial?.desde,
                combinacion.disponibilidadEspecial?.hasta
              ]
            );
          }
          
          // Manejamos las programaciones para cada combinación
          await client.query(
            `DELETE FROM menu_programaciones 
             WHERE restaurante_id = $1 AND combinacion_id = $2`,
            [restauranteId, combinacion.id]
          );
          
          if (combinacion.programacion && combinacion.programacion.length > 0) {
            for (const prog of combinacion.programacion) {
              await client.query(
                `INSERT INTO menu_programaciones 
                 (restaurante_id, combinacion_id, fecha, cantidad_programada)
                 VALUES ($1, $2, $3, $4)`,
                [
                  restauranteId,
                  combinacion.id,
                  prog.fecha,
                  prog.cantidadProgramada
                ]
              );
            }
          }
        }
        
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error al guardar combinaciones en PostgreSQL:', error);
      throw error;
    }
  },

  /**
   * Obtiene las combinaciones guardadas para un restaurante
   * @param restauranteId ID del restaurante
   */
  async getCombinaciones(restauranteId: string): Promise<any[]> {
    try {
      const client = await pool.connect();
      
      try {
        // Obtenemos las combinaciones
        const combinacionesResult = await client.query(
          `SELECT * FROM menu_combinaciones 
           WHERE restaurante_id = $1`,
          [restauranteId]
        );
        
        // Para cada combinación, obtenemos sus programaciones
        const combinacionesConProgramacion = [];
        
        for (const combinacion of combinacionesResult.rows) {
          const programacionesResult = await client.query(
            `SELECT * FROM menu_programaciones 
             WHERE restaurante_id = $1 AND combinacion_id = $2
             ORDER BY fecha`,
            [restauranteId, combinacion.combinacion_id]
          );
          
          // Formateamos las programaciones
          const programaciones = programacionesResult.rows.map(row => ({
            fecha: row.fecha,
            cantidadProgramada: row.cantidad_programada
          }));
          
          // Añadimos la disponibilidad especial si existe
          let disponibilidadEspecial = null;
          if (combinacion.disponibilidad_desde && combinacion.disponibilidad_hasta) {
            disponibilidadEspecial = {
              desde: combinacion.disponibilidad_desde,
              hasta: combinacion.disponibilidad_hasta
            };
          }
          
          combinacionesConProgramacion.push({
            id: combinacion.id,
            combinacionId: combinacion.combinacion_id,
            restauranteId: combinacion.restaurante_id,
            cantidad: combinacion.cantidad,
            nombre: combinacion.nombre,
            favorito: combinacion.favorito,
            especial: combinacion.especial,
            precioEspecial: combinacion.precio_especial,
            disponibilidadEspecial,
            programacion: programaciones,
            createdAt: combinacion.created_at,
            updatedAt: combinacion.updated_at
          });
        }
        
        return combinacionesConProgramacion;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error al obtener combinaciones de PostgreSQL:', error);
      throw error;
    }
  },

  /**
   * Registra una venta de combinaciones para estadísticas
   * @param restauranteId ID del restaurante
   * @param combinacionId ID de la combinación
   * @param cantidad Cantidad vendida
   * @param fecha Fecha de la venta (opcional, por defecto es la fecha actual)
   */
  async registrarVentaCombinacion(
    restauranteId: string, 
    combinacionId: string, 
    cantidad: number,
    fecha: Date = new Date()
  ): Promise<void> {
    try {
      await query(
        `INSERT INTO ventas_combinaciones 
         (restaurante_id, combinacion_id, cantidad, fecha)
         VALUES ($1, $2, $3, $4)`,
        [restauranteId, combinacionId, cantidad, fecha]
      );
    } catch (error) {
      console.error('Error al registrar venta de combinación en PostgreSQL:', error);
      throw error;
    }
  },

  /**
   * Obtiene estadísticas de ventas de combinaciones para un periodo de tiempo
   * @param restauranteId ID del restaurante
   * @param fechaInicio Fecha de inicio del periodo
   * @param fechaFin Fecha de fin del periodo
   */
  async getEstadisticasVentas(
    restauranteId: string,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<any[]> {
    try {
      const result = await query(
        `SELECT combinacion_id, SUM(cantidad) as total_vendido, 
                fecha::date as dia, MIN(created_at) as primera_venta
         FROM ventas_combinaciones 
         WHERE restaurante_id = $1 
           AND fecha BETWEEN $2 AND $3
         GROUP BY combinacion_id, fecha::date
         ORDER BY fecha::date, total_vendido DESC`,
        [restauranteId, fechaInicio, fechaFin]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error al obtener estadísticas de ventas de PostgreSQL:', error);
      throw error;
    }
  }
};
