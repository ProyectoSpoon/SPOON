'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Eye, Loader2, Plus, Trash2 } from 'lucide-react';
import { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/Dialog";
import Image from 'next/image';
import { toast } from 'sonner';
import { jsonDataService } from '@/services/json-data.service';

// Productos hardcodeados por subcategoría (versión simplificada)
const PRODUCTOS_HARDCODED: Record<string, VersionedProduct[]> = {
  'entrada': [
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
        lastUpdated: new Date()
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
        lastUpdated: new Date()
      },
      status: 'active',
      metadata: {
        createdAt: new Date(),
        createdBy: 'system',
        lastModified: new Date(),
        lastModifiedBy: 'system'
      }
    }
  ],
  'principio': [
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
        lastUpdated: new Date()
      },
      status: 'active',
      metadata: {
        createdAt: new Date(),
        createdBy: 'system',
        lastModified: new Date(),
        lastModifiedBy: 'system'
      }
    }
  ],
  'proteina': [
    {
      id: 'pr1',
      nombre: 'Pechuga a la Plancha',
      descripcion: 'Pechuga de pollo a la plancha con especias',
      currentPrice: 18000,
      categoriaId: 'proteina',
      currentVersion: 1,
      priceHistory: [],
      versions: [],
      stock: {
        currentQuantity: 25,
        minQuantity: 8,
        maxQuantity: 100,
        status: 'in_stock',
        lastUpdated: new Date()
      },
      status: 'active',
      metadata: {
        createdAt: new Date(),
        createdBy: 'system',
        lastModified: new Date(),
        lastModifiedBy: 'system'
      }
    }
  ],
  'acompanamiento': [
    {
      id: 'ac1',
      nombre: 'Arroz Blanco',
      descripcion: 'Arroz blanco cocido al vapor',
      currentPrice: 5000,
      categoriaId: 'acompanamiento',
      currentVersion: 1,
      priceHistory: [],
      versions: [],
      stock: {
        currentQuantity: 50,
        minQuantity: 20,
        maxQuantity: 200,
        status: 'in_stock',
        lastUpdated: new Date()
      },
      status: 'active',
      metadata: {
        createdAt: new Date(),
        createdBy: 'system',
        lastModified: new Date(),
        lastModifiedBy: 'system'
      }
    }
  ],
  'bebida': [
    {
      id: 'b1',
      nombre: 'Jugo de Mora',
      descripcion: 'Jugo en Agua de Mora',
      currentPrice: 4000,
      categoriaId: 'bebida',
      currentVersion: 1,
      priceHistory: [],
      versions: [],
      stock: {
        currentQuantity: 45,
        minQuantity: 15,
        maxQuantity: 150,
        status: 'in_stock',
        lastUpdated: new Date()
      },
      status: 'active',
      metadata: {
        createdAt: new Date(),
        createdBy: 'system',
        lastModified: new Date(),
        lastModifiedBy: 'system'
      }
    }
  ]
};

interface ListaProductosProps {
  restauranteId: string;
  categoriaId?: string;
  subcategoriaId?: string;
  onProductSelect?: (product: VersionedProduct) => void;
  onAddToMenu?: (product: VersionedProduct) => void;
  productosSeleccionados?: VersionedProduct[];
}

export default function ListaProductos({ 
  restauranteId, 
  categoriaId,
  subcategoriaId,
  onProductSelect,
  onAddToMenu,
  productosSeleccionados = []
}: ListaProductosProps) {
  const [cargando, setCargando] = useState(false);
  const [modalProductos, setModalProductos] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<VersionedProduct | null>(null);
  const [modalDetalleProducto, setModalDetalleProducto] = useState(false);
  const [productosJSON, setProductosJSON] = useState<VersionedProduct[]>([]);
  const [cargandoProductos, setCargandoProductos] = useState(false);

  // Cargar productos desde los archivos JSON
  useEffect(() => {
    const cargarProductos = async () => {
      console.log('Cargando productos para subcategoría:', subcategoriaId);
      console.log('Categoría seleccionada:', categoriaId);
      
      if (!subcategoriaId) {
        console.log('No hay subcategoría seleccionada, no se cargarán productos');
        return;
      }
      
      setCargandoProductos(true);
      try {
        // Cargar productos
        console.log('Intentando cargar productos desde JSON...');
        const productos = await jsonDataService.getProductos();
        console.log('Productos cargados desde JSON:', productos);
        
        if (!productos || productos.length === 0) {
          console.error('No se cargaron productos desde JSON o el array está vacío');
          setProductosJSON([]);
          setCargandoProductos(false);
          return;
        }
        
        // Filtrar productos por subcategoría
        console.log(`Filtrando productos por subcategoría: ${subcategoriaId}`);
        const productosFiltrados = productos.filter(
          (p: any) => {
            console.log(`Producto: ${p.nombre}, subcategoriaId: ${p.subcategoriaId}, comparando con: ${subcategoriaId}`);
            return p.subcategoriaId === subcategoriaId;
          }
        );
        
        console.log('Productos filtrados por subcategoría:', productosFiltrados);
        console.log(`Se encontraron ${productosFiltrados.length} productos para la subcategoría ${subcategoriaId}`);
        
        setProductosJSON(productosFiltrados);
      } catch (error) {
        console.error('Error al cargar productos:', error);
        toast.error('Error al cargar productos');
      } finally {
        setCargandoProductos(false);
      }
    };

    cargarProductos();
  }, [subcategoriaId]);

  // Verificar si se han seleccionado categoría y subcategoría
  const seleccionCompleta = categoriaId && subcategoriaId;
  
  // Obtener productos para la subcategoría seleccionada
  // Primero intentamos usar los productos cargados desde JSON, si no hay, usamos los hardcodeados
  const productosSubcategoria = productosJSON.length > 0 
    ? productosJSON 
    : (subcategoriaId ? PRODUCTOS_HARDCODED[subcategoriaId] || [] : []);

  // Manejar clic en el botón "Ver productos"
  const handleVerProductos = () => {
    setCargando(true);
    
    // Simular carga
    setTimeout(() => {
      setModalProductos(true);
      setCargando(false);
    }, 800);
  };

  // Manejar clic en un producto
  const handleProductClick = (producto: VersionedProduct) => {
    setProductoSeleccionado(producto);
    setModalDetalleProducto(true);
  };

  // Agregar producto a la lista de productos seleccionados
  const handleAgregarDirecto = (producto: VersionedProduct, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se abra el modal de detalle
    
    console.log('Agregando producto directamente:', producto);
    
    // Asignar el subcategoriaId actual al producto antes de agregarlo
    const productoConSubcategoria = {
      ...producto,
      categoriaId: subcategoriaId || producto.categoriaId
    };
    
    console.log('Producto modificado con subcategoriaId:', productoConSubcategoria);
    
    if (onProductSelect) {
      console.log('Función onProductSelect existe, llamando...');
      onProductSelect(productoConSubcategoria);
      toast.success(`${producto.nombre} agregado a la lista`);
    } else {
      console.error('Función onProductSelect no existe');
      toast.error('No se pudo agregar el producto a la lista');
    }
    
    // Cerrar el modal después de agregar el producto
    setModalProductos(false);
  };

  // Agregar producto al menú desde el modal de detalle
  const handleAgregarDesdeDetalle = () => {
    if (productoSeleccionado && onProductSelect) {
      console.log('Agregando producto desde detalle:', productoSeleccionado);
      
      // Asignar el subcategoriaId actual al producto antes de agregarlo
      const productoConSubcategoria = {
        ...productoSeleccionado,
        categoriaId: subcategoriaId || productoSeleccionado.categoriaId
      };
      
      console.log('Producto modificado con subcategoriaId:', productoConSubcategoria);
      
      onProductSelect(productoConSubcategoria);
      toast.success(`${productoSeleccionado.nombre} agregado a la lista`);
      setModalDetalleProducto(false);
    } else {
      console.error('No hay producto seleccionado o función onProductSelect no existe');
      toast.error('No se pudo agregar el producto a la lista');
    }
  };

  // Agregar producto al menú del día
  const handleAgregarAlMenu = (producto: VersionedProduct) => {
    if (onAddToMenu) {
      onAddToMenu(producto);
      toast.success(`${producto.nombre} agregado al menú del día`);
    }
  };

  // Mostrar todos los productos seleccionados para depuración
  console.log('Todos los productos seleccionados:', productosSeleccionados);
  
  // Filtrar productos seleccionados por subcategoría actual
  const productosSeleccionadosFiltrados = productosSeleccionados.filter(
    p => {
      console.log(`Producto seleccionado: ${p.nombre}, categoriaId: ${p.categoriaId}, comparando con subcategoriaId: ${subcategoriaId}`);
      // Ahora que hemos corregido el categoriaId de los productos, podemos filtrar correctamente
      return p.categoriaId === subcategoriaId;
    }
  );
  
  console.log('Productos seleccionados filtrados por subcategoría:', productosSeleccionadosFiltrados);

  // Si no se ha seleccionado categoría y subcategoría, mostrar mensaje
  if (!seleccionCompleta) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <p className="text-xs font-medium">Selecciona una categoría y subcategoría</p>
        <p className="text-xs">Para ver los productos disponibles</p>
      </div>
    );
  }

  // Si hay productos seleccionados para esta subcategoría, mostrarlos
  if (productosSeleccionadosFiltrados.length > 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-900 text-xs">Productos seleccionados</h3>
          <Button
            onClick={handleVerProductos}
            variant="outline"
            size="sm"
            className="text-[#F4821F] border-[#F4821F] hover:bg-[#F4821F]/10 text-xs h-6"
          >
            <Plus className="h-3 w-3 mr-1" />
            Agregar más
          </Button>
        </div>

        <div className="space-y-2">
          {productosSeleccionadosFiltrados.map((producto) => (
            <div 
              key={producto.id} 
              className="flex items-center p-2 border rounded-lg bg-white"
            >
              <div className="flex-1">
                <h4 className="font-medium text-xs">{producto.nombre}</h4>
                <p className="text-xs text-gray-600 line-clamp-1">{producto.descripcion}</p>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-600 hover:bg-green-50 h-6 w-6 p-0"
                  onClick={() => handleAgregarAlMenu(producto)}
                  title="Agregar al menú del día"
                >
                  <Plus className="h-3 w-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:bg-red-50 h-6 w-6 p-0"
                  onClick={() => {
                    toast.error("Funcionalidad de eliminación no implementada");
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal de lista de productos */}
        <Dialog open={modalProductos} onOpenChange={setModalProductos}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="text-sm">Productos disponibles</DialogTitle>
              <DialogDescription className="text-xs">
                Haz clic en el icono + para agregar un producto al menú o en el producto para ver más detalles
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 max-h-[400px] overflow-y-auto">
              <div className="grid grid-cols-1 gap-4">
                {productosSubcategoria.map((producto) => (
                  <div 
                    key={producto.id} 
                    className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleProductClick(producto)}
                  >
                    <div className="relative w-12 h-12 mr-3">
                      <Image
                        src={producto.imagen || '/images/placeholder.jpg'}
                        alt={producto.nombre}
                        fill
                        className="object-cover rounded"
                        sizes="48px"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/placeholder.jpg';
                        }}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-xs">{producto.nombre}</h3>
                      <p className="text-xs text-gray-600 line-clamp-1">{producto.descripcion}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#F4821F] hover:bg-[#F4821F]/10 h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(producto);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:bg-green-50 h-6 w-6 p-0"
                        onClick={(e) => handleAgregarDirecto(producto, e)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalProductos(false)} className="text-xs h-7">
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de detalle de producto */}
        <Dialog open={modalDetalleProducto} onOpenChange={setModalDetalleProducto}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-sm">{productoSeleccionado?.nombre}</DialogTitle>
              <DialogDescription className="text-xs">
                Detalles del producto
              </DialogDescription>
            </DialogHeader>
            
            {productoSeleccionado && (
              <div className="py-4">
                <div className="flex flex-col items-center mb-4">
                  <div className="relative w-32 h-32 mb-4">
                    <Image
                      src={productoSeleccionado.imagen || '/images/placeholder.jpg'}
                      alt={productoSeleccionado.nombre}
                      fill
                      className="object-cover rounded-lg"
                      sizes="128px"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/placeholder.jpg';
                      }}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-medium text-gray-500">Descripción</h3>
                    <p className="mt-1 text-xs">{productoSeleccionado.descripcion}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-xs font-medium text-gray-500">Categoría</h3>
                      <p className="mt-1 capitalize text-xs">{productoSeleccionado.categoriaId}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-xs font-medium text-gray-500">Stock</h3>
                      <p className="mt-1 text-xs">{productoSeleccionado.stock.currentQuantity} unidades</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalDetalleProducto(false)} className="text-xs h-7">
                Cancelar
              </Button>
              <Button 
                onClick={handleAgregarDesdeDetalle}
                className="bg-[#F4821F] hover:bg-[#CC6A10] text-white text-xs h-7"
              >
                <Plus className="h-3 w-3 mr-1" />
                Agregar al menú
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Si no hay productos seleccionados, mostrar el botón "Ver productos"
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Button
        onClick={handleVerProductos}
        className="bg-[#F4821F] hover:bg-[#CC6A10] text-white text-xs h-7"
        disabled={cargando}
      >
        {cargando ? (
          <>
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Cargando...
          </>
        ) : (
          <>
            <Eye className="h-3 w-3 mr-1" />
            Ver productos
          </>
        )}
      </Button>

      {/* Modal de lista de productos */}
      <Dialog open={modalProductos} onOpenChange={setModalProductos}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="text-sm">Productos disponibles</DialogTitle>
            <DialogDescription className="text-xs">
              Haz clic en el icono + para agregar un producto al menú o en el producto para ver más detalles
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 max-h-[400px] overflow-y-auto">
            <div className="grid grid-cols-1 gap-4">
              {productosSubcategoria.map((producto) => (
                <div 
                  key={producto.id} 
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleProductClick(producto)}
                >
                  <div className="relative w-12 h-12 mr-3">
                    <Image
                      src={producto.imagen || '/images/placeholder.jpg'}
                      alt={producto.nombre}
                      fill
                      className="object-cover rounded"
                      sizes="48px"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/placeholder.jpg';
                      }}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-xs">{producto.nombre}</h3>
                    <p className="text-xs text-gray-600 line-clamp-1">{producto.descripcion}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#F4821F] hover:bg-[#F4821F]/10 h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(producto);
                      }}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-600 hover:bg-green-50 h-6 w-6 p-0"
                      onClick={(e) => handleAgregarDirecto(producto, e)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalProductos(false)} className="text-xs h-7">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de detalle de producto */}
      <Dialog open={modalDetalleProducto} onOpenChange={setModalDetalleProducto}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-sm">{productoSeleccionado?.nombre}</DialogTitle>
            <DialogDescription className="text-xs">
              Detalles del producto
            </DialogDescription>
          </DialogHeader>
          
          {productoSeleccionado && (
            <div className="py-4">
              <div className="flex flex-col items-center mb-4">
                <div className="relative w-32 h-32 mb-4">
                  <Image
                    src={productoSeleccionado.imagen || '/images/placeholder.jpg'}
                    alt={productoSeleccionado.nombre}
                    fill
                    className="object-cover rounded-lg"
                    sizes="128px"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder.jpg';
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-medium text-gray-500">Descripción</h3>
                  <p className="mt-1 text-xs">{productoSeleccionado.descripcion}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs font-medium text-gray-500">Categoría</h3>
                    <p className="mt-1 capitalize text-xs">{productoSeleccionado.categoriaId}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xs font-medium text-gray-500">Stock</h3>
                    <p className="mt-1 text-xs">{productoSeleccionado.stock.currentQuantity} unidades</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalDetalleProducto(false)} className="text-xs h-7">
              Cancelar
            </Button>
            <Button 
              onClick={handleAgregarDesdeDetalle}
              className="bg-[#F4821F] hover:bg-[#CC6A10] text-white text-xs h-7"
            >
              <Plus className="h-3 w-3 mr-1" />
              Agregar al menú
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
