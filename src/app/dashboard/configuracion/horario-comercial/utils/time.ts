// src/app/config-restaurante/horario-comercial/utils/time.ts

/**
 * Convierte hora 24h a formato 12h con AM/PM
 */
export function formatTo12Hour(time: string): string {
  if (!time) return '';
  
  const [hours, minutes] = time.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Valida que la hora de cierre sea posterior a la de apertura
 */
export function validarRangoHorario(apertura: string, cierre: string): boolean {
  if (!apertura || !cierre) return true;
  
  const [horasApertura, minutosApertura] = apertura.split(':').map(Number);
  const [horasCierre, minutosCierre] = cierre.split(':').map(Number);
  
  const minutosAperturaTotales = horasApertura * 60 + minutosApertura;
  const minutosCierreTotales = horasCierre * 60 + minutosCierre;
  
  return minutosCierreTotales > minutosAperturaTotales;
}

/**
 * Genera opciones de horas para selectores
 */
export function generarOpcionesHorario(): Array<{value: string, label: string}> {
  const opciones = [];
  
  for (let hour = 0; hour < 24; hour++) {
    for (let minutes = 0; minutes < 60; minutes += 30) {
      const time24 = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const time12 = formatTo12Hour(time24);
      
      opciones.push({
        value: time24,
        label: time12
      });
    }
  }
  
  return opciones;
}
