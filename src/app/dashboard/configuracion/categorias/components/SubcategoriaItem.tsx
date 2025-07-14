'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Subcategoria } from '../types/tipos';
import { Button } from '@/shared/components/ui/Button';
import { Switch } from '@/shared/components/ui/Switch';
import { Edit, Trash2, GripVertical } from 'lucide-react';

interface SubcategoriaItemProps {
  subcategoria: Subcategoria;
  onToggleActiva: (id: string) => void;
  onEditar: (id: string) => void;
  onEliminar: (id: string) => void;
}

export function SubcategoriaItem({
  subcategoria,
  onToggleActiva,
  onEditar,
  onEliminar
}: SubcategoriaItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: subcategoria.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  // Renderizar el icono según la subcategoría
  const renderIcon = () => {
    // Aquí podrías implementar una lógica más compleja para mostrar iconos
    // Por ahora, simplemente mostramos un div con el color de la subcategoría
    return (
      <div 
        className="w-5 h-5 rounded-full flex items-center justify-center"
        style={{ backgroundColor: subcategoria.color || '#888888' }}
      >
        <span className="text-white text-xs">
          {subcategoria.icono ? subcategoria.icono.charAt(0).toUpperCase() : 'S'}
        </span>
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center p-2 rounded-md border border-gray-200 hover:bg-gray-50 ${
        !subcategoria.activo ? 'opacity-60' : ''
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab mr-2 text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      
      <div className="flex-1 flex items-center">
        {renderIcon()}
        <span className="ml-2 text-sm">{subcategoria.nombre}</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          checked={subcategoria.activo}
          onCheckedChange={() => onToggleActiva(subcategoria.id)}
        />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEditar(subcategoria.id)}
          className="p-1 h-8 w-8 text-gray-500 hover:text-spoon-primary"
        >
          <Edit className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEliminar(subcategoria.id)}
          className="p-1 h-8 w-8 text-gray-500 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}



























