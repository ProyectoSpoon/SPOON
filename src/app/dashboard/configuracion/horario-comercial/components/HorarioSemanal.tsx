// src/app/dashboard/horario-comercial/components/HorarioSemanal.tsx
'use client';

import React, { useState } from 'react';
import { HorariosSemanales, DiaSemana, diasSemana, RangoHorario } from '../types/horarios.types';
import { Plus, Copy, Trash } from 'lucide-react';
import { Checkbox } from "@/shared/components/ui/Checkbox/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/Dialog/dialog";
import { Button } from "@/shared/components/ui/Button/button";
import { TimeInput } from "@/shared/components/ui/TimeInput";
import { spoonTheme } from '@/shared/Styles/spoon-theme';
import { cn } from "@/lib/utils";

interface PropiedadesHorarioSemanal {
  horarios: HorariosSemanales;
  onHorariosChange: (nuevosHorarios: HorariosSemanales) => void;
}

interface EstadoInput {
  [key: string]: {
    [key: number]: {
      apertura: boolean;
      cierre: boolean;
    }
  }
}

const estadoInicialHorarios: HorariosSemanales = diasSemana.reduce((acc, dia) => {
  acc[dia] = [];
  return acc;
}, {} as HorariosSemanales);

const HorarioSemanal: React.FC<PropiedadesHorarioSemanal> = ({
  horarios,
  onHorariosChange
}) => {
  // Estados
  const [dialogoCopiarAbierto, setDialogoCopiarAbierto] = useState(false);
  const [turnoACopiar, setTurnoACopiar] = useState<{dia: DiaSemana; indice: number} | null>(null);
  const [diasSeleccionados, setDiasSeleccionados] = useState<DiaSemana[]>([]);
  const [errores, setErrores] = useState<{[key: string]: { [key: number]: string }}>({});
  const [inputsHabilitados, setInputsHabilitados] = useState<EstadoInput>({});

  // Funciones de manejo de estados de inputs
  const actualizarEstadoInputs = (dia: DiaSemana, indice: number, campo: 'apertura' | 'cierre', estado: boolean) => {
    setInputsHabilitados(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [indice]: {
          ...prev[dia]?.[indice],
          [campo]: estado
        }
      }
    }));
  };

  // Agregar nuevo horario
  const agregarHorario = (dia: DiaSemana) => {
    const nuevosHorarios = {...horarios};
    nuevosHorarios[dia] = nuevosHorarios[dia] || [];
    nuevosHorarios[dia].push({
      horaApertura: null,
      horaCierre: null,
      estaActivo: true
    });
    
    const indice = nuevosHorarios[dia].length - 1;
    actualizarEstadoInputs(dia, indice, 'apertura', true);
    actualizarEstadoInputs(dia, indice, 'cierre', false);
    
    onHorariosChange(nuevosHorarios);
  };

  // Eliminar turno
  const eliminarTurno = (dia: DiaSemana, indice: number) => {
    if (horarios[dia].length <= 1) return;
    
    const nuevosHorarios = {...horarios};
    nuevosHorarios[dia] = nuevosHorarios[dia].filter((_, i) => i !== indice);
    onHorariosChange(nuevosHorarios);

    // Limpiar errores y estados del turno eliminado
    const nuevosErrores = {...errores};
    if (nuevosErrores[dia]) {
      delete nuevosErrores[dia][indice];
      if (Object.keys(nuevosErrores[dia]).length === 0) {
        delete nuevosErrores[dia];
      }
      setErrores(nuevosErrores);
    }

    const nuevosInputsHabilitados = {...inputsHabilitados};
    if (nuevosInputsHabilitados[dia]) {
      delete nuevosInputsHabilitados[dia][indice];
      if (Object.keys(nuevosInputsHabilitados[dia]).length === 0) {
        delete nuevosInputsHabilitados[dia];
      }
      setInputsHabilitados(nuevosInputsHabilitados);
    }
  };

  // Actualizar rango horario
  const actualizarRango = (dia: DiaSemana, indice: number, campo: keyof RangoHorario, valor: string | null) => {
    const nuevosHorarios = {...horarios};
    nuevosHorarios[dia][indice] = {
      ...nuevosHorarios[dia][indice],
      [campo]: valor || null
    };

    // Habilitar horario de cierre solo si hay hora de apertura
    if (campo === 'horaApertura') {
      actualizarEstadoInputs(dia, indice, 'cierre', !!valor);
    }

    onHorariosChange(nuevosHorarios);
  };
  // Copiar turno a otros días
 const copiarTurnoADias = () => {
  if (!turnoACopiar || diasSeleccionados.length === 0) return;
  
  const turnoACopiarData = horarios[turnoACopiar.dia][turnoACopiar.indice];
  const nuevosHorarios = {...horarios};
  
  diasSeleccionados.forEach(diaDestino => {
    if (!nuevosHorarios[diaDestino]) {
      nuevosHorarios[diaDestino] = [];
    }
    
    nuevosHorarios[diaDestino].push({...turnoACopiarData});
    const nuevoIndice = nuevosHorarios[diaDestino].length - 1;
    
    actualizarEstadoInputs(diaDestino, nuevoIndice, 'apertura', true);
    actualizarEstadoInputs(diaDestino, nuevoIndice, 'cierre', !!turnoACopiarData.horaApertura);
  });
  
  onHorariosChange(nuevosHorarios);
  setDialogoCopiarAbierto(false);
  setTurnoACopiar(null);
  setDiasSeleccionados([]);
};

// Habilitar/Deshabilitar día
const toggleDia = (dia: DiaSemana, checked: boolean) => {
  const nuevosHorarios = {...horarios};
  if (checked) {
    nuevosHorarios[dia] = [{
      horaApertura: null,
      horaCierre: null,
      estaActivo: true
    }];
    actualizarEstadoInputs(dia, 0, 'apertura', true);
    actualizarEstadoInputs(dia, 0, 'cierre', false);
  } else {
    nuevosHorarios[dia] = [];
    setInputsHabilitados(prev => {
      const nuevosEstados = {...prev};
      delete nuevosEstados[dia];
      return nuevosEstados;
    });
  }
  onHorariosChange(nuevosHorarios);
};

return (
  <div className="w-full">
    <div className="grid grid-cols-[3fr_7fr_3fr] gap-4 mb-4 px-4 py-2">
      <div className="font-bold text-neutral-600">Día de la semana</div>
      <div className="grid grid-cols-2 gap-4">
        <div className="font-bold text-center text-neutral-600">Horario de apertura</div>
        <div className="font-bold text-center text-neutral-600">Horario de cierre</div>
      </div>
      <div className="font-bold text-center text-neutral-600">Acciones</div>
    </div>

    <div className="space-y-1">
      {diasSemana.map((dia) => (
        <div key={dia} className="grid grid-cols-[3fr_7fr_3fr] gap-4 px-4 py-3 items-start border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={horarios[dia]?.length > 0}
              onCheckedChange={(checked) => toggleDia(dia, checked as boolean)}
              id={`check-${dia}`}
            />
            <label 
              htmlFor={`check-${dia}`}
              className="font-medium capitalize cursor-pointer text-neutral-600"
            >
              {dia}
            </label>
          </div>
          
          <div className="space-y-4">
            {horarios[dia]?.length > 0 ? (
              horarios[dia].map((rango, indiceRango) => (
                <div key={indiceRango} className="space-y-1">
                  <div className="grid grid-cols-2 gap-4">
                    <TimeInput
                      value={rango.horaApertura || ''}
                      onChange={(e) => {
                        const nuevoValor = e.target.value || null;
                        actualizarRango(dia, indiceRango, 'horaApertura', nuevoValor);
                      }}
                      disabled={!inputsHabilitados[dia]?.[indiceRango]?.apertura}
                        error={errores[dia]?.[indiceRango] ? 'Error en horario' : undefined}
                      placeholder="--:-- AM"
                    />
                    <TimeInput
                      value={rango.horaCierre || ''}
                      onChange={(e) => {
                        const nuevoValor = e.target.value || null;
                        actualizarRango(dia, indiceRango, 'horaCierre', nuevoValor);
                      }}
                      disabled={!rango.horaApertura}
                      error={errores[dia]?.[indiceRango] ? 'Error en horario' : undefined}
                      placeholder="--:-- AM"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-neutral-500 italic">Restaurante cerrado</div>
            )}
          </div>

          <div className="flex justify-end items-center gap-2">
            {horarios[dia]?.length > 0 && (
              <>
                <button
                  className="p-1 hover:bg-neutral-50 rounded-md text-neutral-500 hover:text-neutral-700 transition-colors"
                  onClick={() => {
                    setTurnoACopiar({ dia, indice: 0 });
                    setDialogoCopiarAbierto(true);
                  }}
                  title="Copiar horarios"
                >
                  <Copy size={16} strokeWidth={1.5} />
                </button>
                <button
                  className={cn(
                    "p-1 rounded-md transition-colors",
                    horarios[dia].length === 1 
                      ? "text-neutral-300 cursor-not-allowed" 
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
                  )}
                  onClick={() => horarios[dia].length > 1 && eliminarTurno(dia, 0)}
                  disabled={horarios[dia].length === 1}
                  title="Eliminar turno"
                >
                  <Trash size={16} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => agregarHorario(dia)}
                  className="flex items-center gap-1 text-xs whitespace-nowrap"
                  style={{ color: spoonTheme.colors.primary.main }}
                >
                  <Plus size={16} strokeWidth={1.5} />
                  <span>Agregar turno</span>
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>

    <Dialog open={dialogoCopiarAbierto} onOpenChange={setDialogoCopiarAbierto}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Copiar turno</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-neutral-600 mb-4">
            Selecciona los días a los que quieres copiar este turno
          </p>
          {diasSemana
            .filter(dia => dia !== turnoACopiar?.dia)
            .map(dia => (
              <div key={dia} className="flex items-center gap-2 mb-2">
                <Checkbox
                  id={`copy-${dia}`}
                  checked={diasSeleccionados.includes(dia)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setDiasSeleccionados(prev => [...prev, dia]);
                    } else {
                      setDiasSeleccionados(prev => prev.filter(d => d !== dia));
                    }
                  }}
                />
                <label htmlFor={`copy-${dia}`} className="capitalize text-neutral-600">
                  {dia}
                </label>
              </div>
            ))}
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setDialogoCopiarAbierto(false);
              setDiasSeleccionados([]);
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={copiarTurnoADias}
            disabled={diasSeleccionados.length === 0}
          >
            Copiar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
);
};

export default HorarioSemanal;
