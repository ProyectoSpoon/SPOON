'use client';

import { useState } from 'react';
import { TipoRestaurante, Categoria, Subcategoria } from '../types/tipos';
import { toast } from 'sonner';
import { arrayMove } from '@dnd-kit/sortable';

// Componentes
import { BusquedaFiltros } from './BusquedaFiltros';
import { Breadcrumbs } from './Breadcrumbs';
import { TipoRestauranteView } from './vistas/TipoRestauranteView';
import { CategoriaView } from './vistas/CategoriaView';
import { SubcategoriaView } from './vistas/SubcategoriaView';
import { FormularioEdicion } from './FormularioEdicion';

interface ConfiguracionCategoriasProps {
  tiposRestaurante: TipoRestaurante[];
  onSave: (tiposRestaurante: TipoRestaurante[]) => void;
  onImportTemplate: (tipoId: string) => void;
}

export function ConfiguracionCategorias({ 
  tiposRestaurante, 
  onSave, 
  onImportTemplate 
}: ConfiguracionCategoriasProps) {
  const [tiposActualizados, setTiposActualizados] = useState<TipoRestaurante[]>(tiposRestaurante);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string | null>(
    tiposRestaurante.length > 0 ? tiposRestaurante[0].id : null
  );
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [modoEdicion, setModoEdicion] = useState<{
    tipo: boolean;
    categoria: boolean;
    subcategoria: boolean;
    id: string | null;
  }>({
    tipo: false,
    categoria: false,
    subcategoria: false,
    id: null
  });
  const [nuevoElemento, setNuevoElemento] = useState<{
    nombre: string;
    descripcion: string;
    icono: string;
    color: string;
  }>({
    nombre: '',
    descripcion: '',
    icono: 'utensils',
    color: '#F4821F'
  });
  
  // Estado para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [currentView, setCurrentView] = useState<'tipos' | 'categorias' | 'subcategorias'>('tipos');

  // Obtener el tipo de restaurante seleccionado
  const tipoActual = tiposActualizados.find(tipo => tipo.id === tipoSeleccionado) || null;
  
  // Obtener las categorías del tipo seleccionado
  const categorias = tipoActual?.categorias || [];
  
  // Obtener la categoría seleccionada
  const categoriaActual = categorias.find(cat => cat.id === categoriaSeleccionada) || null;
  
  // Obtener las subcategorías de la categoría seleccionada
  const subcategorias = categoriaActual?.subcategorias || [];

  // Filtrar tipos según búsqueda y estado activo
  const tiposFiltrados = tiposActualizados.filter(tipo => {
    const matchesSearch = searchTerm === '' || 
      tipo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tipo.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesActive = showInactive || tipo.activo;
    
    return matchesSearch && matchesActive;
  });

  // Filtrar categorías según búsqueda y estado activo
  const categoriasFiltradas = categorias.filter(cat => {
    const matchesSearch = searchTerm === '' || 
      cat.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.descripcion && cat.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesActive = showInactive || cat.activo;
    
    return matchesSearch && matchesActive;
  });

  // Filtrar subcategorías según búsqueda y estado activo
  const subcategoriasFiltradas = subcategorias.filter(sub => {
    const matchesSearch = searchTerm === '' || 
      sub.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.descripcion && sub.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesActive = showInactive || sub.activo;
    
    return matchesSearch && matchesActive;
  });

  // Manejar la selección de un tipo de restaurante
  const handleSelectTipo = (tipoId: string) => {
    setTipoSeleccionado(tipoId);
    setCategoriaSeleccionada(null);
    setModoEdicion({
      tipo: false,
      categoria: false,
      subcategoria: false,
      id: null
    });
    setCurrentView('categorias');
  };

  // Manejar la selección de una categoría
  const handleSelectCategoria = (categoriaId: string) => {
    setCategoriaSeleccionada(categoriaId);
    setModoEdicion({
      tipo: false,
      categoria: false,
      subcategoria: false,
      id: null
    });
    setCurrentView('subcategorias');
  };

  // Manejar el reordenamiento de tipos de restaurante
  const handleReordenarTipos = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setTiposActualizados((tipos) => {
        const oldIndex = tipos.findIndex(tipo => tipo.id === active.id);
        const newIndex = tipos.findIndex(tipo => tipo.id === over.id);
        
        return arrayMove(tipos, oldIndex, newIndex);
      });
    }
  };

  // Manejar el reordenamiento de categorías
  const handleReordenarCategorias = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setTiposActualizados((tipos) => {
        return tipos.map(tipo => {
          if (tipo.id !== tipoSeleccionado) return tipo;
          
          const oldIndex = tipo.categorias.findIndex(cat => cat.id === active.id);
          const newIndex = tipo.categorias.findIndex(cat => cat.id === over.id);
          
          return {
            ...tipo,
            categorias: arrayMove(tipo.categorias, oldIndex, newIndex).map(
              (cat, index) => ({ ...cat, orden: index })
            )
          };
        });
      });
    }
  };

  // Manejar el reordenamiento de subcategorías
  const handleReordenarSubcategorias = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setTiposActualizados((tipos) => {
        return tipos.map(tipo => {
          if (tipo.id !== tipoSeleccionado) return tipo;
          
          return {
            ...tipo,
            categorias: tipo.categorias.map(cat => {
              if (cat.id !== categoriaSeleccionada) return cat;
              
              const oldIndex = cat.subcategorias.findIndex(sub => sub.id === active.id);
              const newIndex = cat.subcategorias.findIndex(sub => sub.id === over.id);
              
              return {
                ...cat,
                subcategorias: arrayMove(cat.subcategorias, oldIndex, newIndex).map(
                  (sub, index) => ({ ...sub, orden: index })
                )
              };
            })
          };
        });
      });
    }
  };

  // Manejar la activación/desactivación de un tipo de restaurante
  const handleToggleTipoActivo = (tipoId: string) => {
    setTiposActualizados((tipos) => {
      return tipos.map(tipo => {
        if (tipo.id !== tipoId) return tipo;
        return { ...tipo, activo: !tipo.activo };
      });
    });
  };

  // Manejar la activación/desactivación de una categoría
  const handleToggleCategoriaActiva = (categoriaId: string) => {
    setTiposActualizados((tipos) => {
      return tipos.map(tipo => {
        if (tipo.id !== tipoSeleccionado) return tipo;
        
        return {
          ...tipo,
          categorias: tipo.categorias.map(cat => {
            if (cat.id !== categoriaId) return cat;
            return { ...cat, activo: !cat.activo };
          })
        };
      });
    });
  };

  // Manejar la activación/desactivación de una subcategoría
  const handleToggleSubcategoriaActiva = (subcategoriaId: string) => {
    setTiposActualizados((tipos) => {
      return tipos.map(tipo => {
        if (tipo.id !== tipoSeleccionado) return tipo;
        
        return {
          ...tipo,
          categorias: tipo.categorias.map(cat => {
            if (cat.id !== categoriaSeleccionada) return cat;
            
            return {
              ...cat,
              subcategorias: cat.subcategorias.map(sub => {
                if (sub.id !== subcategoriaId) return sub;
                return { ...sub, activo: !sub.activo };
              })
            };
          })
        };
      });
    });
  };

  // Manejar la edición de un tipo de restaurante
  const handleEditarTipo = (tipoId: string) => {
    const tipo = tiposActualizados.find(t => t.id === tipoId);
    if (!tipo) return;
    
    setNuevoElemento({
      nombre: tipo.nombre,
      descripcion: tipo.descripcion,
      icono: tipo.icono,
      color: tipo.color || '#F4821F'
    });
    
    setModoEdicion({
      tipo: true,
      categoria: false,
      subcategoria: false,
      id: tipoId
    });
  };

  // Manejar la edición de una categoría
  const handleEditarCategoria = (categoriaId: string) => {
    if (!tipoSeleccionado) return;
    
    const tipo = tiposActualizados.find(t => t.id === tipoSeleccionado);
    if (!tipo) return;
    
    const categoria = tipo.categorias.find(c => c.id === categoriaId);
    if (!categoria) return;
    
    setNuevoElemento({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      icono: categoria.icono,
      color: categoria.color
    });
    
    setModoEdicion({
      tipo: false,
      categoria: true,
      subcategoria: false,
      id: categoriaId
    });
  };

  // Manejar la edición de una subcategoría
  const handleEditarSubcategoria = (subcategoriaId: string) => {
    if (!tipoSeleccionado || !categoriaSeleccionada) return;
    
    const tipo = tiposActualizados.find(t => t.id === tipoSeleccionado);
    if (!tipo) return;
    
    const categoria = tipo.categorias.find(c => c.id === categoriaSeleccionada);
    if (!categoria) return;
    
    const subcategoria = categoria.subcategorias.find(s => s.id === subcategoriaId);
    if (!subcategoria) return;
    
    setNuevoElemento({
      nombre: subcategoria.nombre,
      descripcion: subcategoria.descripcion || '',
      icono: subcategoria.icono || 'circle',
      color: subcategoria.color || categoria.color
    });
    
    setModoEdicion({
      tipo: false,
      categoria: false,
      subcategoria: true,
      id: subcategoriaId
    });
  };

  // Manejar la creación de un nuevo tipo de restaurante
  const handleNuevoTipo = () => {
    setNuevoElemento({
      nombre: '',
      descripcion: '',
      icono: 'utensils',
      color: '#F4821F'
    });
    
    setModoEdicion({
      tipo: true,
      categoria: false,
      subcategoria: false,
      id: null
    });
  };

  // Manejar la creación de una nueva categoría
  const handleNuevaCategoria = () => {
    if (!tipoSeleccionado) return;
    
    setNuevoElemento({
      nombre: '',
      descripcion: '',
      icono: 'circle',
      color: '#F4821F'
    });
    
    setModoEdicion({
      tipo: false,
      categoria: true,
      subcategoria: false,
      id: null
    });
  };

  // Manejar la creación de una nueva subcategoría
  const handleNuevaSubcategoria = () => {
    if (!tipoSeleccionado || !categoriaSeleccionada) return;
    
    const categoria = categorias.find(c => c.id === categoriaSeleccionada);
    if (!categoria) return;
    
    setNuevoElemento({
      nombre: '',
      descripcion: '',
      icono: 'circle',
      color: categoria.color
    });
    
    setModoEdicion({
      tipo: false,
      categoria: false,
      subcategoria: true,
      id: null
    });
  };

  // Manejar el guardado de un tipo de restaurante (nuevo o editado)
  const handleGuardarTipo = () => {
    if (nuevoElemento.nombre.trim() === '') {
      toast.error('El nombre es obligatorio');
      return;
    }
    
    if (modoEdicion.id) {
      // Editar tipo existente
      setTiposActualizados((tipos) => {
        return tipos.map(tipo => {
          if (tipo.id !== modoEdicion.id) return tipo;
          
          return {
            ...tipo,
            nombre: nuevoElemento.nombre,
            descripcion: nuevoElemento.descripcion,
            icono: nuevoElemento.icono,
            color: nuevoElemento.color
          };
        });
      });
      
      toast.success('Tipo de restaurante actualizado');
    } else {
      // Crear nuevo tipo
      const nuevoTipo: TipoRestaurante = {
        id: `tipo_${Date.now()}`,
        nombre: nuevoElemento.nombre,
        descripcion: nuevoElemento.descripcion,
        icono: nuevoElemento.icono,
        color: nuevoElemento.color,
        categorias: [],
        activo: true
      };
      
      setTiposActualizados((tipos) => [...tipos, nuevoTipo]);
      setTipoSeleccionado(nuevoTipo.id);
      
      toast.success('Tipo de restaurante creado');
    }
    
    setModoEdicion({
      tipo: false,
      categoria: false,
      subcategoria: false,
      id: null
    });
  };

  // Manejar el guardado de una categoría (nueva o editada)
  const handleGuardarCategoria = () => {
    if (!tipoSeleccionado) return;
    if (nuevoElemento.nombre.trim() === '') {
      toast.error('El nombre es obligatorio');
      return;
    }
    
    setTiposActualizados((tipos) => {
      return tipos.map(tipo => {
        if (tipo.id !== tipoSeleccionado) return tipo;
        
        if (modoEdicion.id) {
          // Editar categoría existente
          return {
            ...tipo,
            categorias: tipo.categorias.map(cat => {
              if (cat.id !== modoEdicion.id) return cat;
              
              return {
                ...cat,
                nombre: nuevoElemento.nombre,
                descripcion: nuevoElemento.descripcion,
                icono: nuevoElemento.icono,
                color: nuevoElemento.color
              };
            })
          };
        } else {
          // Crear nueva categoría
          const nuevaCategoria: Categoria = {
            id: `cat_${Date.now()}`,
            nombre: nuevoElemento.nombre,
            descripcion: nuevoElemento.descripcion,
            icono: nuevoElemento.icono,
            color: nuevoElemento.color,
            orden: tipo.categorias.length,
            activo: true,
            subcategorias: []
          };
          
          return {
            ...tipo,
            categorias: [...tipo.categorias, nuevaCategoria]
          };
        }
      });
    });
    
    if (!modoEdicion.id) {
      setCategoriaSeleccionada(`cat_${Date.now()}`);
    }
    
    toast.success(modoEdicion.id ? 'Categoría actualizada' : 'Categoría creada');
    
    setModoEdicion({
      tipo: false,
      categoria: false,
      subcategoria: false,
      id: null
    });
  };

  // Manejar el guardado de una subcategoría (nueva o editada)
  const handleGuardarSubcategoria = () => {
    if (!tipoSeleccionado || !categoriaSeleccionada) return;
    if (nuevoElemento.nombre.trim() === '') {
      toast.error('El nombre es obligatorio');
      return;
    }
    
    setTiposActualizados((tipos) => {
      return tipos.map(tipo => {
        if (tipo.id !== tipoSeleccionado) return tipo;
        
        return {
          ...tipo,
          categorias: tipo.categorias.map(cat => {
            if (cat.id !== categoriaSeleccionada) return cat;
            
            if (modoEdicion.id) {
              // Editar subcategoría existente
              return {
                ...cat,
                subcategorias: cat.subcategorias.map(sub => {
                  if (sub.id !== modoEdicion.id) return sub;
                  
                  return {
                    ...sub,
                    nombre: nuevoElemento.nombre,
                    descripcion: nuevoElemento.descripcion,
                    icono: nuevoElemento.icono,
                    color: nuevoElemento.color
                  };
                })
              };
            } else {
              // Crear nueva subcategoría
              const nuevaSubcategoria: Subcategoria = {
                id: `subcat_${Date.now()}`,
                nombre: nuevoElemento.nombre,
                descripcion: nuevoElemento.descripcion,
                icono: nuevoElemento.icono,
                color: nuevoElemento.color,
                orden: cat.subcategorias.length,
                activo: true
              };
              
              return {
                ...cat,
                subcategorias: [...cat.subcategorias, nuevaSubcategoria]
              };
            }
          })
        };
      });
    });
    
    toast.success(modoEdicion.id ? 'Subcategoría actualizada' : 'Subcategoría creada');
    
    setModoEdicion({
      tipo: false,
      categoria: false,
      subcategoria: false,
      id: null
    });
  };

  // Manejar la eliminación de un tipo de restaurante
  const handleEliminarTipo = (tipoId: string) => {
    if (window.confirm('¿Está seguro de eliminar este tipo de restaurante? Esta acción no se puede deshacer.')) {
      setTiposActualizados((tipos) => {
        const nuevosTipos = tipos.filter(tipo => tipo.id !== tipoId);
        
        // Si se eliminó el tipo seleccionado, seleccionar otro
        if (tipoId === tipoSeleccionado) {
          setTipoSeleccionado(nuevosTipos.length > 0 ? nuevosTipos[0].id : null);
          setCategoriaSeleccionada(null);
        }
        
        return nuevosTipos;
      });
      
      toast.success('Tipo de restaurante eliminado');
    }
  };

  // Manejar la eliminación de una categoría
  const handleEliminarCategoria = (categoriaId: string) => {
    if (window.confirm('¿Está seguro de eliminar esta categoría? Esta acción no se puede deshacer.')) {
      setTiposActualizados((tipos) => {
        return tipos.map(tipo => {
          if (tipo.id !== tipoSeleccionado) return tipo;
          
          const nuevasCategorias = tipo.categorias.filter(cat => cat.id !== categoriaId);
          
          // Si se eliminó la categoría seleccionada, deseleccionar
          if (categoriaId === categoriaSeleccionada) {
            setCategoriaSeleccionada(null);
          }
          
          return {
            ...tipo,
            categorias: nuevasCategorias
          };
        });
      });
      
      toast.success('Categoría eliminada');
    }
  };

  // Manejar la eliminación de una subcategoría
  const handleEliminarSubcategoria = (subcategoriaId: string) => {
    if (window.confirm('¿Está seguro de eliminar esta subcategoría? Esta acción no se puede deshacer.')) {
      setTiposActualizados((tipos) => {
        return tipos.map(tipo => {
          if (tipo.id !== tipoSeleccionado) return tipo;
          
          return {
            ...tipo,
            categorias: tipo.categorias.map(cat => {
              if (cat.id !== categoriaSeleccionada) return cat;
              
              return {
                ...cat,
                subcategorias: cat.subcategorias.filter(sub => sub.id !== subcategoriaId)
              };
            })
          };
        });
      });
      
      toast.success('Subcategoría eliminada');
    }
  };

  // Manejar la importación de una plantilla
  const handleImportarPlantilla = () => {
    if (!tipoSeleccionado) return;
    
    if (window.confirm('¿Está seguro de importar la plantilla para este tipo de restaurante? Se reemplazarán todas las categorías existentes.')) {
      onImportTemplate(tipoSeleccionado);
    }
  };

  // Manejar el guardado de la configuración
  const handleGuardarConfiguracion = () => {
    onSave(tiposActualizados);
  };

  // Manejar el cambio de nombre en el formulario
  const handleChangeNombre = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevoElemento(prev => ({ ...prev, nombre: e.target.value }));
  };

  // Manejar el cambio de descripción en el formulario
  const handleChangeDescripcion = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevoElemento(prev => ({ ...prev, descripcion: e.target.value }));
  };

  // Manejar el cambio de icono en el formulario
  const handleChangeIcono = (icono: string) => {
    setNuevoElemento(prev => ({ ...prev, icono }));
  };

  // Manejar el cambio de color en el formulario
  const handleChangeColor = (color: string) => {
    setNuevoElemento(prev => ({ ...prev, color }));
  };

  // Cancelar la edición
  const handleCancelarEdicion = () => {
    setModoEdicion({
      tipo: false,
      categoria: false,
      subcategoria: false,
      id: null
    });
  };

  // Manejar el cambio de vista
  const handleViewChange = (view: 'tipos' | 'categorias' | 'subcategorias') => {
    setCurrentView(view);
  };

  // Determinar qué función de guardado usar según el modo de edición
  const handleGuardar = () => {
    if (modoEdicion.tipo) {
      handleGuardarTipo();
    } else if (modoEdicion.categoria) {
      handleGuardarCategoria();
    } else if (modoEdicion.subcategoria) {
      handleGuardarSubcategoria();
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Barra de búsqueda y filtros */}
      <BusquedaFiltros
        searchTerm={searchTerm}
        showInactive={showInactive}
        onSearchChange={setSearchTerm}
        onShowInactiveChange={setShowInactive}
        onGuardarConfiguracion={handleGuardarConfiguracion}
      />
      
      {/* Navegación de migas de pan */}
      <Breadcrumbs
        currentView={currentView}
        tipoActual={tipoActual}
        categoriaActual={categoriaActual}
        onViewChange={handleViewChange}
      />
      
      {/* Contenido principal */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Vista de tipos de restaurante */}
        {currentView === 'tipos' && (
          <TipoRestauranteView
            tiposFiltrados={tiposFiltrados}
            tipoSeleccionado={tipoSeleccionado}
            onSelectTipo={handleSelectTipo}
            onToggleTipoActivo={handleToggleTipoActivo}
            onEditarTipo={handleEditarTipo}
            onEliminarTipo={handleEliminarTipo}
            onNuevoTipo={handleNuevoTipo}
            onReordenarTipos={handleReordenarTipos}
          />
        )}
        
        {/* Vista de categorías */}
        {currentView === 'categorias' && tipoActual && (
          <CategoriaView
            tipoActual={tipoActual}
            categoriasFiltradas={categoriasFiltradas}
            categoriaSeleccionada={categoriaSeleccionada}
            onSelectCategoria={handleSelectCategoria}
            onToggleCategoriaActiva={handleToggleCategoriaActiva}
            onEditarCategoria={handleEditarCategoria}
            onEliminarCategoria={handleEliminarCategoria}
            onNuevaCategoria={handleNuevaCategoria}
            onImportarPlantilla={handleImportarPlantilla}
            onReordenarCategorias={handleReordenarCategorias}
          />
        )}
        
        {/* Vista de subcategorías */}
        {currentView === 'subcategorias' && tipoActual && categoriaActual && (
          <SubcategoriaView
            categoriaActual={categoriaActual}
            subcategoriasFiltradas={subcategoriasFiltradas}
            onToggleSubcategoriaActiva={handleToggleSubcategoriaActiva}
            onEditarSubcategoria={handleEditarSubcategoria}
            onEliminarSubcategoria={handleEliminarSubcategoria}
            onNuevaSubcategoria={handleNuevaSubcategoria}
            onReordenarSubcategorias={handleReordenarSubcategorias}
          />
        )}
      </div>
      
      {/* Modal de edición */}
      <FormularioEdicion
        modoEdicion={modoEdicion}
        nuevoElemento={nuevoElemento}
        onChangeNombre={handleChangeNombre}
        onChangeDescripcion={handleChangeDescripcion}
        onChangeIcono={handleChangeIcono}
        onChangeColor={handleChangeColor}
        onCancelar={handleCancelarEdicion}
        onGuardar={handleGuardar}
      />
    </div>
  );
}
