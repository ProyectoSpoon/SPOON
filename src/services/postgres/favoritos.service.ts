'use client';

import { query } from '@/config/database';

export interface FavoritoPostgresDoc {
  id: string;
  restaurante_id: string;
  combinacion_id: string;
  created_at: Date;
}

export const favoritosServicePostgres = {
  /**
   * Inicializa la tabla de favoritos si no existe
   */
  async initTable() {
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS combinaciones_favoritas (
          id SERIAL PRIMARY KEY,
          restaurante_id VARCHAR(50) NOT NULL,
          combinacion_id VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(restaurante_id, combinacion_id)
        )
      `);
      
      console.log('Tabla de favoritos inicializada correctamente');
      return true;
    } catch (error) {
      console.error('Error al inicializar tabla de favoritos:', error);
      return false;
    }
  },

  /**
   * Obtiene las combinaciones favoritas de un restaurante
   * @param restauranteId ID del restaurante
   */
  async getFavoritos(restauranteId: string): Promise<FavoritoPostgresDoc[]> {
    try {
      const result = await query(
        'SELECT * FROM combinaciones_favoritas WHERE restaurante_id = $1',
        [restauranteId]
      );
      
      return result.rows.map(row => ({
        id: row.id.toString(),
        restaurante_id: row.restaurante_id,
        combinacion_id: row.combinacion_id,
        created_at: row.created_at
      }));
    } catch (error) {
      console.error('Error al obtener favoritos de PostgreSQL:', error);
      throw error;
    }
  },

  /**
   * Marca o desmarca una combinación como favorita
   * @param restauranteId ID del restaurante
   * @param combinacionId ID de la combinación
   */
  async toggleFavorito(restauranteId: string, combinacionId: string) {
    try {
      // Verificamos si ya existe
      const existResult = await query(
        'SELECT id FROM combinaciones_favoritas WHERE restaurante_id = $1 AND combinacion_id = $2',
        [restauranteId, combinacionId]
      );
      
      if (existResult.rowCount === 0) {
        // No existe, lo agregamos como favorito
        const insertResult = await query(
          'INSERT INTO combinaciones_favoritas (restaurante_id, combinacion_id) VALUES ($1, $2) RETURNING id',
          [restauranteId, combinacionId]
        );
        
        return {
          id: insertResult.rows[0].id,
          restaurante_id: restauranteId,
          combinacion_id: combinacionId,
          created_at: new Date()
        };
      } else {
        // Ya existe, lo eliminamos como favorito
        await query(
          'DELETE FROM combinaciones_favoritas WHERE restaurante_id = $1 AND combinacion_id = $2',
          [restauranteId, combinacionId]
        );
        
        return true;
      }
    } catch (error) {
      console.error('Error al toggle favorito en PostgreSQL:', error);
      throw error;
    }
  }
};
