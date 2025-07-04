import { useState } from 'react';
import { GripVertical, Trash2, Coffee, Soup, Beef, Salad, Utensils, Plus, Edit2, Info, X, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';
import { Button } from '@/shared/components/ui/Button';
import { toast } from 'sonner';

interface MenuDiarioRedisenoProps {
  productos: VersionedProduct[];
  categorias?: Array<{ id: string; nombre: string; tipo: string; parentId?: string }>;
  onRemoveProduct?: (productId: string) => void;
  onUpdateCantidad?: (productId: string, cantidad: number) => void;
}

export function MenuDiarioRediseno({ 
  productos = [], 
  categorias = [],
  onRemoveProduct,
  onUpdateCantidad 
}: MenuDiarioRedisenoProps) {
  
  // Función para limpiar y validar strings
  const cleanString = (str: string | null | undefined): string => {
    if (str === null || str === undefined) {
      return '';
    }
    
    if (typeof str !== 'string') {
      return String(str);
    }
    
    // Normalizar espacios
    return str.trim().replace(/\s+/g, ' ');
  };

  // Función para validar producto
  const validateProduct = (producto: VersionedProduct): VersionedProduct => {
    return {
      ...producto,
      nombre: cleanString(producto.nombre),
      descripcion: cleanString(producto.descripcion)
    };
  };

  // Validar y limpiar productos
  const productosLimpios = productos.map(validateProduct);
  
  // Agrupar productos por categoría
  const productosPorCategoria = productosLimpios.reduce((acc: Record<string, VersionedProduct[]>, producto) => {
    const categoriaId = producto.categoriaId;
    
    if (!categoriaId) {
      return acc;
    }
    
    if (!acc[categoriaId]) {
      acc[categoriaId] = [];
    }
    
    acc[categoriaId].push(producto);
    return acc;
  }, {});
 
  // Validar y limpiar categorías
  const categoriasLimpias = categorias.map(cat => ({
    ...cat,
    nombre: cleanString(cat.nombre)
  }));

  // Obtener categorías dinámicamente - Solo subcategorías que tengan productos
  const categoriasConProductos = categoriasLimpias.filter(cat => 
    cat.parentId && // Solo subcategorías
    productosPorCategoria[cat.id] && 
    productosPorCategoria[cat.id].length > 0
  );

  // Función para obtener el icono según el nombre de la categoría
  const getIconForCategory = (nombreCategoria: string) => {
    const nombre = cleanString(nombreCategoria).toLowerCase();
    
    if (nombre.includes('entrada')) {
      return <Soup className="h-4 w-4 text-orange-500" />;
    } else if (nombre.includes('principio')) {
      return <Utensils className="h-4 w-4 text-yellow-500" />;
    } else if (nombre.includes('proteina') || nombre.includes('proteína')) {
      return <Beef className="h-4 w-4 text-red-500" />;
    } else if (nombre.includes('acompañamiento') || nombre.includes('acompanamiento')) {
      return <Salad className="h-4 w-4 text-green-500" />;
    } else if (nombre.includes('bebida')) {
      return <Coffee className="h-4 w-4 text-blue-500" />;
    } else {
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
      toast.success(`Cantidad de ${cleanString(modalProducto.nombre)} actualizada a ${cantidadModal}`);
      cerrarModalCantidad();
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

  // Verificar si una categoría es de proteínas para mostrar control de cantidad
  const esCategoriaPoteinas = (categoriaId: string): boolean => {
    const categoria = categoriasLimpias.find(cat => cat.id === categoriaId);
    const nombreCategoria = cleanString(categoria?.nombre || '');
    return nombreCategoria.toLowerCase().includes('proteina') || nombreCategoria.toLowerCase().includes('proteína');
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

  // Obtener todas las subcategorías disponibles, estén o no en productos
  const todasLasSubcategorias = categoriasLimpias.filter(cat => cat.parentId);

  // Si no hay categorías definidas, mostrar mensaje básico
  if (todasLasSubcategorias.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="flex items-center justify-center mb-4">
          <Utensils className="h-12 w-12 text-gray-300" />
        </div>
        <p className="text-gray-500 text-lg">No hay categorías configuradas</p>
        <p className="text-gray-400 text-sm mt-2">Configure las categorías desde el panel de administración</p>
      </div>
    );
  }

  // Componente para renderizar producto
  const renderProducto = (producto: VersionedProduct, categoria: any) => {
    const nombreLimpio = cleanString(producto.nombre);
    const descripcionLimpia = cleanString(producto.descripcion);
    
    // Validación adicional antes de renderizar
    if (!nombreLimpio) {
      return null; // No renderizar productos sin nombre
    }
    
    return (
      <div key={producto.id} className="flex items-center p-2 border rounded-md bg-white hover:shadow-sm transition-shadow">
        {/* Icono de la categoría */}
        <div className="flex-shrink-0 mr-2">
          {getIconForCategory(categoria.nombre)}
        </div>
        
        {/* Información del producto */}
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-gray-900 block truncate">
            {nombreLimpio || 'Producto sin nombre'}
          </span>
          {descripcionLimpia && (
            <span className="text-xs text-gray-500 block truncate">
              {descripcionLimpia}
            </span>
          )}
        </div>
        
        {/* Control de cantidad solo para productos de categoría proteína */}
        {esCategoriaPoteinas(categoria.id) && (
          <div className="flex items-center mr-2 space-x-1">
            <button
              onClick={() => decrementarCantidad(producto.id, getCantidad(producto))}
              className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
              disabled={getCantidad(producto) <= 0}
            >
              <Minus className="h-3 w-3" />
            </button>
            
            <input
              type="number"
              value={getCantidad(producto)}
              onChange={(e) => handleCantidadChange(producto.id, e)}
              className="w-12 h-6 text-center text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
              min="0"
            />
            
            <button
              onClick={() => incrementarCantidad(producto.id, getCantidad(producto))}
              className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
            >
              <Plus className="h-3 w-3" />
            </button>
            
            <button
              onClick={() => abrirModalCantidad(producto)}
              className="text-blue-500 hover:text-blue-700 ml-1"
              title="Editar cantidad"
            >
              <Edit2 className="h-3 w-3" />
            </button>
          </div>
        )}
        
        {/* Botón de eliminar */}
        {onRemoveProduct && (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:bg-red-50 p-1 h-6 w-6 flex-shrink-0"
            onClick={() => onRemoveProduct(producto.id)}
            title="Eliminar del menú"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  };

  // Renderizar el menú del día SIEMPRE con las 5 categorías como en el diseño original
  return (
    <>
      <div className="grid grid-cols-5 gap-4">
        {todasLasSubcategorias.map((categoria) => {
          const nombreCategoriaLimpio = cleanString(categoria.nombre);
          
          return (
            <div key={categoria.id} className="flex flex-col">
              {/* Encabezado de la categoría - EXACTO como en el diseño original */}
              <div className="flex items-center justify-center mb-2 space-x-1">
                {getIconForCategory(nombreCategoriaLimpio)}
                <h3 className="font-medium text-center text-sm">
                  {nombreCategoriaLimpio || 'Categoría sin nombre'}
                </h3>
              </div>
              
              {/* Lista de productos */}
              <div className="space-y-2">
                {productosPorCategoria[categoria.id] && productosPorCategoria[categoria.id].length > 0 ? (
                  productosPorCategoria[categoria.id]
                    .filter(producto => cleanString(producto.nombre)) // Filtrar productos sin nombre válido
                    .map((producto) => renderProducto(producto, categoria))
                    .filter(Boolean) // Remover elementos null
                ) : (
                  // EXACTO como en el diseño original - mensaje para categorías sin productos
                  <div className="text-sm text-gray-400 italic text-center p-2">
                    No hay productos seleccionados
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
                  <span className="font-medium text-gray-800">
                    {cleanString(modalProducto.nombre) || 'Producto sin nombre'}
                  </span>
                </div>
                
                {cleanString(modalProducto.descripcion) && (
                  <p className="text-sm text-gray-600 mb-4">
                    {cleanString(modalProducto.descripcion)}
                  </p>
                )}
                
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                  <div className="flex">
                    <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-blue-700">
                      Establece la cantidad disponible de esta proteína para el menú del día. 
                      Esta cantidad se utilizará para controlar el inventario y las ventas.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <button
                    onClick={() => setCantidadModal(Math.max(0, cantidadModal - 5))}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  
                  <div className="flex flex-col items-center">
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
                    <span className="text-xs text-gray-500 mt-1">porciones</span>
                  </div>
                  
                  <button
                    onClick={() => setCantidadModal(cantidadModal + 5)}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Botones rápidos */}
                <div className="flex justify-center space-x-2 mb-4">
                  {[10, 25, 50, 100].map((cantidad) => (
                    <button
                      key={cantidad}
                      onClick={() => setCantidadModal(cantidad)}
                      className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      {cantidad}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cerrarModalCantidad}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarCantidadModal}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
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
