import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/shared/components/ui/Button';
import { Plus, Trash2, X, Loader2, ChevronDown, ChevronUp, Menu, GripVertical } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/Dialog";
import { toast } from 'sonner';
import { jsonDataService } from '@/services/json-data.service';

// Iconos para las categorías
const ICONOS_CATEGORIAS = {
  'CAT_001': '/iconos/sopa.png',
  'CAT_002': '/iconos/principio.png',
  'CAT_003': '/iconos/carne.png',
  'CAT_004': '/iconos/arroz.png',
  'CAT_005': '/iconos/bebida.png'
};

interface Categoria {
  id: string;
  nombre: string;
  count?: number;
}

interface ListaCategoriasRedisenoProps {
  categorias: Categoria[];
  categoriaSeleccionada: string | null;
  onSelectCategoria: (id: string) => void;
  onAddCategoria?: (categoria: Categoria) => void;
  onDeleteCategoria?: (id: string) => void;
}

export function ListaCategoriasRediseno({
  categorias,
  categoriaSeleccionada,
  onSelectCategoria,
  onAddCategoria,
  onDeleteCategoria
}: ListaCategoriasRedisenoProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [modalCategoria, setModalCategoria] = useState(false);
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [cargandoCategorias, setCargandoCategorias] = useState(false);

  // Obtener el icono para una categoría
  const getIconoCategoria = (id: string) => {
    return ICONOS_CATEGORIAS[id as keyof typeof ICONOS_CATEGORIAS] || '/iconos/sopa.png';
  };

  // Manejar la selección de una categoría
  const handleSelectCategoria = (id: string) => {
    onSelectCategoria(id);
  };

  // Manejar expandir/colapsar una categoría
  const toggleCategory = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };

  // Manejar la adición de una categoría
  const handleAddCategoria = (categoriaId: string, categoriaNombre: string) => {
    if (onAddCategoria) {
      const nuevaCategoria: Categoria = {
        id: categoriaId,
        nombre: categoriaNombre
      };
      
      onAddCategoria(nuevaCategoria);
      setModalCategoria(false);
      toast.success(`Categoría "${categoriaNombre}" agregada`);
    }
  };

  // Confirmar eliminación
  const confirmDelete = () => {
    if (!itemToDelete || !onDeleteCategoria) return;
    
    onDeleteCategoria(itemToDelete);
    toast.success('Categoría eliminada');
    
    setModalConfirmDelete(false);
    setItemToDelete(null);
  };

  // Iniciar proceso de eliminación
  const handleDeleteItem = (id: string) => {
    setItemToDelete(id);
    setModalConfirmDelete(true);
  };

  return (
    <div className="space-y-1">
      {/* Lista de categorías */}
      {categorias.map((categoria) => (
        <div key={categoria.id} className="border-b border-gray-200">
          <div 
            className="flex items-center justify-between py-3 px-4 cursor-pointer"
            onClick={() => toggleCategory(categoria.id)}
          >
            <div className="flex items-center space-x-3">
              <Menu className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-sm">{categoria.nombre}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <GripVertical className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">{categoria.count || 0}</span>
              {expandedCategory === categoria.id ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </div>
          </div>
          
          {expandedCategory === categoria.id && (
            <div className="px-4 py-3 bg-gray-50">
              {/* Aquí iría el contenido expandido de la categoría */}
              <p className="text-sm text-gray-600">Contenido de la categoría {categoria.nombre}</p>
            </div>
          )}
        </div>
      ))}

      {/* Modal para agregar categoría */}
      <Dialog open={modalCategoria} onOpenChange={setModalCategoria}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar categoría</DialogTitle>
            <DialogDescription>
              Selecciona el tipo de categoría que deseas agregar
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-3 py-3">
            {cargandoCategorias ? (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-[#F4821F]" />
                <span className="ml-2 text-sm">Cargando categorías...</span>
              </div>
            ) : (
              <>
                <Button
                  onClick={() => handleAddCategoria('CAT_001', 'Entradas')}
                  variant="outline"
                  className="justify-start h-10 text-sm"
                >
                  Entradas
                </Button>
                <Button
                  onClick={() => handleAddCategoria('CAT_002', 'Principio')}
                  variant="outline"
                  className="justify-start h-10 text-sm"
                >
                  Principio
                </Button>
                <Button
                  onClick={() => handleAddCategoria('CAT_003', 'Proteína')}
                  variant="outline"
                  className="justify-start h-10 text-sm"
                >
                  Proteína
                </Button>
                <Button
                  onClick={() => handleAddCategoria('CAT_004', 'Acompañamientos')}
                  variant="outline"
                  className="justify-start h-10 text-sm"
                >
                  Acompañamientos
                </Button>
                <Button
                  onClick={() => handleAddCategoria('CAT_005', 'Bebida')}
                  variant="outline"
                  className="justify-start h-10 text-sm"
                >
                  Bebida
                </Button>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalCategoria(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación de eliminación */}
      <Dialog open={modalConfirmDelete} onOpenChange={setModalConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta categoría? También se eliminarán todos sus productos asociados.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setModalConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
