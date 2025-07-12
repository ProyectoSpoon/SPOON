import { toast } from 'sonner';

export interface FavoritoDoc {
  id: string;
  restauranteId: string;
  combinacionId: string;
  createdAt: Date;
}

export const favoritosService = {
  async getFavoritos(restauranteId: string): Promise<FavoritoDoc[]> {
    try {
      // Si no hay restauranteId, retornar array vacío
      if (!restauranteId) {
        console.warn('getFavoritos: restauranteId es undefined o vacío');
        return [];
      }
      
      console.log('🔄 Cargando favoritos desde PostgreSQL para restaurante:', restauranteId);
      
      // Llamada al endpoint de PostgreSQL
      const response = await fetch(`/api/favoritos?restauranteId=${restauranteId}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Convertir al formato esperado
      const favoritos = (data.favoritos || []).map((fav: any) => ({
        id: fav.id || `fav-${Date.now()}`,
        restauranteId: fav.restaurante_id || fav.restauranteId || restauranteId,
        combinacionId: fav.combinacion_id || fav.combinacionId || '',
        createdAt: fav.created_at ? new Date(fav.created_at) : new Date()
      }));
      
      console.log('✅ Favoritos cargados desde PostgreSQL:', favoritos.length);
      return favoritos;
    } catch (error) {
      console.error('❌ Error al obtener favoritos desde PostgreSQL:', error);
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
      
      console.log('💫 Toggling favorito en PostgreSQL:', { restauranteId, combinacionId });
      
      // Llamada al endpoint de PostgreSQL para toggle
      const response = await fetch('/api/favoritos/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restauranteId,
          combinacionId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      console.log('✅ Favorito actualizado en PostgreSQL:', result);
      return result;
    } catch (error) {
      console.error('❌ Error al togglear favorito en PostgreSQL:', error);
      // En caso de error, notificar al usuario pero permitir que la UI siga funcionando
      toast.error('No se pudo actualizar el favorito. Intente nuevamente.');
      return null;
    }
  }
};
