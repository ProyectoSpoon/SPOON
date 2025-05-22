import fs from 'fs';
import path from 'path';
import { 
  HorariosSemanales, 
  ConfiguracionHorarios 
} from '@/services/horarios.service';

// Simulación de almacenamiento local
const HORARIOS_FILE = path.join(process.cwd(), 'public', 'test-data', 'horarios.json');

/**
 * Guarda la configuración inicial de horarios cuando se configura por primera vez
 */
export const guardarHorarioInicial = async (
  idRestaurante: string,
  horarios: HorariosSemanales
): Promise<boolean> => {
  try {
    // Verificar si el archivo existe
    let horariosData: Record<string, ConfiguracionHorarios> = {};
    if (fs.existsSync(HORARIOS_FILE)) {
      // Si existe, leer el contenido actual
      const data = await fs.promises.readFile(HORARIOS_FILE, 'utf8');
      horariosData = JSON.parse(data);
    }
    
    // Crear la configuración inicial
    horariosData[idRestaurante] = {
      horarioRegular: horarios,
      festivos: [],
      ultimaActualizacion: new Date()
    };
    
    // Guardar el archivo
    await fs.promises.writeFile(HORARIOS_FILE, JSON.stringify(horariosData, null, 2), 'utf8');
    
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
    // Verificar si el archivo existe
    if (!fs.existsSync(HORARIOS_FILE)) {
      return null;
    }
    
    // Leer el archivo
    const data = await fs.promises.readFile(HORARIOS_FILE, 'utf8');
    const horariosData: Record<string, ConfiguracionHorarios> = JSON.parse(data);
    
    // Buscar los horarios del restaurante
    return horariosData[idRestaurante] || null;
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
    // Verificar si el archivo existe
    if (!fs.existsSync(HORARIOS_FILE)) {
      // Si no existe, crear un objeto vacío
      if (horarios.horarioRegular) {
        return await guardarHorarioInicial(idRestaurante, horarios.horarioRegular);
      }
      return false;
    }
    
    // Leer el archivo
    const data = await fs.promises.readFile(HORARIOS_FILE, 'utf8');
    const horariosData: Record<string, ConfiguracionHorarios> = JSON.parse(data);
    
    // Actualizar los horarios del restaurante
    if (!horariosData[idRestaurante]) {
      if (horarios.horarioRegular) {
        return await guardarHorarioInicial(idRestaurante, horarios.horarioRegular);
      }
      return false;
    }
    
    horariosData[idRestaurante] = {
      ...horariosData[idRestaurante],
      ...horarios,
      ultimaActualizacion: new Date()
    };
    
    // Guardar el archivo
    await fs.promises.writeFile(HORARIOS_FILE, JSON.stringify(horariosData, null, 2), 'utf8');
    
    return true;
  } catch (error) {
    console.error('Error al actualizar horarios:', error);
    return false;
  }
};
