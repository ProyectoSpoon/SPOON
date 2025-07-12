import { MenuCombinacion } from "@/app/dashboard/carta/types/menu.types";

/**
 * Servicio para manejar la persistencia de combinaciones y sus cantidades
 * usando PostgreSQL a través de endpoints de API
 */
export const combinacionesService = {
  /**
   * Guarda o actualiza una combinación en la base de datos
   * @param restauranteId ID del restaurante
   * @param combinacion La combinación a guardar
   */
  async guardarCombinacion(restauranteId: string, combinacion: MenuCombinacion): Promise<void> {
    try {
      console.log('💾 Guardando combinación en PostgreSQL:', { 
        restauranteId, 
        combinacionId: combinacion.id 
      });

      const response = await fetch('/api/combinaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restauranteId,
          combinacion
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Combinación guardada en PostgreSQL:', result);
    } catch (error) {
      console.error('❌ Error al guardar combinación en PostgreSQL:', error);
      throw error;
    }
  },

  /**
   * Guarda o actualiza múltiples combinaciones en la base de datos
   * @param restauranteId ID del restaurante
   * @param combinaciones Lista de combinaciones a guardar
   */
  async guardarCombinaciones(restauranteId: string, combinaciones: MenuCombinacion[]): Promise<void> {
    try {
      console.log('💾 Guardando múltiples combinaciones en PostgreSQL:', { 
        restauranteId, 
        cantidad: combinaciones.length 
      });

      const response = await fetch('/api/combinaciones/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restauranteId,
          combinaciones
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Combinaciones guardadas en PostgreSQL:', result);
    } catch (error) {
      console.error('❌ Error al guardar combinaciones en PostgreSQL:', error);
      throw error;
    }
  },

  /**
   * Obtiene las combinaciones guardadas para un restaurante
   * @param restauranteId ID del restaurante
   */
  async getCombinaciones(restauranteId: string): Promise<Record<string, any>[]> {
    try {
      console.log('🔄 Obteniendo combinaciones desde PostgreSQL para restaurante:', restauranteId);

      const response = await fetch(`/api/combinaciones?restauranteId=${restauranteId}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transformar las combinaciones al formato esperado
      const combinaciones = (data.combinaciones || []).map((combinacion: any) => ({
        id: combinacion.id,
        combinacionId: combinacion.id,
        restauranteId: combinacion.restaurante_id || combinacion.restauranteId || restauranteId,
        cantidad: combinacion.cantidad || 0,
        nombre: combinacion.nombre || `Combinación ${combinacion.id}`,
        favorito: combinacion.favorito || false,
        especial: combinacion.especial || false,
        createdAt: combinacion.created_at ? new Date(combinacion.created_at) : new Date(),
        updatedAt: combinacion.updated_at ? new Date(combinacion.updated_at) : new Date(),
        programacion: combinacion.programacion || []
      }));

      console.log('✅ Combinaciones obtenidas desde PostgreSQL:', combinaciones.length);
      return combinaciones;
    } catch (error) {
      console.error('❌ Error al obtener combinaciones desde PostgreSQL:', error);
      // Retornar array vacío en caso de error para no bloquear la aplicación
      return [];
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
      console.log('📊 Registrando venta en PostgreSQL:', {
        restauranteId,
        combinacionId,
        cantidad,
        fecha
      });

      const response = await fetch('/api/combinaciones/ventas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restauranteId,
          combinacionId,
          cantidad,
          fecha: fecha.toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Venta registrada en PostgreSQL:', result);
    } catch (error) {
      console.error('❌ Error al registrar venta de combinación en PostgreSQL:', error);
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
  ): Promise<Record<string, any>[]> {
    try {
      console.log('📈 Obteniendo estadísticas desde PostgreSQL:', {
        restauranteId,
        fechaInicio,
        fechaFin
      });

      const response = await fetch(`/api/combinaciones/estadisticas?` + new URLSearchParams({
        restauranteId,
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString()
      }));

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('✅ Estadísticas obtenidas desde PostgreSQL:', data.estadisticas?.length || 0);
      return data.estadisticas || [];
    } catch (error) {
      console.error('❌ Error al obtener estadísticas de ventas desde PostgreSQL:', error);
      // Retornar array vacío en caso de error
      return [];
    }
  }
};
