import { useState } from 'react';
import { GripVertical, Trash2, Coffee, Soup, Beef, Salad, Utensils, Plus, Edit2, Info, X, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';
import { Button } from '@/shared/components/ui/Button';
import { toast } from 'sonner';

interface MenuDiarioRedisenoProps {
  productos: VersionedProduct[];
  onRemoveProduct?: (productId: string) => void;
  onUpdateCantidad?: (productId: string, cantidad: number) => void;
}

export function MenuDiarioRediseno({ 
  productos = [], 
  onRemoveProduct,
  onUpdateCantidad 
}: MenuDiarioRedisenoProps) {
  // Mapeo de IDs de categoría a nombres
  const nombresCategorias: Record<string, string> = {
    'CAT_001': 'Entradas',
    'entrada': 'Entradas',
    'CAT_002': 'Principio',
    'principio': 'Principio',
    'CAT_003': 'Proteína',
    'proteina': 'Proteína',
    'CAT_004': 'Acompañamientos',
    'acompanamiento': 'Acompañamientos',
    'CAT_005': 'Bebida',
    'bebida': 'Bebida'
  };
 
  // Agrupar productos por categoría
  const productosPorCategoria = productos.reduce((acc: Record<string, VersionedProduct[]>, producto) => {
    const categoriaId = producto.categoriaId;
    
    if (!acc[categoriaId]) {
      acc[categoriaId] = [];
    }
    
    acc[categoriaId].push(producto);
    return acc;
  }, {});
 
  // Definir todas las categorías que siempre deben mostrarse
  const todasCategorias = [
    { id: 'CAT_001', nombre: 'Entradas', icon: <Soup className="h-4 w-4 text-orange-500" /> },
    { id: 'CAT_002', nombre: 'Principio', icon: <Utensils className="h-4 w-4 text-yellow-500" /> },
    { id: 'CAT_003', nombre: 'Proteína', icon: <Beef className="h-4 w-4 text-red-500" /> },
    { id: 'CAT_004', nombre: 'Acompañamientos', icon: <Salad className="h-4 w-4 text-green-500" /> },
    { id: 'CAT_005', nombre: 'Bebida', icon: <Coffee className="h-4 w-4 text-blue-500" /> }
  ];
 
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

  // Estados para el modal y las cantidades
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [modalProducto, setModalProducto] = useState<VersionedProduct | null>(null);
  const [cantidadModal, setCantidadModal] = useState<number>(0);

  // Función para abrir el modal de cantidad
  const abrirModalCantidad = (producto: VersionedProduct) => {
    setModalProducto(producto);
    setCantidadModal(getCantidad(producto));
  };

  // Función para cerrar el modal de cantidad
  const cerrarModalCantidad = () => {
    setModalProducto(null);
  };

  // Función para guardar la cantidad desde el modal
  const guardarCantidadModal = () => {
    if (modalProducto && onUpdateCantidad) {
      setCantidades(prev => ({
        ...prev,
        [modalProducto.id]: cantidadModal
      }));
      
      onUpdateCantidad(modalProducto.id, cantidadModal);
      toast.success(`Cantidad de ${modalProducto.nombre} actualizada a ${cantidadModal}`);
      cerrarModalCantidad();
    }
  };

  // Función para incrementar la cantidad de un producto
  const incrementarCantidad = (productoId: string, cantidadActual: number) => {
    const nuevaCantidad = cantidadActual + 1;
    setCantidades(prev => ({
      ...prev,
      [productoId]: nuevaCantidad
    }));
    
    if (onUpdateCantidad) {
      onUpdateCantidad(productoId, nuevaCantidad);
    }
  };

  // Función para decrementar la cantidad de un producto
  const decrementarCantidad = (productoId: string, cantidadActual: number) => {
    if (cantidadActual <= 0) return;
    
    const nuevaCantidad = cantidadActual - 1;
    setCantidades(prev => ({
      ...prev,
      [productoId]: nuevaCantidad
    }));
    
    if (onUpdateCantidad) {
      onUpdateCantidad(productoId, nuevaCantidad);
    }
  };

  // Función para manejar cambios directos en el input de cantidad
  const handleCantidadChange = (productoId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = parseInt(e.target.value);
    if (isNaN(valor) || valor < 0) return;
    
    setCantidades(prev => ({
      ...prev,
      [productoId]: valor
    }));
    
    if (onUpdateCantidad) {
      onUpdateCantidad(productoId, valor);
    }
  };

  // Función para obtener la cantidad actual de un producto
  const getCantidad = (producto: VersionedProduct): number => {
    // Si ya tenemos una cantidad en el estado, usarla
    if (cantidades[producto.id] !== undefined) {
      return cantidades[producto.id];
    }
    
    // Si el producto tiene una cantidad definida, usarla
    if (producto.stock?.currentQuantity !== undefined) {
      // Inicializar el estado con este valor
      setCantidades(prev => ({
        ...prev,
        [producto.id]: producto.stock!.currentQuantity
      }));
      return producto.stock.currentQuantity;
    }
    
    // Valor por defecto
    return 0;
  };

  // Renderizar el menú del día con el nuevo diseño
  return (
    <>
      <div className="grid grid-cols-5 gap-4">
        {todasCategorias.map((categoria) => (
          <div key={categoria.id} className="flex flex-col">
            <div className="flex items-center justify-center mb-2 space-x-1">
              {categoria.icon}
              <h3 className="font-medium text-center text-sm">{categoria.nombre}</h3>
            </div>
            <div className="space-y-2">
              {productosPorCategoria[categoria.id]?.map((producto) => (
                <div key={producto.id} className="flex items-center p-2 border rounded-md bg-white">
                  {getIconForCategory(categoria.id)}
                  <span className="text-sm">{producto.nombre}</span>
                  
                  {/* Control de cantidad solo para productos de categoría proteína */}
                  {categoria.id === 'CAT_003' && (
                    <div className="flex items-center ml-auto mr-2">
                      <button
                        onClick={() => abrirModalCantidad(producto)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Editar cantidad"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  
                  {onRemoveProduct && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`${categoria.id === 'CAT_003' ? '' : 'ml-auto'} text-red-500 hover:bg-red-50 p-1 h-6 w-6`}
                      onClick={() => onRemoveProduct(producto.id)}
                      title="Eliminar del menú"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              {(!productosPorCategoria[categoria.id] || productosPorCategoria[categoria.id].length === 0) && (
                <div className="text-sm text-gray-400 italic text-center p-2">
                  No hay productos seleccionados
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Modal para editar cantidad */}
      <AnimatePresence>
        {modalProducto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Beef className="h-5 w-5 text-red-500 mr-2" />
                  Editar Cantidad de Proteína
                </h3>
                <button
                  onClick={cerrarModalCantidad}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <span className="font-medium text-gray-800">{modalProducto.nombre}</span>
                </div>
                
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                  <div className="flex">
                    <Info className="h-5 w-5 text-blue-500 mr-2" />
                    <p className="text-sm text-blue-700">
                      Establece la cantidad disponible de esta proteína para el menú del día. 
                      Esta cantidad se utilizará para controlar el inventario y las ventas.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <button
                    onClick={() => setCantidadModal(Math.max(0, cantidadModal - 5))}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  
                  <input
                    type="number"
                    value={cantidadModal}
                    onChange={(e) => {
                      const valor = parseInt(e.target.value);
                      if (!isNaN(valor) && valor >= 0) {
                        setCantidadModal(valor);
                      }
                    }}
                    className="w-20 h-12 text-center text-lg font-bold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    min="0"
                  />
                  
                  <button
                    onClick={() => setCantidadModal(cantidadModal + 5)}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cerrarModalCantidad}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarCantidadModal}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
