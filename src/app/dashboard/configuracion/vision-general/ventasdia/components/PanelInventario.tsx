import React, { useState } from 'react';
import { ChefHat } from 'lucide-react';
import { useInventario } from '../hooks/useInventario';

interface PanelInventarioProps {
  onActualizarInventario: (cantidad: number) => Promise<boolean>;
}

export const PanelInventario: React.FC<PanelInventarioProps> = ({ 
  onActualizarInventario 
}) => {
  const [cantidad, setCantidad] = useState<number>(0);
  const { actualizando } = useInventario();

  const handleActualizar = async () => {
    if (cantidad > 0) {
      await onActualizarInventario(cantidad);
      setCantidad(0);
    }
  };

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <ChefHat className="w-5 h-5 text-[#F4821F]" />
          <h2 className="text-lg font-semibold text-neutral-800">
            Gestión de Inventario
          </h2>
        </div>
        
        <div className="mt-4 flex gap-4 items-center">
          <input
            type="number"
            min="0"
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
            className="px-3 py-2 border rounded-lg w-32"
            placeholder="Cantidad"
          />
          <button
            onClick={handleActualizar}
            disabled={actualizando || cantidad <= 0}
            className="px-4 py-2 bg-[#F4821F] text-white rounded-lg hover:bg-[#CC6A10] disabled:opacity-50"
          >
            {actualizando ? 'Actualizando...' : 'Actualizar Cantidades'}
          </button>
        </div>
      </div>
    </div>
  );
};