import React, { useState, useEffect } from 'react';
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
import { useCategorias } from '../../hooks/useCategorias';
import { Categoria } from '@/utils/menuCache.utils';

// Iconos para las subcategorías (actualizados para PostgreSQL)
const ICONOS_SUBCATEGORIAS: Record<string, string> = {
  'entrada': '/iconos/sopa.png',
  'principio': '/iconos/principio.png',
  'proteina': '/iconos/carne.png',
  'acompanamiento': '/iconos/arroz.png',
  'bebida': '/iconos/bebida.png'
};

interface CategoriaConConteo extends Categoria {
  count?: number;
}

// Función helper para obtener el conteo de manera segura
const obtenerConteo = (categoria: CategoriaConConteo): number => {
  return categoria.count || 0;
};

interface ListaCategoriasRedisenoProps {
  categorias?: CategoriaConConteo[]; // Opcional, se carga desde PostgreSQL
  categoriaSeleccionada: string | null;
  onSelectCategoria: (id: string) => void;
  onAddCategoria?: (categoria: Categoria) => void;
  onDeleteCategoria?: (id: string) => void;
}

export function ListaCategoriasRediseno({
  categorias: categoriasProps,
  categoriaSeleccionada,
  onSelectCategoria,
  onAddCategoria,
  onDeleteCategoria
}: ListaCategoriasRedisenoProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [modalCategoria, setModalCategoria] = useState(false);
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Hook para cargar categorías desde PostgreSQL
  const { 
    categorias: categoriasPostgreSQL, 
    loading: cargandoCategorias, 
    error: errorCategorias,
    obtenerCategorias,
    obtenerCategoriasPrincipales,
    obtenerSubcategorias
  } = useCategorias();

  // Usar categorías de PostgreSQL o las que vienen por props
  const categorias = categoriasProps || categoriasPostgreSQL;

  // Cargar categorías al montar el componente
  useEffect(() => {
    if (!categoriasProps) {
      obtenerCategorias().catch((error: Error) => {
        console.error('Error al cargar categorías:', error);
        toast.error('Error al cargar categorías desde la base de datos');
      });
    }
  }, [categoriasProps, obtenerCategorias]);

  // Obtener el icono para una subcategoría basado en su nombre/tipo
  const getIconoCategoria = (categoria: Categoria): string => {
    const nombreLower = categoria.nombre.toLowerCase();
    
    if (nombreLower.includes('entrada')) return ICONOS_SUBCATEGORIAS.entrada;
    if (nombreLower.includes('principio')) return ICONOS_SUBCATEGORIAS.principio;
    if (nombreLower.includes('proteina')) return ICONOS_SUBCATEGORIAS.proteina;
    if (nombreLower.includes('acompanamiento')) return ICONOS_SUBCATEGORIAS.acompanamiento;
    if (nombreLower.includes('bebida')) return ICONOS_SUBCATEGORIAS.bebida;
    
    return '/iconos/sopa.png'; // Icono por defecto
  };

  // Filtrar categorías principales y subcategorías
  const categoriasPrincipales = categorias.filter(cat => cat.tipo === 'principal');
  
  // Obtener subcategorías para una categoría principal
  const getSubcategoriasPorCategoria = (parentId: string): Categoria[] => {
    return categorias.filter(cat => cat.tipo === 'subcategoria' && cat.parentId === parentId);
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
      handleSelectCategoria(categoryId);
    }
  };

  // Manejar la adición de una categoría (pendiente de implementar)
  const handleAddCategoria = (categoriaId: string, categoriaNombre: string) => {
    console.log('🚧 Agregar categoría pendiente de implementar:', { categoriaId, categoriaNombre });
    toast.info('Función de agregar categoría pendiente de implementar');
    setModalCategoria(false);
  };

  // Confirmar eliminación (pendiente de implementar)
  const confirmDelete = () => {
    if (!itemToDelete) return;
    
    console.log('🚧 Eliminar categoría pendiente de implementar:', itemToDelete);
    toast.info('Función de eliminar pendiente de implementar');
    
    setModalConfirmDelete(false);
    setItemToDelete(null);
  };

  // Iniciar proceso de eliminación
  const handleDeleteItem = (id: string) => {
    setItemToDelete(id);
    setModalConfirmDelete(true);
  };

  // Mostrar error si hay problemas cargando
  if (errorCategorias) {
    return (
      <div className="space-y-3">
        <div className="text-red-500 text-sm p-3 bg-red-50 rounded-md">
          Error al cargar categorías: {errorCategorias}
        </div>
        <Button 
          onClick={() => obtenerCategorias()}
          className="w-full bg-[#F4821F] hover:bg-[#CC6A10] text-white text-sm"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Indicador de carga */}
      {cargandoCategorias && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-[#F4821F]" />
          <span className="ml-2 text-sm">Cargando categorías...</span>
        </div>
      )}

      {/* Lista de categorías principales con subcategorías */}
      {categoriasPrincipales.map((categoria) => {
        const subcategorias = getSubcategoriasPorCategoria(categoria.id);
        const totalProductos = obtenerConteo(categoria);
        
        return (
          <div key={categoria.id} className="border-b border-gray-200">
            <div 
              className="flex items-center justify-between py-3 px-4 cursor-pointer"
              onClick={() => toggleCategory(categoria.id)}
            >
              <div className="flex items-center space-x-3">
                <Menu className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-sm">{categoria.nombre}</span>
                {subcategorias.length > 0 && (
                  <span className="text-xs text-gray-500">({subcategorias.length} subcategorías)</span>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <GripVertical className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">{totalProductos}</span>
                {expandedCategory === categoria.id ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </div>
            </div>
            
            {/* Subcategorías expandidas */}
            {expandedCategory === categoria.id && (
              <div className="px-4 py-3 bg-gray-50">
                {subcategorias.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-600 mb-3">Subcategorías:</p>
                    {subcategorias.map((subcategoria) => {
                      const conteoSubcategoria: number = 'count' in subcategoria ? subcategoria.count || 0 : 0;
                      return (
                        <div 
                          key={subcategoria.id}
                          className="flex items-center justify-between p-2 bg-white rounded-md hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleSelectCategoria(subcategoria.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 flex-shrink-0">
                              <Image
                                src={getIconoCategoria(subcategoria)}
                                alt={subcategoria.nombre}
                                width={24}
                                height={24}
                                className="object-contain"
                              />
                            </div>
                            <span className="text-sm">{subcategoria.nombre}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {conteoSubcategoria} productos
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                handleDeleteItem(subcategoria.id);
                              }}
                              className="text-red-500 hover:bg-red-50 h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No hay subcategorías en esta categoría.</p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Mensaje si no hay categorías principales */}
      {!cargandoCategorias && categoriasPrincipales.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">No hay categorías disponibles</p>
          <p className="text-xs">Las categorías se cargan automáticamente desde PostgreSQL</p>
        </div>
      )}

      {/* Modal para agregar categoría (simplificado) */}
      <Dialog open={modalCategoria} onOpenChange={setModalCategoria}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar categoría</DialogTitle>
            <DialogDescription>
              Función pendiente de implementar
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 text-center text-gray-500">
            <p>La funcionalidad de agregar categorías será implementada próximamente.</p>
            <p className="text-xs mt-2">Las categorías se gestionan actualmente desde PostgreSQL.</p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalCategoria(false)}>
              Cerrar
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
              Función pendiente de implementar
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 text-center text-gray-500">
            <p>La funcionalidad de eliminar será implementada próximamente.</p>
            <p className="text-xs mt-2">Las categorías se gestionan actualmente desde PostgreSQL.</p>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setModalConfirmDelete(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
