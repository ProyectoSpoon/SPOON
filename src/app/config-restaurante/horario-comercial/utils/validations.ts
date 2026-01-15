// src/app/config-restaurante/horario-comercial/utils/validations.ts

import { Turno } from '../types/horarios.types';

// Convertir hora string a minutos para comparación fácil
export function horaAMinutos(hora: string): number {
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos;
}

// Convertir minutos a hora string
export function minutosAHora(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Validar si dos turnos se superponen
export function turnosSeSuperponenFunction(turno1: Turno, turno2: Turno): boolean {
  const inicio1 = horaAMinutos(turno1.horaApertura);
  const fin1 = horaAMinutos(turno1.horaCierre);
  const inicio2 = horaAMinutos(turno2.horaApertura);
  const fin2 = horaAMinutos(turno2.horaCierre);

  // Casos de superposición:
  // 1. turno2 empieza antes de que termine turno1 Y termina después de que empiece turno1
  return (inicio2 < fin1) && (fin2 > inicio1);
}

// Validar que no hay superposición en array de turnos
export function validarSuperposicion(turnos: Turno[]): { 
  valido: boolean; 
  mensaje: string; 
  turnosConflicto?: number[] 
} {
  if (turnos.length <= 1) {
    return { valido: true, mensaje: '' };
  }

  // Ordenar turnos por hora de apertura para facilitar validación
  const turnosOrdenados = turnos
    .map((turno, indice) => ({ ...turno, indiceOriginal: indice }))
    .sort((a, b) => horaAMinutos(a.horaApertura) - horaAMinutos(b.horaApertura));

  for (let i = 0; i < turnosOrdenados.length - 1; i++) {
    const turnoActual = turnosOrdenados[i];
    const siguienteTurno = turnosOrdenados[i + 1];

    if (turnosSeSuperponenFunction(turnoActual, siguienteTurno)) {
      return {
        valido: false,
        mensaje: `Los turnos ${turnoActual.indiceOriginal + 1} y ${siguienteTurno.indiceOriginal + 1} se superponen`,
        turnosConflicto: [turnoActual.indiceOriginal, siguienteTurno.indiceOriginal]
      };
    }
  }

  return { valido: true, mensaje: '' };
}

// Generar opciones de horario con step de 30 minutos DESDE LAS 6 AM
export function generarOpcionesHorarioCompletas(): { value: string; label: string; disabled?: boolean }[] {
  const opciones = [];
  
  // ✅ NUEVO: Empezar desde las 6:00 AM hasta las 11:30 PM
  for (let horas = 6; horas < 24; horas++) {
    for (let minutos = 0; minutos < 60; minutos += 30) {
      const horaStr = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
      const label = formatTo12HourSimple(horaStr);
      opciones.push({ value: horaStr, label, disabled: false });
    }
  }
  
  return opciones;
}

// Formato 12 horas simple para opciones
function formatTo12HourSimple(hora: string): string {
  const [horas, minutos] = hora.split(':').map(Number);
  const periodo = horas >= 12 ? 'PM' : 'AM';
  const horas12 = horas === 0 ? 12 : horas > 12 ? horas - 12 : horas;
  const minutosStr = minutos === 0 ? '' : `:${minutos.toString().padStart(2, '0')}`;
  return `${horas12}${minutosStr} ${periodo}`;
}

// ✅ NUEVO: Filtrar opciones de apertura marcando como disabled (no eliminar)
export function filtrarOpcionesApertura(
  turnos: Turno[], 
  indiceActual: number,
  todasLasOpciones: { value: string; label: string; disabled?: boolean }[]
): { value: string; label: string; disabled: boolean }[] {
  if (turnos.length <= 1) {
    return todasLasOpciones.map(opcion => ({ ...opcion, disabled: false }));
  }

  // Obtener otros turnos (excluyendo el actual)
  const otrosTurnos = turnos.filter((_, indice) => indice !== indiceActual);
  
  if (otrosTurnos.length === 0) {
    return todasLasOpciones.map(opcion => ({ ...opcion, disabled: false }));
  }

  return todasLasOpciones.map(opcion => {
    const horaOpcion = horaAMinutos(opcion.value);
    
    // Verificar si esta hora de apertura causaría conflictos
    const causaConflicto = otrosTurnos.some(otroTurno => {
      const inicioOtro = horaAMinutos(otroTurno.horaApertura);
      const finOtro = horaAMinutos(otroTurno.horaCierre);
      
      // Deshabilitar si la apertura estaría dentro del rango de otro turno
      return horaOpcion > inicioOtro && horaOpcion < finOtro;
    });
    
    return {
      ...opcion,
      disabled: causaConflicto
    };
  });
}

// ✅ NUEVO: Filtrar opciones de cierre marcando como disabled (no eliminar)
export function filtrarOpcionesCierre(
  turnos: Turno[],
  indiceActual: number, 
  aperturaSeleccionada: string,
  todasLasOpciones: { value: string; label: string; disabled?: boolean }[]
): { value: string; label: string; disabled: boolean }[] {
  const inicioActual = horaAMinutos(aperturaSeleccionada);
  
  return todasLasOpciones.map(opcion => {
    const horaOpcion = horaAMinutos(opcion.value);
    
    // Deshabilitar si es antes de la apertura
    if (horaOpcion <= inicioActual) {
      return { ...opcion, disabled: true };
    }
    
    // Verificar conflictos con otros turnos solo si hay múltiples turnos
    if (turnos.length <= 1) {
      return { ...opcion, disabled: false };
    }

    // Obtener otros turnos (excluyendo el actual)
    const otrosTurnos = turnos.filter((_, indice) => indice !== indiceActual);
    
    if (otrosTurnos.length === 0) {
      return { ...opcion, disabled: false };
    }

    // Verificar si esta hora de cierre causaría conflictos
    const causaConflicto = otrosTurnos.some(otroTurno => {
      const inicioOtro = horaAMinutos(otroTurno.horaApertura);
      const finOtro = horaAMinutos(otroTurno.horaCierre);
      
      // Deshabilitar si el cierre estaría dentro del rango de otro turno
      return horaOpcion > inicioOtro && horaOpcion < finOtro;
    });
    
    return {
      ...opcion,
      disabled: causaConflicto
    };
  });
}

// Validar antes de agregar nuevo turno
export function puedeAgregarTurno(turnos: Turno[]): { 
  puede: boolean; 
  mensaje?: string // ✅ CORREGIDO: Mensaje opcional
} {
  if (turnos.length >= 3) {
    return {
      puede: false,
      mensaje: 'Máximo 3 turnos por día'
    };
  }

  // Verificar que los turnos actuales sean válidos
  const validacion = validarSuperposicion(turnos);
  if (!validacion.valido) {
    return {
      puede: false,
      mensaje: validacion.mensaje || 'Corrige los turnos existentes antes de agregar uno nuevo'
    };
  }

  return { puede: true }; // ✅ CORREGIDO: Sin mensaje cuando es válido
}

// Sugerir horarios para nuevo turno basado en turnos existentes (6 AM - 11:30 PM)
export function sugerirHorariosNuevoTurno(turnos: Turno[]): {
  sugerenciaApertura?: string;
  sugerenciaCierre?: string;
} {
  if (turnos.length === 0) {
    return {
      sugerenciaApertura: '06:00', // ✅ Desde 6 AM
      sugerenciaCierre: '18:00'
    };
  }

  // Rango de trabajo: 6:00 AM - 11:30 PM (360 - 1410 minutos)
  const inicioJornada = 6 * 60; // 6:00 AM en minutos
  const finJornada = 23 * 60 + 30; // 11:30 PM en minutos

  // Ordenar turnos por hora de apertura
  const turnosOrdenados = [...turnos].sort((a, b) => 
    horaAMinutos(a.horaApertura) - horaAMinutos(b.horaApertura)
  );

  // Encontrar el gap más grande para sugerir nuevo turno
  let mejorGap = { inicio: 0, fin: 0, duracion: 0 };
  
  // Gap antes del primer turno
  const primerTurno = turnosOrdenados[0];
  const antesDelPrimero = horaAMinutos(primerTurno.horaApertura) - inicioJornada;
  
  if (antesDelPrimero >= 120) { // Al menos 2 horas
    mejorGap = {
      inicio: inicioJornada,
      fin: horaAMinutos(primerTurno.horaApertura),
      duracion: antesDelPrimero
    };
  }

  // Gaps entre turnos
  for (let i = 0; i < turnosOrdenados.length - 1; i++) {
    const turnoActual = turnosOrdenados[i];
    const siguienteTurno = turnosOrdenados[i + 1];
    
    const inicioGap = horaAMinutos(turnoActual.horaCierre);
    const finGap = horaAMinutos(siguienteTurno.horaApertura);
    const duracionGap = finGap - inicioGap;
    
    if (duracionGap > mejorGap.duracion && duracionGap >= 60) { // Al menos 1 hora
      mejorGap = {
        inicio: inicioGap,
        fin: finGap,
        duracion: duracionGap
      };
    }
  }

  // Gap después del último turno
  const ultimoTurno = turnosOrdenados[turnosOrdenados.length - 1];
  const despuesDelUltimo = finJornada - horaAMinutos(ultimoTurno.horaCierre);
  
  if (despuesDelUltimo > mejorGap.duracion && despuesDelUltimo >= 120) { // Al menos 2 horas
    mejorGap = {
      inicio: horaAMinutos(ultimoTurno.horaCierre),
      fin: finJornada,
      duracion: despuesDelUltimo
    };
  }

  // Generar sugerencia basada en el mejor gap
  if (mejorGap.duracion > 0) {
    const duracionSugerida = Math.min(mejorGap.duracion - 30, 4 * 60); // Máximo 4 horas, dejar 30 min de buffer
    return {
      sugerenciaApertura: minutosAHora(mejorGap.inicio),
      sugerenciaCierre: minutosAHora(mejorGap.inicio + duracionSugerida)
    };
  }

  // Fallback: después del último turno o horario estándar
  if (ultimoTurno && horaAMinutos(ultimoTurno.horaCierre) < 20 * 60) { // Antes de las 8 PM
    return {
      sugerenciaApertura: ultimoTurno.horaCierre,
      sugerenciaCierre: '22:00'
    };
  }

  // Fallback final: horario de mañana estándar desde 6 AM
  return {
    sugerenciaApertura: '06:00',
    sugerenciaCierre: '12:00'
  };
}