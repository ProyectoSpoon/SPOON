import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  ConfigurationState, 
  RestaurantConfig,
  ConfigSection,
  ConfigTemplate,
  GroupConfig,
  TarjetaConfiguracion,
  CampoRequerido
} from '@/types/group-config.types';

// Datos iniciales de las tarjetas de configuración - SIN INFO LEGAL
const datosConfiguracion: TarjetaConfiguracion[] = [
  {
    id: 'ubicacion',
    titulo: 'Ubicación',
    descripcion: 'Establece la ubicación de tu restaurante',
    ruta: '/config-restaurante/ubicacion',
    estado: 'no_iniciado',
    camposRequeridos: [
      { id: 'direccion', nombre: 'Dirección', completado: false },
      { id: 'ciudad', nombre: 'Ciudad', completado: false }
    ]
  },
  {
    id: 'horario',
    titulo: 'Horario Comercial',
    descripcion: 'Define los horarios de atención',
    ruta: '/config-restaurante/horario-comercial',
    estado: 'no_iniciado',
    camposRequeridos: [
      { id: 'horarios', nombre: 'Horarios', completado: false }
    ]
  },
  {
    id: 'logo-portada',
    titulo: 'Logo y Portada',
    descripcion: 'Sube el logo y la imagen de portada',
    ruta: '/config-restaurante/logo-portada',
    estado: 'no_iniciado',
    camposRequeridos: [
      { id: 'logo', nombre: 'Logo', completado: false },
      { id: 'portada', nombre: 'Portada', completado: false }
    ]
  }
];

interface ConfigActions {
  actualizarEstadoTarjeta: (rutaTarjeta: string, estado: 'no_iniciado' | 'incompleto' | 'completo') => void;
  actualizarCampo: (rutaTarjeta: string, idCampo: string, completado: boolean) => void;
  calcularProgreso: () => void;
  resetConfig: () => void;
  
  // Gestión de templates
  createTemplate: (template: ConfigTemplate) => Promise<void>;
  updateTemplate: (id: string, template: Partial<ConfigTemplate>) => Promise<void>;
  
  // Gestión de configuraciones de grupo
  createGroupConfig: (config: GroupConfig) => Promise<void>;
  updateGroupConfig: (id: string, config: Partial<GroupConfig>) => Promise<void>;
  applyGroupConfig: (groupId: string, restaurantId: string) => Promise<void>;
  
  // Gestión de configuraciones de restaurante
  loadRestaurantConfig: (restaurantId: string) => Promise<void>;
  updateRestaurantConfig: (config: Partial<RestaurantConfig>) => Promise<void>;
  overrideField: (sectionId: string, fieldId: string, value: any) => Promise<void>;
}

type ConfigStore = ConfigurationState & ConfigActions;

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      progreso: 0,
      tarjetas: datosConfiguracion,
      puedeAvanzar: false,
      templates: [],
      groupConfigs: [],
      restaurantConfigs: [],
      activeConfig: null,
      loading: false,
      error: null,

      // Función para resetear la configuración
      resetConfig: () => {
        set({
          progreso: 0,
          tarjetas: [...datosConfiguracion],
          puedeAvanzar: false,
          templates: [],
          groupConfigs: [],
          restaurantConfigs: [],
          activeConfig: null,
          loading: false,
          error: null
        });
      },

      // Funciones para tarjetas de configuración
      actualizarEstadoTarjeta: (rutaTarjeta, estado) => {
        set((state): Partial<ConfigStore> => ({
          tarjetas: state.tarjetas.map(tarjeta => 
            tarjeta.ruta === rutaTarjeta 
              ? { ...tarjeta, estado } 
              : tarjeta
          )
        }));
        get().calcularProgreso();
      },
      
      actualizarCampo: (rutaTarjeta, idCampo, completado) => {
        set((state): Partial<ConfigStore> => {
          const tarjetasActualizadas = state.tarjetas.map(tarjeta => {
            if (tarjeta.ruta === rutaTarjeta) {
              const camposActualizados = tarjeta.camposRequeridos.map(campo =>
                campo.id === idCampo ? { ...campo, completado } : campo
              );
      
              let nuevoEstado: 'no_iniciado' | 'incompleto' | 'completo' = 'no_iniciado';
              const camposCompletados = camposActualizados.filter(c => c.completado).length;
              
              if (camposCompletados === camposActualizados.length) {
                nuevoEstado = 'completo';
              } else if (camposCompletados > 0) {
                nuevoEstado = 'incompleto';
              }
      
              return {
                ...tarjeta,
                camposRequeridos: camposActualizados,
                estado: nuevoEstado
              };
            }
            return tarjeta;
          });
      
          return { tarjetas: tarjetasActualizadas };
        });

        get().calcularProgreso();
      },

      calcularProgreso: () => {
        const { tarjetas } = get();
        let camposTotalesCompletados = 0;
        let camposTotales = 0;

        tarjetas.forEach(tarjeta => {
          tarjeta.camposRequeridos.forEach(campo => {
            camposTotales++;
            if (campo.completado) {
              camposTotalesCompletados++;
            }
          });
        });

        const progresoCalculado = Math.round((camposTotalesCompletados / camposTotales) * 100);
        const todasCompletas = tarjetas.every(t => t.estado === 'completo');

        set({
          progreso: progresoCalculado,
          puedeAvanzar: todasCompletas
        });
      },

      // Implementación de acciones para configuración jerárquica
      createTemplate: async (template) => {
        try {
          set({ loading: true, error: null });
          set(state => ({
            templates: [...state.templates, template]
          }));
        } catch (error) {
          set({ error: 'Error al crear template' });
        } finally {
          set({ loading: false });
        }
      },

      updateTemplate: async (id, template) => {
        try {
          set({ loading: true, error: null });
          set(state => ({
            templates: state.templates.map(t => 
              t.id === id ? { ...t, ...template } : t
            )
          }));
        } catch (error) {
          set({ error: 'Error al actualizar template' });
        } finally {
          set({ loading: false });
        }
      },

      createGroupConfig: async (config) => {
        try {
          set({ loading: true, error: null });
          set(state => ({
            groupConfigs: [...state.groupConfigs, config]
          }));
        } catch (error) {
          set({ error: 'Error al crear configuración de grupo' });
        } finally {
          set({ loading: false });
        }
      },

      updateGroupConfig: async (id, config) => {
        try {
          set({ loading: true, error: null });
          set(state => ({
            groupConfigs: state.groupConfigs.map(g => 
              g.id === id ? { ...g, ...config } : g
            )
          }));
        } catch (error) {
          set({ error: 'Error al actualizar configuración de grupo' });
        } finally {
          set({ loading: false });
        }
      },

      applyGroupConfig: async (groupId, restaurantId) => {
        try {
          set({ loading: true, error: null });
          const groupConfig = get().groupConfigs.find(g => g.id === groupId);
          if (!groupConfig) throw new Error('Configuración de grupo no encontrada');

          const newRestaurantConfig: RestaurantConfig = {
            id: `config_${restaurantId}_${Date.now()}`,
            restaurantId,
            groupId,
            sections: groupConfig.defaultConfig.sections || [],
            inheritedFrom: groupId,
            overrides: groupConfig.defaultConfig.overrides || {},
            metadata: {
              createdAt: new Date(),
              updatedAt: new Date(),
              version: '1.0.0'
            }
          };

          set(state => ({
            restaurantConfigs: [...state.restaurantConfigs, newRestaurantConfig]
          }));
        } catch (error) {
          set({ error: 'Error al aplicar configuración de grupo' });
        } finally {
          set({ loading: false });
        }
      },

      loadRestaurantConfig: async (restaurantId) => {
        try {
          set({ loading: true, error: null });
          const config = get().restaurantConfigs.find(c => c.restaurantId === restaurantId);
          set({ activeConfig: config || null });
        } catch (error) {
          set({ error: 'Error al cargar configuración' });
        } finally {
          set({ loading: false });
        }
      },

      updateRestaurantConfig: async (config) => {
        try {
          set({ loading: true, error: null });
          if (!get().activeConfig) throw new Error('No hay configuración activa');
          
          set(state => ({
            activeConfig: { ...state.activeConfig!, ...config }
          }));
        } catch (error) {
          set({ error: 'Error al actualizar configuración' });
        } finally {
          set({ loading: false });
        }
      },

      overrideField: async (sectionId, fieldId, value) => {
        try {
          set({ loading: true, error: null });
          if (!get().activeConfig) throw new Error('No hay configuración activa');

          set(state => ({
            activeConfig: {
              ...state.activeConfig!,
              overrides: {
                ...state.activeConfig!.overrides,
                [sectionId]: {
                  ...state.activeConfig!.overrides[sectionId],
                  [fieldId]: value
                }
              }
            }
          }));
        } catch (error) {
          set({ error: 'Error al sobrescribir campo' });
        } finally {
          set({ loading: false });
        }
      }
    }),
    {
      name: 'restaurant-config-storage',
      partialize: (state) => ({
        tarjetas: state.tarjetas,
        templates: state.templates,
        groupConfigs: state.groupConfigs,
        restaurantConfigs: state.restaurantConfigs
      })
    }
  )
);
