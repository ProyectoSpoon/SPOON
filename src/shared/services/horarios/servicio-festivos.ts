// /shared/services/horarios/servicio-festivos.ts
import { Festivo, ConfiguracionFestivos } from '@/shared/types/horarios';

export class ServicioFestivos {
  private static COLECCION = 'festivos';

  static async obtenerFestivos(
    restauranteId: string, 
    año: number
  ): Promise<ConfiguracionFestivos | null> {
    try {
      const q = query(
        collection(db, this.COLECCION),
        where('restauranteId', '==', restauranteId),
        where('año', '==', año)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      
      return snapshot.docs[0].data() as ConfiguracionFestivos;
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
      const docRef = await addDoc(collection(db, this.COLECCION), {
        ...festivo,
        restauranteId,
        createdAt: new Date()
      });
      return docRef.id;
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
      const docRef = doc(db, this.COLECCION, festivoId);
      await updateDoc(docRef, {
        deleted: true,
        deletedAt: new Date()
      });
    } catch (error) {
      console.error('Error al eliminar festivo:', error);
      throw error;
    }
  }
}
