// src/app/config-restaurante/horario-comercial/hooks/useHorarios.ts

import { useState, useCallback, useEffect } from 'react';
import { useConfigStore } from '../../store/config-store';
import { DiaSemana, HorariosRestaurante, HorarioDia, Turno, DIAS_SEMANA } from '../types/horarios.types';
import { validarRangoHorario } from '../utils/time';
import { useToast } from '@/shared/Hooks/use-toast';
import { useAuth } from '@/context/postgres-authcontext'; // ← AGREGAR IMPORT

// Horarios por defecto
const HORARIOS_INICIALES: HorariosRestaurante = {
  lunes: { abierto: true, turnos: [{ horaApertura: '08:00', horaCierre: '14:00' }, { horaApertura: '18:00', horaCierre: '22:00' }] },
  martes: { abierto: true, turnos: [{ horaApertura: '08:00', horaCierre: '22:00' }] },
  miercoles: { abierto: true, turnos: [{ horaApertura: '08:00', horaCierre: '22:00' }] },
  jueves: { abierto: true, turnos: [{ horaApertura: '08:00', horaCierre: '22:00' }] },
  viernes: { abierto: true, turnos: [{ horaApertura: '08:00', horaCierre: '23:00' }] },
  sabado: { abierto: true, turnos: [{ horaApertura: '09:00', horaCierre: '23:00' }] },
  domingo: { abierto: false, turnos: [] }
};

export function useHorarios() {
  const { user } = useAuth(); // ← USAR AUTH CONTEXT
  const restaurantId = user?.restaurantId; // ← ID DINÁMICO

  const [horarios, setHorarios] = useState<HorariosRestaurante>(HORARIOS_INICIALES);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState<DiaSemana>('lunes');
  
  const { actualizarCampo } = useConfigStore();
  const { toast } = useToast();

  // Cargar horarios al inicializar o cuando cambie el restaurantId
  useEffect(() => {
    if (!restaurantId) {
      console.log('⚠️ No hay restaurantId, esperando...');
      return;
    }

    console.log('🚀 Hook useHorarios iniciado');
    console.log('👤 Usuario actual:', user?.email);
    console.log('🏪 Restaurant ID:', restaurantId);

    const cargarHorarios = async () => {
      try {
        setCargando(true);
        console.log('📅 Cargando horarios para restaurante:', restaurantId);
        
        const response = await fetch(`/api/restaurants/${restaurantId}/business-hours`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.horarios && Object.keys(data.horarios).length > 0) {
            setHorarios(data.horarios);
            
            // Actualizar store si hay horarios configurados
            const tieneHorarios = Object.values(data.horarios).some((dia: any) => 
              dia.abierto && dia.turnos.length > 0
            );
            
            if (tieneHorarios) {
              actualizarCampo('/config-restaurante/horario-comercial', 'horarios', true);
            }
            
            console.log('✅ Horarios cargados desde BD');
          } else {
            // Si no hay datos de la API, mantener horarios iniciales
            console.log('No se encontraron horarios guardados, usando por defecto');
            setHorarios(HORARIOS_INICIALES);
          }
        } else {
          console.log('No se encontraron horarios guardados, usando por defecto');
          setHorarios(HORARIOS_INICIALES);
        }
      } catch (error) {
        console.error('Error cargando horarios:', error);
        // En caso de error, usar horarios por defecto
        setHorarios(HORARIOS_INICIALES);
        toast({
          title: 'Aviso',
          description: 'Usando horarios por defecto. Los horarios guardados no se pudieron cargar.',
          variant: 'default'
        });
      } finally {
        setCargando(false);
      }
    };

    cargarHorarios();
  }, [restaurantId]); // ← SOLO restaurantId como dependencia

  // Función para cargar horarios manualmente (si se necesita)
  const cargarHorarios = useCallback(async () => {
    if (!restaurantId) return;
    
    try {
      setCargando(true);
      const response = await fetch(`/api/restaurants/${restaurantId}/business-hours`);
      if (response.ok) {
        const data = await response.json();
        if (data.horarios) {
          setHorarios(data.horarios);
        }
      }
    } catch (error) {
      console.error('Error recargando horarios:', error);
    } finally {
      setCargando(false);
    }
  }, [restaurantId]);

  // Cambiar estado de un día (abierto/cerrado)
  const toggleDiaAbierto = useCallback((dia: DiaSemana, abierto: boolean) => {
    console.log('🔥 toggleDiaAbierto llamado:', { dia, abierto });
    
    setHorarios(prev => {
      const nuevosHorarios = {
        ...prev,
        [dia]: {
          abierto,
          turnos: abierto ? 
            (prev[dia].turnos.length === 0 ? [{ horaApertura: '08:00', horaCierre: '18:00' }] : prev[dia].turnos) 
            : []
        }
      };
      console.log('🔥 Nuevos horarios:', nuevosHorarios);
      return nuevosHorarios;
    });
  }, []);

  // Actualizar un turno específico
  const actualizarTurno = useCallback((dia: DiaSemana, indice: number, turno: Partial<Turno>) => {
    setHorarios(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        turnos: prev[dia].turnos.map((t, i) => 
          i === indice ? { ...t, ...turno } : t
        )
      }
    }));
  }, []);

  // Agregar nuevo turno
  const agregarTurno = useCallback((dia: DiaSemana) => {
    setHorarios(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        turnos: [...prev[dia].turnos, { horaApertura: '08:00', horaCierre: '18:00' }]
      }
    }));
  }, []);

  // Eliminar turno
  const eliminarTurno = useCallback((dia: DiaSemana, indice: number) => {
    setHorarios(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        turnos: prev[dia].turnos.filter((_, i) => i !== indice)
      }
    }));
  }, []);

  // Copiar horarios de un día a otro
  const copiarHorarios = useCallback((diaOrigen: DiaSemana, diaDestino: DiaSemana) => {
    setHorarios(prev => ({
      ...prev,
      [diaDestino]: { ...prev[diaOrigen] }
    }));
  }, []);

  // Validar todos los horarios
  const validarHorarios = useCallback((): boolean => {
    for (const dia of DIAS_SEMANA) {
      const horarioDia = horarios[dia];
      if (!horarioDia.abierto) continue;

      for (const turno of horarioDia.turnos) {
        if (!validarRangoHorario(turno.horaApertura, turno.horaCierre)) {
          return false;
        }
      }
    }
    return true;
  }, [horarios]);

  // Guardar horarios en la API
  const guardarHorarios = useCallback(async () => {
    if (!validarHorarios()) {
      toast({
        title: 'Error de Validación',
        description: 'Algunos horarios son inválidos. Verifica que las horas de cierre sean posteriores a las de apertura.',
        variant: 'destructive'
      });
      return false;
    }

    if (!restaurantId) { // ← USAR restaurantId DINÁMICO
      toast({
        title: 'Error',
        description: 'No se encontró el ID del restaurante',
        variant: 'destructive'
      });
      return false;
    }

    setGuardando(true);
    try {
      console.log('💾 Guardando horarios para restaurante:', restaurantId);
      
      const response = await fetch(`/api/restaurants/${restaurantId}/business-hours`, { // ← USAR restaurantId DINÁMICO
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ horarios }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar horarios');
      }

      const data = await response.json();
      
      if (data.success) {
        // Actualizar store de configuración
        actualizarCampo('/config-restaurante/horario-comercial', 'horarios', true);
        
        console.log('✅ Horarios guardados exitosamente');
        
        return true;
      }
      
    } catch (error) {
      console.error('Error al guardar horarios:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al guardar horarios',
        variant: 'destructive'
      });
      return false;
    } finally {
      setGuardando(false);
    }
  }, [horarios, validarHorarios, actualizarCampo, toast, restaurantId]); // ← AGREGAR restaurantId A DEPENDENCIAS

  // Verificar si hay horarios configurados
  const tieneHorariosConfigurados = useCallback((): boolean => {
    return DIAS_SEMANA.some(dia => horarios[dia].abierto && horarios[dia].turnos.length > 0);
  }, [horarios]);

  return {
    horarios,
    diaSeleccionado,
    setDiaSeleccionado,
    guardando,
    cargando,
    toggleDiaAbierto,
    actualizarTurno,
    agregarTurno,
    eliminarTurno,
    copiarHorarios,
    guardarHorarios,
    validarHorarios,
    tieneHorariosConfigurados,
    cargarHorarios,
    restaurantId // ← EXPONER PARA DEBUGGING
  };
}