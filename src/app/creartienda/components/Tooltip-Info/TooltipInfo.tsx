'use client';
import { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface PropsTooltipInfo {
  mensaje: string;
  posicion?: 'arriba' | 'abajo' | 'izquierda' | 'derecha';
}

const TooltipInfo = ({ mensaje, posicion = 'arriba' }: PropsTooltipInfo) => {
  const [mostrarTooltip, setMostrarTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const manejarClickFuera = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setMostrarTooltip(false);
      }
    };

    document.addEventListener('mousedown', manejarClickFuera);
    return () => document.removeEventListener('mousedown', manejarClickFuera);
  }, []);

  const obtenerClasePosicion = () => {
    switch (posicion) {
      case 'arriba':
        return 'bottom-full mb-2';
      case 'abajo':
        return 'top-full mt-2';
      case 'izquierda':
        return 'right-full mr-2';
      case 'derecha':
        return 'left-full ml-2';
      default:
        return 'bottom-full mb-2';
    }
  };

  return (
    <div className="relative inline-block" ref={tooltipRef}>
      <button
        type="button"
        className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        onClick={() => setMostrarTooltip(!mostrarTooltip)}
      >
        <Info className="w-5 h-5 text-gray-400" />
      </button>

      {mostrarTooltip && (
        <div
          className={`absolute z-10 w-64 p-2 text-sm text-white bg-gray-900 rounded shadow-lg ${obtenerClasePosicion()}`}
        >
          {mensaje}
        </div>
      )}
    </div>
  );
};

export default TooltipInfo;
