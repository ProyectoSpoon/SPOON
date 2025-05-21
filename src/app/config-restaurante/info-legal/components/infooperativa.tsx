// src/app/config-restaurante/pages/datos-restaurante/components/InfoOperativa.tsx
import React from 'react';

const tiposRestaurante = [
  'Restaurante Casual',
  'Restaurante Formal',
  'Comida Rápida',
  'Cafetería',
  'Bar/Restaurante',
  'Otro'
];

interface InfoOperativaProps {
  datos: {
    tipoRestaurante: string;
    especialidad: string;
    capacidad: string;
  };
  actualizarDatos: (datos: any) => void;
  estaEnviando: boolean;
}

export default function InfoOperativa({ datos, actualizarDatos, estaEnviando }: InfoOperativaProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Restaurante
        </label>
        <select
          value={datos.tipoRestaurante}
          onChange={(e) => actualizarDatos({ tipoRestaurante: e.target.value })}
          disabled={estaEnviando}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] outline-none 
            disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Selecciona un tipo</option>
          {tiposRestaurante.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Especialidad
        </label>
        <input
          type="text"
          value={datos.especialidad}
          onChange={(e) => actualizarDatos({ especialidad: e.target.value })}
          disabled={estaEnviando}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] outline-none 
            disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="Ej: Comida Italiana, Mariscos, etc."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Capacidad del Local
        </label>
        <input
          type="number"
          value={datos.capacidad}
          onChange={(e) => actualizarDatos({ capacidad: e.target.value })}
          disabled={estaEnviando}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] outline-none 
            disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="Número de personas"
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">
          Esta información nos ayuda a optimizar tu perfil y mejorar la visibilidad de tu restaurante.
        </p>
      </div>
    </div>
  );
}