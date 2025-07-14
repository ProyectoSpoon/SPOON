// /app/horarios-restaurante/componentes/HorarioDiario.tsx
'use client';

import React from 'react';
import { RangoHorario } from '../types/horarios.types';
import EntradaHorario from './EntradaHorario';
import { Plus } from 'lucide-react';

interface PropiedadesHorarioDiario {
  diaSemana: string;
  rangosHorario: RangoHorario[];
  onChange: (nuevosRangos: RangoHorario[]) => void;
}

const HorarioDiario: React.FC<PropiedadesHorarioDiario> = ({
  diaSemana,
  rangosHorario,
  onChange
}) => {
  const agregarRango = () => {
    const nuevoRango: RangoHorario = {
      horaApertura: "09:00",
      horaCierre: "18:00",
      estaActivo: true
    };
    onChange([...rangosHorario, nuevoRango]);
  };

  const actualizarRango = (indice: number, nuevoRango: RangoHorario) => {
    const nuevosRangos = [...rangosHorario];
    nuevosRangos[indice] = nuevoRango;
    onChange(nuevosRangos);
  };

  const eliminarRango = (indice: number) => {
    const nuevosRangos = rangosHorario.filter((_, i) => i !== indice);
    onChange(nuevosRangos);
  };

  return (
    <div className="p-4 bg-background-paper rounded-lg shadow-sm">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold capitalize">{diaSemana}</h3>
        <button
          onClick={agregarRango}
          className="flex items-center gap-2 text-sm text-primary-main hover:text-primary-dark"
        >
          <Plus size={16} />
          <span>Agregar horario</span>
        </button>
      </div>

      <div className="space-y-2">
        {rangosHorario.map((rango, indice) => (
          <EntradaHorario
            key={indice}
            rangoHorario={rango}
            onChange={(nuevoRango) => actualizarRango(indice, nuevoRango)}
            onEliminar={() => eliminarRango(indice)}
            esUnico={rangosHorario.length === 1}
          />
        ))}
      </div>
    </div>
  );
};

export default HorarioDiario;



























