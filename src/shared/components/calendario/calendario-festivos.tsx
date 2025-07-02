// /shared/components/calendario/calendario-festivos.tsx
'use client';

import React, { useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/shared/components/ui/Dialog";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Trash } from 'lucide-react';
import { spoonTheme } from '@/shared/Styles/spoon-theme';
import { cn } from "@/lib/utils";
import { usarFestivos } from '@/shared/Hooks/horarios/usar-festivos';
import { Festivo } from '@/shared/types/horarios/tipos-festivos';
import { toast } from 'sonner';
import 'react-day-picker/dist/style.css';

interface CalendarioFestivosProps {
  restauranteId: string;
}

export default function CalendarioFestivos({ restauranteId }: CalendarioFestivosProps) {
  const [dialogoAbierto, setDialogoAbierto] = React.useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = React.useState<Date | undefined>();
  const [nuevoEvento, setNuevoEvento] = React.useState('');
  
  const {
    configuracion,
    cargando,
    error,
    cargarFestivos,
    agregarFestivo
  } = usarFestivos(restauranteId);

  useEffect(() => {
    cargarFestivos(new Date().getFullYear());
  }, [cargarFestivos]);

  const eventos = React.useMemo(() => {
    if (!configuracion) return [];
    return [
      ...configuracion.festivosNacionales,
      ...configuracion.festivosLocales,
      ...configuracion.festivosPersonalizados
    ];
  }, [configuracion]);

  const agregarEvento = async () => {
    if (fechaSeleccionada && nuevoEvento.trim()) {
      await agregarFestivo({
        nombre: nuevoEvento.trim(),
        fecha: fechaSeleccionada,
        tipo: 'personalizado',
        activo: true,
        descripcion: nuevoEvento.trim(),
        recurrenciaAnual: false,
        afectaHorario: true
      });
      
      setDialogoAbierto(false);
      setNuevoEvento('');
      setFechaSeleccionada(undefined);
    }
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

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    );
  }

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
            (ev.tipo === 'nacional' || ev.tipo === 'regional' || ev.tipo === 'local') && 
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
                    (evento.tipo === 'nacional' || evento.tipo === 'regional' || evento.tipo === 'local')
                      ? `bg-[${spoonTheme.colors.primary.light}] text-[${spoonTheme.colors.primary.dark}]`
                      : 'bg-blue-50 text-blue-800'
                  )}>
                    {evento.descripcion}
                  </span>
                  {evento.tipo === 'personalizado' && (
                    <button
                      onClick={async () => {
                        try {
                          // Aquí iría la lógica para eliminar el festivo
                          toast.success('Evento eliminado');
                        } catch (error) {
                          toast.error('Error al eliminar el evento');
                        }
                      }}
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
              variant="default"
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
}
