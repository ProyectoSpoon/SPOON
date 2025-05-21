// /shared/services/horarios/servicio-horarios.ts
import { db } from '@/firebase/config';
;
import { RangoHorario, ConfiguracionHorario, FechaExcepcion } from '@/shared/types/horarios';
import { DateTime } from 'luxon';

export class ServicioHorarios {
  private static COLECCION = 'horarios';

  static async obtenerConfiguracion(restauranteId: string): Promise<ConfiguracionHorario | null> {
    try {
      const q = query(
        collection(db, this.COLECCION),
        where('restauranteId', '==', restauranteId)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      
      return snapshot.docs[0].data() as ConfiguracionHorario;
    } catch (error) {
      console.error('Error al obtener configuración:', error);
      throw error;
    }
  }

  static async guardarConfiguracion(
    restauranteId: string, 
    configuracion: ConfiguracionHorario
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLECCION, restauranteId);
      await updateDoc(docRef, { ...configuracion });
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      throw error;
    }
  }

  static async agregarExcepcion(
    restauranteId: string,
    excepcion: FechaExcepcion
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLECCION, restauranteId);
      await updateDoc(docRef, {
        excepciones: arrayUnion(excepcion)
      });
    } catch (error) {
      console.error('Error al agregar excepción:', error);
      throw error;
    }
  }

  static estaAbierto(
    configuracion: ConfiguracionHorario,
    fecha: Date = new Date()
  ): boolean {
    const dt = DateTime.fromJSDate(fecha).setZone(configuracion.zonaHoraria);
    const diaSemana = dt.weekday;
    
    // Verificar excepciones
    const esExcepcion = configuracion.excepciones.find(exc => 
      DateTime.fromJSDate(exc.fecha).hasSame(dt, 'day')
    );
    
    if (esExcepcion) {
      if (esExcepcion.estaCerrado) return false;
      if (esExcepcion.rangos) {
        return this.verificarRangosHorarios(dt, esExcepcion.rangos);
      }
    }

    // Verificar horario normal
    const horariosDelDia = configuracion.horariosPorDefecto[diaSemana];
    return this.verificarRangosHorarios(dt, horariosDelDia);
  }

  private static verificarRangosHorarios(dt: DateTime, rangos: RangoHorario[]): boolean {
    const horaActual = dt.toFormat('HH:mm');
    return rangos.some(rango => 
      rango.estaActivo && 
      rango.horaApertura !== null &&
      rango.horaCierre !== null &&
      horaActual >= rango.horaApertura && 
      horaActual <= rango.horaCierre
    );
  }
}