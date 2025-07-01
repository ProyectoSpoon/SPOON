'use client'
import React from 'react';

// Props que acepta el componente
interface PropIndicadorProgreso {
  pasos: Array<{
    titulo: string;
    descripcion: string;
  }>;
  pasoActual: number;
}

const IndicadorProgreso: React.FC<PropIndicadorProgreso> = ({ 
  pasos, 
  pasoActual 
}) => {
  return (
    <div className="py-8">
      <div className="flex justify-between items-center relative">
        {/* Línea de progreso */}
        <div className="absolute h-0.5 w-full bg-gray-200 z-0">
          <div
            className="h-full bg-[#FF9933] transition-all duration-500 ease-in-out"
            style={{ width: `${(pasoActual / (pasos.length - 1)) * 100}%` }}
          />
        </div>

        {/* Pasos */}
        {pasos.map((paso, index) => {
          const estaCompleto = index < pasoActual;
          const estaActivo = index === pasoActual;

          return (
            <div
              key={paso.titulo}
              className="relative z-10 group"
              title={paso.descripcion}
            >
              <div
                className={`
                  w-10 h-10 rounded-full border-2 flex justify-center items-center
                  text-sm font-bold transition-all duration-200 hover:scale-105
                  ${estaCompleto 
                    ? 'bg-[#FF9933] border-[#FF9933] text-white' 
                    : estaActivo 
                    ? 'bg-white border-blue-500 text-blue-500' 
                    : 'bg-gray-200 border-gray-200 text-gray-600'
                  }
                `}
              >
                {estaCompleto ? '✓' : index + 1}
              </div>

              {/* Título del paso */}
              <div
                className={`
                  mt-2 text-center text-sm max-w-[120px] mx-auto
                  ${estaActivo 
                    ? 'font-bold text-blue-500' 
                    : 'font-medium text-gray-600'
                  }
                `}
              >
                {paso.titulo}
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                {paso.descripcion}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default IndicadorProgreso;
