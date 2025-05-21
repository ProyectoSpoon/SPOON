import React from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import type { CombinacionProgramada } from '../types/programacion.types';

interface FormularioProgramacionProps {
  dia: string;
  combinaciones: CombinacionProgramada[];
  onCopiarDiaAnterior: () => void;
  onLimpiar: () => void;
  onAgregarCombinacion: (combinacion: CombinacionProgramada) => void;
}
const getNombreCombinacion = (combo: CombinacionProgramada) => {
  const { entrada, principio, proteina } = combo.combinacion;
  return combo.combinacion.nombre || 
    `${entrada.nombre} + ${principio.nombre} + ${proteina.nombre}`;
};

const getDescripcionCombinacion = (combo: CombinacionProgramada) => {
  const { entrada, principio, proteina, bebida } = combo.combinacion;
  return combo.combinacion.descripcion || 
    `${entrada.nombre} + ${principio.nombre} + ${proteina.nombre} + ${bebida.nombre}`;
};

export const FormularioProgramacion: React.FC<FormularioProgramacionProps> = ({
  dia,
  combinaciones,
  onCopiarDiaAnterior,
  onLimpiar,
  onAgregarCombinacion
}) => {
  return (
    <div className="bg-white rounded-lg border border-neutral-200">
      <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
        <h2 className="font-semibold">
          Programación para {dia}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={onCopiarDiaAnterior}
            className="text-sm text-[#F4821F] hover:text-[#CC6A10]"
          >
            Copiar del día anterior
          </button>
          <button 
            onClick={onLimpiar}
            className="text-sm text-[#F4821F] hover:text-[#CC6A10]"
          >
            Limpiar
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {combinaciones.length > 0 ? (
          <div className="space-y-4">
            {combinaciones.map(combo => (
              <div
                key={combo.id}
                className="p-4 border rounded-lg hover:border-[#F4821F] group"
              >
                <div className="flex justify-between items-start">
                  <div>
                  <h3 className="font-medium">{getNombreCombinacion(combo)}</h3>
                    <p className="text-sm text-neutral-600 mt-1">
                      {getDescripcionCombinacion(combo)}
                    </p>
                  </div>
                  <button 
                    onClick={() => onLimpiar()}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="text-red-500 text-sm">Quitar</span>
                  </button>
                </div>
                
                <div className="mt-3 flex items-center gap-4 text-sm text-neutral-500">
                  <span className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {combo.prediccionVentas.minimo}-{combo.prediccionVentas.maximo} ventas esperadas
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    combo.tendencia === 'up' 
                      ? 'bg-green-100 text-green-800'
                      : combo.tendencia === 'down'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-neutral-100 text-neutral-800'
                  }`}>
                    {combo.tendencia === 'up' ? '↑' : combo.tendencia === 'down' ? '↓' : '→'} Tendencia
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="min-h-[400px] border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center">
            <div className="text-center text-neutral-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-neutral-400" />
              <p>Arrastra combinaciones aquí para programarlas</p>
              <p className="text-sm mt-1">o</p>
              <button className="mt-2 px-4 py-2 text-sm text-[#F4821F] hover:bg-[#FFF4E6] rounded-lg">
                Seleccionar Combinaciones
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};