// src/app/dashboard/carta/components/toolbar/PanelFiltros.tsx
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/Select';
import { Badge } from '@/shared/components/ui/Badge';

interface Filtros {
  busqueda: string;
  categoria: string | null;
  estado: 'todos' | 'activo' | 'inactivo';
}

interface PanelFiltrosProps {
  filtros?: Filtros;
  onFiltrosChange?: (filtros: Partial<Filtros>) => void;
}

// Mock data para categorías
const CATEGORIAS_MOCK = [
  { id: 'entrada', nombre: 'Entradas' },
  { id: 'principio', nombre: 'Principios' },
  { id: 'proteina', nombre: 'Proteínas' },
  { id: 'acompanamiento', nombre: 'Acompañamientos' },
  { id: 'bebida', nombre: 'Bebidas' },
];

export function PanelFiltros({ 
  filtros = { busqueda: '', categoria: null, estado: 'todos' },
  onFiltrosChange = () => {}
}: PanelFiltrosProps) {
  const [filtrosLocales, setFiltrosLocales] = useState<Filtros>(filtros);

  const actualizarFiltros = (nuevosFiltros: Partial<Filtros>) => {
    const filtrosActualizados = { ...filtrosLocales, ...nuevosFiltros };
    setFiltrosLocales(filtrosActualizados);
    onFiltrosChange(nuevosFiltros);
  };

  const limpiarFiltros = () => {
    const filtrosVacios = { busqueda: '', categoria: null, estado: 'todos' as const };
    setFiltrosLocales(filtrosVacios);
    onFiltrosChange(filtrosVacios);
  };

  return (
    <div className="p-4 bg-white border rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filtros aplicados</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={limpiarFiltros}
        >
          Limpiar filtros
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Categoría</label>
          <Select
            value={filtrosLocales.categoria || 'todas'}
            onValueChange={(value) => actualizarFiltros({
              categoria: value === 'todas' ? null : value
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las categorías</SelectItem>
              {CATEGORIAS_MOCK.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Estado</label>
          <Select
            value={filtrosLocales.estado}
            onValueChange={(value: 'todos' | 'activo' | 'inactivo') => 
              actualizarFiltros({ estado: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="activo">Activos</SelectItem>
              <SelectItem value="inactivo">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Badges de filtros activos */}
      <div className="flex flex-wrap gap-2 pt-2">
        {filtrosLocales.categoria && (
          <Badge className="flex items-center gap-1">
            {CATEGORIAS_MOCK.find(c => c.id === filtrosLocales.categoria)?.nombre}
            <button
              onClick={() => actualizarFiltros({ categoria: null })}
              className="ml-1 hover:text-neutral-900"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {filtrosLocales.estado !== 'todos' && (
          <Badge className="flex items-center gap-1">
            {filtrosLocales.estado === 'activo' ? 'Activos' : 'Inactivos'}
            <button
              onClick={() => actualizarFiltros({ estado: 'todos' })}
              className="ml-1 hover:text-neutral-900"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
      </div>
    </div>
  );
}


























