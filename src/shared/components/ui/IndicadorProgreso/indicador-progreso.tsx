// src/shared/components/ui/IndicadorProgreso/indicador-progreso.tsx
import React from 'react';

interface Paso {
  titulo: string;
  descripcion: string;
}

interface IndicadorProgresoProps {
  pasos: Paso[];
  pasoActual: number;
}

export function IndicadorProgreso({ pasos, pasoActual }: IndicadorProgresoProps) {
  return (
    <div className="w-full py-4">
      <div className="flex justify-between mb-4">
        {pasos.map((paso, index) => {
          const esCompleto = index < pasoActual;
          const esActivo = index === pasoActual;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              {/* Línea conectora */}
              {index !== 0 && (
                <div className={`hidden sm:block absolute h-0.5 w-full -translate-y-4 
                  ${index <= pasoActual ? 'bg-spoon-primary' : 'bg-gray-200'}`} />
              )}
              
              {/* Círculo indicador */}
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-full 
                ${esCompleto ? 'bg-spoon-primary' : esActivo ? 'bg-spoon-primary' : 'bg-gray-200'}
                ${esActivo ? 'ring-4 ring-[#FF9933]/20' : ''}`}
              >
                {esCompleto ? (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className={`text-sm font-medium ${esActivo ? 'text-white' : 'text-gray-500'}`}>
                    {index + 1}
                  </span>
                )}
              </div>
              
              {/* Texto del paso */}
              <div className="mt-2 text-center">
                <div className={`text-sm font-medium ${esActivo ? 'text-gray-900' : 'text-gray-500'}`}>
                  {paso.titulo}
                </div>
                <div className="text-xs text-gray-500 hidden sm:block">
                  {paso.descripcion}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}



























