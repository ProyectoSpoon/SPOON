import { Trash } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

interface ItemProductoProps {
  id: string;
  nombre: string;
  descripcion?: string;
  precio?: number;
  imagen?: string;
  categoriaId?: string;
  isActive?: boolean;
  onAdd: () => void; // Cambiamos de (id: string) => void a () => void
  onDelete: (id: string) => void;
}
export function ItemProducto({
  id,
  nombre,
  descripcion,
  precio,
  imagen,
  categoriaId,
  isActive = false,
  onAdd,
  onDelete,
}: ItemProductoProps) {
  return (
    <div
      className={`
        flex items-center p-3 rounded-lg
        transition-colors duration-200
        ${isActive ? 'bg-neutral-100' : 'bg-white hover:bg-neutral-50'}
      `}
    >
      {/* Imagen del producto */}
      <div className="flex-shrink-0 h-12 w-12 rounded-md overflow-hidden mr-3">
        {imagen ? (
          <img 
            src={imagen} 
            alt={nombre}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-neutral-200 flex items-center justify-center">
            <span className="text-neutral-400 text-xs">Sin imagen</span>
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-medium truncate ${isActive ? 'text-neutral-900' : 'text-neutral-700'}`}>
          {nombre}
        </h3>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center gap-2 ml-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          className="text-red-500 hover:text-red-600 transition-colors"
        >
          <Trash className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => {
            console.log('Botón Agregar clickeado');
            e.stopPropagation();
            onAdd();
          }}
          className="text-[#00A0A7] hover:text-[#008a90] transition-colors text-sm"
        >
          Agregar
        </button>
      </div>
    </div>
  );
}
