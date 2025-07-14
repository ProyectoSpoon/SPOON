// src/app/config-restaurante/components/barra-lateral.tsx
import React from 'react';
import { useConfigStore } from '../store/config-store';

export default function BarraLateral() {
  const { progreso } = useConfigStore();

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 hidden lg:block">
      <div className="bg-white rounded-lg shadow-lg p-4 w-16">
        {/* Indicador de progreso vertical */}
        <div className="flex flex-col items-center space-y-3">
          {/* Título */}
          <div className="text-xs font-semibold text-gray-600 writing-mode-vertical text-center">
            Progreso
          </div>
          
          {/* Barra de progreso vertical */}
          <div className="w-2 h-32 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="w-full bg-gradient-to-t from-[#F4821F] to-[#FF9933] transition-all duration-500 ease-out"
              style={{ height: `${progreso}%` }}
            />
          </div>
          
          {/* Porcentaje */}
          <div className="text-sm font-bold text-spoon-primary">
            {progreso}%
          </div>
        </div>
      </div>
    </div>
  );
}


























