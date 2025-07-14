// src/app/config-restaurante/encabezado.tsx
import React from 'react';
import { useConfigStore } from './store/config-store';

export default function Encabezado() {
  const { tarjetas, progreso } = useConfigStore();

  const tarjetasCompletas = tarjetas.filter(t => t.estado === 'completo').length;
  const totalTarjetas = tarjetas.length;

  return (
    <div className="text-center space-y-4">
      {/* Título principal */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#F4821F] to-[#CC6A10] bg-clip-text text-transparent">
          Configuración de tu Restaurante
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Completa la información necesaria para configurar tu restaurante y comenzar a usar Spoon
        </p>
      </div>

      {/* Indicador de progreso */}
      <div className="bg-white rounded-lg shadow-sm border p-6 max-w-md mx-auto">
        <div className="space-y-3">
          {/* Progreso visual */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Progreso general</span>
            <span className="font-semibold">{tarjetasCompletas}/{totalTarjetas} secciones</span>
          </div>
          
          {/* Barra de progreso */}
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#F4821F] to-[#FF9933] transition-all duration-700 ease-out"
              style={{ width: `${progreso}%` }}
            />
          </div>
          
          {/* Porcentaje */}
          <div className="text-center">
            <span className="text-2xl font-bold text-spoon-primary">{progreso}%</span>
            <span className="text-sm text-gray-500 ml-2">completado</span>
          </div>
        </div>
      </div>
    </div>
  );
}


























