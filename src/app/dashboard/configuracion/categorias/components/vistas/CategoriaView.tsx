'use client';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Categoria, TipoRestaurante } from '../../types/tipos';
import { CategoriaItem } from '../CategoriaItem';
import { Button } from '@/shared/components/ui/Button';
import { PlusCircle, RefreshCw, Info } from 'lucide-react';

interface CategoriaViewProps {
  tipoActual: TipoRestaurante;
  categoriasFiltradas: Categoria[];
  categoriaSeleccionada: string | null;
  onSelectCategoria: (categoriaId: string) => void;
  onToggleCategoriaActiva: (categoriaId: string) => void;
  onEditarCategoria: (categoriaId: string) => void;
  onEliminarCategoria: (categoriaId: string) => void;
  onNuevaCategoria: () => void;
  onImportarPlantilla: () => void;
  onReordenarCategorias: (event: any) => void;
}

export function CategoriaView({
  tipoActual,
  categoriasFiltradas,
  categoriaSeleccionada,
  onSelectCategoria,
  onToggleCategoriaActiva,
  onEditarCategoria,
  onEliminarCategoria,
  onNuevaCategoria,
  onImportarPlantilla,
  onReordenarCategorias
}: CategoriaViewProps) {
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
        <h2 className="text-xl font-semibold text-gray-800">Categorías de {tipoActual.nombre}</h2>
        <div className="flex space-x-2">
          <Button 
            onClick={onNuevaCategoria}
            className="bg-spoon-primary hover:bg-spoon-primary-dark text-white"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Nueva Categoría
          </Button>
          <Button 
            onClick={onImportarPlantilla}
            variant="outline"
            className="border-spoon-primary text-spoon-primary hover:bg-orange-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Importar Plantilla
          </Button>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6 flex items-start">
        <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-600">
          Las categorías agrupan los productos en el menú. Cada categoría puede contener subcategorías para una organización más detallada.
          Puede arrastrar las categorías para reordenarlas. Haga clic en una categoría para ver sus subcategorías.
        </p>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onReordenarCategorias}
      >
        <SortableContext
          items={categoriasFiltradas.map(cat => cat.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoriasFiltradas.length > 0 ? (
              categoriasFiltradas.map(categoria => (
                <CategoriaItem
                  key={categoria.id}
                  categoria={categoria}
                  seleccionada={categoria.id === categoriaSeleccionada}
                  onSelect={onSelectCategoria}
                  onToggleActiva={onToggleCategoriaActiva}
                  onEditar={onEditarCategoria}
                  onEliminar={onEliminarCategoria}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-gray-500">
                No se encontraron categorías
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}



























