import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

// Tipos para la programación semanal
interface DailyMenuData {
  id: string;
  fecha: string;
  dia: string;
  menu: {
    id: string;
    name: string;
    description: string;
    status: 'draft' | 'published' | 'archived' | 'cancelled';
    total_combinations: number;
    published_at: string | null;
  } | null;
  combinaciones: MenuCombinationData[];
}

interface MenuCombinationData {
  id: string;
  name: string;
  description: string;
  entrada: ProductData | null;
  principio: ProductData | null;
  proteina: ProductData;
  bebida: ProductData | null;
  acompanamientos: ProductData[];
  base_price: number;
  special_price: number | null;
  is_available: boolean;
  is_featured: boolean;
  max_daily_quantity: number;
  current_quantity: number;
  sold_quantity: number;
}

interface ProductData {
  id: string;
  name: string;
  description: string;
  current_price: number;
  category_id: string;
  image_url: string | null;
}

interface PlantillaData {
  id: string;
  nombre: string;
  descripcion: string;
  programacion: Record<string, string[]>; // día -> combinationIds
  fechaCreacion: string;
  esActiva: boolean;
}

interface ProgramacionSemanalData {
  semana: {
    fechaInicio: string;
    fechaFin: string;
    menusDiarios: DailyMenuData[];
  };
  combinacionesDisponibles: MenuCombinationData[];
  plantillas: PlantillaData[];
}

// Tipos para el hook
type DiaSemana = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';

interface UseProgramacionSemanalProps {
  restaurantId?: string;
  fechaInicial?: Date;
}

const RESTAURANT_ID_DEFAULT = 'rest-test-001';
const DIAS_SEMANA: DiaSemana[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const useProgramacionSemanalUnificado = ({
  restaurantId = RESTAURANT_ID_DEFAULT,
  fechaInicial = new Date()
}: UseProgramacionSemanalProps = {}) => {
  
  // Estados principales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [programacionData, setProgramacionData] = useState<ProgramacionSemanalData | null>(null);
  const [semanaActual, setSemanaActual] = useState<Date>(fechaInicial);
  const [diaSeleccionado, setDiaSeleccionado] = useState<DiaSemana>('Lunes');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Estados para operaciones
  const [guardando, setGuardando] = useState(false);
  const [publicando, setPublicando] = useState(false);
  const [cargandoPlantilla, setCargandoPlantilla] = useState(false);
  const [programandoAutomatico, setProgramandoAutomatico] = useState(false);
  
  // Refs para evitar bucles infinitos
  const isInitialized = useRef(false);
  const currentWeekRef = useRef<string>('');
  
  // Función para obtener el inicio de la semana (Lunes)
  const getWeekStart = useCallback((fecha: Date): Date => {
    const d = new Date(fecha);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }, []);
  
  // Función para formatear fecha
  const formatDate = useCallback((date: Date): string => {
    return date.toISOString().split('T')[0];
  }, []);
  
  // Función para cargar programación semanal
  const cargarProgramacionSemanal = useCallback(async (fecha: Date) => {
    try {
      setLoading(true);
      setError(null);
      
      const weekStart = getWeekStart(fecha);
      const fechaFormatted = formatDate(weekStart);
      
      // Evitar cargar la misma semana múltiples veces
      if (currentWeekRef.current === fechaFormatted) {
        setLoading(false);
        return;
      }
      
      console.log('🔄 Cargando programación semanal:', { restaurantId, fecha: fechaFormatted });
      
      const response = await fetch(`/api/programacion-semanal?fecha=${fechaFormatted}&restaurantId=${restaurantId}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Error al cargar programación semanal');
      }
      
      setProgramacionData(result.data);
      currentWeekRef.current = fechaFormatted;
      setHasUnsavedChanges(false);
      
      console.log('✅ Programación semanal cargada:', {
        menusDiarios: result.data.semana.menusDiarios.length,
        combinaciones: result.data.combinacionesDisponibles.length,
        plantillas: result.data.plantillas.length
      });
      
    } catch (err) {
      console.error('❌ Error al cargar programación semanal:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('Error al cargar programación semanal');
    } finally {
      setLoading(false);
    }
  }, [restaurantId, getWeekStart, formatDate]);
  
  // Cargar datos iniciales
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      cargarProgramacionSemanal(semanaActual);
    }
  }, [cargarProgramacionSemanal, semanaActual]);
  
  // Función para cambiar semana
  const cambiarSemana = useCallback((nuevaFecha: Date) => {
    setSemanaActual(nuevaFecha);
    cargarProgramacionSemanal(nuevaFecha);
  }, [cargarProgramacionSemanal]);
  
  // Función para ir a la semana anterior
  const semanaAnterior = useCallback(() => {
    const nuevaFecha = new Date(semanaActual);
    nuevaFecha.setDate(nuevaFecha.getDate() - 7);
    cambiarSemana(nuevaFecha);
  }, [semanaActual, cambiarSemana]);
  
  // Función para ir a la semana siguiente
  const semanaSiguiente = useCallback(() => {
    const nuevaFecha = new Date(semanaActual);
    nuevaFecha.setDate(nuevaFecha.getDate() + 7);
    cambiarSemana(nuevaFecha);
  }, [semanaActual, cambiarSemana]);
  
  // Función para ir a la semana actual
  const irASemanaActual = useCallback(() => {
    cambiarSemana(new Date());
  }, [cambiarSemana]);
  
  // Función para agregar combinación a un día
  const agregarCombinacionAlDia = useCallback((dia: DiaSemana, combinacion: MenuCombinationData) => {
    if (!programacionData) return;
    
    setProgramacionData(prev => {
      if (!prev) return prev;
      
      const nuevosMenusDiarios = prev.semana.menusDiarios.map(menuDia => {
        if (menuDia.dia === dia) {
          return {
            ...menuDia,
            combinaciones: [...menuDia.combinaciones, combinacion]
          };
        }
        return menuDia;
      });
      
      return {
        ...prev,
        semana: {
          ...prev.semana,
          menusDiarios: nuevosMenusDiarios
        }
      };
    });
    
    setHasUnsavedChanges(true);
    toast.success(`Combinación agregada a ${dia}`);
  }, [programacionData]);
  
  // Función para remover combinación de un día
  const removerCombinacionDelDia = useCallback((dia: DiaSemana, combinacionId: string) => {
    if (!programacionData) return;
    
    setProgramacionData(prev => {
      if (!prev) return prev;
      
      const nuevosMenusDiarios = prev.semana.menusDiarios.map(menuDia => {
        if (menuDia.dia === dia) {
          return {
            ...menuDia,
            combinaciones: menuDia.combinaciones.filter(c => c.id !== combinacionId)
          };
        }
        return menuDia;
      });
      
      return {
        ...prev,
        semana: {
          ...prev.semana,
          menusDiarios: nuevosMenusDiarios
        }
      };
    });
    
    setHasUnsavedChanges(true);
    toast.success(`Combinación removida de ${dia}`);
  }, [programacionData]);
  
  // Función para copiar combinaciones de un día a otro
  const copiarDia = useCallback((diaOrigen: DiaSemana, diaDestino: DiaSemana) => {
    if (!programacionData) return;
    
    const menuOrigen = programacionData.semana.menusDiarios.find(m => m.dia === diaOrigen);
    if (!menuOrigen) return;
    
    setProgramacionData(prev => {
      if (!prev) return prev;
      
      const nuevosMenusDiarios = prev.semana.menusDiarios.map(menuDia => {
        if (menuDia.dia === diaDestino) {
          return {
            ...menuDia,
            combinaciones: [...menuOrigen.combinaciones]
          };
        }
        return menuDia;
      });
      
      return {
        ...prev,
        semana: {
          ...prev.semana,
          menusDiarios: nuevosMenusDiarios
        }
      };
    });
    
    setHasUnsavedChanges(true);
    toast.success(`Combinaciones copiadas de ${diaOrigen} a ${diaDestino}`);
  }, [programacionData]);
  
  // Función para limpiar un día
  const limpiarDia = useCallback((dia: DiaSemana) => {
    if (!programacionData) return;
    
    setProgramacionData(prev => {
      if (!prev) return prev;
      
      const nuevosMenusDiarios = prev.semana.menusDiarios.map(menuDia => {
        if (menuDia.dia === dia) {
          return {
            ...menuDia,
            combinaciones: []
          };
        }
        return menuDia;
      });
      
      return {
        ...prev,
        semana: {
          ...prev.semana,
          menusDiarios: nuevosMenusDiarios
        }
      };
    });
    
    setHasUnsavedChanges(true);
    toast.success(`${dia} limpiado`);
  }, [programacionData]);
  
  // Función para guardar como borrador
  const guardarBorrador = useCallback(async () => {
    if (!programacionData) return;
    
    try {
      setGuardando(true);
      console.log('💾 Guardando programación como borrador...');
      
      const response = await fetch('/api/programacion-semanal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId,
          semana: programacionData.semana,
          esPublicacion: false
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Error al guardar borrador');
      }
      
      setHasUnsavedChanges(false);
      toast.success('Programación guardada como borrador');
      
    } catch (err) {
      console.error('❌ Error al guardar borrador:', err);
      toast.error('Error al guardar borrador');
    } finally {
      setGuardando(false);
    }
  }, [programacionData, restaurantId]);
  
  // Función para publicar programación
  const publicarProgramacion = useCallback(async () => {
    if (!programacionData) return;
    
    try {
      setPublicando(true);
      console.log('🚀 Publicando programación semanal...');
      
      const response = await fetch('/api/programacion-semanal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId,
          semana: programacionData.semana,
          esPublicacion: true
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Error al publicar programación');
      }
      
      setHasUnsavedChanges(false);
      toast.success('Programación semanal publicada exitosamente');
      
      // Recargar datos para obtener el estado actualizado
      cargarProgramacionSemanal(semanaActual);
      
    } catch (err) {
      console.error('❌ Error al publicar programación:', err);
      toast.error('Error al publicar programación');
    } finally {
      setPublicando(false);
    }
  }, [programacionData, restaurantId, cargarProgramacionSemanal, semanaActual]);
  
  // Función para programar automáticamente
  const programarAutomaticamente = useCallback(async () => {
    if (!programacionData) return;
    
    try {
      setProgramandoAutomatico(true);
      console.log('🤖 Programando automáticamente...');
      
      // Algoritmo simple de programación automática
      const combinacionesDisponibles = programacionData.combinacionesDisponibles;
      
      if (combinacionesDisponibles.length === 0) {
        toast.error('No hay combinaciones disponibles para programar');
        return;
      }
      
      setProgramacionData(prev => {
        if (!prev) return prev;
        
        const nuevosMenusDiarios = prev.semana.menusDiarios.map(menuDia => {
          // Asignar 2-4 combinaciones aleatorias por día
          const numCombinaciones = Math.floor(Math.random() * 3) + 2;
          const combinacionesAleatorias = [];
          
          for (let i = 0; i < numCombinaciones; i++) {
            const randomIndex = Math.floor(Math.random() * combinacionesDisponibles.length);
            combinacionesAleatorias.push(combinacionesDisponibles[randomIndex]);
          }
          
          return {
            ...menuDia,
            combinaciones: combinacionesAleatorias
          };
        });
        
        return {
          ...prev,
          semana: {
            ...prev.semana,
            menusDiarios: nuevosMenusDiarios
          }
        };
      });
      
      setHasUnsavedChanges(true);
      toast.success('Programación automática completada');
      
    } catch (err) {
      console.error('❌ Error en programación automática:', err);
      toast.error('Error en programación automática');
    } finally {
      setProgramandoAutomatico(false);
    }
  }, [programacionData]);
  
  // Función para guardar plantilla
  const guardarPlantilla = useCallback(async (nombre: string, descripcion: string = '') => {
    if (!programacionData) return null;
    
    try {
      console.log('💾 Guardando plantilla:', { nombre, descripcion });
      
      // Crear estructura de programación para la plantilla
      const programacion: Record<string, string[]> = {};
      
      programacionData.semana.menusDiarios.forEach(menuDia => {
        programacion[menuDia.dia] = menuDia.combinaciones.map(c => c.id);
      });
      
      const plantillaData = {
        nombre,
        descripcion,
        programacion,
        fechaCreacion: new Date().toISOString(),
        esActiva: true
      };
      
      // Guardar usando el endpoint específico de plantillas
      const response = await fetch('/api/programacion-semanal/plantillas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId,
          plantilla: plantillaData
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar plantilla');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Error al guardar plantilla');
      }
      
      // Actualizar lista de plantillas
      setProgramacionData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          plantillas: [...prev.plantillas, result.plantilla]
        };
      });
      
      toast.success(`Plantilla "${nombre}" guardada exitosamente`);
      return result.plantilla.id;
      
    } catch (err) {
      console.error('❌ Error al guardar plantilla:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar plantilla';
      toast.error(errorMessage);
      return null;
    }
  }, [programacionData, restaurantId]);
  
  // Función para cargar plantilla
  const cargarPlantilla = useCallback(async (plantillaId: string) => {
    if (!programacionData) return false;
    
    try {
      setCargandoPlantilla(true);
      console.log('🔄 Cargando plantilla:', plantillaId);
      
      const plantilla = programacionData.plantillas.find(p => p.id === plantillaId);
      if (!plantilla) {
        throw new Error('Plantilla no encontrada');
      }
      
      // Mapear combinaciones por ID
      const combinacionesMap = new Map(
        programacionData.combinacionesDisponibles.map(c => [c.id, c])
      );
      
      setProgramacionData(prev => {
        if (!prev) return prev;
        
        const nuevosMenusDiarios = prev.semana.menusDiarios.map(menuDia => {
          const combinacionesIds = plantilla.programacion[menuDia.dia] || [];
          const combinaciones = combinacionesIds
            .map(id => combinacionesMap.get(id))
            .filter(Boolean) as MenuCombinationData[];
          
          return {
            ...menuDia,
            combinaciones
          };
        });
        
        return {
          ...prev,
          semana: {
            ...prev.semana,
            menusDiarios: nuevosMenusDiarios
          }
        };
      });
      
      setHasUnsavedChanges(true);
      toast.success(`Plantilla "${plantilla.nombre}" cargada exitosamente`);
      return true;
      
    } catch (err) {
      console.error('❌ Error al cargar plantilla:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar plantilla';
      toast.error(errorMessage);
      return false;
    } finally {
      setCargandoPlantilla(false);
    }
  }, [programacionData]);
  
  // Función para eliminar plantilla
  const eliminarPlantilla = useCallback(async (plantillaId: string) => {
    if (!programacionData) return false;
    
    try {
      console.log('🗑️ Eliminando plantilla:', plantillaId);
      
      const plantilla = programacionData.plantillas.find(p => p.id === plantillaId);
      if (!plantilla) {
        throw new Error('Plantilla no encontrada');
      }
      
      const confirmacion = confirm(`¿Está seguro de que desea eliminar la plantilla "${plantilla.nombre}"?`);
      if (!confirmacion) return false;
      
      const response = await fetch(`/api/programacion-semanal/plantillas?id=${plantillaId}&restaurantId=${restaurantId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar plantilla');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Error al eliminar plantilla');
      }
      
      // Actualizar lista de plantillas
      setProgramacionData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          plantillas: prev.plantillas.filter(p => p.id !== plantillaId)
        };
      });
      
      toast.success(`Plantilla "${plantilla.nombre}" eliminada exitosamente`);
      return true;
      
    } catch (err) {
      console.error('❌ Error al eliminar plantilla:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar plantilla';
      toast.error(errorMessage);
      return false;
    }
  }, [programacionData, restaurantId]);
  
  // Función para manejar drag & drop
  const handleDrop = useCallback((dia: DiaSemana, combinacionId: string) => {
    if (!programacionData) return;
    
    const combinacion = programacionData.combinacionesDisponibles.find(c => c.id === combinacionId);
    if (!combinacion) return;
    
    agregarCombinacionAlDia(dia, combinacion);
  }, [programacionData, agregarCombinacionAlDia]);
  
  // Función para resetear error
  const resetError = useCallback(() => {
    setError(null);
  }, []);
  
  // Getters computados
  const diasSemana = DIAS_SEMANA;
  const menuDelDiaSeleccionado = programacionData?.semana.menusDiarios.find(m => m.dia === diaSeleccionado);
  const combinacionesDelDiaSeleccionado = menuDelDiaSeleccionado?.combinaciones || [];
  const totalCombinacionesSemana = programacionData?.semana.menusDiarios.reduce((total, menu) => total + menu.combinaciones.length, 0) || 0;
  
  return {
    // Estados
    loading,
    error,
    guardando,
    publicando,
    cargandoPlantilla,
    programandoAutomatico,
    hasUnsavedChanges,
    
    // Datos
    programacionData,
    combinacionesDisponibles: programacionData?.combinacionesDisponibles || [],
    plantillas: programacionData?.plantillas || [],
    menusDiarios: programacionData?.semana.menusDiarios || [],
    
    // Semana actual
    semanaActual,
    fechaInicioSemana: programacionData?.semana.fechaInicio,
    fechaFinSemana: programacionData?.semana.fechaFin,
    
    // Día seleccionado
    diaSeleccionado,
    setDiaSeleccionado,
    menuDelDiaSeleccionado,
    combinacionesDelDiaSeleccionado,
    
    // Navegación de semanas
    semanaAnterior,
    semanaSiguiente,
    irASemanaActual,
    cambiarSemana,
    
    // Operaciones con combinaciones
    agregarCombinacionAlDia,
    removerCombinacionDelDia,
    copiarDia,
    limpiarDia,
    handleDrop,
    
    // Operaciones de guardado
    guardarBorrador,
    publicarProgramacion,
    
    // Programación automática
    programarAutomaticamente,
    
    // Plantillas
    guardarPlantilla,
    cargarPlantilla,
    eliminarPlantilla,
    
    // Utilidades
    diasSemana,
    totalCombinacionesSemana,
    resetError,
    
    // Función para recargar datos
    recargar: () => cargarProgramacionSemanal(semanaActual)
  };
};
