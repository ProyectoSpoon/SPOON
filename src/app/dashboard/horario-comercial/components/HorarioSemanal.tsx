'use client';

import React, { useState } from 'react';

interface HorarioDay {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface HorarioSemanalProps {
  initialSchedule?: HorarioDay[];
  onScheduleChange?: (schedule: HorarioDay[]) => void;
}

const defaultSchedule: HorarioDay[] = [
  { day: 'Lunes', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Martes', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Miércoles', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Jueves', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Viernes', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Sábado', isOpen: true, openTime: '10:00', closeTime: '16:00' },
  { day: 'Domingo', isOpen: false, openTime: '10:00', closeTime: '16:00' }
];

export default function HorarioSemanal({ initialSchedule = defaultSchedule, onScheduleChange }: HorarioSemanalProps) {
  const [schedule, setSchedule] = useState<HorarioDay[]>(initialSchedule);

  const handleDayToggle = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index].isOpen = !newSchedule[index].isOpen;
    setSchedule(newSchedule);
    onScheduleChange?.(newSchedule);
  };

  const handleTimeChange = (index: number, field: 'openTime' | 'closeTime', value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
    onScheduleChange?.(newSchedule);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Horario Comercial</h3>
      
      <div className="space-y-3">
        {schedule.map((daySchedule, index) => (
          <div key={daySchedule.day} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-20">
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

            {daySchedule.isOpen && (
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
            )}

            {!daySchedule.isOpen && (
              <span className="text-sm text-gray-500 italic">Cerrado</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Información</h4>
        <p className="text-sm text-blue-700">
          Configure los horarios de atención de su restaurante. Los clientes podrán ver estos horarios 
          y realizar pedidos únicamente durante las horas de operación.
        </p>
      </div>
    </div>
  );
}

export { type HorarioDay };
