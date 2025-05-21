import { MenuCombinacion } from "@/app/dashboard/carta/types/menu.types";
import { jsonDataService } from "@/services/json-data.service";

/**
 * Servicio para manejar la persistencia de combinaciones y sus cantidades
 * usando el servicio de datos JSON
 */
export const combinacionesService = {
  /**
   * Guarda o actualiza una combinación en la base de datos
   * @param restauranteId ID del restaurante
   * @param combinacion La combinación a guardar
   */
  async guardarCombinacion(restauranteId: string, combinacion: MenuCombinacion): Promise<void> {
    try {
      // Usar el servicio JSON para guardar la combinación
      return jsonDataService.guardarCombinacion(restauranteId, combinacion);
    } catch (error) {
      console.error('Error al guardar combinación:', error);
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
      // Usar el servicio JSON para guardar las combinaciones
      return jsonDataService.guardarCombinaciones(restauranteId, combinaciones);
    } catch (error) {
      console.error('Error al guardar combinaciones:', error);
      throw error;
    }
  },

  /**
   * Obtiene las combinaciones guardadas para un restaurante
   * @param restauranteId ID del restaurante
   */
  async getCombinaciones(restauranteId: string): Promise<Record<string, any>[]> {
    try {
      // Obtener combinaciones desde el servicio JSON
      const combinaciones = await jsonDataService.getCombinaciones();
      
      // Transformar las combinaciones al formato esperado
      return combinaciones.map((combinacion: any) => ({
        id: combinacion.id,
        combinacionId: combinacion.id,
        restauranteId: restauranteId,
        cantidad: combinacion.cantidad || 0,
        nombre: combinacion.nombre || `Combinación ${combinacion.id}`,
        favorito: combinacion.favorito || false,
        especial: combinacion.especial || false,
        createdAt: new Date(),
        updatedAt: new Date(),
        programacion: combinacion.programacion || []
      }));
    } catch (error) {
      console.error('Error al obtener combinaciones:', error);
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
      // En la implementación JSON, simplemente registramos en la consola
      console.log('Simulando registro de venta:', {
        restauranteId,
        combinacionId,
        cantidad,
        fecha
      });
      return Promise.resolve();
    } catch (error) {
      console.error('Error al registrar venta de combinación:', error);
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
      // En la implementación JSON, devolvemos un array vacío
      console.log('Simulando obtención de estadísticas:', {
        restauranteId,
        fechaInicio,
        fechaFin
      });
      return [];
    } catch (error) {
      console.error('Error al obtener estadísticas de ventas:', error);
      throw error;
    }
  }
};
