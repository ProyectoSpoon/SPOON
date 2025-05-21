'use client';
import { Check } from 'lucide-react';
import { Categoria } from '../../types/categorias.tipos';

interface PropsSelectorCategoria {
  categorias: Categoria[];
  categoriaSeleccionada: string | null;
  alSeleccionar: (id: string) => void;
}

const SelectorCategoria = ({
  categorias,
  categoriaSeleccionada,
  alSeleccionar
}: PropsSelectorCategoria) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categorias.map((categoria) => (
        <button
          key={categoria.id}
          onClick={() => alSeleccionar(categoria.id)}
          className={`
            relative p-4 border rounded-lg flex items-center space-x-3 
            hover:bg-gray-50 transition-all group
            ${categoriaSeleccionada === categoria.id 
              ? 'border-emerald-500 bg-emerald-50' 
              : 'border-gray-200'
            }
          `}
        >
          {/* Icono de check cuando está seleccionado */}
          {categoriaSeleccionada === categoria.id && (
            <div className="absolute top-2 right-2">
              <Check className="w-4 h-4 text-emerald-500" />
            </div>
          )}
          
          {/* Icono de la categoría */}
          <span className="text-2xl group-hover:scale-110 transition-transform">
            {categoria.icono}
          </span>
          
          {/* Nombre de la categoría */}
          <span className="text-sm font-medium text-gray-700">
            {categoria.nombre}
          </span>
        </button>
      ))}
    </div>
  );
};

export default SelectorCategoria;