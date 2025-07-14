import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { CombinacionProgramada } from '../types/programacion.types';

interface TablaProgramacionProps {
  combinaciones: CombinacionProgramada[];
  onSeleccionarCombinacion: (combinacion: CombinacionProgramada) => void;
}

export const TablaProgramacion: React.FC<TablaProgramacionProps> = ({
  combinaciones,
  onSeleccionarCombinacion
}) => {
  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-neutral-600" />;
    }
  };

  return (
    <div className="overflow-hidden bg-white border border-neutral-200 rounded-lg">
      <table className="min-w-full divide-y divide-neutral-200">
        <thead className="bg-neutral-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Combinación
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Predicción
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Tendencia
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {combinaciones.map((combinacion) => (
            <tr 
              key={combinacion.id}
              className="hover:bg-neutral-50"
            >
              <td className="px-6 py-4">
                <div>
                <div className="text-sm font-medium text-neutral-900">
                  {combinacion.combinacion.nombre || 
                    `${combinacion.combinacion.entrada.nombre} + ${combinacion.combinacion.principio.nombre}`}
                </div>
                  <div className="text-sm text-neutral-500">
                    {combinacion.combinacion.descripcion || 
                      `${combinacion.combinacion.entrada.descripcion} con ${combinacion.combinacion.proteina.nombre}`}
                  </div>  
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-neutral-600">
                  {combinacion.prediccionVentas.minimo}-{combinacion.prediccionVentas.maximo} ventas
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  {getTendenciaIcon(combinacion.tendencia)}
                  <span className="ml-2 text-sm text-neutral-600">
                    {combinacion.tendencia === 'up' ? 'Subiendo' : 
                     combinacion.tendencia === 'down' ? 'Bajando' : 'Estable'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => onSeleccionarCombinacion(combinacion)}
                  className="text-spoon-primary hover:text-spoon-primary-dark text-sm font-medium"
                >
                  Agregar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


























