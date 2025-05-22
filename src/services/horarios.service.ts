import fs from 'fs';
import path from 'path';

// Definición de tipos para horarios
export interface RangoHorario {
  horaApertura: string;
  horaCierre: string;
  estaActivo: boolean;
}

export interface HorariosSemanales {
  [dia: string]: RangoHorario[];
}

export interface ConfiguracionHorarios {
  horarioRegular: HorariosSemanales;
  festivos: Array<{
    fecha: Date;
    descripcion: string;
    tipo: 'festivo' | 'personalizado';
  }>;
  ultimaActualizacion: Date;
}

// Simulación de almacenamiento local
const HORARIOS_FILE = path.join(process.cwd(), 'public', 'test-data', 'horarios.json');

// Función auxiliar para leer horarios desde archivo JSON
const leerHorariosDesdeJSON = async (idRestaurante: string) => {
  try {
    // Verificar si el archivo existe
    if (!fs.existsSync(HORARIOS_FILE)) {
      // Si no existe, crear un objeto vacío
      return null;
    }
    
    // Leer el archivo
    const data = await fs.promises.readFile(HORARIOS_FILE, 'utf8');
    const horarios: Record<string, ConfiguracionHorarios> = JSON.parse(data);
    
    // Buscar los horarios del restaurante
    return horarios[idRestaurante] || null;
  } catch (error) {
    console.error('Error al leer horarios desde JSON:', error);
    return null;
  }
};

// Función auxiliar para guardar horarios en archivo JSON
const guardarHorariosEnJSON = async (idRestaurante: string, datos: ConfiguracionHorarios) => {
  try {
    // Verificar si el archivo existe
    let horarios: Record<string, ConfiguracionHorarios> = {};
    if (fs.existsSync(HORARIOS_FILE)) {
      // Si existe, leer el contenido actual
      const data = await fs.promises.readFile(HORARIOS_FILE, 'utf8');
      horarios = JSON.parse(data);
    }
    
    // Actualizar los horarios del restaurante
    horarios[idRestaurante] = datos;
    
    // Guardar el archivo
    await fs.promises.writeFile(HORARIOS_FILE, JSON.stringify(horarios, null, 2), 'utf8');
    
    return true;
  } catch (error) {
    console.error('Error al guardar horarios en JSON:', error);
    return false;
  }
};
  
/**
 * Guarda los horarios en la configuración inicial y valida los datos
 */
export const guardarConfiguracionInicial = async (
  idRestaurante: string,
  horarios: HorariosSemanales
): Promise<{ exito: boolean; error?: string }> => {
  try {
    // Validar que todos los días tengan al menos un horario
    for (const dia of Object.keys(horarios)) {
      if (!horarios[dia] || horarios[dia].length === 0) {
        return {
          exito: false,
          error: `El día ${dia} debe tener al menos un horario configurado`
        };
      }

      // Validar cada rango horario
      for (const rango of horarios[dia]) {
        if (!rango.horaApertura || !rango.horaCierre) {
          return {
            exito: false,
            error: `Horarios incompletos en ${dia}`
          };
        }
      }
    }

    // Si pasa las validaciones, guardar en JSON
    const datos = {
      horarioRegular: horarios,
      festivos: [],
      ultimaActualizacion: new Date()
    };
    
    const guardado = await guardarHorariosEnJSON(idRestaurante, datos);
    
    if (!guardado) {
      return {
        exito: false,
        error: 'Error al guardar los horarios'
      };
    }

    return { exito: true };
  
    } catch (error) {
      console.error('Error en el servicio de horarios:', error);
      return {
        exito: false,
        error: 'Error inesperado al guardar los horarios'
      };
    }
  };
  
/**
 * Obtiene los horarios con lógica adicional de negocio
 */
export const obtenerHorariosActuales = async (idRestaurante: string) => {
  try {
    const horarios = await leerHorariosDesdeJSON(idRestaurante);
    
    if (!horarios) {
      return null;
    }

    // Aquí podrías añadir lógica adicional como:
    // - Formatear fechas
    // - Filtrar días festivos pasados
    // - Calcular próximos horarios especiales
    // etc.

    return horarios;
  
    } catch (error) {
      console.error('Error al obtener horarios actuales:', error);
      return null;
    }
  };
  
/**
 * Actualiza los horarios desde el dashboard con validaciones
 */
export const actualizarHorariosRestaurante = async (
  idRestaurante: string,
  horarios: HorariosSemanales
) => {
  try {
    // Obtener los horarios actuales
    const horariosActuales = await leerHorariosDesdeJSON(idRestaurante);
    
    // Si no existen, crear nuevos
    if (!horariosActuales) {
      return await guardarConfiguracionInicial(idRestaurante, horarios);
    }
    
    // Actualizar solo el horario regular
    const datosActualizados = {
      ...horariosActuales,
      horarioRegular: horarios,
      ultimaActualizacion: new Date()
    };
    
    // Guardar los datos actualizados
    const actualizado = await guardarHorariosEnJSON(idRestaurante, datosActualizados);
    
    return actualizado;
    } catch (error) {
      console.error('Error al actualizar horarios:', error);
      return false;
    }
  };
