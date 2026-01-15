// src/services/postgres/combinaciones.service.ts
import { createClient } from '@supabase/supabase-js';
import { MenuCombinacion } from "@/app/dashboard/carta/types/menu.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente con service role para operaciones administrativas
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Estructura para almacenar combinaciones
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
 * Servicio para manejar la persistencia de combinaciones usando Supabase SDK
 */
export const combinacionesServicePostgres = {
  /**
   * Guarda o actualiza una combinación en la base de datos
   * @param restauranteId ID del restaurante
   * @param combinacion La combinación a guardar
   */
  async guardarCombinacion(restauranteId: string, combinacion: MenuCombinacion): Promise<void> {
    try {
      // Primero intentamos actualizar
      const { data: existing } = await supabaseAdmin
        .from('generated_combinations')
        .select('id')
        .eq('restaurant_id', restauranteId)
        .eq('combination_id', combinacion.id)
        .maybeSingle();

      const combinacionData = {
        restaurant_id: restauranteId,
        combination_id: combinacion.id,
        quantity: combinacion.cantidad || 0,
        name: `${combinacion.principio?.nombre || 'Principio'} con ${combinacion.proteina?.nombre || 'Proteína'}`,
        is_favorite: combinacion.favorito || false,
        is_special: combinacion.especial || false,
        special_price: combinacion.precioEspecial || null,
        available_from: combinacion.disponibilidadEspecial?.desde || null,
        available_until: combinacion.disponibilidadEspecial?.hasta || null,
        updated_at: new Date().toISOString()
      };

      if (existing) {
        // Actualizar existente
        const { error } = await supabaseAdmin
          .from('generated_combinations')
          .update(combinacionData)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insertar nuevo
        const { error } = await supabaseAdmin
          .from('generated_combinations')
          .insert({
            ...combinacionData,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      // Manejar programaciones si existen
      if (combinacion.programacion && combinacion.programacion.length > 0) {
        // Eliminar programaciones existentes
        await supabaseAdmin
          .from('combination_schedules')
          .delete()
          .eq('restaurant_id', restauranteId)
          .eq('combination_id', combinacion.id);

        // Insertar nuevas programaciones
        const programaciones = combinacion.programacion.map(prog => ({
          restaurant_id: restauranteId,
          combination_id: combinacion.id,
          scheduled_date: prog.fecha,
          scheduled_quantity: prog.cantidadProgramada,
          created_at: new Date().toISOString()
        }));

        const { error: schedError } = await supabaseAdmin
          .from('combination_schedules')
          .insert(programaciones);

        if (schedError) {
          console.error('Error al guardar programaciones:', schedError);
        }
      }
    } catch (error) {
      console.error('Error al guardar combinación en Supabase:', error);
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
      for (const combinacion of combinaciones) {
        await this.guardarCombinacion(restauranteId, combinacion);
      }
    } catch (error) {
      console.error('Error al guardar combinaciones en Supabase:', error);
      throw error;
    }
  },

  /**
   * Obtiene las combinaciones guardadas para un restaurante
   * @param restauranteId ID del restaurante
   */
  async getCombinaciones(restauranteId: string): Promise<any[]> {
    try {
      // Obtenemos las combinaciones
      const { data: combinaciones, error } = await supabaseAdmin
        .from('generated_combinations')
        .select('*')
        .eq('restaurant_id', restauranteId);

      if (error) throw error;

      // Para cada combinación, obtenemos sus programaciones
      const combinacionesConProgramacion = [];

      for (const combinacion of combinaciones || []) {
        const { data: programaciones } = await supabaseAdmin
          .from('combination_schedules')
          .select('*')
          .eq('restaurant_id', restauranteId)
          .eq('combination_id', combinacion.combination_id)
          .order('scheduled_date', { ascending: true });

        // Formateamos las programaciones
        const programacionesFormateadas = (programaciones || []).map(row => ({
          fecha: row.scheduled_date,
          cantidadProgramada: row.scheduled_quantity
        }));

        // Añadimos la disponibilidad especial si existe
        let disponibilidadEspecial = null;
        if (combinacion.available_from && combinacion.available_until) {
          disponibilidadEspecial = {
            desde: combinacion.available_from,
            hasta: combinacion.available_until
          };
        }

        combinacionesConProgramacion.push({
          id: combinacion.id,
          combinacionId: combinacion.combination_id,
          restauranteId: combinacion.restaurant_id,
          cantidad: combinacion.quantity,
          nombre: combinacion.name,
          favorito: combinacion.is_favorite,
          especial: combinacion.is_special,
          precioEspecial: combinacion.special_price,
          disponibilidadEspecial,
          programacion: programacionesFormateadas,
          createdAt: combinacion.created_at,
          updatedAt: combinacion.updated_at
        });
      }

      return combinacionesConProgramacion;
    } catch (error) {
      console.error('Error al obtener combinaciones de Supabase:', error);
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
      const { error } = await supabaseAdmin
        .from('combination_sales')
        .insert({
          restaurant_id: restauranteId,
          combination_id: combinacionId,
          quantity: cantidad,
          sale_date: fecha.toISOString(),
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error al registrar venta de combinación en Supabase:', error);
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
      const { data, error } = await supabaseAdmin
        .from('combination_sales')
        .select('combination_id, quantity, sale_date, created_at')
        .eq('restaurant_id', restauranteId)
        .gte('sale_date', fechaInicio.toISOString())
        .lte('sale_date', fechaFin.toISOString())
        .order('sale_date', { ascending: true });

      if (error) throw error;

      // Agrupar por combinación y día
      const estadisticas = new Map<string, any>();

      (data || []).forEach(venta => {
        const dia = new Date(venta.sale_date).toISOString().split('T')[0];
        const key = `${venta.combination_id}_${dia}`;

        if (!estadisticas.has(key)) {
          estadisticas.set(key, {
            combinacion_id: venta.combination_id,
            dia,
            total_vendido: 0,
            primera_venta: venta.created_at
          });
        }

        const stat = estadisticas.get(key);
        stat.total_vendido += venta.quantity;
      });

      return Array.from(estadisticas.values());
    } catch (error) {
      console.error('Error al obtener estadísticas de ventas de Supabase:', error);
      throw error;
    }
  },

  /**
   * Elimina una combinación
   * @param restauranteId ID del restaurante
   * @param combinacionId ID de la combinación
   */
  async eliminarCombinacion(restauranteId: string, combinacionId: string): Promise<void> {
    try {
      // Las programaciones y ventas se eliminarán en cascada si hay FK configuradas
      const { error } = await supabaseAdmin
        .from('generated_combinations')
        .delete()
        .eq('restaurant_id', restauranteId)
        .eq('combination_id', combinacionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error al eliminar combinación:', error);
      throw error;
    }
  }
};
