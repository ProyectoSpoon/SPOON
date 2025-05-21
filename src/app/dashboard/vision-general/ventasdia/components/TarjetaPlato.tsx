import { AlertCircle, Tag, Clock, DollarSign } from 'lucide-react';
import type { Plato } from '../types/ventasdia.types';
import { motion } from 'framer-motion';

interface TarjetaPlatoProps {
  plato: Plato;
  onRegistrarVenta: (platoId: string) => void;
  vistaLista?: boolean;
}

// Función para formatear el precio de manera segura
const formatearPrecio = (precio: number | undefined): string => {
  if (precio === undefined || isNaN(precio)) {
    return '0';
  }
  return precio.toLocaleString();
};

export const TarjetaPlato: React.FC<TarjetaPlatoProps> = ({ 
  plato, 
  onRegistrarVenta,
  vistaLista = false
}) => {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Vista de lista
  if (vistaLista) {
    return (
      <motion.div 
        variants={item}
        className={`bg-white rounded-lg border transition-all duration-200 ${
          plato.estado === 'agotado' 
            ? 'border-red-200 bg-red-50' 
            : 'border-neutral-200 hover:border-[#F4821F] hover:shadow-md'
        }`}
      >
        <div className="p-4 flex items-center gap-4">
          <div className="hidden sm:block h-16 w-16 rounded-md bg-gray-100 flex-shrink-0 flex items-center justify-center">
            <div className="text-2xl text-[#F4821F] font-bold">
              {plato.nombre.substring(0, 1)}
            </div>
          </div>
          
          <div className="flex-grow min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-medium text-base text-neutral-800">
                {plato.nombre}
              </h3>
              {plato.categoriaId && (
                <div className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {plato.categoriaId}
                </div>
              )}
              {plato.estado === 'agotado' && (
                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Agotado
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-500 mb-2 line-clamp-1">
              {plato.descripcion}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1 text-gray-600">
                <DollarSign className="w-4 h-4 text-[#F4821F]" />
                <span className="font-semibold text-[#F4821F]">
                  ${formatearPrecio(plato.precio)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className={`text-sm ${
                  plato.disponibles === 0 
                    ? 'text-red-600' 
                    : plato.disponibles <= 10 
                      ? 'text-amber-600' 
                      : 'text-green-600'
                }`}>
                  {plato.disponibles} disponibles
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <button
              className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap ${
                plato.estado === 'agotado'
                  ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                  : 'bg-[#F4821F] text-white hover:bg-[#CC6A10]'
              } transition-colors`}
              disabled={plato.estado === 'agotado'}
              onClick={() => onRegistrarVenta(plato.id)}
            >
              Registrar Venta
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Vista de cuadrícula (original)
  return (
    <motion.div 
      variants={item}
      className={`bg-white rounded-lg border ${
        plato.estado === 'agotado' 
          ? 'border-red-200 bg-red-50' 
          : 'border-neutral-200 hover:border-[#F4821F] hover:shadow-md'
      } transition-all duration-200`}
    >
      <div className="p-3 border-b border-neutral-100">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-medium text-sm text-neutral-800 line-clamp-1">
            {plato.nombre}
          </h3>
          {plato.estado === 'agotado' && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Agotado
            </span>
          )}
        </div>
        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
          {plato.descripcion}
        </p>
      </div>

      <div className="p-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-[#F4821F]">
            ${formatearPrecio(plato.precio)}
          </span>
          <span className={`text-sm font-medium ${
            plato.disponibles === 0 
              ? 'text-red-600' 
              : plato.disponibles <= 10 
                ? 'text-amber-600' 
                : 'text-green-600'
          }`}>
            {plato.disponibles} disponibles
          </span>
        </div>

        <button
          className={`w-full px-3 py-2 text-sm rounded-lg ${
            plato.estado === 'agotado'
              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              : 'bg-[#F4821F] text-white hover:bg-[#CC6A10]'
          } transition-colors`}
          disabled={plato.estado === 'agotado'}
          onClick={() => onRegistrarVenta(plato.id)}
        >
          Registrar Venta
        </button>
      </div>
    </motion.div>
  );
};
