'use client';

import React, { useState, useEffect, useRef, KeyboardEvent, useCallback } from 'react';
import Image from 'next/image';
import { Search, X, Tag, Clock, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';

// Tipos para los filtros
export interface FiltroRapido {
  nombre: string;
  filtro: Record<string, any>;
}

export interface Categoria {
  id: string;
  nombre: string;
  subcategorias?: { id: string; nombre: string }[];
}

export interface Atributo {
  id: string;
  nombre: string;
}

interface BusquedaAvanzadaProps {
  onSearch: (resultados: VersionedProduct[]) => void;
  categorias: Categoria[];
  atributos?: Atributo[];
  filtrosRapidos?: FiltroRapido[];
  productos: VersionedProduct[];
  renderResultado?: (producto: VersionedProduct) => React.ReactNode;
  placeholder?: string;
}

// Clave para almacenar el historial de búsqueda en localStorage
const HISTORIAL_BUSQUEDA_KEY = 'menu_historial_busqueda';

// Función para obtener el historial de búsqueda del localStorage
const obtenerHistorialBusqueda = (): string[] => {
  if (typeof window === 'undefined') return [];

  try {
    const historial = localStorage.getItem(HISTORIAL_BUSQUEDA_KEY);
    return historial ? JSON.parse(historial) : [];
  } catch (error) {
    console.error('Error al obtener historial de búsqueda:', error);
    return [];
  }
};

// Función para guardar el historial de búsqueda en localStorage
const guardarHistorialBusqueda = (historial: string[]) => {
  if (typeof window === 'undefined') return;

  try {
    // Limitar a las últimas 10 búsquedas
    const historialLimitado = historial.slice(0, 10);
    localStorage.setItem(HISTORIAL_BUSQUEDA_KEY, JSON.stringify(historialLimitado));
  } catch (error) {
    console.error('Error al guardar historial de búsqueda:', error);
  }
};

export const BusquedaAvanzada: React.FC<BusquedaAvanzadaProps> = ({
  onSearch,
  categorias,
  atributos = [],
  filtrosRapidos = [],
  productos,
  renderResultado,
  placeholder = 'Buscar producto...'
}) => {
  // Estados para la búsqueda
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [resultados, setResultados] = useState<VersionedProduct[]>([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [indiceSeleccionado, setIndiceSeleccionado] = useState(-1);
  const [historialBusqueda, setHistorialBusqueda] = useState<string[]>([]);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  // Estados para los filtros
  const [categoriasFiltradas, setCategoriasFiltradas] = useState<string[]>([]);
  const [subcategoriasFiltradas, setSubcategoriasFiltradas] = useState<string[]>([]);
  const [atributosFiltrados, setAtributosFiltrados] = useState<string[]>([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Referencias para el manejo del foco
  const inputRef = useRef<HTMLInputElement>(null);
  const resultadosRef = useRef<HTMLDivElement>(null);

  // Cargar historial de búsqueda al montar el componente
  useEffect(() => {
    setHistorialBusqueda(obtenerHistorialBusqueda());
  }, []);

  // Función para realizar la búsqueda
  const realizarBusqueda = useCallback((termino: string = terminoBusqueda) => {
    if (!termino.trim() && categoriasFiltradas.length === 0 &&
      subcategoriasFiltradas.length === 0 && atributosFiltrados.length === 0) {
      setResultados([]);
      setMostrarResultados(false);
      return;
    }

    // Filtrar productos por término de búsqueda
    let productosFiltrados = [...productos];

    if (termino.trim()) {
      const terminoLower = termino.toLowerCase();
      productosFiltrados = productosFiltrados.filter(producto =>
        producto.nombre.toLowerCase().includes(terminoLower) ||
        producto.descripcion.toLowerCase().includes(terminoLower)
      );

      // Agregar al historial si es una búsqueda nueva
      if (termino.trim() && !historialBusqueda.includes(termino)) {
        const nuevoHistorial = [termino, ...historialBusqueda];
        setHistorialBusqueda(nuevoHistorial);
        guardarHistorialBusqueda(nuevoHistorial);
      }
    }

    // Aplicar filtros de categorías
    if (categoriasFiltradas.length > 0) {
      productosFiltrados = productosFiltrados.filter(producto =>
        categoriasFiltradas.includes(producto.categoriaId)
      );
    }

    // Aplicar filtros de subcategorías (si aplica)
    if (subcategoriasFiltradas.length > 0) {
      // Verificar subcategoría en los metadatos (si existe)
      productosFiltrados = productosFiltrados.filter(producto =>
        subcategoriasFiltradas.some(subId => {
          // Verificar si el producto tiene metadatos de subcategoría
          // Esto es solo un ejemplo, ajustar según la estructura real de datos
          return producto.metadata &&
            (producto.metadata as any).subcategoriaId === subId;
        })
      );
    }

    // Aplicar filtros de atributos (si aplica)
    if (atributosFiltrados.length > 0) {
      productosFiltrados = productosFiltrados.filter(producto =>
        atributosFiltrados.every(atributo => {
          // Verificar si el producto tiene el atributo (por ejemplo, vegano, sin gluten, etc.)
          // Esto es solo un ejemplo, ajustar según la estructura real de datos
          return producto.metadata &&
            (producto.metadata as any).atributos?.includes(atributo);
        })
      );
    }

    setResultados(productosFiltrados);
    setMostrarResultados(true);
    setIndiceSeleccionado(-1);

    // Notificar al componente padre sobre los resultados
    onSearch(productosFiltrados);
  }, [terminoBusqueda, productos, categoriasFiltradas, subcategoriasFiltradas, atributosFiltrados, historialBusqueda, onSearch]);

  // Efecto para realizar la búsqueda cuando cambian los filtros
  useEffect(() => {
    realizarBusqueda();
  }, [categoriasFiltradas, subcategoriasFiltradas, atributosFiltrados, realizarBusqueda]);

  // Manejador para cambios en el input de búsqueda
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setTerminoBusqueda(valor);

    if (valor.trim()) {
      realizarBusqueda(valor);
    } else {
      setMostrarResultados(false);
    }
  };

  // Manejador para el foco en el input
  const handleInputFocus = () => {
    if (terminoBusqueda.trim()) {
      setMostrarResultados(true);
    } else if (historialBusqueda.length > 0) {
      setMostrarHistorial(true);
    }
  };

  // Manejador para teclas especiales (navegación con teclado)
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Si no hay resultados, no hacer nada
    if (!mostrarResultados && !mostrarHistorial) return;

    const items = mostrarResultados ? resultados : historialBusqueda;
    const maxIndex = items.length - 1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIndiceSeleccionado(prev => (prev < maxIndex ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setIndiceSeleccionado(prev => (prev > 0 ? prev - 1 : maxIndex));
        break;
      case 'Enter':
        e.preventDefault();
        if (indiceSeleccionado >= 0 && indiceSeleccionado <= maxIndex) {
          if (mostrarResultados) {
            // Seleccionar un resultado
            const productoSeleccionado = resultados[indiceSeleccionado];
            setTerminoBusqueda(productoSeleccionado.nombre);
            setMostrarResultados(false);
            onSearch([productoSeleccionado]);
          } else if (mostrarHistorial) {
            // Seleccionar un elemento del historial
            const terminoSeleccionado = historialBusqueda[indiceSeleccionado];
            setTerminoBusqueda(terminoSeleccionado);
            setMostrarHistorial(false);
            realizarBusqueda(terminoSeleccionado);
          }
        } else if (terminoBusqueda.trim()) {
          // Realizar búsqueda con el término actual
          realizarBusqueda();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setMostrarResultados(false);
        setMostrarHistorial(false);
        break;
    }
  };

  // Manejador para seleccionar un resultado
  const handleSelectResult = (producto: VersionedProduct) => {
    setTerminoBusqueda(producto.nombre);
    setMostrarResultados(false);
    onSearch([producto]);
  };

  // Manejador para seleccionar un elemento del historial
  const handleSelectHistorial = (termino: string) => {
    setTerminoBusqueda(termino);
    setMostrarHistorial(false);
    realizarBusqueda(termino);
  };

  // Manejador para limpiar la búsqueda
  const handleClearSearch = () => {
    setTerminoBusqueda('');
    setMostrarResultados(false);
    setMostrarHistorial(false);
    onSearch([]);
  };

  // Manejador para eliminar un elemento del historial
  const handleRemoveHistorial = (termino: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nuevoHistorial = historialBusqueda.filter(item => item !== termino);
    setHistorialBusqueda(nuevoHistorial);
    guardarHistorialBusqueda(nuevoHistorial);
  };

  // Manejador para alternar filtros de categoría
  const handleToggleCategoria = (categoriaId: string) => {
    setCategoriasFiltradas(prev => {
      if (prev.includes(categoriaId)) {
        return prev.filter(id => id !== categoriaId);
      } else {
        return [...prev, categoriaId];
      }
    });
  };

  // Manejador para alternar filtros de subcategoría
  const handleToggleSubcategoria = (subcategoriaId: string) => {
    setSubcategoriasFiltradas(prev => {
      if (prev.includes(subcategoriaId)) {
        return prev.filter(id => id !== subcategoriaId);
      } else {
        return [...prev, subcategoriaId];
      }
    });
  };

  // Manejador para alternar filtros de atributo
  const handleToggleAtributo = (atributoId: string) => {
    setAtributosFiltrados(prev => {
      if (prev.includes(atributoId)) {
        return prev.filter(id => id !== atributoId);
      } else {
        return [...prev, atributoId];
      }
    });
  };

  // Manejador para aplicar un filtro rápido
  const handleFiltroRapido = (filtro: Record<string, any>) => {
    // Implementar lógica para aplicar filtros rápidos
    // Por ejemplo, si el filtro es { popularidad: "alta" }, filtrar productos populares
    console.log('Aplicando filtro rápido:', filtro);

    // Ejemplo: filtrar por popularidad
    if (filtro.popularidad) {
      const productosFiltrados = productos.filter(producto => {
        // Asumiendo que hay un campo de popularidad en los metadatos
        return producto.metadata &&
          (producto.metadata as any).popularidad === filtro.popularidad;
      });
      setResultados(productosFiltrados);
      setMostrarResultados(true);
      onSearch(productosFiltrados);
    }

    // Ejemplo: filtrar por fecha de creación
    if (filtro.fechaCreacion) {
      const diasAtras = parseInt(filtro.fechaCreacion);
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - diasAtras);

      const productosFiltrados = productos.filter(producto => {
        const fechaCreacion = new Date(producto.metadata?.createdAt);
        return fechaCreacion >= fechaLimite;
      });
      setResultados(productosFiltrados);
      setMostrarResultados(true);
      onSearch(productosFiltrados);
    }
  };

  // Cerrar resultados al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        resultadosRef.current &&
        !resultadosRef.current.contains(e.target as Node)
      ) {
        setMostrarResultados(false);
        setMostrarHistorial(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Calcular si hay filtros activos
  const hayFiltrosActivos = categoriasFiltradas.length > 0 ||
    subcategoriasFiltradas.length > 0 ||
    atributosFiltrados.length > 0;

  return (
    <div className="relative w-full">
      {/* Barra de búsqueda */}
      <div className="relative">
        <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
          <div className="pl-3 text-gray-400">
            <Search size={18} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={terminoBusqueda}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="py-2 px-2 w-full focus:outline-none text-sm"
          />
          {terminoBusqueda && (
            <button
              onClick={handleClearSearch}
              className="px-3 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`px-3 py-2 border-l border-gray-200 ${hayFiltrosActivos ? 'text-spoon-primary' : 'text-gray-500'} hover:bg-gray-50`}
          >
            <Filter size={18} />
            {hayFiltrosActivos && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-spoon-primary rounded-full"></span>
            )}
          </button>
        </div>

        {/* Filtros rápidos */}
        {filtrosRapidos.length > 0 && (
          <div className="flex mt-2 space-x-2 overflow-x-auto pb-1">
            {filtrosRapidos.map((filtro, index) => (
              <button
                key={index}
                onClick={() => handleFiltroRapido(filtro.filtro)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 whitespace-nowrap"
              >
                {filtro.nombre}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Panel de filtros avanzados */}
      {mostrarFiltros && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-sm">Filtros avanzados</h3>
            <button
              onClick={() => setMostrarFiltros(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtros de categorías */}
            <div>
              <h4 className="font-medium text-xs text-gray-500 mb-2">Categorías</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {categorias.map(categoria => (
                  <div key={categoria.id}>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={categoriasFiltradas.includes(categoria.id)}
                        onChange={() => handleToggleCategoria(categoria.id)}
                        className="rounded text-spoon-primary focus:ring-[#F4821F]"
                      />
                      <span className="text-sm">{categoria.nombre}</span>
                    </label>

                    {/* Subcategorías */}
                    {categoria.subcategorias && categoria.subcategorias.length > 0 && (
                      <div className="ml-6 mt-1 space-y-1">
                        {categoria.subcategorias.map(subcategoria => (
                          <label key={subcategoria.id} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={subcategoriasFiltradas.includes(subcategoria.id)}
                              onChange={() => handleToggleSubcategoria(subcategoria.id)}
                              className="rounded text-spoon-primary focus:ring-[#F4821F]"
                            />
                            <span className="text-xs">{subcategoria.nombre}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Filtros de atributos */}
            {atributos.length > 0 && (
              <div>
                <h4 className="font-medium text-xs text-gray-500 mb-2">Atributos</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {atributos.map(atributo => (
                    <label key={atributo.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={atributosFiltrados.includes(atributo.id)}
                        onChange={() => handleToggleAtributo(atributo.id)}
                        className="rounded text-spoon-primary focus:ring-[#F4821F]"
                      />
                      <span className="text-sm">{atributo.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-4 space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setCategoriasFiltradas([]);
                setSubcategoriasFiltradas([]);
                setAtributosFiltrados([]);
              }}
              className="text-xs"
            >
              Limpiar filtros
            </Button>
            <Button
              onClick={() => setMostrarFiltros(false)}
              className="text-xs bg-spoon-primary text-white hover:bg-spoon-primary-dark"
            >
              Aplicar filtros
            </Button>
          </div>
        </div>
      )}

      {/* Resultados de búsqueda */}
      {mostrarResultados && resultados.length > 0 && (
        <div
          ref={resultadosRef}
          className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-auto"
        >
          {resultados.map((producto, index) => (
            <div
              key={producto.id}
              className={`cursor-pointer ${indiceSeleccionado === index ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              onClick={() => handleSelectResult(producto)}
            >
              {renderResultado ? (
                renderResultado(producto)
              ) : (
                <div className="px-4 py-2 flex items-center">
                  {producto.imagen && (
                    <div className="w-10 h-10 mr-3 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={producto.imagen}
                        alt={producto.nombre}
                        width={40}
                        height={40}
                        className="object-cover"
                        unoptimized={producto.imagen.startsWith('blob:')}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{producto.nombre}</div>
                    <div className="text-xs text-gray-500 truncate">{producto.descripcion}</div>
                  </div>
                  <div className="ml-2">
                    <Tag className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Mensaje de no resultados */}
      {mostrarResultados && terminoBusqueda && resultados.length === 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center">
          <p className="text-sm text-gray-500">No se encontraron resultados para &quot;{terminoBusqueda}&quot;</p>
        </div>
      )}

      {/* Historial de búsqueda */}
      {mostrarHistorial && historialBusqueda.length > 0 && !terminoBusqueda && (
        <div
          ref={resultadosRef}
          className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              <span>Búsquedas recientes</span>
            </div>
          </div>
          {historialBusqueda.map((termino, index) => (
            <div
              key={index}
              className={`px-4 py-2 flex items-center justify-between cursor-pointer ${indiceSeleccionado === index ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              onClick={() => handleSelectHistorial(termino)}
            >
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm">{termino}</span>
              </div>
              <button
                onClick={(e) => handleRemoveHistorial(termino, e)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusquedaAvanzada;


























