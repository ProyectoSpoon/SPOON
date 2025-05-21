;
import { db } from '@/firebase/config';

interface ConfiguracionLegal {
  datosRestaurante: {
    nombre: string;
    descripcion: string;
    razonSocial: string;
    nit: string;
    regimenTributario: string;
    actividadEconomica: string;
    telefono: string;
    email: string;
    tipoRestaurante: string;
    especialidad: string;
    capacidad: string;
  };
  representanteLegal: {
    nombres: string;
    apellidos: string;
    tipoDocumento: string;
    numeroDocumento: string;
    email: string;
    telefono: string;
    cargo: string;
  };
  documentos: Record<string, {
    id: string;
    nombre: string;
    archivo: File | null;
    estado: 'pendiente' | 'cargando' | 'completado' | 'error';
    error?: string;
  }>;
  pasoCompletado: number;
  configuracionCompleta: boolean;
}

export const guardarConfiguracionLegal = async (
  email: string, 
  datos: ConfiguracionLegal
) => {
  try {
    const docRef = doc(db, 'dueno_restaurante', email);
    
    return await updateDoc(docRef, {
      ...datos,
      updatedAt: new Date(),
      'info_legal.completed': datos.configuracionCompleta,
      'info_legal.lastUpdated': new Date(),
      'info_legal.currentStep': datos.pasoCompletado
    });
  } catch (error) {
    console.error('Error al guardar configuración legal:', error);
    throw error;
  }
};