'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/shared/components/ui/Button';
import { Alert, AlertDescription } from '@/shared/components/ui/Alert';
import { Clock, Save, RotateCcw, AlertCircle } from 'lucide-react';
import { useToast } from '@/shared/Hooks/use-toast';

interface HorarioDay {
  day: string;
  dayCode: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  isSpecial?: boolean;
  specialNote?: string;
}

interface VistaHorariosRestauranteProps {
  restaurantId?: string;
  onScheduleChange?: (schedule: HorarioDay[]) => void;
}

const defaultSchedule: HorarioDay[] = [
  { day: 'Lunes', dayCode: 'monday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Martes', dayCode: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Miércoles', dayCode: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Jueves', dayCode: 'thursday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Viernes', dayCode: 'friday', isOpen: true, openTime: '09:00', closeTime: '20:00' },
  { day: 'Sábado', dayCode: 'saturday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
  { day: 'Domingo', dayCode: 'sunday', isOpen: false, openTime: '10:00', closeTime: '16:00' }
];

export default function VistaHorariosRestaurante({ 
  restaurantId = 'default', 
  onScheduleChange 
}: VistaHorariosRestauranteProps) {
  const [schedule, setSchedule] = useState<HorarioDay[]>(defaultSchedule);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSchedule();
  }, [restaurantId]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/restaurants/${restaurantId}/schedule`);
      
      if (response.ok) {
        const data = await response.json();
        setSchedule(data.schedule || defaultSchedule);
      } else {
        // If no schedule exists, use default
        setSchedule(defaultSchedule);
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el horario. Usando horario por defecto.',
        variant: 'destructive'
      });
      setSchedule(defaultSchedule);
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index].isOpen = !newSchedule[index].isOpen;
    setSchedule(newSchedule);
    setHasChanges(true);
    onScheduleChange?.(newSchedule);
  };

  const handleTimeChange = (index: number, field: 'openTime' | 'closeTime', value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    
    // Validate that close time is after open time
    if (field === 'closeTime' || field === 'openTime') {
      const openTime = field === 'openTime' ? value : newSchedule[index].openTime;
      const closeTime = field === 'closeTime' ? value : newSchedule[index].closeTime;
      
      if (openTime >= closeTime) {
        toast({
          title: 'Horario inválido',
          description: 'La hora de cierre debe ser posterior a la hora de apertura.',
          variant: 'destructive'
        });
        return;
      }
    }
    
    setSchedule(newSchedule);
    setHasChanges(true);
    onScheduleChange?.(newSchedule);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const response = await fetch(`/api/restaurants/${restaurantId}/schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schedule }),
      });

      if (response.ok) {
        setHasChanges(false);
        toast({
          title: 'Éxito',
          description: 'Horario guardado correctamente.',
        });
      } else {
        throw new Error('Error al guardar el horario');
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el horario. Inténtalo de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSchedule(defaultSchedule);
    setHasChanges(true);
    onScheduleChange?.(defaultSchedule);
    toast({
      title: 'Horario restablecido',
      description: 'Se ha restablecido el horario por defecto.',
    });
  };

  const copyFromDay = (sourceIndex: number, targetIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[targetIndex] = {
      ...newSchedule[targetIndex],
      isOpen: newSchedule[sourceIndex].isOpen,
      openTime: newSchedule[sourceIndex].openTime,
      closeTime: newSchedule[sourceIndex].closeTime
    };
    setSchedule(newSchedule);
    setHasChanges(true);
    onScheduleChange?.(newSchedule);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 animate-spin" />
            <span>Cargando horarios...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Horarios de Atención</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasChanges && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Tienes cambios sin guardar. No olvides guardar tu configuración.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {schedule.map((daySchedule, index) => (
              <div key={daySchedule.dayCode} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-24">
                    <span className="text-sm font-medium text-gray-700">{daySchedule.day}</span>
                  </div>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={daySchedule.isOpen}
                      onChange={() => handleDayToggle(index)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">Abierto</span>
                  </label>
                </div>

                {daySchedule.isOpen ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Apertura</label>
                        <input
                          type="time"
                          value={daySchedule.openTime}
                          onChange={(e) => handleTimeChange(index, 'openTime', e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <span className="text-gray-400 mt-5">-</span>
                      
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Cierre</label>
                        <input
                          type="time"
                          value={daySchedule.closeTime}
                          onChange={(e) => handleTimeChange(index, 'closeTime', e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {index > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyFromDay(index - 1, index)}
                        className="text-xs"
                      >
                        Copiar anterior
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 italic">Cerrado</span>
                    {index > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyFromDay(index - 1, index)}
                        className="text-xs"
                      >
                        Copiar anterior
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={saving}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Restablecer</span>
            </Button>

            <Button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Información</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Configure los horarios de atención de su restaurante.</p>
            <p>• Los clientes solo podrán realizar pedidos durante las horas de operación.</p>
            <p>• Use "Copiar anterior" para aplicar el mismo horario del día anterior.</p>
            <p>• Los cambios se aplicarán inmediatamente después de guardar.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { type HorarioDay };
