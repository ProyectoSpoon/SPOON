import { toast } from 'sonner';
import { jsonDataService } from '@/services/json-data.service';

export interface FavoritoDoc {
  id: string;
  restauranteId: string;
  combinacionId: string;
  createdAt: Date;
}

// Definir la interfaz para los favoritos devueltos por jsonDataService
interface JsonFavorito {
  id?: string;
  restauranteId?: string;
  restaurante_id?: string;
  combinacionId?: string;
  combinacion_id?: string;
  createdAt?: Date;
  created_at?: Date;
}

export const favoritosService = {
  async getFavoritos(restauranteId: string): Promise<FavoritoDoc[]> {
    try {
      // Si no hay restauranteId, retornar array vacío
      if (!restauranteId) {
        console.warn('getFavoritos: restauranteId es undefined o vacío');
        return [];
      }
      
      // Usar el servicio JSON para obtener favoritos
      const jsonFavoritos = await jsonDataService.getFavoritos(restauranteId) as JsonFavorito[];
      
      // Convertir al formato esperado
      return jsonFavoritos.map(fav => ({
        id: fav.id || `fav-${Date.now()}`,
        restauranteId: fav.restauranteId || fav.restaurante_id || restauranteId,
        combinacionId: fav.combinacionId || fav.combinacion_id || '',
        createdAt: fav.createdAt instanceof Date ? fav.createdAt : 
                  fav.created_at instanceof Date ? fav.created_at : new Date()
      }));
    } catch (error) {
      console.error('Error al obtener favoritos:', error);
      // En caso de error, devolver un array vacío para no bloquear la aplicación
      return [];
    }
  },

  async toggleFavorito(restauranteId: string, combinacionId: string) {
    try {
      // Validar parámetros
      if (!restauranteId || !combinacionId) {
        console.error('toggleFavorito: restauranteId o combinacionId son undefined o vacíos');
        return null;
      }
      
      // Usar el servicio JSON para toggle favorito
      return jsonDataService.toggleFavorito(restauranteId, combinacionId);
    } catch (error) {
      console.error('Error al togglear favorito:', error);
      // En caso de error, notificar al usuario pero permitir que la UI siga funcionando
      toast.error('No se pudo actualizar el favorito. Intente nuevamente.');
      return null;
    }
  }
};
