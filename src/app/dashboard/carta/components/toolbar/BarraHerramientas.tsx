// src/app/dashboard/carta/components/toolbar/BarraHerramientas.tsx
import { useState } from 'react';
import { Search, Filter, Download, Upload, MoreVertical } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/DropdownMenu';
import { toast } from 'sonner';

interface FiltrosState {
  busqueda: string;
  categoria: string;
  estado: string;
}

export function BarraHerramientas() {
  const [filtros, setFiltros] = useState<FiltrosState>({
    busqueda: '',
    categoria: '',
    estado: ''
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const handleExportar = async (formato: 'csv' | 'excel') => {
    try {
      // Simular exportación
      toast.success(`Exportando carta en formato ${formato.toUpperCase()}...`);
      
      // En una implementación real, aquí se haría la exportación
      setTimeout(() => {
        toast.success(`Carta exportada exitosamente en formato ${formato.toUpperCase()}`);
      }, 2000);
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al exportar la carta');
    }
  };

  const handleImportar = () => {
    toast.info('Funcionalidad de importación en desarrollo');
  };

  const handleActualizarPrecios = () => {
    toast.info('Funcionalidad de actualización de precios en desarrollo');
  };

  const handleDuplicarCarta = () => {
    toast.info('Funcionalidad de duplicación de carta en desarrollo');
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Barra superior */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
            <Input
              value={filtros.busqueda}
              onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
              placeholder="Buscar productos..."
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={mostrarFiltros ? 'bg-neutral-100' : ''}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Exportar
                <Download className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExportar('csv')}>
                Exportar a CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportar('excel')}>
                Exportar a Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleImportar}>
                <Upload className="mr-2 h-4 w-4" />
                Importar productos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleActualizarPrecios}>
                Actualizar precios
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicarCarta}>
                Duplicar carta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Panel de filtros */}
      {mostrarFiltros && (
        <div className="bg-neutral-50 p-4 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Categoría
              </label>
              <select
                value={filtros.categoria}
                onChange={(e) => setFiltros(prev => ({ ...prev, categoria: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las categorías</option>
                <option value="entrada">Entradas</option>
                <option value="principio">Principios</option>
                <option value="proteina">Proteínas</option>
                <option value="acompanamiento">Acompañamientos</option>
                <option value="bebida">Bebidas</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Estado
              </label>
              <select
                value={filtros.estado}
                onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="draft">Borrador</option>
                <option value="archived">Archivado</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFiltros({ busqueda: '', categoria: '', estado: '' })}
                className="w-full"
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
