import { db } from '@/firebase/config';  // Actualizado el import
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { HorariosSemanales } from '@/app/dashboard/horario-comercial/types/horarios.types';

interface ConfiguracionHorarios {
  horarioRegular: HorariosSemanales;
  festivos: Array<{
    fecha: Date;
    descripcion: string;
    tipo: 'festivo' | 'personalizado';
  }>;
  ultimaActualizacion: Date;
}

/**
 * Guarda la configuración inicial de horarios cuando se configura por primera vez
 */
export const guardarHorarioInicial = async (
  idRestaurante: string,
  horarios: HorariosSemanales
): Promise<boolean> => {
  try {
    const horarioRef = doc(db, 'restaurantes', idRestaurante, 'configuracion', 'horario');
    await setDoc(horarioRef, {
      horarioRegular: horarios,
      festivos: [],
      ultimaActualizacion: new Date(),
    });
    return true;
  } catch (error) {
    console.error('Error al guardar horario inicial:', error);
    return false;
  }
};

/**
 * Obtiene la configuración completa de horarios
 */
export const obtenerHorarios = async (
  idRestaurante: string
): Promise<ConfiguracionHorarios | null> => {
  try {
    const horarioRef = doc(db, 'restaurantes', idRestaurante, 'configuracion', 'horario');
    const snapshot = await getDoc(horarioRef);

    if (snapshot.exists()) {
      return snapshot.data() as ConfiguracionHorarios;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    return null;
  }
};

/**
 * Actualiza los horarios desde el dashboard
 */
export const actualizarHorarios = async (
  idRestaurante: string,
  horarios: Partial<ConfiguracionHorarios>
): Promise<boolean> => {
  try {
    const horarioRef = doc(db, 'restaurantes', idRestaurante, 'configuracion', 'horario');
    await updateDoc(horarioRef, {
      ...horarios,
      ultimaActualizacion: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error al actualizar horarios:', error);
    return false;
  }
};