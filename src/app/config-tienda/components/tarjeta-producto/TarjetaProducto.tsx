'use client';
import { Check } from 'lucide-react';
import { Subcategoria } from '../../types/categorias.tipos';

interface PropsTarjetaProducto {
  subcategoria: Subcategoria;
  seleccionada: boolean;
  alSeleccionar: (id: string) => void;
}

const TarjetaProducto = ({
  subcategoria,
  seleccionada,
  alSeleccionar
}: PropsTarjetaProducto) => {
  return (
    <button
      onClick={() => alSeleccionar(subcategoria.id)}
      className={`
        relative w-full p-4 border rounded-lg text-left
        hover:bg-gray-50 transition-all
        ${seleccionada 
          ? 'border-emerald-500 bg-emerald-50' 
          : 'border-gray-200'
        }
      `}
    >
      {/* Indicador de selección */}
      {seleccionada && (
        <div className="absolute top-2 right-2">
          <Check className="w-4 h-4 text-emerald-500" />
        </div>
      )}

      {/* Nombre de la subcategoría */}
      <h3 className="font-medium text-gray-900 mb-2">
        {subcategoria.nombre}
      </h3>

      {/* Lista de productos (si existen) */}
      {subcategoria.productos && subcategoria.productos.length > 0 && (
        <div className="mt-2 space-y-1">
          {subcategoria.productos.slice(0, 3).map((producto, index) => (
            <p key={index} className="text-sm text-gray-500">
              • {producto}
            </p>
          ))}
          {subcategoria.productos.length > 3 && (
            <p className="text-sm text-gray-400">
              Y {subcategoria.productos.length - 3} más...
            </p>
          )}
        </div>
      )}
    </button>
  );
};

export default TarjetaProducto;