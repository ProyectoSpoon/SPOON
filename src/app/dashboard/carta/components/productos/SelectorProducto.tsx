import { useEffect, useState } from 'react';
import { Card } from "@/shared/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/Select";

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  precio: number;
}

interface SelectorProductoProps {
  categoriaId: string | null;
  onProductoSeleccionado: (producto: Producto) => void;
  className?: string;
}

// Mock data para desarrollo
const MOCK_PRODUCTOS: Record<string, Producto[]> = {
  'principios': [
    { id: '1', nombre: 'Frijoles', descripcion: 'Frijoles rojos cocinados con plátano y costilla', tipo: 'principio', precio: 15000 },
    { id: '2', nombre: 'Arroz con Coco', descripcion: 'Arroz preparado con leche de coco', tipo: 'principio', precio: 10000 },
  ],
  'proteinas': [
    { id: '3', nombre: 'Pollo Asado', descripcion: 'Pollo marinado y asado a la parrilla', tipo: 'proteina', precio: 18000 },
    { id: '4', nombre: 'Pescado Frito', descripcion: 'Pescado fresco frito con especias', tipo: 'proteina', precio: 20000 },
  ],
  'acompañamientos': [
    { id: '5', nombre: 'Patacones', descripcion: 'Plátano verde frito y aplastado', tipo: 'acompanamiento', precio: 6000 },
    { id: '6', nombre: 'Yuca Frita', descripcion: 'Yuca cortada en bastones y frita', tipo: 'acompanamiento', precio: 5000 },
  ],
  'bebidas': [
    { id: '7', nombre: 'Limonada Natural', descripcion: 'Limonada fresca con agua o leche', tipo: 'bebida', precio: 4000 },
    { id: '8', nombre: 'Jugo de Maracuyá', descripcion: 'Jugo natural de maracuyá', tipo: 'bebida', precio: 4500 },
  ],
  'entradas': [
    { id: '9', nombre: 'Sopa de Guineo', descripcion: 'Sopa tradicional con plátano verde', tipo: 'entrada', precio: 8500 },
    { id: '10', nombre: 'Ajiaco', descripcion: 'Sopa típica con tres tipos de papa, pollo y guascas', tipo: 'entrada', precio: 12000 },
  ],
};

export function SelectorProducto({
  categoriaId,
  onProductoSeleccionado,
  className = ''
}: SelectorProductoProps) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [estaCargando, setEstaCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarProductos = async () => {
      if (!categoriaId) return;
      
      setEstaCargando(true);
      setError(null);
      
      try {
        // Simular delay de carga
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const productosData = MOCK_PRODUCTOS[categoriaId] || [];
        setProductos(productosData);
        setError(null);
      } catch (error) {
        console.error('Error al cargar productos:', error);
        setError('Error al cargar los productos. Por favor, intenta de nuevo.');
      } finally {
        setEstaCargando(false);
      }
    };

    cargarProductos();
  }, [categoriaId]);

  const handleSeleccionProducto = (productoId: string) => {
    const productoSeleccionado = productos.find(p => p.id === productoId);
    if (productoSeleccionado) {
      onProductoSeleccionado(productoSeleccionado);
    }
  };

  if (!categoriaId) {
    return null;
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Seleccionar Producto</h3>
          <p className="text-sm text-gray-500">
            Elige un producto de la categoría seleccionada
          </p>
        </div>

        {estaCargando ? (
          <div className="flex items-center justify-center p-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        ) : (
          <Select onValueChange={handleSeleccionProducto}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona un producto" />
            </SelectTrigger>
            <SelectContent>
              {productos.map((producto) => (
                <SelectItem 
                  key={producto.id} 
                  value={producto.id}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{producto.nombre}</span>
                    <span className="text-sm text-gray-500 truncate">
                      {producto.descripcion}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {productos.length === 0 && !estaCargando && !error && (
          <div className="text-center text-gray-500 py-2">
            No hay productos disponibles en esta categoría
          </div>
        )}
      </div>
    </Card>
  );
}
