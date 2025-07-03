// src/app/dashboard/carta/components/categorias/ListaCategorias.tsx
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/shared/components/ui/Button';
import { Plus, Trash2, Loader2 } from 'lucide-react';
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

// Iconos para las subcategorías
const ICONOS_SUBCATEGORIAS: Record<string, string> = {
  'entrada': '/iconos/sopa.png',
  'principio': '/iconos/principio.png', 
  'proteina': '/iconos/carne.png',
  'acompanamiento': '/iconos/sopa.png',
  'bebida': '/iconos/bebida.png'
};

interface ListaCategoriasProps {
  categorias?: Categoria[]; // Opcional, se carga desde PostgreSQL
  categoriaSeleccionada: string | null;
  subcategoriaSeleccionada: string | null;
  onSelectCategoria: (id: string) => void;
  onSelectSubcategoria: (id: string, parentId: string) => void;
  onAddCategoria?: (categoria: Categoria) => void;
  onDeleteCategoria?: (id: string) => void;
  onDeleteSubcategoria?: (id: string, parentId: string) => void;
}

export function ListaCategorias({
  categorias: categoriasProps,
  categoriaSeleccionada,
  subcategoriaSeleccionada,
  onSelectCategoria,
  onSelectSubcategoria,
  onAddCategoria,
  onDeleteCategoria,
  onDeleteSubcategoria
}: ListaCategoriasProps) {
  const [modalCategoria, setModalCategoria] = useState(false);
  const [modalSubcategoria, setModalSubcategoria] = useState(false);
  const [categoriaParaSubcategoria, setCategoriaParaSubcategoria] = useState<string | null>(null);
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, tipo: 'categoria' | 'subcategoria', parentId?: string} | null>(null);

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

  // Seleccionar primera categoría automáticamente si no hay ninguna seleccionada
  useEffect(() => {
    if (!categoriaSeleccionada && categorias.length > 0) {
      const primeraCategoriaPrincipal = categorias.find(cat => cat.tipo === 'principal');
      if (primeraCategoriaPrincipal) {
        onSelectCategoria(primeraCategoriaPrincipal.id);
      }
    }
  }, [categorias, categoriaSeleccionada, onSelectCategoria]);

  // Obtener el icono para una subcategoría basado en su nombre/tipo
  const getIconoSubcategoria = (categoria: Categoria): string => {
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

  // Manejar la selección de una categoría principal
  const handleSelectCategoria = (id: string) => {
    onSelectCategoria(id);
  };

  // Manejar la selección de una subcategoría
  const handleSelectSubcategoria = (id: string, parentId: string) => {
    onSelectSubcategoria(id, parentId);
  };

  // Manejar la adición de una categoría principal (pendiente de implementar)
  const handleAddCategoria = (categoriaId: string, categoriaNombre: string) => {
    console.log('🚧 Agregar categoría pendiente de implementar:', { categoriaId, categoriaNombre });
    toast.info('Función de agregar categoría pendiente de implementar');
    setModalCategoria(false);
  };

  // Manejar la adición de una subcategoría (pendiente de implementar)
  const handleAddSubcategoria = (subcategoriaId: string, subcategoriaNombre: string) => {
    console.log('🚧 Agregar subcategoría pendiente de implementar:', { subcategoriaId, subcategoriaNombre });
    toast.info('Función de agregar subcategoría pendiente de implementar');
    setModalSubcategoria(false);
  };

  // Abrir modal para agregar subcategoría
  const openSubcategoriaModal = (categoriaId: string) => {
    setCategoriaParaSubcategoria(categoriaId);
    setModalSubcategoria(true);
  };

  // Confirmar eliminación (pendiente de implementar)
  const confirmDelete = () => {
    if (!itemToDelete) return;
    
    console.log('🚧 Eliminar elemento pendiente de implementar:', itemToDelete);
    toast.info('Función de eliminar pendiente de implementar');
    
    setModalConfirmDelete(false);
    setItemToDelete(null);
  };

  // Iniciar proceso de eliminación
  const handleDeleteItem = (id: string, tipo: 'categoria' | 'subcategoria', parentId?: string) => {
    setItemToDelete({ id, tipo, parentId });
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
    <div className="space-y-3">
      {/* Botón para agregar categoría principal */}
      <Button 
        onClick={() => setModalCategoria(true)}
        className="w-full bg-[#F4821F] hover:bg-[#CC6A10] text-white text-sm"
        disabled={cargandoCategorias}
      >
        <Plus className="h-3 w-3 mr-1" />
        Agregar categoría
      </Button>

      {/* Indicador de carga */}
      {cargandoCategorias && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-[#F4821F]" />
          <span className="ml-2 text-sm">Cargando categorías...</span>
        </div>
      )}

      {/* Lista de categorías principales */}
      <div className="space-y-3">
        {categoriasPrincipales.map((categoria) => {
          const subcategorias = getSubcategoriasPorCategoria(categoria.id);
          
          return (
            <div key={categoria.id} className="space-y-1 border border-gray-100 rounded-md overflow-hidden">
              {/* Categoría principal */}
              <div className="flex items-center justify-between bg-gray-50">
                <button
                  onClick={() => handleSelectCategoria(categoria.id)}
                  className={`flex-1 text-left flex items-center gap-2 px-3 py-1.5 transition-colors ${
                    categoriaSeleccionada === categoria.id
                      ? 'bg-[#F4821F]/10 text-[#F4821F] font-medium'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                    {categoria.nombre}
                  </span>
                  {subcategorias.length > 0 && (
                    <span className="text-xs text-gray-500">({subcategorias.length})</span>
                  )}
                </button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleDeleteItem(categoria.id, 'categoria');
                  }}
                  className="text-red-500 hover:bg-red-50 h-7 w-7 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              
              {/* Botón de agregar subcategoría */}
              <div className="px-3 py-1 bg-gray-50 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openSubcategoriaModal(categoria.id)}
                  className="text-[#F4821F] hover:bg-[#F4821F]/10 text-xs h-6 px-2"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Agregar subcategoría
                </Button>
              </div>
              
              {/* Subcategorías (solo mostrar si la categoría principal está seleccionada) */}
              {categoriaSeleccionada === categoria.id && (
                <div className="pl-3 space-y-1 py-1 bg-white">
                  {subcategorias.map((subcategoria) => (
                    <div key={subcategoria.id} className="flex items-center justify-between">
                      <button
                        onClick={() => handleSelectSubcategoria(subcategoria.id, categoria.id)}
                        className={`flex-1 flex items-center gap-2 px-2 py-1 rounded-md transition-colors ${
                          subcategoriaSeleccionada === subcategoria.id
                            ? 'bg-[#F4821F]/10 text-[#F4821F]'
                            : 'text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        <div className="w-4 h-4 flex-shrink-0">
                          <Image
                            src={getIconoSubcategoria(subcategoria)}
                            alt={subcategoria.nombre}
                            width={16}
                            height={16}
                            className="object-contain"
                          />
                        </div>
                        <span className="text-xs">{subcategoria.nombre}</span>
                      </button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleDeleteItem(subcategoria.id, 'subcategoria', categoria.id);
                        }}
                        className="text-red-500 hover:bg-red-50 h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  
                  {/* Mensaje si no hay subcategorías */}
                  {subcategorias.length === 0 && (
                    <div className="text-xs text-gray-500 text-center py-2">
                      No hay subcategorías
                    </div>
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
            <p className="text-xs">Agrega una categoría para comenzar</p>
          </div>
        )}
      </div>

      {/* Modal para agregar categoría principal (simplificado) */}
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
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalCategoria(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para agregar subcategoría (simplificado) */}
      <Dialog open={modalSubcategoria} onOpenChange={setModalSubcategoria}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar subcategoría</DialogTitle>
            <DialogDescription>
              Función pendiente de implementar
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 text-center text-gray-500">
            <p>La funcionalidad de agregar subcategorías será implementada próximamente.</p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalSubcategoria(false)}>
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