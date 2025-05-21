'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Star, Clock, Calendar, Plus } from 'lucide-react';
import type { MenuCombinacion } from '../types/programacion.types';

// Tipo para los días de la semana
type DiaSemana = keyof typeof DIAS_SEMANA;
const DIAS_SEMANA = {
  'Lunes': { index: 0 },
  'Martes': { index: 1 },
  'Miércoles': { index: 2 },
  'Jueves': { index: 3 },
  'Viernes': { index: 4 },
  'Sábado': { index: 5 },
  'Domingo': { index: 6 }
} as const;

interface CombinacionesViewerProps {
  combinaciones: MenuCombinacion[];
  onAddToDia: (combinacion: MenuCombinacion) => void;
  onViewDetails?: (combinacion: MenuCombinacion) => void;
  loading?: boolean;
  diaSeleccionado?: DiaSemana;
}

export const CombinacionesViewer: React.FC<CombinacionesViewerProps> = ({
  combinaciones,
  onAddToDia,
  onViewDetails,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCombinaciones, setFilteredCombinaciones] = useState<MenuCombinacion[]>(combinaciones);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    onlyEspeciales: false,
    onlyFavoritos: false,
    minPrecio: 0,
    maxPrecio: 100000
  });

  // Actualizar combinaciones filtradas cuando cambian las combinaciones o los filtros
  useEffect(() => {
    let filtered = [...combinaciones];
    
    // Aplicar búsqueda por texto
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(comb => 
        comb.nombre?.toLowerCase().includes(term) ||
        comb.entrada.nombre.toLowerCase().includes(term) ||
        comb.principio.nombre.toLowerCase().includes(term) ||
        comb.proteina.nombre.toLowerCase().includes(term) ||
        comb.bebida.nombre.toLowerCase().includes(term) ||
        comb.acompanamiento.some(a => a.nombre.toLowerCase().includes(term))
      );
    }
    
    // Aplicar filtros
    if (filters.onlyEspeciales) {
      filtered = filtered.filter(comb => comb.especial);
    }
    
    if (filters.onlyFavoritos) {
      filtered = filtered.filter(comb => comb.favorito);
    }
    
    // Filtrar por precio
    filtered = filtered.filter(comb => {
      const precio = comb.precioEspecial || 
        (comb.entrada.precio + comb.principio.precio + comb.proteina.precio + 
         comb.bebida.precio + comb.acompanamiento.reduce((sum, a) => sum + a.precio, 0));
      return precio >= filters.minPrecio && precio <= filters.maxPrecio;
    });
    
    setFilteredCombinaciones(filtered);
  }, [combinaciones, searchTerm, filters]);

  // Función para obtener el nombre de la combinación
  const getNombreCombinacion = (combinacion: MenuCombinacion) => {
    if (combinacion.nombre) return combinacion.nombre;
    
    const partes = [];
    if (combinacion.entrada?.nombre) partes.push(combinacion.entrada.nombre);
    if (combinacion.principio?.nombre) partes.push(combinacion.principio.nombre);
    if (combinacion.proteina?.nombre) partes.push(combinacion.proteina.nombre);
    if (combinacion.bebida?.nombre) partes.push(combinacion.bebida.nombre);
    
    return partes.length > 0 ? partes.join(' + ') : 'Combinación sin nombre';
  };

  // Función para calcular el precio total de una combinación
  const getPrecioCombinacion = (combinacion: MenuCombinacion) => {
    if (combinacion.precioEspecial) return combinacion.precioEspecial;
    
    return combinacion.entrada.precio + 
           combinacion.principio.precio + 
           combinacion.proteina.precio + 
           combinacion.bebida.precio + 
           combinacion.acompanamiento.reduce((sum, a) => sum + a.precio, 0);
  };

  // Función para formatear precio como moneda
  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold">Combinaciones Disponibles</h2>
        
        {/* Barra de búsqueda */}
        <div className="mt-3 relative">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <div className="pl-3 text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar combinación..."
              className="py-2 px-2 w-full focus:outline-none text-sm"
            />
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 border-l border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              <Filter size={18} />
            </button>
          </div>
          
          {/* Panel de filtros */}
          {showFilters && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4">
              <div className="space-y-3">
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.onlyEspeciales}
                      onChange={() => setFilters({...filters, onlyEspeciales: !filters.onlyEspeciales})}
                      className="rounded text-[#F4821F] focus:ring-[#F4821F]"
                    />
                    <span className="text-sm">Solo especiales</span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.onlyFavoritos}
                      onChange={() => setFilters({...filters, onlyFavoritos: !filters.onlyFavoritos})}
                      className="rounded text-[#F4821F] focus:ring-[#F4821F]"
                    />
                    <span className="text-sm">Solo favoritos</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm mb-1">Rango de precio</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={filters.minPrecio}
                      onChange={(e) => setFilters({...filters, minPrecio: Number(e.target.value)})}
                      className="w-1/2 border border-gray-200 rounded p-1 text-sm"
                      placeholder="Mínimo"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={filters.maxPrecio}
                      onChange={(e) => setFilters({...filters, maxPrecio: Number(e.target.value)})}
                      className="w-1/2 border border-gray-200 rounded p-1 text-sm"
                      placeholder="Máximo"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setFilters({
                        onlyEspeciales: false,
                        onlyFavoritos: false,
                        minPrecio: 0,
                        maxPrecio: 100000
                      });
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 mr-3"
                  >
                    Limpiar
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-sm bg-[#F4821F] text-white px-3 py-1 rounded hover:bg-[#E67812]"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Lista de combinaciones */}
      <div className="p-2">
        {loading ? (
          <div className="flex justify-center items-center py-6">
            <div className="w-6 h-6 border-2 border-t-[#F4821F] border-r-[#F4821F] border-b-gray-200 border-l-gray-200 rounded-full animate-spin"></div>
          </div>
        ) : filteredCombinaciones.length > 0 ? (
          <div className="space-y-2">
            {filteredCombinaciones.map((combinacion) => (
              <div
                key={combinacion.id}
                className="p-2 border rounded-lg hover:border-[#F4821F] transition-colors group"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('combinacion', JSON.stringify(combinacion));
                }}
              >
                <div className="flex justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-xs font-medium">
                        {getNombreCombinacion(combinacion)}
                      </h3>
                      {combinacion.favorito && (
                        <Star className="ml-1 h-3 w-3 text-yellow-400 fill-yellow-400" />
                      )}
                      {combinacion.especial && (
                        <span className="ml-1 text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                          Especial
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-1 text-[10px] text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        <span className="inline-flex items-center px-1 py-0.5 rounded bg-orange-100 text-orange-800">
                          {combinacion.entrada.nombre}
                        </span>
                        <span className="inline-flex items-center px-1 py-0.5 rounded bg-yellow-100 text-yellow-800">
                          {combinacion.principio.nombre}
                        </span>
                        <span className="inline-flex items-center px-1 py-0.5 rounded bg-red-100 text-red-800">
                          {combinacion.proteina.nombre}
                        </span>
                        <span className="inline-flex items-center px-1 py-0.5 rounded bg-blue-100 text-blue-800">
                          {combinacion.bebida.nombre}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-1">
                      <div className="text-xs font-medium">
                        {formatearPrecio(getPrecioCombinacion(combinacion))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-2 flex flex-col space-y-1">
                    <button
                      onClick={() => onAddToDia(combinacion)}
                      className="p-1 text-[#F4821F] hover:bg-orange-50 rounded-full transition-colors"
                      title="Agregar a día seleccionado"
                    >
                      <Plus size={14} />
                    </button>
                    
                    {onViewDetails && (
                      <button
                        onClick={() => onViewDetails(combinacion)}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                        title="Ver detalles"
                      >
                        <Calendar size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No se encontraron combinaciones</p>
            {searchTerm && (
              <p className="text-gray-400 text-xs mt-1">
                Intenta con otros términos de búsqueda
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CombinacionesViewer;
