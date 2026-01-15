// src/app/config-restaurante/horario-comercial/hooks/useHorarios.ts
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/shared/Hooks/use-toast';
import { useAuth } from '@/context/postgres-authcontext';
import { DiaSemana, HorariosDia, Turno, DIAS_SEMANA, NOMBRES_DIAS } from '../types/horarios.types';
import {
  validarSuperposicion,
  puedeAgregarTurno,
  sugerirHorariosNuevoTurno,
  filtrarOpcionesApertura,
  filtrarOpcionesCierre,
  generarOpcionesHorarioCompletas
} from '../utils/validations';

// Estado inicial de horarios (6 AM - 6 PM por defecto)
const crearHorariosIniciales = (): Record<DiaSemana, HorariosDia> => {
  const horarios: Record<DiaSemana, HorariosDia> = {} as Record<DiaSemana, HorariosDia>;

  DIAS_SEMANA.forEach(dia => {
    horarios[dia] = {
      abierto: dia !== 'domingo', // Domingo cerrado por defecto
      turnos: dia !== 'domingo' ? [{ horaApertura: '06:00', horaCierre: '18:00' }] : [] // ✅ Desde 6 AM
    };
  });

  return horarios;
};

export function useHorarios() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [horarios, setHorarios] = useState<Record<DiaSemana, HorariosDia>>(crearHorariosIniciales);
  const [diaSeleccionado, setDiaSeleccionado] = useState<DiaSemana>('lunes');
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState<Record<DiaSemana, string>>({} as Record<DiaSemana, string>);

  // Opciones de horario completas
  const todasLasOpciones = generarOpcionesHorarioCompletas();

  // ✅ SIMPLIFICADO: Validar horarios en tiempo real (menos estricto)
  const validarHorariosDia = useCallback((dia: DiaSemana, nuevosTurnos: Turno[]) => {
    // Con opciones deshabilitadas, las validaciones son principalmente para casos edge
    const validacion = validarSuperposicion(nuevosTurnos);

    setErroresValidacion(prev => ({
      ...prev,
      [dia]: validacion.valido ? '' : (validacion.mensaje || 'Error de validación')
    }));

    return validacion.valido;
  }, []);

  // ✅ NUEVA: Obtener opciones filtradas para apertura
  const getOpcionesApertura = useCallback((dia: DiaSemana, indiceTurno: number) => {
    const turnosDelDia = horarios[dia].turnos;
    return filtrarOpcionesApertura(turnosDelDia, indiceTurno, todasLasOpciones);
  }, [horarios, todasLasOpciones]);

  // ✅ NUEVA: Obtener opciones filtradas para cierre
  const getOpcionesCierre = useCallback((dia: DiaSemana, indiceTurno: number, aperturaSeleccionada: string) => {
    const turnosDelDia = horarios[dia].turnos;
    return filtrarOpcionesCierre(turnosDelDia, indiceTurno, aperturaSeleccionada, todasLasOpciones);
  }, [horarios, todasLasOpciones]);

  // Cargar horarios existentes
  useEffect(() => {
    const cargarHorarios = async () => {
      if (!user?.restaurantId) return;

      try {
        setCargando(true);
        const token = localStorage.getItem('auth_token');

        const response = await fetch(`/api/restaurants/${user.restaurantId}/business-hours`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.horarios) {
            setHorarios(data.horarios);
            console.log('✅ Horarios cargados desde BD:', data.horarios);
          }
        }
      } catch (error) {
        console.error('❌ Error cargando horarios:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarHorarios();
  }, [user?.restaurantId]);

  // Toggle día abierto/cerrado
  const toggleDiaAbierto = useCallback((dia: DiaSemana, abierto: boolean) => {
    setHorarios(prev => ({
      ...prev,
      [dia]: {
        abierto,
        turnos: abierto
          ? (prev[dia].turnos.length > 0 ? prev[dia].turnos : [{ horaApertura: '06:00', horaCierre: '18:00' }]) // ✅ Mínimo desde 6 AM
          : []
      }
    }));

    // Limpiar error de validación si se cierra el día
    if (!abierto) {
      setErroresValidacion(prev => ({ ...prev, [dia]: '' }));
    }
  }, []);

  // ✅ ACTUALIZADA: Actualizar turno con validación
  const actualizarTurno = useCallback((dia: DiaSemana, indice: number, cambios: Partial<Turno>) => {
    setHorarios(prev => {
      const nuevosTurnos = [...prev[dia].turnos];
      nuevosTurnos[indice] = { ...nuevosTurnos[indice], ...cambios };

      // Validar inmediatamente
      validarHorariosDia(dia, nuevosTurnos);

      return {
        ...prev,
        [dia]: {
          ...prev[dia],
          turnos: nuevosTurnos
        }
      };
    });
  }, [validarHorariosDia]);

  // ✅ ACTUALIZADA: Agregar turno con validación y sugerencias
  const agregarTurno = useCallback((dia: DiaSemana) => {
    const horarioDia = horarios[dia];
    const validacionAgregar = puedeAgregarTurno(horarioDia.turnos);

    if (!validacionAgregar.puede) {
      toast({
        title: 'No se puede agregar turno',
        description: validacionAgregar.mensaje || 'Error desconocido',
        variant: 'destructive'
      });
      return;
    }

    // Obtener sugerencias para el nuevo turno
    const sugerencias = sugerirHorariosNuevoTurno(horarioDia.turnos);

    const nuevoTurno: Turno = {
      horaApertura: sugerencias.sugerenciaApertura || '14:00',
      horaCierre: sugerencias.sugerenciaCierre || '18:00'
    };

    setHorarios(prev => {
      const nuevosTurnos = [...prev[dia].turnos, nuevoTurno];

      // Validar inmediatamente
      validarHorariosDia(dia, nuevosTurnos);

      return {
        ...prev,
        [dia]: {
          ...prev[dia],
          turnos: nuevosTurnos
        }
      };
    });

    toast({
      title: 'Turno agregado',
      description: `Nuevo turno sugerido: ${sugerencias.sugerenciaApertura || '14:00'} - ${sugerencias.sugerenciaCierre || '18:00'}`,
    });
  }, [horarios, validarHorariosDia, toast]);

  // Eliminar turno
  const eliminarTurno = useCallback((dia: DiaSemana, indice: number) => {
    setHorarios(prev => {
      const nuevosTurnos = prev[dia].turnos.filter((_, i) => i !== indice);

      // Validar después de eliminar
      validarHorariosDia(dia, nuevosTurnos);

      return {
        ...prev,
        [dia]: {
          ...prev[dia],
          turnos: nuevosTurnos
        }
      };
    });
  }, [validarHorariosDia]);

  // Copiar horarios de un día a otro
  const copiarHorarios = useCallback((diaOrigen: DiaSemana, diaDestino: DiaSemana) => {
    const horarioOrigen = horarios[diaOrigen];

    setHorarios(prev => {
      // Validar horarios copiados
      validarHorariosDia(diaDestino, horarioOrigen.turnos);

      return {
        ...prev,
        [diaDestino]: { ...horarioOrigen }
      };
    });

    toast({
      title: 'Horarios copiados',
      description: `Horarios de ${NOMBRES_DIAS[diaOrigen]} copiados a ${NOMBRES_DIAS[diaDestino]}`,
    });
  }, [horarios, validarHorariosDia, toast]);

  // ✅ ACTUALIZADO: Guardar con validación completa y auto-detección
  const guardarHorarios = useCallback(async (): Promise<boolean> => {
    // Validar todos los días antes de guardar
    let tieneErrores = false;
    const errores: string[] = [];

    DIAS_SEMANA.forEach(dia => {
      const horarioDia = horarios[dia];
      if (horarioDia.abierto && horarioDia.turnos.length > 0) {
        const validacion = validarSuperposicion(horarioDia.turnos);
        if (!validacion.valido) {
          tieneErrores = true;
          errores.push(`${dia}: ${validacion.mensaje || 'Error de validación'}`); // ✅ Fallback extra
        }
      }
    });

    if (tieneErrores) {
      toast({
        title: 'Errores de validación',
        description: errores.join('\n'),
        variant: 'destructive'
      });
      return false;
    }

    try {
      setGuardando(true);
      const token = localStorage.getItem('auth_token');

      // Usar 'current' si no tenemos restaurantId (auto-detección en backend)
      const restaurantId = user?.restaurantId || 'current';

      const response = await fetch(`/api/restaurants/${restaurantId}/business-hours`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ horarios })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar horarios');
      }

      console.log('✅ Horarios guardados exitosamente');
      return true;

    } catch (error: any) {
      console.error('❌ Error guardando horarios:', error);
      toast({
        title: 'Error al guardar',
        description: error?.message || 'Error desconocido',
        variant: 'destructive'
      });
      return false;
    } finally {
      setGuardando(false);
    }
  }, [user?.restaurantId, horarios, toast]);

  // Verificar si tiene horarios configurados
  const tieneHorariosConfigurados = useCallback(() => {
    return DIAS_SEMANA.some(dia => {
      const horarioDia = horarios[dia];
      return horarioDia.abierto && horarioDia.turnos.length > 0;
    });
  }, [horarios]);

  // ✅ NUEVA: Verificar si un día tiene errores
  const diaConErrores = useCallback((dia: DiaSemana) => {
    const error = erroresValidacion[dia];
    return !!(error && error.trim() !== '');
  }, [erroresValidacion]);

  return {
    // Estados
    horarios,
    diaSeleccionado,
    guardando,
    cargando,
    erroresValidacion,

    // Acciones básicas
    setDiaSeleccionado,
    toggleDiaAbierto,
    actualizarTurno,
    agregarTurno,
    eliminarTurno,
    copiarHorarios,
    guardarHorarios,

    // Utilidades
    tieneHorariosConfigurados,
    diaConErrores,

    // ✅ NUEVAS: Funciones de validación
    getOpcionesApertura,
    getOpcionesCierre,
    validarHorariosDia,

    // Opciones completas (fallback)
    todasLasOpciones
  };
}