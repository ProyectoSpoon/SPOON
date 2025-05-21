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
import { useProductosStore } from '../../store/productosStore';
import { exportarCarta } from '../../utils/exportacion';

export function BarraHerramientas() {
  const { filtros, setFiltros } = useProductosStore();
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const handleExportar = async () => {
    try {
      const blob = await exportarCarta([], [], { formatoSalida: 'csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `carta-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al exportar:', error);
    }
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
              onChange={(e) => setFiltros({ busqueda: e.target.value })}
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
              <DropdownMenuItem onClick={() => handleExportar()}>
                Exportar a CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportar()}>
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
              <DropdownMenuItem>
                <Upload className="mr-2 h-4 w-4" />
                Importar productos
              </DropdownMenuItem>
              <DropdownMenuItem>
                Actualizar precios
              </DropdownMenuItem>
              <DropdownMenuItem>
                Duplicar carta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Panel de filtros */}
      {mostrarFiltros && <PanelFiltros />}
    </div>
  );
}