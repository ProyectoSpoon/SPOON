'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface CantidadProductoProps {
  id: string;
  cantidad: number;
  categoriaId: string;
  onCantidadChange: (id: string, nuevaCantidad: number) => void;
}

export function CantidadProducto({ id, cantidad, categoriaId, onCantidadChange }: CantidadProductoProps) {
  const [cantidadActual, setCantidadActual] = useState(cantidad);
  
  // Solo mostrar el componente para productos de categoría proteína (UUID real de la BD)
  if (categoriaId !== '342f0c43-7f98-48fb-b0ba-e4c5d3ee72b3') {
    return null;
  }

  const incrementar = () => {
    const nuevaCantidad = cantidadActual + 1;
    setCantidadActual(nuevaCantidad);
    onCantidadChange(id, nuevaCantidad);
  };

  const decrementar = () => {
    if (cantidadActual > 0) {
      const nuevaCantidad = cantidadActual - 1;
      setCantidadActual(nuevaCantidad);
      onCantidadChange(id, nuevaCantidad);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = parseInt(e.target.value);
    if (!isNaN(valor) && valor >= 0) {
      setCantidadActual(valor);
      onCantidadChange(id, valor);
    }
  };

  return (
    <div className="flex items-center space-x-1 ml-2">
      <button
        onClick={decrementar}
        className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
        aria-label="Decrementar cantidad"
      >
        <Minus className="w-3 h-3" />
      </button>
      
      <input
        type="number"
        value={cantidadActual}
        onChange={handleInputChange}
        className="w-12 h-6 text-center text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
        min="0"
      />
      
      <button
        onClick={incrementar}
        className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
        aria-label="Incrementar cantidad"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}
