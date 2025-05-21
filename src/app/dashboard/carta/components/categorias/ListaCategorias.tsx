// src/app/dashboard/carta/components/categorias/ListaCategorias.tsx
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/shared/components/ui/Button';
import { Plus, Trash2, X, Loader2 } from 'lucide-react';
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

// Tipos de categorías principales
const CATEGORIAS_PRINCIPALES = [
  { id: 'desayunos', nombre: 'DESAYUNOS' },
  { id: 'menu-dia', nombre: 'MENÚ DEL DÍA' },
  { id: 'cenas', nombre: 'CENAS' },
  { id: 'comidas-rapidas', nombre: 'COMIDAS RÁPIDAS' }
];

// Tipos de subcategorías
const SUBCATEGORIAS = [
  { id: 'entrada', nombre: 'Entrada', ejemplo: 'sopa, ensalada' },
  { id: 'principio', nombre: 'Principio', ejemplo: 'frijoles, lentejas' },
  { id: 'proteina', nombre: 'Proteína', ejemplo: 'carne, pollo, pescado' },
  { id: 'acompanamiento', nombre: 'Acompañamiento', ejemplo: 'arroz, ensalada, patacones' },
  { id: 'bebida', nombre: 'Bebida', ejemplo: 'jugo, refresco' }
];

// Iconos para las subcategorías
const ICONOS_SUBCATEGORIAS = {
  'entrada': '/iconos/sopa.png',
  'principio': '/iconos/principio.png',
  'proteina': '/iconos/carne.png',
  'acompanamiento': '/iconos/sopa.png',
  'bebida': '/iconos/bebida.png'
};

interface Categoria {
  id: string;
  nombre: string;
  tipo: 'principal' | 'subcategoria';
  parentId?: string;
}

interface ListaCategoriasProps {
  categorias: Categoria[];
  categoriaSeleccionada: string | null;
  subcategoriaSeleccionada: string | null;
  onSelectCategoria: (id: string) => void;
  onSelectSubcategoria: (id: string, parentId: string) => void;
  onAddCategoria: (categoria: Categoria) => void;
  onDeleteCategoria?: (id: string) => void;
  onDeleteSubcategoria?: (id: string, parentId: string) => void;
}

export function ListaCategorias({
  categorias,
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
  const [cargandoCategorias, setCargandoCategorias] = useState(false);
  const [categoriasJSON, setCategoriasJSON] = useState<Categoria[]>([]);
  const [subcategoriasJSON, setSubcategoriasJSON] = useState<Categoria[]>([]);

  // Cargar categorías y subcategorías desde los archivos JSON
  useEffect(() => {
    const cargarDatos = async () => {
      setCargandoCategorias(true);
      try {
        // Cargar categorías
        const categorias = await jsonDataService.getCategorias();
        console.log('Categorías cargadas desde JSON:', categorias);
        setCategoriasJSON(categorias);

        // Cargar subcategorías
        const subcategorias = await jsonDataService.getSubcategorias();
        console.log('Subcategorías cargadas desde JSON:', subcategorias);
        setSubcategoriasJSON(subcategorias);

        // Si no hay categorías seleccionadas, seleccionar la primera
        if (!categoriaSeleccionada && categorias.length > 0) {
          onSelectCategoria(categorias[0].id);
        }
      } catch (error) {
        console.error('Error al cargar categorías y subcategorías:', error);
        toast.error('Error al cargar categorías y subcategorías');
      } finally {
        setCargandoCategorias(false);
      }
    };

    cargarDatos();
  }, []);

  // Obtener el icono para una subcategoría
  const getIconoSubcategoria = (id: string) => {
    return ICONOS_SUBCATEGORIAS[id as keyof typeof ICONOS_SUBCATEGORIAS] || '/iconos/sopa.png';
  };

  // Agrupar categorías por tipo
  const categoriasPrincipales = categoriasJSON.length > 0 
    ? categoriasJSON 
    : categorias.filter(cat => cat.tipo === 'principal');
  
  // Obtener subcategorías para una categoría principal
  const getSubcategorias = (parentId: string) => {
    if (subcategoriasJSON.length > 0) {
      return subcategoriasJSON.filter(subcat => subcat.parentId === parentId);
    }
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

  // Manejar la adición de una categoría principal
  const handleAddCategoria = (categoriaId: string, categoriaNombre: string) => {
    const nuevaCategoria: Categoria = {
      id: categoriaId,
      nombre: categoriaNombre,
      tipo: 'principal'
    };
    
    onAddCategoria(nuevaCategoria);
    setModalCategoria(false);
    toast.success(`Categoría "${categoriaNombre}" agregada`);
  };

  // Manejar la adición de una subcategoría
  const handleAddSubcategoria = (subcategoriaId: string, subcategoriaNombre: string) => {
    if (!categoriaParaSubcategoria) return;
    
    const nuevaSubcategoria: Categoria = {
      id: subcategoriaId,
      nombre: subcategoriaNombre,
      tipo: 'subcategoria',
      parentId: categoriaParaSubcategoria
    };
    
    onAddCategoria(nuevaSubcategoria);
    setModalSubcategoria(false);
    toast.success(`Subcategoría "${subcategoriaNombre}" agregada`);
  };

  // Abrir modal para agregar subcategoría
  const openSubcategoriaModal = (categoriaId: string) => {
    setCategoriaParaSubcategoria(categoriaId);
    setModalSubcategoria(true);
  };

  // Confirmar eliminación
  const confirmDelete = () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.tipo === 'categoria' && onDeleteCategoria) {
      onDeleteCategoria(itemToDelete.id);
      toast.success('Categoría eliminada');
    } else if (itemToDelete.tipo === 'subcategoria' && onDeleteSubcategoria && itemToDelete.parentId) {
      onDeleteSubcategoria(itemToDelete.id, itemToDelete.parentId);
      toast.success('Subcategoría eliminada');
    }
    
    setModalConfirmDelete(false);
    setItemToDelete(null);
  };

  // Iniciar proceso de eliminación
  const handleDeleteItem = (id: string, tipo: 'categoria' | 'subcategoria', parentId?: string) => {
    setItemToDelete({ id, tipo, parentId });
    setModalConfirmDelete(true);
  };

  return (
    <div className="space-y-3">
      {/* Botón para agregar categoría principal */}
      <Button 
        onClick={() => setModalCategoria(true)}
        className="w-full bg-[#F4821F] hover:bg-[#CC6A10] text-white text-sm"
      >
        <Plus className="h-3 w-3 mr-1" />
        Agregar categoría
      </Button>

      {/* Lista de categorías principales */}
      <div className="space-y-3">
        {categoriasPrincipales.map((categoria) => (
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
                <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">{categoria.nombre}</span>
              </button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteItem(categoria.id, 'categoria');
                }}
                className="text-red-500 hover:bg-red-50 h-7 w-7 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            
            {/* Botón de agregar subcategoría (ahora debajo de la categoría) */}
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
                {getSubcategorias(categoria.id).map((subcategoria) => (
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
                          src={getIconoSubcategoria(subcategoria.id)}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(subcategoria.id, 'subcategoria', categoria.id);
                      }}
                      className="text-red-500 hover:bg-red-50 h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal para agregar categoría principal */}
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
            ) : categoriasJSON.length > 0 ? (
              categoriasJSON.map((cat) => (
                <Button
                  key={cat.id}
                  onClick={() => handleAddCategoria(cat.id, cat.nombre)}
                  variant="outline"
                  className="justify-start h-10 text-sm"
                >
                  {cat.nombre}
                </Button>
              ))
            ) : (
              CATEGORIAS_PRINCIPALES.map((cat) => (
                <Button
                  key={cat.id}
                  onClick={() => handleAddCategoria(cat.id, cat.nombre)}
                  variant="outline"
                  className="justify-start h-10 text-sm"
                >
                  {cat.nombre}
                </Button>
              ))
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalCategoria(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para agregar subcategoría */}
      <Dialog open={modalSubcategoria} onOpenChange={setModalSubcategoria}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar subcategoría</DialogTitle>
            <DialogDescription>
              Selecciona el tipo de subcategoría que deseas agregar
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-3 py-3">
            {cargandoCategorias ? (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-[#F4821F]" />
                <span className="ml-2 text-sm">Cargando subcategorías...</span>
              </div>
            ) : categoriaParaSubcategoria === 'CAT_002' ? (
              // Si la categoría es Almuerzos (CAT_002), mostrar las subcategorías definidas
              subcategoriasJSON
                .filter(subcat => subcat.parentId === 'CAT_002')
                .map((subcat) => (
                  <Button
                    key={subcat.id}
                    onClick={() => handleAddSubcategoria(subcat.id, subcat.nombre)}
                    variant="outline"
                    className="justify-start h-10"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-sm">{subcat.nombre}</span>
                    </div>
                  </Button>
                ))
            ) : (
              // Para otras categorías, mostrar mensaje de que no hay subcategorías
              <div className="flex flex-col items-center justify-center py-4 text-gray-500">
                <p className="text-sm">No existen subcategorías para esta categoría</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalSubcategoria(false)}>
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
              {itemToDelete?.tipo === 'categoria' 
                ? '¿Estás seguro de que deseas eliminar esta categoría? También se eliminarán todas sus subcategorías.'
                : '¿Estás seguro de que deseas eliminar esta subcategoría?'}
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
