// src/app/dashboard/carta/components/toolbar/PanelFiltros.tsx
import { useCategoriasStore } from '../../store/categoriasStore';
import { useProductosStore } from '../../store/productosStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/Select';
import { Badge } from '@/shared/components/ui/Badge';

export function PanelFiltros() {
  const { categorias } = useCategoriasStore();
  const { filtros, setFiltros } = useProductosStore();

  return (
    <div className="p-4 bg-white border rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filtros aplicados</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFiltros({
            busqueda: '',
            categoria: null,
            estado: 'todos'
          })}
        >
          Limpiar filtros
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Categoría</label>
          <Select
            value={filtros.categoria || 'todas'}
            onValueChange={(value) => setFiltros({
              categoria: value === 'todas' ? null : value
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las categorías</SelectItem>
              {categorias.map((cat) => (
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
            value={filtros.estado}
            onValueChange={(value: typeof filtros.estado) => 
              setFiltros({ estado: value })
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
        {filtros.categoria && (
          <Badge variant="secondary" className="flex items-center gap-1">
            {categorias.find(c => c.id === filtros.categoria)?.nombre}
            <button
              onClick={() => setFiltros({ categoria: null })}
              className="ml-1 hover:text-neutral-900"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {filtros.estado !== 'todos' && (
          <Badge variant="secondary" className="flex items-center gap-1">
            {filtros.estado === 'activo' ? 'Activos' : 'Inactivos'}
            <button
              onClick={() => setFiltros({ estado: 'todos' })}
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