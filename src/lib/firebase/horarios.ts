import fs from 'fs';
import path from 'path';
import { 
  HorariosSemanales, 
  ConfiguracionHorarios 
} from '@/services/horarios.service';

// Simulación de almacenamiento local
const HORARIOS_FILE = path.join(process.cwd(), 'public', 'test-data', 'horarios.json');

type HorariosData = Record<string, ConfiguracionHorarios>;

/**
 * Lee y parsea de forma segura los datos de horarios desde el archivo JSON.
 */
const readHorariosData = async (): Promise<HorariosData> => {
  try {
    if (!fs.existsSync(HORARIOS_FILE)) {
      return {};
    }
    const data = await fs.promises.readFile(HORARIOS_FILE, 'utf8');
    // Es importante manejar el caso de un archivo vacío.
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error al leer el archivo de horarios:', error);
    // Lanzar el error permite que la función que llama decida cómo manejarlo.
    throw new Error('No se pudo leer la configuración de horarios.');
  }
};

/**
 * Escribe los datos de horarios en el archivo JSON.
 */
const writeHorariosData = async (data: HorariosData): Promise<void> => {
  await fs.promises.writeFile(HORARIOS_FILE, JSON.stringify(data, null, 2), 'utf8');
};

/**
 * Guarda la configuración inicial de horarios cuando se configura por primera vez
 */
export const guardarHorarioInicial = async (
  idRestaurante: string,
  horarios: HorariosSemanales
): Promise<boolean> => {
  try {
    const horariosData = await readHorariosData();
    // Crear la configuración inicial
    horariosData[idRestaurante] = {
      horarioRegular: horarios,
      festivos: [],
      ultimaActualizacion: new Date()
    };
    
    // Guardar el archivo
    await writeHorariosData(horariosData);
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
    const horariosData = await readHorariosData();
    // Buscar los horarios del restaurante
    // También se convierten las fechas que vienen como string desde el JSON
    const horario = horariosData[idRestaurante];
    if (horario) {
      horario.ultimaActualizacion = new Date(horario.ultimaActualizacion);
    }
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
    const horariosData = await readHorariosData();
    
    // Actualizar los horarios del restaurante
    if (!horariosData[idRestaurante]) {
      // Si el restaurante no tiene horario y se provee uno, se crea.
      if (horarios.horarioRegular) {
        return await guardarHorarioInicial(idRestaurante, horarios.horarioRegular);
      }
      return false;
    }
    
    const horarioActualizado = {
      ...horariosData[idRestaurante],
      ...horarios,
      ultimaActualizacion: new Date()
    };
    horariosData[idRestaurante] = horarioActualizado;
    // Guardar el archivo
    await writeHorariosData(horariosData);
    return true;
  } catch (error) {
    console.error('Error al actualizar horarios:', error);
    return false;
  }
};
