// src/app/config-restaurante/horario-comercial/hooks/useHorarios.ts

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useConfigStore } from '@/app/config-restaurante/store/config-store';
import { DiaSemana, HorariosRestaurante, HorarioDia, Turno, DIAS_SEMANA } from '../types/horarios.types';
import { validarRangoHorario } from '../utils/time';
import { useToast } from '@/shared/Hooks/use-toast';

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

// Obtener ID del restaurante actual
const RESTAURANT_ID = '4073a4ad-b275-4e17-b197-844881f0319e';

export function useHorarios() {
  const [horarios, setHorarios] = useState<HorariosRestaurante>(HORARIOS_INICIALES);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState<DiaSemana>('lunes');
  
  const { actualizarCampo } = useConfigStore();
  const { toast } = useToast();
  
  // Memoizar el token para evitar accesos repetidos a localStorage
  const authToken = useMemo(() => {
    return localStorage.getItem('auth_token') || localStorage.getItem('token');
  }, []);

  // Cargar horarios desde la API del dashboard
  const cargarHorarios = useCallback(async () => {
    try {
      setCargando(true);
      console.log('🔍 Cargando horarios desde dashboard API...');
      
      // Usar token memoizado
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      // Usar el mismo endpoint que funciona en config-restaurante
      const restaurantId = 'ce51f50f-bcd0-4329-9370-14f83b4af3d4';
      const response = await fetch(`/api/restaurants/${restaurantId}/business-hours`, {
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Datos de horarios recibidos:', data);
        
        if (data.horarios) {
          // Usar directamente los horarios del endpoint que funciona
          setHorarios(data.horarios);
          console.log('✅ Horarios cargados directamente:', data.horarios);
          
          // Actualizar store si hay horarios configurados
          const tieneHorarios = Object.values(data.horarios).some((dia: any) => 
            dia.abierto && dia.turnos && dia.turnos.length > 0
          );
          
          if (tieneHorarios) {
            actualizarCampo('/config-restaurante/horario-comercial', 'horarios', true);
          }
        } else {
          console.log('⚠️ No se encontraron horarios guardados, usando por defecto');
          setHorarios(HORARIOS_INICIALES);
        }
      } else {
        console.log('⚠️ API respondió con error, usando horarios por defecto');
        setHorarios(HORARIOS_INICIALES);
      }
    } catch (error) {
      console.error('❌ Error cargando horarios:', error);
      setHorarios(HORARIOS_INICIALES);
      toast({
        title: 'Aviso',
        description: 'Usando horarios por defecto. Los horarios guardados no se pudieron cargar.',
        variant: 'default'
      });
    } finally {
      setCargando(false);
    }
  }, [authToken, actualizarCampo, toast]);

  // Cargar horarios al inicializar
  useEffect(() => {
    console.log('🚀 Hook useHorarios iniciado');
    console.log('Estado inicial:', HORARIOS_INICIALES);
    cargarHorarios();
  }, []);

  // Cambiar estado de un día (abierto/cerrado)
const toggleDiaAbierto = useCallback((dia: DiaSemana, abierto: boolean) => {
  console.log('🔥 toggleDiaAbierto llamado:', { dia, abierto }); // ← AGREGAR ESTO
  
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
    console.log('🔥 Nuevos horarios:', nuevosHorarios); // ← AGREGAR ESTO
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

  // Guardar horarios en la API del dashboard
  const guardarHorarios = useCallback(async () => {
    if (!validarHorarios()) {
      toast({
        title: 'Error de Validación',
        description: 'Algunos horarios son inválidos. Verifica que las horas de cierre sean posteriores a las de apertura.',
        variant: 'destructive'
      });
      return false;
    }

    setGuardando(true);
    try {
      console.log('💾 Guardando horarios en dashboard API...');
      console.log('📊 Estado actual de horarios:', horarios);
      
      // Asegurar que tenemos los 7 días completos
      const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
      const horarioRegular: any[] = [];
      
      // Convertir a formato array que espera el endpoint PUT
      diasSemana.forEach((dia, index) => {
        const horarioDia = horarios[dia as keyof typeof horarios] || { abierto: false, turnos: [] };
        horarioRegular.push({
          dia: index,
          abierto: horarioDia.abierto,
          horaApertura: horarioDia.turnos.length > 0 ? horarioDia.turnos[0].horaApertura : '08:00',
          horaCierre: horarioDia.turnos.length > 0 ? horarioDia.turnos[0].horaCierre : '18:00'
        });
      });
      
      console.log('📤 Datos a enviar (formato array):', horarioRegular);
      
      // Usar token memoizado
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      // Usar el mismo endpoint que funciona en config-restaurante
      const restaurantId = 'ce51f50f-bcd0-4329-9370-14f83b4af3d4';
      const response = await fetch(`/api/restaurants/${restaurantId}/business-hours`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ horarioRegular: horarioRegular }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar horarios');
      }

      const data = await response.json();
      
      if (data.success) {
        // Actualizar store de configuración
        actualizarCampo('/config-restaurante/horario-comercial', 'horarios', true);
        
        toast({
          title: 'Éxito',
          description: 'Horarios guardados correctamente'
        });
        
        console.log('✅ Horarios guardados exitosamente');
        return true;
      }
      
    } catch (error) {
      console.error('❌ Error al guardar horarios:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al guardar horarios',
        variant: 'destructive'
      });
      return false;
    } finally {
      setGuardando(false);
    }
  }, [horarios, validarHorarios, actualizarCampo, toast, authToken]);

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
    cargarHorarios
  };
}
