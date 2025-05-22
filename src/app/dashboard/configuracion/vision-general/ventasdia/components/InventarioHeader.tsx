import React, { useState } from 'react';
import { History, RefreshCw, Package2 } from 'lucide-react';

interface ModalInventarioProps {
  isOpen: boolean;
  onClose: () => void;
  onActualizarInventario: (cantidad: number) => Promise<boolean>;
  actualizando?: boolean;
}

const ModalInventario: React.FC<ModalInventarioProps> = ({
  isOpen,
  onClose,
  onActualizarInventario,
  actualizando
}) => {
  const [cantidad, setCantidad] = useState<number>(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Gestión de Inventario</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Cantidad de platos disponibles
              </label>
              <input
                type="number"
                min="0"
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F4821F] focus:border-[#F4821F]"
                placeholder="Ingrese la cantidad"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={async () => {
                  if (await onActualizarInventario(cantidad)) {
                    onClose();
                  }
                }}
                disabled={actualizando || cantidad <= 0}
                className="flex-1 px-4 py-2 bg-[#F4821F] text-white rounded-lg hover:bg-[#CC6A10] disabled:opacity-50"
              >
                {actualizando ? 'Actualizando...' : 'Actualizar Inventario'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded-lg hover:bg-neutral-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const InventarioHeader = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">Ventas del Día</h1>
            <p className="text-neutral-500">{new Date().toLocaleDateString()}</p>
          </div>
          <div className="flex gap-3">
            <button 
              className="flex items-center px-4 py-2 text-sm bg-white border rounded-lg hover:bg-neutral-50"
              onClick={() => setModalOpen(true)}
            >
              <Package2 className="w-4 h-4 mr-2" />
              Gestionar Inventario
            </button>
            <button className="flex items-center px-4 py-2 text-sm bg-white border rounded-lg hover:bg-neutral-50">
              <History className="w-4 h-4 mr-2" />
              Historial
            </button>
            <button className="flex items-center px-4 py-2 text-sm bg-[#F4821F] text-white rounded-lg hover:bg-[#CC6A10]">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar Todo
            </button>
          </div>
        </div>
      </div>

      <ModalInventario 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onActualizarInventario={async (cantidad) => {
          // Aquí iría la lógica de actualización
          console.log('Actualizando cantidad:', cantidad);
          return true;
        }}
      />
    </div>
  );
};