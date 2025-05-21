// src/app/config-restaurante/pages/datos-restaurante/components/InfoBasica.tsx
import React from 'react';

interface InfoBasicaProps {
  datos: {
    nombre: string;
    descripcion: string;
  };
  actualizarDatos: (datos: any) => void;
  estaEnviando: boolean;
}

export default function InfoBasica({ datos, actualizarDatos, estaEnviando }: InfoBasicaProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del Restaurante *
        </label>
        <input
          type="text"
          value={datos.nombre}
          onChange={(e) => actualizarDatos({ nombre: e.target.value })}
          disabled={estaEnviando}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] outline-none 
            disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="Ej: El Buen Sabor"
        />
        {!datos.nombre && (
          <p className="mt-1 text-sm text-gray-500">
            Este campo es requerido para continuar
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción del Restaurante
        </label>
        <textarea
          value={datos.descripcion}
          onChange={(e) => actualizarDatos({ descripcion: e.target.value })}
          disabled={estaEnviando}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] outline-none 
            disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="Describe tu restaurante, su concepto y lo que lo hace especial..."
        />
        <p className="mt-1 text-sm text-gray-500">
          Una buena descripción ayuda a tus clientes a conocer mejor tu restaurante
        </p>
      </div>
    </div>
  );
}