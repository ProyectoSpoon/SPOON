import { DateTime, IANAZone } from 'luxon';

export class TimezoneHandler {
  private timezone: IANAZone;

  constructor(timezoneId: string = 'America/Bogota') {
    this.timezone = IANAZone.create(timezoneId);
  }

  convertToLocalTime(date: Date, targetTimezone?: string): DateTime {
    const dt = DateTime.fromJSDate(date);
    return targetTimezone 
      ? dt.setZone(targetTimezone)
      : dt.setZone(this.timezone);
  }

  getBusinessHours(date: DateTime): { open: DateTime; close: DateTime } {
    const open = date.set({ hour: 8, minute: 0 });
    const close = date.set({ hour: 20, minute: 0 });
    return { open, close };
  }

  isHoliday(date: DateTime): boolean {
    // Implementar lógica de feriados según el país
    return false;
  }

  getDayType(date: DateTime): 'weekday' | 'weekend' | 'holiday' {
    if (this.isHoliday(date)) return 'holiday';
    return [6, 7].includes(date.weekday) ? 'weekend' : 'weekday';
  }
}
