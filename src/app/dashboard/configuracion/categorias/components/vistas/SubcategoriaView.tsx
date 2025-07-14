'use client';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Categoria, Subcategoria } from '../../types/tipos';
import { SubcategoriaItem } from '../SubcategoriaItem';
import { Button } from '@/shared/components/ui/Button';
import { PlusCircle, Info } from 'lucide-react';

interface SubcategoriaViewProps {
  categoriaActual: Categoria;
  subcategoriasFiltradas: Subcategoria[];
  onToggleSubcategoriaActiva: (subcategoriaId: string) => void;
  onEditarSubcategoria: (subcategoriaId: string) => void;
  onEliminarSubcategoria: (subcategoriaId: string) => void;
  onNuevaSubcategoria: () => void;
  onReordenarSubcategorias: (event: any) => void;
}

export function SubcategoriaView({
  categoriaActual,
  subcategoriasFiltradas,
  onToggleSubcategoriaActiva,
  onEditarSubcategoria,
  onEliminarSubcategoria,
  onNuevaSubcategoria,
  onReordenarSubcategorias
}: SubcategoriaViewProps) {
  // Configuración para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Subcategorías de {categoriaActual.nombre}</h2>
        <Button 
          onClick={onNuevaSubcategoria}
          className="bg-spoon-primary hover:bg-spoon-primary-dark text-white"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Nueva Subcategoría
        </Button>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6 flex items-start">
        <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-600">
          Las subcategorías permiten organizar los productos dentro de una categoría. 
          Puede arrastrar las subcategorías para reordenarlas.
        </p>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onReordenarSubcategorias}
      >
        <SortableContext
          items={subcategoriasFiltradas.map(sub => sub.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subcategoriasFiltradas.length > 0 ? (
              subcategoriasFiltradas.map(subcategoria => (
                <SubcategoriaItem
                  key={subcategoria.id}
                  subcategoria={subcategoria}
                  onToggleActiva={onToggleSubcategoriaActiva}
                  onEditar={onEditarSubcategoria}
                  onEliminar={onEliminarSubcategoria}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-gray-500">
                No se encontraron subcategorías
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}



























