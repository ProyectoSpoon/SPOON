import { DateTime } from 'luxon';
import { TimezoneHandler } from '@/app/dashboard/carta/programacion-semanal/utils/timezone-handler.utils';

interface ScheduleSlot {
  startTime: DateTime;
  endTime: DateTime;
  menuId: string;
}

export class ScheduleValidator {
  private tzHandler: TimezoneHandler;

  constructor(timezone: string) {
    this.tzHandler = new TimezoneHandler(timezone);
  }

  validateSlot(slot: ScheduleSlot, existingSlots: ScheduleSlot[]): {
    valid: boolean;
    conflicts?: ScheduleSlot[];
    reason?: string;
  } {
    // Validar horario de operación
    const { open, close } = this.tzHandler.getBusinessHours(slot.startTime);
    if (slot.startTime < open || slot.endTime > close) {
      return {
        valid: false,
        reason: 'El horario está fuera del horario de operación'
      };
    }

    // Buscar conflictos
    const conflicts = existingSlots.filter(existing => 
      this.hasOverlap(slot, existing)
    );

    if (conflicts.length > 0) {
      return {
        valid: false,
        conflicts,
        reason: 'El horario se sobrepone con otros menús'
      };
    }

    return { valid: true };
  }

  private hasOverlap(slot1: ScheduleSlot, slot2: ScheduleSlot): boolean {
    return slot1.startTime < slot2.endTime && slot2.startTime < slot1.endTime;
  }

  validateWeekSchedule(slots: ScheduleSlot[]): {
    valid: boolean;
    errors?: { slot: ScheduleSlot; reason: string }[];
  } {
    const errors: { slot: ScheduleSlot; reason: string }[] = [];
    
    slots.forEach(slot => {
      const dayType = this.tzHandler.getDayType(slot.startTime);
      
      // Validar días festivos
      if (dayType === 'holiday') {
        errors.push({
          slot,
          reason: 'No se puede programar en días festivos'
        });
      }

      // Validar conflictos
      const otherSlots = slots.filter(s => s !== slot);
      const validation = this.validateSlot(slot, otherSlots);
      
      if (!validation.valid) {
        errors.push({
          slot,
          reason: validation.reason!
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}