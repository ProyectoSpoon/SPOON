// src/app/config-restaurante/encabezado.tsx
import React from 'react';
import { useConfigStore } from './store/config-store';

export default function Encabezado() {
  const progreso = useConfigStore(state => state.progreso);

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold mb-2">Configuración de tu Restaurante</h1>
      <p className="text-gray-600 mb-4">
        Completa la información necesaria para configurar tu restaurante
      </p>
      
      {/* Barra de progreso principal */}
      <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
        <div
          className="bg-[#FF9933] h-4 rounded-full transition-all duration-500"
          style={{ width: `${progreso}%` }}
        />
      </div>
      
      {/* Información del progreso */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>{progreso}% completado</span>
        <span>{Math.round(progreso/16.66)}/6 secciones</span>
      </div>
    </div>
  );
}