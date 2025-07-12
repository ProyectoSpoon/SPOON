// /shared/utils/horarios/gestor-zona-horaria.ts
import { DateTime, IANAZone } from 'luxon';
import { RangoHorario, FechaExcepcion } from '@/shared/types/horarios';

export class GestorZonaHoraria {
  private zona: IANAZone;

  constructor(zonaHoraria: string = 'America/Bogota') {
    this.zona = IANAZone.create(zonaHoraria);
  }

  convertirAHoraLocal(fecha: Date, zonaDestino?: string): DateTime {
    const dt = DateTime.fromJSDate(fecha);
    return zonaDestino 
      ? dt.setZone(zonaDestino)
      : dt.setZone(this.zona);
  }

  formatearHora(hora: string, formato: '12h' | '24h'): string {
    const dt = DateTime.fromFormat(hora, 'HH:mm').setZone(this.zona);
    return formato === '12h' 
      ? dt.toFormat('hh:mm a')
      : dt.toFormat('HH:mm');
  }

  obtenerDiferenciaZonas(zonaDestino: string): number {
    const ahora = DateTime.now();
    const horaLocal = ahora.setZone(this.zona);
    const horaDestino = ahora.setZone(zonaDestino);
    return horaDestino.offset - horaLocal.offset;
  }
}
