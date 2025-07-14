// /app/horarios-restaurante/componentes/EntradaHorario.tsx
'use client';

import React from 'react';
import { RangoHorario } from '../types/horarios.types';
import { X } from 'lucide-react';

interface PropiedadesEntradaHorario {
  rangoHorario: RangoHorario;
  onChange: (nuevoRango: RangoHorario) => void;
  onEliminar: () => void;
  esUnico: boolean; // Para evitar eliminar el último rango
}

const EntradaHorario: React.FC<PropiedadesEntradaHorario> = ({
  rangoHorario,
  onChange,
  onEliminar,
  esUnico
}) => {
  const manejarCambioHora = (campo: keyof RangoHorario, valor: string) => {
    onChange({
      ...rangoHorario,
      [campo]: valor
    });
  };

  return (
    <div className="flex items-center gap-4 mb-2">
      <input
        type="time"
        value={rangoHorario.horaApertura || ''}
        onChange={(e) => manejarCambioHora('horaApertura', e.target.value)}
        className="border rounded-md p-2 bg-white"
      />
      <span className="text-neutral-500">a</span>
      <input
        type="time"
        value={rangoHorario.horaCierre || ''}
        onChange={(e) => manejarCambioHora('horaCierre', e.target.value)}
        className="border rounded-md p-2 bg-white"
      />
      {!esUnico && (
        <button
          onClick={onEliminar}
          className="p-2 text-neutral-500 hover:text-system-error rounded-full hover:bg-neutral-100"
          aria-label="Eliminar rango horario"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};

export default EntradaHorario;



























