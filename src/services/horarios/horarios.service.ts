/**
 * Servicio para gestionar los horarios del restaurante utilizando localStorage
 * @module HorariosService
 */

import { HorariosSemanales } from '@/app/dashboard/horario-comercial/types/horarios.types';

/**
 * Interfaz para los datos de horarios completos
 */
export interface DatosHorarios {
  horarioRegular: HorariosSemanales;
  fechaActualizacion: string;
}

/**
 * Prefijo para las claves de localStorage
 */
const STORAGE_PREFIX = 'spoon_horarios_';

/**
 * Obtiene los horarios de un restaurante desde localStorage
 * @param {string} idRestaurante - ID del restaurante
 * @returns {Promise<DatosHorarios | null>} Datos de horarios o null si no existen
 */
export const obtenerHorarios = async (idRestaurante: string): Promise<DatosHorarios | null> => {
  try {
    // Simulamos una operación asíncrona para mantener la misma interfaz que tendría con Firebase
    return new Promise((resolve) => {
      setTimeout(() => {
        // Intentamos obtener los datos del localStorage
        const storageKey = `${STORAGE_PREFIX}${idRestaurante}`;
        const datosGuardados = localStorage.getItem(storageKey);
        
        if (datosGuardados) {
          try {
            const datos = JSON.parse(datosGuardados) as DatosHorarios;
            resolve(datos);
          } catch (error) {
            console.error('Error al parsear datos de horarios:', error);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      }, 300); // Simulamos un pequeño retraso para emular una operación de red
    });
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    return null;
  }
};

/**
 * Actualiza los horarios de un restaurante en localStorage
 * @param {string} idRestaurante - ID del restaurante
 * @param {Partial<DatosHorarios>} datos - Datos de horarios a actualizar
 * @returns {Promise<boolean>} True si la operación fue exitosa
 */
export const actualizarHorarios = async (
  idRestaurante: string,
  datos: Partial<DatosHorarios>
): Promise<boolean> => {
  try {
    // Simulamos una operación asíncrona para mantener la misma interfaz que tendría con Firebase
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const storageKey = `${STORAGE_PREFIX}${idRestaurante}`;
          
          // Intentamos obtener datos existentes
          const datosExistentesStr = localStorage.getItem(storageKey);
          let datosExistentes: DatosHorarios | null = null;
          
          if (datosExistentesStr) {
            try {
              datosExistentes = JSON.parse(datosExistentesStr) as DatosHorarios;
            } catch (error) {
              console.error('Error al parsear datos existentes:', error);
            }
          }
          
          // Combinamos los datos existentes con los nuevos
          const datosActualizados: DatosHorarios = {
            horarioRegular: datos.horarioRegular || (datosExistentes?.horarioRegular || {} as any),
            fechaActualizacion: new Date().toISOString()
          };
          
          // Guardamos en localStorage
          localStorage.setItem(storageKey, JSON.stringify(datosActualizados));
          
          resolve(true);
        } catch (error) {
          console.error('Error al guardar en localStorage:', error);
          resolve(false);
        }
      }, 500); // Simulamos un pequeño retraso para emular una operación de red
    });
  } catch (error) {
    console.error('Error al actualizar horarios:', error);
    return false;
  }
};

/**
 * Elimina los horarios de un restaurante de localStorage
 * @param {string} idRestaurante - ID del restaurante
 * @returns {Promise<boolean>} True si la operación fue exitosa
 */
export const eliminarHorarios = async (idRestaurante: string): Promise<boolean> => {
  try {
    // Simulamos una operación asíncrona para mantener la misma interfaz que tendría con Firebase
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const storageKey = `${STORAGE_PREFIX}${idRestaurante}`;
          localStorage.removeItem(storageKey);
          resolve(true);
        } catch (error) {
          console.error('Error al eliminar horarios:', error);
          resolve(false);
        }
      }, 300);
    });
  } catch (error) {
    console.error('Error al eliminar horarios:', error);
    return false;
  }
};
