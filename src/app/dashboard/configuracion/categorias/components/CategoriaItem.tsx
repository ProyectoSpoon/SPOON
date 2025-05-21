'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Categoria } from '../types/tipos';
import { Button } from '@/shared/components/ui/Button';
import { Switch } from '@/shared/components/ui/Switch';
import { Edit, Trash2, GripVertical, ChevronRight } from 'lucide-react';

interface CategoriaItemProps {
  categoria: Categoria;
  seleccionada: boolean;
  onSelect: (id: string) => void;
  onToggleActiva: (id: string) => void;
  onEditar: (id: string) => void;
  onEliminar: (id: string) => void;
}

export function CategoriaItem({
  categoria,
  seleccionada,
  onSelect,
  onToggleActiva,
  onEditar,
  onEliminar
}: CategoriaItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: categoria.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  // Renderizar el icono según la categoría
  const renderIcon = () => {
    // Aquí podrías implementar una lógica más compleja para mostrar iconos
    // Por ahora, simplemente mostramos un div con el color de la categoría
    return (
      <div 
        className="w-6 h-6 rounded-full flex items-center justify-center"
        style={{ backgroundColor: categoria.color }}
      >
        <span className="text-white text-xs">{categoria.icono.charAt(0).toUpperCase()}</span>
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center p-2 rounded-md border ${
        seleccionada 
          ? 'border-[#F4821F] bg-[#FFF8F3]' 
          : 'border-gray-200 hover:bg-gray-50'
      } ${!categoria.activo ? 'opacity-60' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab mr-2 text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      
      <div 
        className="flex-1 flex items-center cursor-pointer"
        onClick={() => onSelect(categoria.id)}
      >
        {renderIcon()}
        <span className="ml-2 text-sm font-medium">{categoria.nombre}</span>
        
        {categoria.subcategorias.length > 0 && (
          <span className="ml-2 text-xs text-gray-500">
            ({categoria.subcategorias.length})
          </span>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          checked={categoria.activo}
          onCheckedChange={() => onToggleActiva(categoria.id)}
        />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEditar(categoria.id);
          }}
          className="p-1 h-8 w-8 text-gray-500 hover:text-[#F4821F]"
        >
          <Edit className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEliminar(categoria.id);
          }}
          className="p-1 h-8 w-8 text-gray-500 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelect(categoria.id)}
          className="p-1 h-8 w-8 text-gray-500"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
