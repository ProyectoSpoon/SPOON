import { Clock, MoreVertical, Pencil, Trash } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/DropdownMenu';

interface ItemCategoriaProps {
  id: string;
  nombre: string;
  isActive?: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSchedule: (id: string) => void;
}

export function ItemCategoria({
  id,
  nombre,
  isActive = false,
  onSelect,
  onEdit,
  onDelete,
  onSchedule,
}: ItemCategoriaProps) {
  return (
    <div
      className={`
        flex items-center justify-between p-3 rounded-lg cursor-pointer
        group transition-colors
        ${isActive ? 'bg-neutral-100' : 'hover:bg-neutral-50'}
      `}
      onClick={() => onSelect(id)}
    >
      <span className={`font-medium ${isActive ? 'text-neutral-900' : 'text-neutral-700'}`}>
        {nombre}
      </span>
      
      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onSchedule(id);
          }}
        >
          <Clock className="h-4 w-4 text-neutral-500" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4 text-neutral-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(id)}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(id)}
            >
              <Trash className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}