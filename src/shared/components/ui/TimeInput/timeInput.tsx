'use client';

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { TimeInputProps } from './types';
import { Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

export const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(({
  value,
  onChange,
  className = '',
  disabled = false,
  error = false,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Convertir "HH:mm" a formato 12 horas
  const to12Hour = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return { hours: hours12, minutes, period };
  };

  // Convertir a formato 24 horas
  const to24Hour = (hours: number, minutes: number, period: 'AM' | 'PM') => {
    let hours24 = hours;
    if (period === 'PM' && hours !== 12) hours24 += 12;
    if (period === 'AM' && hours === 12) hours24 = 0;
    return `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const { hours, minutes, period: currentPeriod } = to12Hour(value as string);

  useEffect(() => {
    setPeriod(currentPeriod as 'AM' | 'PM');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTimeChange = (newHours?: number, newMinutes?: number, newPeriod?: 'AM' | 'PM') => {
    const finalHours = newHours ?? hours;
    const finalMinutes = newMinutes ?? minutes;
    const finalPeriod = newPeriod ?? period;
    
    const newTime = to24Hour(finalHours, finalMinutes, finalPeriod);
    if (onChange) {
      onChange({ target: { value: newTime } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="time"
        ref={inputRef}
        value={value}
        onChange={onChange}
        className={cn(
          "w-full rounded-md px-3 py-2",
          "border border-neutral-200",
          "focus:border-[#F4821F] focus:ring-1 focus:ring-[#F4821F]/20",
          "text-xs text-neutral-600",
          "bg-transparent appearance-none",
          "[&::-webkit-calendar-picker-indicator]:hidden",
          error && "border-red-500",
          className
        )}
        disabled={disabled}
        {...props}
      />
      <Pencil 
        className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 
                 hover:text-[#F4821F] transition-colors cursor-pointer"
        size={14}
        onClick={() => setIsOpen(!isOpen)}
      />

 
{/* Selector desplegable */}
{isOpen && (
  <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg border border-neutral-200">
    <div className="p-3">
      {/* Selector de Horas */}
      <div className="mb-3">
        <label className="text-xs font-medium text-neutral-600 mb-1 block">Hora</label>
        <div className="grid grid-cols-4 gap-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <button
              key={i + 1}
              onClick={() => handleTimeChange(i + 1)}
              className={cn(
                "p-1.5 text-xs rounded-md transition-colors",
                hours === i + 1
                  ? "bg-[#F4821F] text-white"
                  : "hover:bg-neutral-100 text-neutral-600"
              )}
            >
              {(i + 1).toString().padStart(2, '0')}
            </button>
          ))}
        </div>
      </div>

      {/* Selector de Minutos */}
      <div className="mb-3">
        <label className="text-xs font-medium text-neutral-600 mb-1 block">Minutos</label>
        <div className="grid grid-cols-4 gap-1">
          {[0, 15, 30, 45].map((min) => (
            <button
              key={min}
              onClick={() => handleTimeChange(undefined, min)}
              className={cn(
                "p-1.5 text-xs rounded-md transition-colors",
                minutes === min
                  ? "bg-[#F4821F] text-white"
                  : "hover:bg-neutral-100 text-neutral-600"
              )}
            >
              {min.toString().padStart(2, '0')}
            </button>
          ))}
        </div>
      </div>

      {/* Selector AM/PM */}
      <div className="mb-3">
        <label className="text-xs font-medium text-neutral-600 mb-1 block">Periodo</label>
        <div className="grid grid-cols-2 gap-1">
          {['AM', 'PM'].map((p) => (
            <button
              key={p}
              onClick={() => handleTimeChange(undefined, undefined, p as 'AM' | 'PM')}
              className={cn(
                "p-1.5 text-xs rounded-md transition-colors",
                period === p
                  ? "bg-[#F4821F] text-white"
                  : "hover:bg-neutral-100 text-neutral-600"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Botón Aceptar */}
      <div className="flex justify-end border-t border-neutral-100 pt-2">
        <button
          onClick={() => setIsOpen(false)}
          className="text-xs px-3 py-1 rounded-md text-[#F4821F] hover:bg-[#F4821F]/10 transition-colors"
        >
          Aceptar
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
});

TimeInput.displayName = 'TimeInput';
