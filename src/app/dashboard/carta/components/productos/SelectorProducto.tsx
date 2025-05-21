import { useEffect, useState } from 'react';
import { Card } from "@/shared/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/Select";
;
import { db } from '@/firebase/config';

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
        let coleccionName: string;
        // Determinar la colección basada en el ID de la categoría
        switch(categoriaId) {
          case 'principios':
            coleccionName = 'Principio';
            break;
          case 'proteinas':
            coleccionName = 'Proteina';
            break;
          case 'acompañamientos':
            coleccionName = 'Acompanamientos';
            break;
          case 'bebidas':
            coleccionName = 'Bebida';
            break;
          case 'entradas':
            coleccionName = 'Entrada';
            break;
          default:
            console.log('ID de categoría recibido:', categoriaId);
            throw new Error('Categoría no reconocida');
        }

        const productosRef = collection(db, coleccionName);
        const snapshot = await getDocs(productosRef);
        
        if (snapshot.empty) {
          setProductos([]);
          return;
        }

        const productosData = snapshot.docs.map(doc => {
          const data = doc.data();
          const nombre = 
            data[coleccionName] || 
            data['Tipo de Proteína'] || 
            data.Entrada || 
            data['Tipo de Bebida'] || 
            data.Acompanamiento || '';

          return {
            id: doc.id,
            nombre: nombre,
            descripcion: data.Descripción || data.Descripcion || '',
            tipo: coleccionName,
            precio: data.precio || 0
          };
        }).filter(producto => producto.nombre && producto.descripcion);

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