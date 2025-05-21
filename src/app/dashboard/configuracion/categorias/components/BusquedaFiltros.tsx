'use client';

import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Search, Save, X } from 'lucide-react';

interface BusquedaFiltrosProps {
  searchTerm: string;
  showInactive: boolean;
  onSearchChange: (value: string) => void;
  onShowInactiveChange: (value: boolean) => void;
  onGuardarConfiguracion: () => void;
}

export function BusquedaFiltros({
  searchTerm,
  showInactive,
  onSearchChange,
  onShowInactiveChange,
  onGuardarConfiguracion
}: BusquedaFiltrosProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-lg shadow-sm">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 py-2 w-full"
        />
        {searchTerm && (
          <button 
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <label className="flex items-center space-x-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={() => onShowInactiveChange(!showInactive)}
            className="rounded text-[#F4821F] focus:ring-[#F4821F]"
          />
          <span>Mostrar inactivos</span>
        </label>
        
        <Button 
          onClick={onGuardarConfiguracion}
          className="bg-[#F4821F] hover:bg-[#E67812] text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          Guardar
        </Button>
      </div>
    </div>
  );
}
