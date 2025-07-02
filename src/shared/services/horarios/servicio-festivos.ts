// /shared/services/horarios/servicio-festivos.ts
import { Festivo, ConfiguracionFestivos } from '@/shared/types/horarios';

export class ServicioFestivos {
  private static COLECCION = 'festivos';

  static async obtenerFestivos(
    restauranteId: string, 
    año: number
  ): Promise<ConfiguracionFestivos | null> {
    try {
      // Mock implementation for build
      console.log(`Obteniendo festivos para restaurante ${restauranteId}, año ${año}`);
      
      // Return mock data
      return {
        habilitado: true,
        tiposPermitidos: ['nacional', 'regional', 'local', 'personalizado'],
        festivosNacionales: [],
        festivosLocales: [],
        festivosPersonalizados: []
      };
    } catch (error) {
      console.error('Error al obtener festivos:', error);
      throw error;
    }
  }

  static async agregarFestivo(
    restauranteId: string,
    festivo: Omit<Festivo, 'id'>
  ): Promise<string> {
    try {
      // Mock implementation for build
      console.log(`Agregando festivo para restaurante ${restauranteId}:`, festivo);
      
      // Return mock ID
      return `mock-festivo-${Date.now()}`;
    } catch (error) {
      console.error('Error al agregar festivo:', error);
      throw error;
    }
  }

  static async eliminarFestivo(
    restauranteId: string,
    festivoId: string
  ): Promise<void> {
    try {
      // Mock implementation for build
      console.log(`Eliminando festivo ${festivoId} para restaurante ${restauranteId}`);
    } catch (error) {
      console.error('Error al eliminar festivo:', error);
      throw error;
    }
  }
}
