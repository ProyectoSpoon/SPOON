'use client';

import React from 'react';

interface SelectorMesaProps {
  mesaSeleccionada: string | null;
  onSeleccionarMesa: (mesa: string) => void;
}

const SelectorMesa: React.FC<SelectorMesaProps> = ({ mesaSeleccionada, onSeleccionarMesa }) => {
  // Generar mesas del 1 al 20
  const mesas = Array.from({ length: 20 }, (_, i) => (i + 1).toString());

  return (
    <div className="grid grid-cols-5 gap-3">
      {mesas.map((mesa) => (
        <button
          key={mesa}
          onClick={() => onSeleccionarMesa(mesa)}
          className={`
            p-4 rounded-lg border-2 font-semibold text-lg transition-all duration-200
            ${mesaSeleccionada === mesa
              ? 'bg-blue-500 text-white border-blue-600 shadow-lg scale-105'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }
          `}
        >
          Mesa {mesa}
        </button>
      ))}
    </div>
  );
};

export default SelectorMesa;
