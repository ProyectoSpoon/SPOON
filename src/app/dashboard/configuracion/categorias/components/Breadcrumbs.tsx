'use client';

import { ChevronRight } from 'lucide-react';
import { TipoRestaurante, Categoria } from '../types/tipos';

interface BreadcrumbsProps {
  currentView: 'tipos' | 'categorias' | 'subcategorias';
  tipoActual: TipoRestaurante | null;
  categoriaActual: Categoria | null;
  onViewChange: (view: 'tipos' | 'categorias' | 'subcategorias') => void;
}

export function Breadcrumbs({
  currentView,
  tipoActual,
  categoriaActual,
  onViewChange
}: BreadcrumbsProps) {
  return (
    <div className="flex items-center text-sm mb-4 bg-gray-50 p-3 rounded-lg">
      <button 
        onClick={() => onViewChange('tipos')}
        className={`${currentView === 'tipos' ? 'font-semibold text-spoon-primary' : 'text-gray-600 hover:text-spoon-primary'}`}
      >
        Tipos de Restaurante
      </button>
      
      {tipoActual && (
        <>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <button 
            onClick={() => onViewChange('categorias')}
            className={`${currentView === 'categorias' ? 'font-semibold text-spoon-primary' : 'text-gray-600 hover:text-spoon-primary'}`}
          >
            {tipoActual.nombre}
          </button>
        </>
      )}
      
      {categoriaActual && (
        <>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <button 
            onClick={() => onViewChange('subcategorias')}
            className={`${currentView === 'subcategorias' ? 'font-semibold text-spoon-primary' : 'text-gray-600 hover:text-spoon-primary'}`}
          >
            {categoriaActual.nombre}
          </button>
        </>
      )}
    </div>
  );
}
























