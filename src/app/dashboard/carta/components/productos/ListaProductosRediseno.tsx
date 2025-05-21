'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Eye, Loader2, Plus, Trash2, Edit, MoreVertical, Check, Coffee, Soup, Beef, Salad, Utensils } from 'lucide-react';
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

// Los productos se cargan dinámicamente desde los archivos JSON separados por categoría
// No se utilizan productos hardcodeados

interface ListaProductosRedisenoProps {
  restauranteId: string;
  categoriaId?: string;
  subcategoriaId?: string | null;
  onProductSelect?: (product: VersionedProduct) => void;
  onAddToMenu?: (product: VersionedProduct) => void;
  onRemoveFromMenu?: (productId: string) => void;
  productosSeleccionados?: VersionedProduct[];
  productosMenu?: VersionedProduct[]; // Productos que ya están en el menú
}

export default function ListaProductosRediseno({ 
  restauranteId, 
  categoriaId,
  subcategoriaId,
  onProductSelect,
  onAddToMenu,
  onRemoveFromMenu,
  productosSeleccionados = [],
  productosMenu = []
}: ListaProductosRedisenoProps) {
  const [cargando, setCargando] = useState(false);
  const [modalProductos, setModalProductos] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<VersionedProduct | null>(null);
  const [modalDetalleProducto, setModalDetalleProducto] = useState(false);
  const [productosJSON, setProductosJSON] = useState<VersionedProduct[]>([]);
  const [cargandoProductos, setCargandoProductos] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Referencia para almacenar la categoría actual y detectar cambios reales
  const categoriaIdRef = useRef<string | undefined>(categoriaId);

  // Cargar productos desde los archivos JSON o usar los hardcodeados
  useEffect(() => {
    // Solo recargar productos si la categoría ha cambiado realmente
    if (categoriaId !== categoriaIdRef.current) {
      categoriaIdRef.current = categoriaId;
      console.log(`CATEGORÍA CAMBIADA: Anterior=${categoriaIdRef.current}, Nueva=${categoriaId}`);
      
      const cargarProductos = async () => {
        console.log('╔════════════════════════════════════════════════════════╗');
        console.log(`║ Cargando productos para categoría: ${categoriaId}      ║`);
        console.log('╚════════════════════════════════════════════════════════╝');
        
        if (!categoriaId) {
          console.log('No hay categoría seleccionada, no se cargarán productos');
          setProductosJSON([]);
          return;
        }
        
        // Limpiar productos actuales antes de cargar nuevos
        setProductosJSON([]);
        setCargandoProductos(true);
        
        try {
          // Limpiar caché para forzar recarga
          localStorage.removeItem('menu_productos');
          console.log('Caché de productos eliminado para forzar recarga');
          
          // Cargar productos específicos de la categoría
          console.log(`▶️ Intentando cargar productos de categoría ${categoriaId}...`);
          const productos = await jsonDataService.getProductosByCategoria(categoriaId);
          console.log(`✅ Productos cargados: ${productos.length}`);
          
          if (!productos || productos.length === 0) {
            console.log('⚠️ No se cargaron productos desde JSON, intentando respaldo...');
            // Intento secundario con getProductos()
            try {
              const todosProductos = await jsonDataService.getProductos();
              if (todosProductos && todosProductos.length > 0) {
                // IMPORTANTE: Filtrado estricto por categoría
                const productosFiltrados = todosProductos.filter((p: any) => {
                  // CORRECCIÓN: Eliminada referencia a id_categoria
                  const coincide = p.categoriaId === categoriaId;
                  console.log(`Producto ${p.id} (${p.nombre}) - categoría="${p.categoriaId}" - ¿coincide con ${categoriaId}? ${coincide ? 'SÍ' : 'NO'}`);
                  return coincide;
                });
                
                console.log(`🔍 Filtrado secundario: ${productosFiltrados.length} productos de categoría ${categoriaId}`);
                if (productosFiltrados.length === 0) {
                  console.log('⚠️ No se encontraron productos con esta categoría en el respaldo');
                }
                setProductosJSON(productosFiltrados);
              } else {
                console.log('❌ Tampoco se encontraron productos en el respaldo');
                setProductosJSON([]);
              }
            } catch (secondaryError) {
              console.error('Error en carga secundaria:', secondaryError);
              setProductosJSON([]);
            }
          } else {
            // Verificación extra para confirmar categorías
            console.log('🔍 Verificando categorías de productos cargados:');
            const productosFiltrados = productos.filter((p: any) => {
              const coincide = p.categoriaId === categoriaId;
              console.log(`Producto ${p.id} (${p.nombre}) - categoría="${p.categoriaId}" - ¿coincide con ${categoriaId}? ${coincide ? 'SÍ' : 'NO'}`);
              return coincide;
            });
            
            if (productosFiltrados.length !== productos.length) {
              console.warn(`⚠️ ${productos.length - productosFiltrados.length} productos tienen categoría incorrecta`);
            }
            
            console.log(`✅ Final: ${productosFiltrados.length} productos cargados correctamente para categoría ${categoriaId}`);
            setProductosJSON(productosFiltrados);
          }
        } catch (error) {
          console.error('❌ Error al cargar productos:', error);
          setProductosJSON([]);
        } finally {
          setCargandoProductos(false);
        }
      };
      
      cargarProductos();
    }
  }, [categoriaId]);

  // Verificar si se ha seleccionado categoría
  const seleccionCompleta = categoriaId !== undefined;
  
  // Obtener productos para la categoría seleccionada - SIN FILTRADO ADICIONAL
  // Ya filtramos estrictamente en la carga de productos
  const productosFiltrados = productosJSON;
  
  // Diagnóstico para verificar productos mostrados
  useEffect(() => {
    console.log(`⚡ Renderizando ${productosFiltrados.length} productos para categoría ${categoriaId}`);
    if (productosFiltrados.length > 0) {
      console.log('📋 Lista de productos mostrados:');
      productosFiltrados.forEach((p, idx) => {
        console.log(`  ${idx + 1}. ${p.nombre} (ID: ${p.id}, Cat: ${p.categoriaId})`);
      });
    }
  }, [productosFiltrados, categoriaId]);

  // Manejar clic en un producto
  const handleProductClick = (producto: VersionedProduct) => {
    setProductoSeleccionado(producto);
    setModalDetalleProducto(true);
  };

  // Verificar si un producto está en el menú
  const isProductInMenu = (productoId: string) => {
    return productosMenu.some(p => p.id === productoId);
  };

  // Manejar el toggle del checkbox para agregar/quitar producto del menú
  const handleToggleProductoMenu = (producto: VersionedProduct, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Evitar que se abra el modal de detalle
    
    const isInMenu = isProductInMenu(producto.id);
    
    if (isInMenu) {
      // Si ya está en el menú, quitarlo
      if (onRemoveFromMenu) {
        onRemoveFromMenu(producto.id);
        toast.success(`${producto.nombre} eliminado del menú del día`);
      } else {
        toast.error('No se pudo eliminar el producto del menú');
      }
    } else {
      // Si no está en el menú, agregarlo
      if (onAddToMenu) {
        onAddToMenu(producto);
        toast.success(`${producto.nombre} agregado al menú del día`);
      } else {
        toast.error('No se pudo agregar el producto al menú');
      }
    }
  };

  // Función para obtener el icono según la categoría
  const getIconForCategory = (categoriaId: string) => {
    switch (categoriaId) {
      case 'CAT_001':
        return <Soup className="h-4 w-4 text-orange-500" />;
      case 'CAT_002':
        return <Utensils className="h-4 w-4 text-yellow-500" />;
      case 'CAT_003':
        return <Beef className="h-4 w-4 text-red-500" />;
      case 'CAT_004':
        return <Salad className="h-4 w-4 text-green-500" />;
      case 'CAT_005':
        return <Coffee className="h-4 w-4 text-blue-500" />;
      default:
        return <Utensils className="h-4 w-4 text-gray-500" />;
    }
  };

  // Renderizar la tabla de productos
  return (
    <div className="space-y-4">
      {/* Diagnóstico visible */}
      <div className="bg-gray-100 p-2 rounded text-xs mb-2">
        <p>Categoría actual: <strong>{categoriaId || 'Ninguna'}</strong></p>
        <p>Productos cargados: <strong>{productosFiltrados.length}</strong></p>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Imagen
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agregar a Menu Día
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cargandoProductos ? (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-[#F4821F]" />
                  <span className="text-sm text-gray-500 mt-2 block">Cargando productos...</span>
                </td>
              </tr>
            ) : productosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">
                  No hay productos disponibles para esta categoría
                </td>
              </tr>
            ) : (
              productosFiltrados.map((producto) => (
                <tr key={producto.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="relative w-10 h-10">
                      <Image
                        src={producto.imagen || '/images/placeholder.jpg'}
                        alt={producto.nombre}
                        fill
                        className="object-cover rounded"
                        sizes="40px"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/placeholder.jpg';
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      {getIconForCategory(producto.categoriaId || '')}
                      <div className="ml-2 flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{producto.nombre}</span>
                        <span className="text-xs text-gray-500">{producto.descripcion}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={isProductInMenu(producto.id)}
                          onChange={() => handleToggleProductoMenu(producto)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#F4821F]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F4821F]"></div>
                      </label>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#F4821F] hover:bg-[#F4821F]/10 h-8 w-8 p-0"
                        onClick={() => handleProductClick(producto)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
              onClick={() => {
                if (productoSeleccionado) {
                  handleToggleProductoMenu(productoSeleccionado);
                  setModalDetalleProducto(false);
                }
              }}
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