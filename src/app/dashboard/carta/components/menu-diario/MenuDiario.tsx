import { Trash2 } from 'lucide-react';
import { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';
import { Button } from '@/shared/components/ui/Button';

interface MenuDiarioProps {
  productos: VersionedProduct[];
  onRemoveProduct?: (productId: string) => void;
}

export const productosEjemplo: VersionedProduct[] = [
  {
    id: 'e1',
    nombre: 'Sopa de Guineo',
    descripcion: 'Sopa tradicional con plátano verde',
    currentPrice: 8500,
    categoriaId: 'entrada',
    currentVersion: 1,
    priceHistory: [],
    versions: [],
    stock: {
      currentQuantity: 10,
      minQuantity: 5,
      maxQuantity: 100,
      status: 'in_stock',
      lastUpdated: new Date(),
      alerts: {
        lowStock: false,
        overStock: false,
        thresholds: { low: 10, high: 90 }
      }
    },
    status: 'active',
    metadata: {
      createdAt: new Date(),
      createdBy: 'system',
      lastModified: new Date(),
      lastModifiedBy: 'system'
    }
  },
  {
    id: 'e2',
    nombre: 'Ajiaco',
    descripcion: 'Sopa típica con tres tipos de papa, pollo y guascas',
    currentPrice: 12000,
    categoriaId: 'entrada',
    currentVersion: 1,
    priceHistory: [],
    versions: [],
    stock: {
      currentQuantity: 15,
      minQuantity: 5,
      maxQuantity: 100,
      status: 'in_stock',
      lastUpdated: new Date(),
      alerts: {
        lowStock: false,
        overStock: false,
        thresholds: { low: 10, high: 90 }
      }
    },
    status: 'active',
    metadata: {
      createdAt: new Date(),
      createdBy: 'system',
      lastModified: new Date(),
      lastModifiedBy: 'system'
    }
  },
  {
    id: 'p1',
    nombre: 'Frijoles',
    descripcion: 'Frijoles rojos cocinados con platano y costilla',
    currentPrice: 15000,
    categoriaId: 'principio',
    currentVersion: 1,
    priceHistory: [],
    versions: [],
    stock: {
      currentQuantity: 20,
      minQuantity: 5,
      maxQuantity: 100,
      status: 'in_stock',
      lastUpdated: new Date(),
      alerts: {
        lowStock: false,
        overStock: false,
        thresholds: { low: 10, high: 90 }
      }
    },
    status: 'active',
    metadata: {
      createdAt: new Date(),
      createdBy: 'system',
      lastModified: new Date(),
      lastModifiedBy: 'system'
    }
  }
];

export function MenuDiario({ productos = [], onRemoveProduct }: MenuDiarioProps) {
  // Usar solo los productos proporcionados, sin fallback a productosEjemplo
  console.log('MenuDiario - Productos a mostrar:', {
    productosEnviadosCount: productos.length
  });
 
  const nombresCategorias: Record<string, string> = {
    'entrada': 'Entradas',
    'principio': 'Principios',
    'proteina': 'Proteínas',
    'acompanamiento': 'Acompañamientos',
    'bebida': 'Bebidas'
  };
 
  const productosPorCategoria = productos.reduce((acc: Record<string, { nombre: string, productos: VersionedProduct[] }>, producto) => {
    const nombreCategoria = nombresCategorias[producto.categoriaId] || producto.categoriaId;
    
    if (!acc[producto.categoriaId]) {
      acc[producto.categoriaId] = {
        nombre: nombreCategoria,
        productos: []
      };
    }
    
    acc[producto.categoriaId].productos.push(producto);
    return acc;
  }, {});
 
  if (productos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <p className="text-neutral-500 text-center text-xs">
          Selecciona productos para comenzar a armar el menú
        </p>
      </div>
    );
  }
 
  return (
    <div className="space-y-3">
      {Object.entries(productosPorCategoria).map(([categoriaId, categoria]) => (
        <div key={categoriaId} className="relative pl-3 border-l-2 border-[#F4821F]">
          <h3 className="font-medium text-gray-900 mb-2 pl-1 text-xs">{categoria.nombre}</h3>
          <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {categoria.productos.map((producto: VersionedProduct) => (
                <div key={producto.id} className="grid grid-cols-[220px_1fr_50px] hover:bg-gray-50">
                  <div className="py-2 px-3 border-r border-gray-100">
                    <span className="text-gray-900 text-xs">{producto.nombre}</span>
                  </div>
                  <div className="py-2 px-3">
                    <span className="text-gray-600 text-xs">{producto.descripcion}</span>
                  </div>
                  <div className="py-2 px-1 flex items-center justify-center">
                    {onRemoveProduct && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-50 p-1 h-6 w-6"
                        onClick={() => onRemoveProduct(producto.id)}
                        title="Eliminar del menú"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
