import { useState, useCallback } from 'react';
;
import { db } from '@/firebase/config';
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
      const weekEnd = DateTime.fromJSDate(weekStart).plus({ days: 7 }).toJSDate();
      
      const q = query(
        collection(db, 'programacion'),
        where('restaurantId', '==', restaurantId),
        where('startTime', '>=', weekStart),
        where('startTime', '<', weekEnd)
      );

      const snapshot = await getDocs(q);
      const slots = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProgramacionSlot[];

      setProgramacion(slots);
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

      const docRef = await addDoc(collection(db, 'programacion'), {
        ...slot,
        restaurantId,
        createdAt: new Date()
      });

      setProgramacion(prev => [...prev, { ...slot, id: docRef.id }]);
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

      await updateDoc(doc(db, 'programacion', id), updates);
      setProgramacion(prev => 
        prev.map(slot => 
          slot.id === id ? { ...slot, ...updates } : slot
        )
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar slot');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [restaurantId, programacion, validator]);

  return {
    loading,
    error,
    programacion,
    cargarProgramacion,
    agregarSlot,
    actualizarSlot
  };
}