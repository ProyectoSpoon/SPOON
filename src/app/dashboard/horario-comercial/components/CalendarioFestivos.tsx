// src/app/dashboard/horario-comercial/components/CalendarioFestivos.tsx
'use client';

import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/shared/components/ui/Dialog/dialog";
import { Button } from "@/shared/components/ui/Button/button";
import { Input } from "@/shared/components/ui/Input";
import { Trash } from 'lucide-react';
import { spoonTheme } from '@/shared/Styles/spoon-theme';
import { cn } from "@/lib/utils";
import 'react-day-picker/dist/style.css';

interface Evento {
  id: string;
  fecha: Date;
  tipo: 'festivo' | 'personalizado';
  descripcion: string;
}

// Lista de días festivos del 2024
const diasFestivos2024: Evento[] = [
  { id: 'f1', fecha: new Date(2024, 0, 1), tipo: 'festivo', descripcion: 'Año Nuevo' },
  { id: 'f2', fecha: new Date(2024, 4, 1), tipo: 'festivo', descripcion: 'Día del Trabajo' },
  { id: 'f3', fecha: new Date(2024, 6, 20), tipo: 'festivo', descripcion: 'Día de la Independencia' },
  { id: 'f4', fecha: new Date(2024, 7, 7), tipo: 'festivo', descripcion: 'Batalla de Boyacá' },
  { id: 'f5', fecha: new Date(2024, 11, 25), tipo: 'festivo', descripcion: 'Navidad' },
];

const CalendarioFestivos: React.FC = () => {
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | undefined>();
  const [nuevoEvento, setNuevoEvento] = useState('');
  const [eventos, setEventos] = useState<Evento[]>(diasFestivos2024);

  const agregarEvento = () => {
    if (fechaSeleccionada && nuevoEvento.trim()) {
      const nuevoEventoObj: Evento = {
        id: `p${Date.now()}`,
        fecha: fechaSeleccionada,
        tipo: 'personalizado',
        descripcion: nuevoEvento.trim()
      };

      setEventos(prev => [...prev, nuevoEventoObj]);
      setDialogoAbierto(false);
      setNuevoEvento('');
      setFechaSeleccionada(undefined);
    }
  };

  const eliminarEvento = (id: string) => {
    setEventos(prev => prev.filter(evento => evento.id !== id));
  };

  const estilosCalendario = `
    .rdp {
      --rdp-cell-size: 40px;
      margin: 0;
    }
    .rdp-month {
      background-color: white;
      padding: 4px;
    }
    .rdp-day {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      font-size: 0.875rem;
    }
    .rdp-day_selected {
      background-color: ${spoonTheme.colors.primary.main};
      color: white;
    }
    .rdp-day_today {
      border: 2px solid ${spoonTheme.colors.primary.light};
      font-weight: bold;
    }
    .rdp-head_cell {
      font-size: 0.875rem;
      font-weight: 500;
      color: ${spoonTheme.colors.neutral[600]};
    }
    .rdp-nav_button {
      border-radius: 8px;
      color: ${spoonTheme.colors.neutral[600]};
    }
    .rdp-nav_button:hover {
      background-color: ${spoonTheme.colors.neutral[100]};
    }
  `;

  return (
    <div className="bg-white rounded-xl p-4">
      <style>{estilosCalendario}</style>
      
      <h2 className="text-lg font-semibold mb-4">Días Festivos</h2>
 
      <DayPicker
        mode="single"
        locale={es}
        selected={fechaSeleccionada}
        onSelect={(date) => {
          if (date) {
            setFechaSeleccionada(date);
            setDialogoAbierto(true);
          }
        }}
        modifiers={{
          festivo: (date) => eventos.some(ev => 
            ev.tipo === 'festivo' && 
            date.getDate() === ev.fecha.getDate() && 
            date.getMonth() === ev.fecha.getMonth()
          ),
          personalizado: (date) => eventos.some(ev => 
            ev.tipo === 'personalizado' && 
            date.getDate() === ev.fecha.getDate() && 
            date.getMonth() === ev.fecha.getMonth()
          )
        }}
        modifiersStyles={{
          festivo: {
            backgroundColor: spoonTheme.colors.primary.light,
            color: spoonTheme.colors.primary.dark,
            fontWeight: '500'
          },
          personalizado: {
            backgroundColor: '#EEF2FF',
            color: '#4F46E5',
            fontWeight: '500'
          }
        }}
        className="mx-auto"
      />
 
      <Button 
        className="w-full mt-4"
        variant="primary"
        onClick={() => setDialogoAbierto(true)}
      >
        Agregar evento
      </Button>
 
      {/* Próximos eventos */}
      <div className="mt-6">
        <h3 className="font-medium text-sm mb-3">Próximos eventos:</h3>
        <div className="space-y-2">
          {eventos
            .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
            .map((evento) => (
              <div key={evento.id} className="flex items-center justify-between py-2">
                <span className="text-sm text-neutral-600">
                  {format(evento.fecha, "d 'de' MMMM", { locale: es })}
                </span>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
                    evento.tipo === 'festivo' 
                      ? `bg-[${spoonTheme.colors.primary.light}] text-[${spoonTheme.colors.primary.dark}] ring-1 ring-inset ring-[${spoonTheme.colors.primary.main}]/20`
                      : 'bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-600/20'
                  )}>
                    {evento.descripcion}
                  </span>
                  {evento.tipo === 'personalizado' && (
                    <button
                      onClick={() => eliminarEvento(evento.id)}
                      className="p-1 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <Trash size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
 
      <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Evento</DialogTitle>
            <DialogDescription>
              Selecciona una fecha y agrega una descripción para el evento.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-neutral-600 mb-4">
              Fecha seleccionada: {fechaSeleccionada && 
                format(fechaSeleccionada, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
            <Input
              value={nuevoEvento}
              onChange={(e) => setNuevoEvento(e.target.value)}
              placeholder="Descripción del evento"
              className="w-full"
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => {
                setDialogoAbierto(false);
                setNuevoEvento('');
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={agregarEvento}
              disabled={!nuevoEvento.trim()}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
 
      {/* Instrucciones */}
      <div className="mt-4 pt-4 border-t border-neutral-200">
        <p className="text-xs text-neutral-600">
          • Los días festivos aparecen en naranja<br />
          • Los eventos personalizados aparecen en azul<br />
          • Haz clic en cualquier día para agregar un evento<br />
          • Los eventos personalizados pueden ser eliminados
        </p>
      </div>
    </div>
  );
};
 
export default CalendarioFestivos;