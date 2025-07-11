// src/app/dashboard/carta/menu-dia/services/favoritos.service.ts

import { query } from '@/lib/database';

export interface ProductoFavorito {
  id: string;
  user_id: string;
  product_id: string;
  favorite_type: 'product';
  is_active: boolean;
  favorite_count: number;
  last_ordered?: Date;
  created_at: Date;
  updated_at: Date;
  // Datos del producto (join)
  product_name?: string;
  product_description?: string;
  product_image?: string;
  category_id?: string;
}

export interface CreateFavoritoRequest {
  user_id: string;
  product_id: string;
}

/**
 * Servicio para gestión de favoritos de productos en mobile.user_favorites
 */
export class ProductosFavoritosService {
  
  /**
   * Obtiene todos los productos favoritos de un usuario
   * @param userId ID del usuario
   * @returns Lista de productos favoritos con información del producto
   */
  static async getFavoritosByUser(userId: string): Promise<ProductoFavorito[]> {
    try {
      const result = await query(`
        SELECT 
          uf.*,
          p.name as product_name,
          p.description as product_description,
          p.image_url as product_image,
          p.category_id
        FROM mobile.user_favorites uf
        INNER JOIN menu.products p ON uf.product_id = p.id
        WHERE uf.user_id = $1 
          AND uf.favorite_type = 'product'
          AND uf.is_active = true
          AND p.status = 'active'
        ORDER BY uf.created_at DESC
      `, [userId]);

      // ✅ VERIFICACIÓN NULL: Manejar rows que puede ser undefined
      if (!result.rows || !Array.isArray(result.rows)) {
        console.warn('⚠️ getFavoritosByUser: No se obtuvieron filas válidas');
        return [];
      }

      return result.rows.map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        product_id: row.product_id,
        favorite_type: row.favorite_type,
        is_active: row.is_active,
        favorite_count: row.favorite_count,
        last_ordered: row.last_ordered,
        created_at: row.created_at,
        updated_at: row.updated_at,
        product_name: row.product_name,
        product_description: row.product_description,
        product_image: row.product_image,
        category_id: row.category_id
      }));
    } catch (error) {
      console.error('Error al obtener favoritos del usuario:', error);
      throw new Error('Error al obtener favoritos del usuario');
    }
  }

  /**
   * Verifica si un producto es favorito de un usuario
   * @param userId ID del usuario
   * @param productId ID del producto
   * @returns true si es favorito, false si no
   */
  static async isFavorito(userId: string, productId: string): Promise<boolean> {
    try {
      const result = await query(`
        SELECT 1 
        FROM mobile.user_favorites 
        WHERE user_id = $1 
          AND product_id = $2 
          AND favorite_type = 'product'
          AND is_active = true
        LIMIT 1
      `, [userId, productId]);

      // ✅ CORRECCIÓN TYPESCRIPT: Verificación null para rowCount
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error al verificar favorito:', error);
      return false;
    }
  }

  /**
   * Agrega un producto a favoritos de un usuario
   * @param data Datos del favorito a crear
   * @returns Favorito creado o existente
   */
  static async addFavorito(data: CreateFavoritoRequest): Promise<ProductoFavorito> {
    try {
      // Verificar si ya existe
      const existingResult = await query(`
        SELECT * FROM mobile.user_favorites 
        WHERE user_id = $1 AND product_id = $2 AND favorite_type = 'product'
      `, [data.user_id, data.product_id]);

      // ✅ CORRECCIÓN TYPESCRIPT: Verificación null para rowCount
      if ((existingResult.rowCount ?? 0) > 0) {
        const existing = existingResult.rows?.[0];
        
        if (!existing) {
          throw new Error('No se pudo obtener el favorito existente');
        }
        
        if (!existing.is_active) {
          // Reactivar favorito existente
          const updateResult = await query(`
            UPDATE mobile.user_favorites 
            SET is_active = true, 
                favorite_count = favorite_count + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $1 AND product_id = $2 AND favorite_type = 'product'
            RETURNING *
          `, [data.user_id, data.product_id]);
          
          if (!updateResult.rows?.[0]) {
            throw new Error('No se pudo reactivar el favorito');
          }
          
          return this.mapRowToFavorito(updateResult.rows[0]);
        } else {
          // Ya es favorito activo, incrementar contador
          const updateResult = await query(`
            UPDATE mobile.user_favorites 
            SET favorite_count = favorite_count + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $1 AND product_id = $2 AND favorite_type = 'product'
            RETURNING *
          `, [data.user_id, data.product_id]);
          
          if (!updateResult.rows?.[0]) {
            throw new Error('No se pudo actualizar el contador de favorito');
          }
          
          return this.mapRowToFavorito(updateResult.rows[0]);
        }
      } else {
        // Crear nuevo favorito
        const insertResult = await query(`
          INSERT INTO mobile.user_favorites (
            user_id, 
            product_id, 
            favorite_type,
            is_active,
            favorite_count
          ) VALUES ($1, $2, 'product', true, 1)
          RETURNING *
        `, [data.user_id, data.product_id]);

        if (!insertResult.rows?.[0]) {
          throw new Error('No se pudo crear el nuevo favorito');
        }

        return this.mapRowToFavorito(insertResult.rows[0]);
      }
    } catch (error) {
      console.error('Error al agregar favorito:', error);
      throw new Error('Error al agregar producto a favoritos');
    }
  }

  /**
   * Elimina un producto de favoritos (desactiva)
   * @param userId ID del usuario
   * @param productId ID del producto
   * @returns true si se eliminó correctamente
   */
  static async removeFavorito(userId: string, productId: string): Promise<boolean> {
    try {
      const result = await query(`
        UPDATE mobile.user_favorites 
        SET is_active = false,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 
          AND product_id = $2 
          AND favorite_type = 'product'
          AND is_active = true
      `, [userId, productId]);

      // ✅ CORRECCIÓN TYPESCRIPT: Verificación null para rowCount
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      throw new Error('Error al eliminar producto de favoritos');
    }
  }

  /**
   * Toggle de favorito - agrega si no existe, elimina si existe
   * @param userId ID del usuario
   * @param productId ID del producto
   * @returns { isNowFavorite: boolean, favorito?: ProductoFavorito }
   */
  static async toggleFavorito(userId: string, productId: string): Promise<{
    isNowFavorite: boolean;
    favorito?: ProductoFavorito;
  }> {
    try {
      const isFav = await this.isFavorito(userId, productId);
      
      if (isFav) {
        // Es favorito, eliminar
        await this.removeFavorito(userId, productId);
        return { isNowFavorite: false };
      } else {
        // No es favorito, agregar
        const favorito = await this.addFavorito({ user_id: userId, product_id: productId });
        return { isNowFavorite: true, favorito };
      }
    } catch (error) {
      console.error('Error en toggle favorito:', error);
      throw new Error('Error al cambiar estado de favorito');
    }
  }

  /**
   * Obtiene estadísticas de favoritos de un usuario
   * @param userId ID del usuario
   * @returns Estadísticas de favoritos
   */
  static async getEstadisticasFavoritos(userId: string): Promise<{
    total: number;
    por_categoria: Array<{ category_name: string; count: number }>;
    mas_favoriteados: Array<{ product_name: string; favorite_count: number }>;
  }> {
    try {
      // Total de favoritos
      const totalResult = await query(`
        SELECT COUNT(*) as total
        FROM mobile.user_favorites uf
        WHERE uf.user_id = $1 
          AND uf.favorite_type = 'product'
          AND uf.is_active = true
      `, [userId]);

      // Por categoría
      const categoriaResult = await query(`
        SELECT 
          c.name as category_name,
          COUNT(*) as count
        FROM mobile.user_favorites uf
        INNER JOIN menu.products p ON uf.product_id = p.id
        INNER JOIN menu.categories c ON p.category_id = c.id
        WHERE uf.user_id = $1 
          AND uf.favorite_type = 'product'
          AND uf.is_active = true
          AND p.status = 'active'
        GROUP BY c.id, c.name
        ORDER BY count DESC
      `, [userId]);

      // Más favoriteados
      const masFavResult = await query(`
        SELECT 
          p.name as product_name,
          uf.favorite_count
        FROM mobile.user_favorites uf
        INNER JOIN menu.products p ON uf.product_id = p.id
        WHERE uf.user_id = $1 
          AND uf.favorite_type = 'product'
          AND uf.is_active = true
          AND p.status = 'active'
        ORDER BY uf.favorite_count DESC, uf.created_at DESC
        LIMIT 10
      `, [userId]);

      // ✅ VERIFICACIONES NULL: Manejo robusto de resultados
      const totalValue = totalResult.rows?.[0]?.total;
      const total = totalValue ? parseInt(totalValue.toString()) : 0;

      return {
        total,
        por_categoria: categoriaResult.rows || [],
        mas_favoriteados: masFavResult.rows || []
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de favoritos:', error);
      throw new Error('Error al obtener estadísticas de favoritos');
    }
  }

  /**
   * Marca cuando un usuario pidió por última vez un producto favorito
   * @param userId ID del usuario  
   * @param productId ID del producto
   */
  static async updateLastOrdered(userId: string, productId: string): Promise<void> {
    try {
      await query(`
        UPDATE mobile.user_favorites 
        SET last_ordered = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 
          AND product_id = $2 
          AND favorite_type = 'product'
          AND is_active = true
      `, [userId, productId]);
      
      // No verificamos rowCount aquí porque es una operación opcional
      // Si falla silenciosamente, no es crítico
    } catch (error) {
      console.error('Error al actualizar last_ordered:', error);
      // No lanzar error, esta operación es opcional
    }
  }

  /**
   * ✅ NUEVO: Método para validar conexión de base de datos
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const result = await query('SELECT 1 as test');
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error en health check de favoritos:', error);
      return false;
    }
  }

  /**
   * ✅ NUEVO: Método para limpiar favoritos inactivos antiguos
   * @param userId ID del usuario
   * @param daysOld Días de antigüedad (por defecto 30)
   */
  static async cleanOldInactiveFavorites(userId: string, daysOld: number = 30): Promise<number> {
    try {
      const result = await query(`
        DELETE FROM mobile.user_favorites 
        WHERE user_id = $1 
          AND is_active = false 
          AND updated_at < NOW() - INTERVAL '${daysOld} days'
      `, [userId]);

      return result.rowCount ?? 0;
    } catch (error) {
      console.error('Error al limpiar favoritos antiguos:', error);
      return 0;
    }
  }

  /**
   * ✅ NUEVO: Método para obtener favoritos por categoría específica
   * @param userId ID del usuario
   * @param categoryId ID de la categoría
   */
  static async getFavoritosByCategory(userId: string, categoryId: string): Promise<ProductoFavorito[]> {
    try {
      const result = await query(`
        SELECT 
          uf.*,
          p.name as product_name,
          p.description as product_description,
          p.image_url as product_image,
          p.category_id
        FROM mobile.user_favorites uf
        INNER JOIN menu.products p ON uf.product_id = p.id
        WHERE uf.user_id = $1 
          AND uf.favorite_type = 'product'
          AND uf.is_active = true
          AND p.status = 'active'
          AND p.category_id = $2
        ORDER BY uf.created_at DESC
      `, [userId, categoryId]);

      if (!result.rows || !Array.isArray(result.rows)) {
        return [];
      }

      return result.rows.map((row: any) => this.mapRowToFavorito(row));
    } catch (error) {
      console.error('Error al obtener favoritos por categoría:', error);
      return [];
    }
  }

  /**
   * Mapea una fila de BD a ProductoFavorito
   * @private
   */
  private static mapRowToFavorito(row: any): ProductoFavorito {
    // ✅ VALIDACIONES ADICIONALES: Verificar que row existe y tiene las propiedades necesarias
    if (!row) {
      throw new Error('Row es null o undefined en mapRowToFavorito');
    }

    if (!row.id || !row.user_id || !row.product_id) {
      throw new Error('Row no tiene las propiedades requeridas en mapRowToFavorito');
    }

    return {
      id: row.id,
      user_id: row.user_id,
      product_id: row.product_id,
      favorite_type: row.favorite_type || 'product',
      is_active: Boolean(row.is_active),
      favorite_count: parseInt(row.favorite_count?.toString() || '0'),
      last_ordered: row.last_ordered ? new Date(row.last_ordered) : undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      product_name: row.product_name || undefined,
      product_description: row.product_description || undefined,
      product_image: row.product_image || undefined,
      category_id: row.category_id || undefined
    };
  }
}

/**
 * ✅ EXPORTACIÓN ADICIONAL: Instancia singleton para uso directo
 */
export const favoritosService = ProductosFavoritosService;

/**
 * ✅ TIPOS ADICIONALES ÚTILES
 */
export type FavoritoStatus = 'active' | 'inactive';
export type FavoritoResponse = {
  success: boolean;
  data?: ProductoFavorito | ProductoFavorito[];
  error?: string;
};

/**
 * ✅ CONSTANTES ÚTILES
 */
export const FAVORITOS_CONSTANTS = {
  MAX_FAVORITES_PER_USER: 100,
  CLEANUP_DAYS_DEFAULT: 30,
  FAVORITE_TYPE: 'product' as const
} as const;