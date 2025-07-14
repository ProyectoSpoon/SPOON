import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/Dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/Select";
import { Button } from "@/shared/components/ui/Button";

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  precio: number;
}

interface DialogoSelectorProductoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductoSeleccionado: (producto: Producto) => void;
  categoriaId: string | null;
}

// Mock data para desarrollo
const MOCK_PRODUCTOS: Record<string, Producto[]> = {
  'entrada': [
    { id: '1', nombre: 'Sopa de Guineo', descripcion: 'Sopa tradicional con plátano verde', tipo: 'entrada', precio: 8500 },
    { id: '2', nombre: 'Ajiaco', descripcion: 'Sopa típica con tres tipos de papa, pollo y guascas', tipo: 'entrada', precio: 12000 },
  ],
  'principio': [
    { id: '3', nombre: 'Frijoles', descripcion: 'Frijoles rojos cocinados con plátano y costilla', tipo: 'principio', precio: 15000 },
    { id: '4', nombre: 'Arroz con Coco', descripcion: 'Arroz preparado con leche de coco', tipo: 'principio', precio: 10000 },
  ],
  'proteina': [
    { id: '5', nombre: 'Pollo Asado', descripcion: 'Pollo marinado y asado a la parrilla', tipo: 'proteina', precio: 18000 },
    { id: '6', nombre: 'Pescado Frito', descripcion: 'Pescado fresco frito con especias', tipo: 'proteina', precio: 20000 },
  ],
  'acompanamiento': [
    { id: '7', nombre: 'Patacones', descripcion: 'Plátano verde frito y aplastado', tipo: 'acompanamiento', precio: 6000 },
    { id: '8', nombre: 'Yuca Frita', descripcion: 'Yuca cortada en bastones y frita', tipo: 'acompanamiento', precio: 5000 },
  ],
  'bebida': [
    { id: '9', nombre: 'Limonada Natural', descripcion: 'Limonada fresca con agua o leche', tipo: 'bebida', precio: 4000 },
    { id: '10', nombre: 'Jugo de Maracuyá', descripcion: 'Jugo natural de maracuyá', tipo: 'bebida', precio: 4500 },
  ],
};

export function DialogoSelectorProducto({
  open,
  onOpenChange,
  onProductoSeleccionado,
  categoriaId
}: DialogoSelectorProductoProps) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [estaCargando, setEstaCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarProductos = async () => {
      if (!categoriaId || !open) {
        console.log('No se ejecuta la carga:', { categoriaId, open });
        return;
      }
      
      setEstaCargando(true);
      setError(null);
      
      try {
        console.log('Iniciando carga de productos para categoría:', categoriaId);
        
        // Simular delay de carga
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const categoriaKey = categoriaId.toLowerCase();
        const productosData = MOCK_PRODUCTOS[categoriaKey] || [];
        
        console.log('Total de productos procesados:', productosData.length);
        setProductos(productosData);
        setError(null);
      } catch (error) {
        console.error('Error detallado al cargar productos:', error);
        if (error instanceof Error) {
          setError(`Error al cargar los productos: ${error.message}`);
        } else {
          setError('Error al cargar los productos. Por favor, intenta de nuevo.');
        }
      } finally {
        setEstaCargando(false);
        console.log('Proceso de carga finalizado');
      }
    };

    if (open) {
      console.log('Dialog abierto, iniciando carga de productos');
      cargarProductos();
    }
  }, [categoriaId, open]);

  const handleSeleccionProducto = (productoId: string) => {
    const producto = productos.find(p => p.id === productoId);
    if (producto) {
      setProductoSeleccionado(producto);
    }
  };

  const handleAgregar = () => {
    if (productoSeleccionado) {
      onProductoSeleccionado(productoSeleccionado);
      onOpenChange(false);
      setProductoSeleccionado(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Seleccionar Producto</DialogTitle>
          <DialogDescription>
            Elige un producto de la lista para agregarlo al menú
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {estaCargando ? (
            <div className="flex items-center justify-center p-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-md">
              {error}
              <div className="mt-2 text-sm">
                ID de categoría: {categoriaId}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Select onValueChange={handleSeleccionProducto}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Selecciona un producto" />
                </SelectTrigger>
                <SelectContent 
                  position="popper" 
                  className="bg-white min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border shadow-md z-50"
                  align="start"
                  side="bottom"
                  sideOffset={4}
                >
                  <div className="max-h-[300px] overflow-y-auto">
                    {productos.map((producto) => (
                      <SelectItem
                        key={producto.id}
                        value={producto.id}
                        className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100 px-3 py-2"
                      >
                        {producto.nombre}
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>

              {productoSeleccionado && (
                <div className="p-4 bg-gray-50 rounded-md">
                  <h4 className="font-medium mb-2">Descripción:</h4>
                  <p className="text-sm text-gray-600">
                    {productoSeleccionado.descripcion}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Precio: ${productoSeleccionado.precio.toLocaleString()}
                  </p>
                </div>
              )}

              {productos.length === 0 && !estaCargando && !error && (
                <div className="text-center text-gray-500">
                  No hay productos disponibles en esta categoría
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAgregar}
            disabled={!productoSeleccionado || estaCargando}
          >
            Agregar Producto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


























