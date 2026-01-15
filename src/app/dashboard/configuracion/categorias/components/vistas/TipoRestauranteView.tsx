'use client';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TipoRestaurante } from '@/app/dashboard/configuracion/categorias/types/tipos';
import { TipoRestauranteItem } from '../TipoRestauranteItem';
import { Button } from '@/shared/components/ui/Button';
import { PlusCircle, Info } from 'lucide-react';

interface TipoRestauranteViewProps {
  tiposFiltrados: TipoRestaurante[];
  tipoSeleccionado: string | null;
  onSelectTipo: (tipoId: string) => void;
  onToggleTipoActivo: (tipoId: string) => void;
  onEditarTipo: (tipoId: string) => void;
  onEliminarTipo: (tipoId: string) => void;
  onNuevoTipo: () => void;
  onReordenarTipos: (event: any) => void;
}

export function TipoRestauranteView({
  tiposFiltrados,
  tipoSeleccionado,
  onSelectTipo,
  onToggleTipoActivo,
  onEditarTipo,
  onEliminarTipo,
  onNuevoTipo,
  onReordenarTipos
}: TipoRestauranteViewProps) {
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
        <h2 className="text-xl font-semibold text-gray-800">Tipos de Restaurante</h2>
        <Button
          onClick={onNuevoTipo}
          className="bg-spoon-primary hover:bg-spoon-primary-dark text-white"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Nuevo Tipo
        </Button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6 flex items-start">
        <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-600">
          Los tipos de restaurante definen las categorías y subcategorías disponibles para cada tipo de negocio.
          Puede arrastrar los elementos para reordenarlos. Haga clic en un tipo para ver sus categorías.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onReordenarTipos}
      >
        <SortableContext
          items={tiposFiltrados.map(tipo => tipo.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tiposFiltrados.length > 0 ? (
              tiposFiltrados.map(tipo => (
                <TipoRestauranteItem
                  key={tipo.id}
                  tipo={tipo}
                  seleccionado={tipo.id === tipoSeleccionado}
                  onSelect={onSelectTipo}
                  onToggleActivo={onToggleTipoActivo}
                  onEditar={onEditarTipo}
                  onEliminar={onEliminarTipo}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-gray-500">
                No se encontraron tipos de restaurante
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}



























