// /shared/utils/horarios/utilidades-horarios.ts
import { RangoHorario, DiaSemana, FechaExcepcion } from '@/shared/types/horarios/indice';
import { DateTime } from 'luxon';

export const utilidadesHorarios = {
  ordenarRangos(rangos: RangoHorario[]): RangoHorario[] {
    return [...rangos].sort((a, b) => {
      if (!a.horaApertura || !b.horaApertura) return 0;
      return a.horaApertura.localeCompare(b.horaApertura);
    });
  },

  crearRangoHorario(
    horaApertura: string | null = null,
    horaCierre: string | null = null
  ): RangoHorario {
    return {
      horaApertura,
      horaCierre,
      estaActivo: true
    };
  },

  esDiaHabil(fecha: Date, excepciones: FechaExcepcion[] = []): boolean {
    const dt = DateTime.fromJSDate(fecha);

    // Verificar excepciones
    const esExcepcion = excepciones.some(exc =>
      DateTime.fromJSDate(exc.fecha).hasSame(dt, 'day')
    );

    if (esExcepcion) return false;

    // Verificar fin de semana
    const diaSemana = dt.weekday;
    return diaSemana !== 6 && diaSemana !== 7;
  },

  obtenerProximoDiaHabil(
    fecha: Date,
    excepciones: FechaExcepcion[] = []
  ): Date {
    let dt = DateTime.fromJSDate(fecha);
    while (!this.esDiaHabil(dt.toJSDate(), excepciones)) {
      dt = dt.plus({ days: 1 });
    }
    return dt.toJSDate();
  }
};
