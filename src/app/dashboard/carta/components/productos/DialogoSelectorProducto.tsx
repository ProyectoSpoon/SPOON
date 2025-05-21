import { useState } from 'react';
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
import { useEffect } from 'react';
;
import { db } from '@/firebase/config';

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
    const obtenerNombreColeccion = (id: string): string => {
      console.log('=== Debug Info ===');
      console.log('ID de categoría recibido:', id);
      console.log('Tipo de ID:', typeof id);
      
      // Convertir el ID a minúsculas para hacer la comparación más robusta
      const idLowerCase = id.toLowerCase();
      console.log('ID en minúsculas:', idLowerCase);

      // Mapa actualizado de IDs a nombres de colección
      const colecciones: Record<string, string> = {
        'entrada': 'Entrada',
        'entradas': 'Entrada',
        'principio': 'Principio',
        'principios': 'Principio',
        'proteina': 'Proteina',
        'proteinas': 'Proteina',
        'acompanamiento': 'Acompanamientos',
        'acompanamientos': 'Acompanamientos',
        'bebida': 'Bebida',
        'bebidas': 'Bebida',
        // Variantes con prefijo por si acaso
        'categoria-entrada': 'Entrada',
        'categoria-principio': 'Principio',
        'categoria-proteina': 'Proteina',
        'categoria-acompanamiento': 'Acompanamientos',
        'categoria-bebida': 'Bebida'
      };

      console.log('Colecciones disponibles:', Object.keys(colecciones));
      const coleccion = colecciones[idLowerCase];
      console.log('Colección encontrada:', coleccion);

      if (!coleccion) {
        console.error('ID de categoría no reconocido:', id);
        throw new Error(`Categoría no reconocida: ${id}`);
      }

      return coleccion;
    };

    const cargarProductos = async () => {
      if (!categoriaId || !open) {
        console.log('No se ejecuta la carga:', { categoriaId, open });
        return;
      }
      
      setEstaCargando(true);
      setError(null);
      
      try {
        console.log('Iniciando carga de productos para categoría:', categoriaId);
        const coleccionName = obtenerNombreColeccion(categoriaId);
        console.log('Nombre de colección a consultar:', coleccionName);

        const productosRef = collection(db, coleccionName);
        console.log('Referencia de colección creada');
        
        const snapshot = await getDocs(productosRef);
        console.log('Snapshot obtenido, documentos:', snapshot.size);
        
        if (snapshot.empty) {
          console.log('No se encontraron documentos');
          setProductos([]);
          return;
        }

        const productosData = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Datos del documento:', data);
          
          let nombre = '';

          // Manejar diferentes estructuras de datos según la colección
          switch(coleccionName) {
            case 'Entrada':
              nombre = data.Entrada || '';
              console.log('Procesando entrada:', nombre);
              break;
            case 'Principio':
              nombre = data.Principio || '';
              console.log('Procesando principio:', nombre);
              break;
            case 'Proteina':
              nombre = data['Tipo de Proteína'] || '';
              console.log('Procesando proteína:', nombre);
              break;
            case 'Acompanamientos':
              nombre = data.Acompanamiento || '';
              console.log('Procesando acompañamiento:', nombre);
              break;
            case 'Bebida':
              nombre = data['Tipo de Bebida'] || '';
              console.log('Procesando bebida:', nombre);
              break;
          }

          const producto = {
            id: doc.id,
            nombre: nombre,
            descripcion: data.Descripción || data.Descripcion || '',
            tipo: coleccionName,
            precio: data.precio || 0
          };

          console.log('Producto procesado:', producto);
          return producto;
        }).filter(producto => {
          const esValido = producto.nombre && producto.descripcion;
          if (!esValido) {
            console.log('Producto filtrado por falta de datos:', producto);
          }
          return esValido;
        });

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