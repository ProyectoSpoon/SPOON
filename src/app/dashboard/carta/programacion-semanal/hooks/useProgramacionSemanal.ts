import { useState, useCallback } from 'react';
import { DateTime } from 'luxon';
import { TimezoneHandler } from '@/app/dashboard/carta/programacion-semanal/utils/timezone-handler.utils';
import { ScheduleValidator } from '@/app/dashboard/carta/programacion-semanal/services/schedule-validator.service';

interface ProgramacionSlot {
  id?: string;
  menuId: string;
  startTime: Date;
  endTime: Date;
  repeat?: 'none' | 'daily' | 'weekly';
  exceptions?: Date[];
  status: 'active' | 'inactive';
}

export function useProgramacionSemanal(restaurantId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [programacion, setProgramacion] = useState<ProgramacionSlot[]>([]);

  const tzHandler = new TimezoneHandler();
  const validator = new ScheduleValidator('America/Bogota');

  const cargarProgramacion = useCallback(async (weekStart: Date) => {
    setLoading(true);
    try {
      console.log('Cargando programación semanal (simulación):', { restaurantId, weekStart });
      
      // Simular delay de carga
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Datos de ejemplo para la programación semanal
      const slotsEjemplo: ProgramacionSlot[] = [
        {
          id: 'slot_1',
          menuId: 'menu_almuerzo_1',
          startTime: new Date(weekStart.getTime() + 12 * 60 * 60 * 1000), // 12:00 PM
          endTime: new Date(weekStart.getTime() + 15 * 60 * 60 * 1000), // 3:00 PM
          repeat: 'daily',
          status: 'active'
        },
        {
          id: 'slot_2',
          menuId: 'menu_cena_1',
          startTime: new Date(weekStart.getTime() + 18 * 60 * 60 * 1000), // 6:00 PM
          endTime: new Date(weekStart.getTime() + 21 * 60 * 60 * 1000), // 9:00 PM
          repeat: 'daily',
          status: 'active'
        }
      ];

      setProgramacion(slotsEjemplo);
      console.log('Programación cargada (simulación):', slotsEjemplo);
    } catch (error) {
      setError('Error al cargar la programación');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  const agregarSlot = useCallback(async (slot: Omit<ProgramacionSlot, 'id'>) => {
    setLoading(true);
    try {
      console.log('Agregando slot de programación (simulación):', slot);
      
      // Validar el slot
      const existingSlots = programacion.map(p => ({
        startTime: DateTime.fromJSDate(p.startTime),
        endTime: DateTime.fromJSDate(p.endTime),
        menuId: p.menuId
      }));

      const newSlot = {
        startTime: DateTime.fromJSDate(slot.startTime),
        endTime: DateTime.fromJSDate(slot.endTime),
        menuId: slot.menuId
      };

      const validation = validator.validateSlot(newSlot, existingSlots);
      if (!validation.valid) {
        throw new Error(validation.reason);
      }

      // Simular delay de creación
      await new Promise(resolve => setTimeout(resolve, 300));

      // Generar ID único
      const newId = `slot_${Date.now()}`;
      const newSlotWithId = { ...slot, id: newId };

      setProgramacion(prev => [...prev, newSlotWithId]);
      console.log('Slot agregado exitosamente (simulación):', newSlotWithId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al agregar slot');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [restaurantId, programacion, validator]);

  const actualizarSlot = useCallback(async (
    id: string, 
    updates: Partial<ProgramacionSlot>
  ) => {
    setLoading(true);
    try {
      console.log('Actualizando slot de programación (simulación):', { id, updates });
      
      if (updates.startTime || updates.endTime) {
        const currentSlot = programacion.find(p => p.id === id);
        if (!currentSlot) throw new Error('Slot no encontrado');

        const updatedSlot = {
          startTime: DateTime.fromJSDate(updates.startTime || currentSlot.startTime),
          endTime: DateTime.fromJSDate(updates.endTime || currentSlot.endTime),
          menuId: updates.menuId || currentSlot.menuId
        };

        const otherSlots = programacion
          .filter(p => p.id !== id)
          .map(p => ({
            startTime: DateTime.fromJSDate(p.startTime),
            endTime: DateTime.fromJSDate(p.endTime),
            menuId: p.menuId
          }));

        const validation = validator.validateSlot(updatedSlot, otherSlots);
        if (!validation.valid) {
          throw new Error(validation.reason);
        }
      }

      // Simular delay de actualización
      await new Promise(resolve => setTimeout(resolve, 300));

      setProgramacion(prev => 
        prev.map(slot => 
          slot.id === id ? { ...slot, ...updates } : slot
        )
      );
      
      console.log('Slot actualizado exitosamente (simulación)');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar slot');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [restaurantId, programacion, validator]);

  const eliminarSlot = useCallback(async (id: string) => {
    setLoading(true);
    try {
      console.log('Eliminando slot de programación (simulación):', id);
      
      // Simular delay de eliminación
      await new Promise(resolve => setTimeout(resolve, 300));

      setProgramacion(prev => prev.filter(slot => slot.id !== id));
      console.log('Slot eliminado exitosamente (simulación)');
    } catch (error) {
      setError('Error al eliminar slot');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    programacion,
    cargarProgramacion,
    agregarSlot,
    actualizarSlot,
    eliminarSlot,
    resetError
  };
}
