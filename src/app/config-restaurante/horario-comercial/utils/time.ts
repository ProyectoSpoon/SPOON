// src/app/config-restaurante/horario-comercial/utils/time.ts

// Convertir hora 24h a formato 12h para mostrar
export function formatTo12Hour(hora: string): string {
  if (!hora || !hora.includes(':')) return hora;
  
  const [horas, minutos] = hora.split(':').map(Number);
  const periodo = horas >= 12 ? 'PM' : 'AM';
  const horas12 = horas === 0 ? 12 : horas > 12 ? horas - 12 : horas;
  
  return `${horas12}:${minutos.toString().padStart(2, '0')} ${periodo}`;
}

// Generar opciones de horario con intervalos de 30 minutos
export function generarOpcionesHorario(): { value: string; label: string }[] {
  const opciones = [];
  
  for (let horas = 0; horas < 24; horas++) {
    for (let minutos = 0; minutos < 60; minutos += 30) {
      const horaStr = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
      const label = formatTo12Hour(horaStr);
      opciones.push({ value: horaStr, label });
    }
  }
  
  return opciones;
}

// Validar formato de hora
export function esHoraValida(hora: string): boolean {
  if (!hora || typeof hora !== 'string') return false;
  
  const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(hora);
}

// Comparar dos horas (retorna -1 si hora1 < hora2, 0 si son iguales, 1 si hora1 > hora2)
export function compararHoras(hora1: string, hora2: string): number {
  if (!esHoraValida(hora1) || !esHoraValida(hora2)) {
    throw new Error('Formato de hora inválido');
  }
  
  const [h1, m1] = hora1.split(':').map(Number);
  const [h2, m2] = hora2.split(':').map(Number);
  
  const minutos1 = h1 * 60 + m1;
  const minutos2 = h2 * 60 + m2;
  
  if (minutos1 < minutos2) return -1;
  if (minutos1 > minutos2) return 1;
  return 0;
}

// Calcular duración entre dos horas en minutos
export function calcularDuracion(horaInicio: string, horaFin: string): number {
  if (!esHoraValida(horaInicio) || !esHoraValida(horaFin)) {
    throw new Error('Formato de hora inválido');
  }
  
  const [h1, m1] = horaInicio.split(':').map(Number);
  const [h2, m2] = horaFin.split(':').map(Number);
  
  const minutos1 = h1 * 60 + m1;
  const minutos2 = h2 * 60 + m2;
  
  return minutos2 - minutos1;
}

// Agregar minutos a una hora
export function agregarMinutos(hora: string, minutos: number): string {
  if (!esHoraValida(hora)) {
    throw new Error('Formato de hora inválido');
  }
  
  const [h, m] = hora.split(':').map(Number);
  const totalMinutos = h * 60 + m + minutos;
  
  // Mantener dentro del día (0-1439 minutos)
  const minutosDelDia = ((totalMinutos % (24 * 60)) + (24 * 60)) % (24 * 60);
  
  const nuevasHoras = Math.floor(minutosDelDia / 60);
  const nuevosMinutos = minutosDelDia % 60;
  
  return `${nuevasHoras.toString().padStart(2, '0')}:${nuevosMinutos.toString().padStart(2, '0')}`;
}

// Obtener hora actual en formato HH:MM
export function obtenerHoraActual(): string {
  const ahora = new Date();
  const horas = ahora.getHours();
  const minutos = ahora.getMinutes();
  
  return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
}

// Formatear duración en minutos a texto legible
export function formatearDuracion(minutos: number): string {
  if (minutos < 60) {
    return `${minutos} min`;
  }
  
  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;
  
  if (minutosRestantes === 0) {
    return `${horas}h`;
  }
  
  return `${horas}h ${minutosRestantes}min`;
}