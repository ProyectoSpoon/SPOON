// src/app/config-restaurante/store/config-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Tipos para el estado de configuración
interface CampoConfiguracion {
  completado: boolean;
  ultimaActualizacion?: Date;
}

interface SeccionConfiguracion {
  [campo: string]: CampoConfiguracion;
}

interface EstadoConfiguracion {
  [ruta: string]: SeccionConfiguracion;
}

interface ConfigStore {
  // Estado
  configuracion: EstadoConfiguracion;
  
  // Acciones
  actualizarCampo: (ruta: string, campo: string, completado: boolean) => void;
  obtenerEstadoCampo: (ruta: string, campo: string) => boolean;
  obtenerProgresoSeccion: (ruta: string) => { completados: number; total: number; porcentaje: number };
  obtenerProgresoGeneral: () => { completados: number; total: number; porcentaje: number };
  reiniciarConfiguracion: () => void;
  marcarSeccionCompleta: (ruta: string) => void;
  esSeccionCompleta: (ruta: string) => boolean;
}

// Estado inicial por defecto
const estadoInicial: EstadoConfiguracion = {
  '/config-restaurante/informacion-general': {
    nombre: { completado: false },
    contacto: { completado: false },
    descripcion: { completado: false },
    tipoComida: { completado: false }
  },
  '/config-restaurante/ubicacion': {
    direccion: { completado: false },
    coordenadas: { completado: false },
    zona: { completado: false }
  },
  '/config-restaurante/horario-comercial': {
    horarios: { completado: false },
    diasAtencion: { completado: false }
  },
  '/config-restaurante/logo-portada': {
    logo: { completado: false },
    portada: { completado: false }
  }
};

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      configuracion: estadoInicial,

      // Actualizar un campo específico
      actualizarCampo: (ruta: string, campo: string, completado: boolean) => {
        set((state) => {
          const nuevaConfiguracion = { ...state.configuracion };
          
          // Inicializar la sección si no existe
          if (!nuevaConfiguracion[ruta]) {
            nuevaConfiguracion[ruta] = {};
          }
          
          // Actualizar el campo
          nuevaConfiguracion[ruta][campo] = {
            completado,
            ultimaActualizacion: new Date()
          };
          
          return { configuracion: nuevaConfiguracion };
        });
      },

      // Obtener estado de un campo específico
      obtenerEstadoCampo: (ruta: string, campo: string): boolean => {
        const state = get();
        return state.configuracion[ruta]?.[campo]?.completado || false;
      },

      // Obtener progreso de una sección
      obtenerProgresoSeccion: (ruta: string) => {
        const state = get();
        const seccion = state.configuracion[ruta];
        
        if (!seccion) {
          return { completados: 0, total: 0, porcentaje: 0 };
        }
        
        const campos = Object.values(seccion);
        const completados = campos.filter(campo => campo.completado).length;
        const total = campos.length;
        const porcentaje = total > 0 ? Math.round((completados / total) * 100) : 0;
        
        return { completados, total, porcentaje };
      },

      // Obtener progreso general de toda la configuración
      obtenerProgresoGeneral: () => {
        const state = get();
        let totalCompletados = 0;
        let totalCampos = 0;
        
        Object.values(state.configuracion).forEach(seccion => {
          const campos = Object.values(seccion);
          totalCampos += campos.length;
          totalCompletados += campos.filter(campo => campo.completado).length;
        });
        
        const porcentaje = totalCampos > 0 ? Math.round((totalCompletados / totalCampos) * 100) : 0;
        
        return { 
          completados: totalCompletados, 
          total: totalCampos, 
          porcentaje 
        };
      },

      // Marcar una sección completa (todos sus campos)
      marcarSeccionCompleta: (ruta: string) => {
        set((state) => {
          const nuevaConfiguracion = { ...state.configuracion };
          
          if (nuevaConfiguracion[ruta]) {
            Object.keys(nuevaConfiguracion[ruta]).forEach(campo => {
              nuevaConfiguracion[ruta][campo] = {
                completado: true,
                ultimaActualizacion: new Date()
              };
            });
          }
          
          return { configuracion: nuevaConfiguracion };
        });
      },

      // Verificar si una sección está completa
      esSeccionCompleta: (ruta: string): boolean => {
        const state = get();
        const progreso = state.obtenerProgresoSeccion(ruta);
        return progreso.porcentaje === 100;
      },

      // Reiniciar toda la configuración
      reiniciarConfiguracion: () => {
        set({ configuracion: estadoInicial });
      }
    }),
    {
      name: 'spoon-config-storage', // Clave para localStorage
      version: 1,
      // Solo persistir el estado de configuración
      partialize: (state) => ({ configuracion: state.configuracion }),
    }
  )
);

// Hook auxiliar para obtener información específica de progreso
export const useProgresoConfiguracion = () => {
  const { 
    obtenerProgresoGeneral, 
    obtenerProgresoSeccion, 
    esSeccionCompleta 
  } = useConfigStore();
  
  return {
    progresoGeneral: obtenerProgresoGeneral(),
    obtenerProgresoSeccion,
    esSeccionCompleta,
    // Métodos de conveniencia para cada sección
    progresoInformacionGeneral: obtenerProgresoSeccion('/config-restaurante/informacion-general'),
    progresoUbicacion: obtenerProgresoSeccion('/config-restaurante/ubicacion'),
    progresoHorarios: obtenerProgresoSeccion('/config-restaurante/horario-comercial'),
    progresoImagenes: obtenerProgresoSeccion('/config-restaurante/logo-portada'),
  };
};

export default useConfigStore;