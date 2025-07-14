// src/app/dashboard/horario-comercial/utils/time.utils.ts

export const parseTime = (time: string | null) => {
  if (!time) return null;
  const [hours, minutes] = time.split(':').map(Number);
  return { hours, minutes };
};

export const convertTo12Hour = (time: string | null) => {
  if (!time) return null;
  const { hours, minutes } = parseTime(time)!;
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const getAvailableHours = (
  currentTime: string | null,
  ocupiedRanges: Array<{start: string | null, end: string | null}>,
  isClosingTime: boolean = false
) => {
  const currentMinutes = currentTime ? convertToMinutes(currentTime) : null;

  // Generar todas las horas posibles (formato 12 horas)
  const horasPosibles = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const period = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const minutes = hour * 60;

    // Validar disponibilidad
    if (isClosingTime && currentMinutes && minutes <= currentMinutes) {
      return null;
    }

    const estaOcupado = ocupiedRanges.some(range => {
      const start = range.start ? convertToMinutes(range.start) : null;
      const end = range.end ? convertToMinutes(range.end) : null;
      if (!start || !end) return false;
      return minutes >= start && minutes <= end;
    });

    if (estaOcupado) return null;

    return {
      hour,
      display: `${hour12}:00 ${period}`,
      minutes
    };
  }).filter(Boolean);

  return horasPosibles;
};

const convertToMinutes = (time: string) => {
  const { hours, minutes } = parseTime(time)!;
  return hours * 60 + minutes;
};

export const validateTimeRange = (horaApertura: string | null, horaCierre: string | null) => {
  if (!horaApertura || !horaCierre) return true;
  const inicioMinutos = convertToMinutes(horaApertura);
  const finMinutos = convertToMinutes(horaCierre);
  return finMinutos > inicioMinutos;
};
