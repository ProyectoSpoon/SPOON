// src/services/postgres/favoritos.service.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente con service role para operaciones administrativas
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface FavoritoPostgresDoc {
  id: string;
  restaurante_id: string;
  combinacion_id: string;
  created_at: Date;
}

export const favoritosServicePostgres = {
  /**
   * Obtiene las combinaciones favoritas de un restaurante
   * @param restauranteId ID del restaurante
   */
  async getFavoritos(restauranteId: string): Promise<FavoritoPostgresDoc[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('favorite_combinations')
        .select('id, restaurant_id, combination_id, created_at')
        .eq('restaurant_id', restauranteId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al obtener favoritos:', error);
        throw error;
      }

      return (data || []).map(row => ({
        id: row.id,
        restaurante_id: row.restaurant_id,
        combinacion_id: row.combination_id,
        created_at: new Date(row.created_at)
      }));
    } catch (error) {
      console.error('Error al obtener favoritos de Supabase:', error);
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
      const { data: existing, error: checkError } = await supabaseAdmin
        .from('favorite_combinations')
        .select('id')
        .eq('restaurant_id', restauranteId)
        .eq('combination_id', combinacionId)
        .maybeSingle();

      if (checkError) {
        console.error('Error al verificar favorito:', checkError);
        throw checkError;
      }

      if (!existing) {
        // No existe, lo agregamos como favorito
        const { data, error: insertError } = await supabaseAdmin
          .from('favorite_combinations')
          .insert({
            restaurant_id: restauranteId,
            combination_id: combinacionId,
            created_at: new Date().toISOString()
          })
          .select('id, restaurant_id, combination_id, created_at')
          .single();

        if (insertError) {
          console.error('Error al insertar favorito:', insertError);
          throw insertError;
        }

        return {
          id: data.id,
          restaurante_id: data.restaurant_id,
          combinacion_id: data.combination_id,
          created_at: new Date(data.created_at)
        };
      } else {
        // Ya existe, lo eliminamos como favorito
        const { error: deleteError } = await supabaseAdmin
          .from('favorite_combinations')
          .delete()
          .eq('restaurant_id', restauranteId)
          .eq('combination_id', combinacionId);

        if (deleteError) {
          console.error('Error al eliminar favorito:', deleteError);
          throw deleteError;
        }

        return true;
      }
    } catch (error) {
      console.error('Error al toggle favorito en Supabase:', error);
      throw error;
    }
  },

  /**
   * Verifica si una combinación es favorita
   * @param restauranteId ID del restaurante
   * @param combinacionId ID de la combinación
   */
  async esFavorito(restauranteId: string, combinacionId: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdmin
        .from('favorite_combinations')
        .select('id')
        .eq('restaurant_id', restauranteId)
        .eq('combination_id', combinacionId)
        .maybeSingle();

      if (error) {
        console.error('Error al verificar favorito:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error al verificar favorito:', error);
      return false;
    }
  },

  /**
   * Elimina un favorito por su ID
   * @param favoritoId ID del favorito
   */
  async eliminarFavorito(favoritoId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('favorite_combinations')
        .delete()
        .eq('id', favoritoId);

      if (error) {
        console.error('Error al eliminar favorito:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      throw error;
    }
  }
};
