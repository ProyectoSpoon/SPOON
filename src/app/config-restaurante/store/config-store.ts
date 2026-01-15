// src/app/config-restaurante/store/config-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TarjetaConfiguracion } from '@/types/group-config.types';

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
  isLoading: boolean;
  error: string | null;
  lastSync: Date | null;

  // Propiedades computadas
  tarjetas: TarjetaConfiguracion[];
  puedeAvanzar: boolean;

  // Acciones
  cargarConfiguracion: (restaurantId: string) => Promise<void>;
  actualizarCampo: (ruta: string, campo: string, completado: boolean) => void;
  sincronizarConBD: (restaurantId: string) => Promise<void>;
  obtenerEstadoCampo: (ruta: string, campo: string) => boolean;
  obtenerProgresoSeccion: (ruta: string) => { completados: number; total: number; porcentaje: number };
  obtenerProgresoGeneral: () => { completados: number; total: number; porcentaje: number };
  reiniciarConfiguracion: () => void;
  marcarSeccionCompleta: (ruta: string) => void;
  esSeccionCompleta: (ruta: string) => boolean;
}

// Estado inicial por defecto - CON 4 SECCIONES
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

// Definición de tarjetas base
const DEFINICIONES_TARJETAS = [
  {
    id: 'informacion-general',
    titulo: 'Información General',
    descripcion: 'Datos básicos del restaurante: nombre, contacto y tipo de cocina',
    ruta: '/config-restaurante/informacion-general',
    orden: 1
  },
  {
    id: 'ubicacion',
    titulo: 'Ubicación',
    descripcion: 'Dirección y ubicación geográfica del restaurante',
    ruta: '/config-restaurante/ubicacion',
    orden: 2
  },
  {
    id: 'horario',
    titulo: 'Horarios',
    descripcion: 'Horarios de atención y días de operación',
    ruta: '/config-restaurante/horario-comercial',
    orden: 3
  },
  {
    id: 'logo-portada',
    titulo: 'Logo y Portada',
    descripcion: 'Imágenes representativas del restaurante',
    ruta: '/config-restaurante/logo-portada',
    orden: 4
  }
];

// Funciones utilitarias para verificar completitud basándose en datos de BD
const verificarInformacionGeneral = (data: any): SeccionConfiguracion => {
  return {
    nombre: {
      completado: Boolean(data.nombreRestaurante?.trim()),
      ultimaActualizacion: new Date()
    },
    contacto: {
      completado: Boolean(data.telefono?.trim() && data.email?.trim()),
      ultimaActualizacion: new Date()
    },
    descripcion: {
      completado: Boolean(data.descripcion?.trim()),
      ultimaActualizacion: new Date()
    },
    tipoComida: {
      completado: Boolean(data.tipoComida?.trim()),
      ultimaActualizacion: new Date()
    }
  };
};

const verificarUbicacion = (data: any): SeccionConfiguracion => {
  return {
    direccion: {
      completado: Boolean(data.address?.trim()),
      ultimaActualizacion: new Date()
    },
    coordenadas: {
      completado: Boolean(data.latitude && data.longitude),
      ultimaActualizacion: new Date()
    },
    zona: {
      completado: Boolean(data.city_id),
      ultimaActualizacion: new Date()
    }
  };
};

const verificarHorarios = (data: any): SeccionConfiguracion => {
  const tieneHorarios = data.horarios && Object.values(data.horarios).some((dia: any) =>
    dia.abierto && dia.turnos && dia.turnos.length > 0
  );

  return {
    horarios: {
      completado: Boolean(tieneHorarios),
      ultimaActualizacion: new Date()
    },
    diasAtencion: {
      completado: Boolean(tieneHorarios),
      ultimaActualizacion: new Date()
    }
  };
};

const verificarImagenes = (data: any): SeccionConfiguracion => {
  return {
    logo: {
      completado: Boolean(data.logoUrl?.trim()),
      ultimaActualizacion: new Date()
    },
    portada: {
      completado: Boolean(data.coverImageUrl?.trim()),
      ultimaActualizacion: new Date()
    }
  };
};

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      configuracion: estadoInicial,
      isLoading: false,
      error: null,
      lastSync: null,

      // Propiedades computadas (se recalculan automáticamente)
      get tarjetas(): TarjetaConfiguracion[] {
        const state = get();

        return DEFINICIONES_TARJETAS.map(def => {
          const seccion = state.configuracion[def.ruta];
          const campos = seccion ? Object.entries(seccion) : [];

          // Crear campos requeridos
          const camposRequeridos = campos.map(([id, campo]) => ({
            id,
            nombre: id.charAt(0).toUpperCase() + id.slice(1),
            completado: campo.completado
          }));

          // Calcular estado
          const completados = camposRequeridos.filter(c => c.completado).length;
          const total = camposRequeridos.length;

          let estado: 'no_iniciado' | 'incompleto' | 'completo';
          if (completados === 0) {
            estado = 'no_iniciado';
          } else if (completados === total) {
            estado = 'completo';
          } else {
            estado = 'incompleto';
          }

          return {
            id: def.id,
            titulo: def.titulo,
            descripcion: def.descripcion,
            ruta: def.ruta,
            estado,
            camposRequeridos
          };
        });
      },

      get puedeAvanzar(): boolean {
        const state = get();
        return DEFINICIONES_TARJETAS.every(def => {
          return state.esSeccionCompleta(def.ruta);
        });
      },

      // Cargar configuración desde PostgreSQL
      cargarConfiguracion: async (restaurantId?: string) => {
        try {
          set({ isLoading: true, error: null });

          const token = localStorage.getItem('auth_token');
          if (!token) {
            throw new Error('Token de autenticación no encontrado');
          }

          const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          };

          // Usar 'current' si no se proporciona restaurantId (auto-detect)
          const idToUse = restaurantId || 'current';

          // Cargar información general
          const generalResponse = await fetch(`/api/restaurants/${idToUse}/general-info`, { headers });
          const generalData = generalResponse.ok ? await generalResponse.json() : {};

          // Si no encontró restaurante, dejar configuración vacía
          if (generalResponse.status === 404) {
            set({
              configuracion: estadoInicial,
              isLoading: false,
              lastSync: new Date()
            });
            console.log('ℹ️ No se encontró restaurante, configuración vacía');
            return;
          }

          // Cargar ubicación
          const locationResponse = await fetch(`/api/restaurants/${idToUse}/location`, { headers });
          const locationData = locationResponse.ok ? await locationResponse.json() : {};

          // Cargar horarios
          const hoursResponse = await fetch(`/api/restaurants/${idToUse}/business-hours`, { headers });
          const hoursData = hoursResponse.ok ? await hoursResponse.json() : {};

          // Cargar imágenes
          const imagesResponse = await fetch(`/api/restaurants/${idToUse}/images`, { headers });
          const imagesData = imagesResponse.ok ? await imagesResponse.json() : {};

          // Actualizar configuración basándose en datos de BD
          const nuevaConfiguracion = {
            '/config-restaurante/informacion-general': verificarInformacionGeneral(generalData),
            '/config-restaurante/ubicacion': verificarUbicacion(locationData),
            '/config-restaurante/horario-comercial': verificarHorarios(hoursData),
            '/config-restaurante/logo-portada': verificarImagenes(imagesData)
          };

          set({
            configuracion: nuevaConfiguracion,
            isLoading: false,
            lastSync: new Date()
          });

          console.log('✅ Configuración cargada desde PostgreSQL');

        } catch (error) {
          console.error('❌ Error cargando configuración:', error);
          set({
            error: error instanceof Error ? error.message : 'Error desconocido',
            isLoading: false
          });
        }
      },

      // Sincronizar con base de datos
      sincronizarConBD: async (restaurantId: string) => {
        const state = get();

        try {
          await state.cargarConfiguracion(restaurantId);
        } catch (error) {
          console.error('Error sincronizando con BD:', error);
        }
      },

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
        set({
          configuracion: estadoInicial,
          error: null,
          lastSync: null
        });
      }
    }),
    {
      name: 'spoon-config-storage', // Clave para localStorage
      version: 4, // Incrementar versión para forzar reset con nueva estructura
      // Solo persistir configuración
      partialize: (state) => ({
        configuracion: state.configuracion,
        lastSync: state.lastSync
      }),
    }
  )
);

// Hook personalizado que integra auth context con config store
export const useConfigWithAuth = () => {
  // Nota: Este hook debe importar useAuth desde el context existente en páginas
  // No podemos importarlo aquí para evitar dependencias circulares
  return useConfigStore();
};

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
