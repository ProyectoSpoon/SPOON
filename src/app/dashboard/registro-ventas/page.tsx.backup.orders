'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  Check,
  Clock,
  Receipt,
  Star,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/shared/components/ui/Card';
import { useToast } from '@/shared/Hooks/useToast';
import { useMenuVentas, ItemMenu, ItemCarrito } from './hooks/useMenuVentas';

// Componente de tarjeta de producto
const TarjetaProducto: React.FC<{
  producto: ItemMenu;
  onAgregarCarrito: (producto: ItemMenu) => void;
}> = ({ producto, onAgregarCarrito }) => {
  const { nombre, descripcion, precio, disponible, tipo, esCombo, destacado } = producto;
  
  // Colores según tipo de producto
  const colorFondo = esCombo 
    ? 'from-[#F4821F]/20 to-[#F4821F]/5'
    : {
      entrada: 'from-green-100 to-green-50',
      principio: 'from-yellow-100 to-yellow-50',
      proteina: 'from-red-100 to-red-50',
      acompanamiento: 'from-purple-100 to-purple-50',
      bebida: 'from-blue-100 to-blue-50',
      utensilio: 'from-gray-100 to-gray-50',
      combo: 'from-[#F4821F]/20 to-[#F4821F]/5'
    }[tipo];
  
  // Icono según tipo
  const getIconoTipo = () => {
    switch (tipo) {
      case 'combo': return '🍱';
      case 'proteina': return '🍖';
      case 'principio': return '🍚';
      case 'entrada': return '🥣';
      case 'bebida': return '🥤';
      case 'utensilio': return '🥡';
      case 'acompanamiento': return '🥗';
      default: return '🍽️';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-white rounded-lg border ${
        destacado 
          ? 'border-[#F4821F] shadow-md'
          : 'border-neutral-200 shadow-sm'
        } overflow-hidden hover:shadow-md transition-all duration-200 ${!disponible && 'opacity-60'}`}
    >
      <div className={`p-3 border-b border-neutral-100 bg-gradient-to-br ${colorFondo}`}>
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-neutral-800 line-clamp-1">
            {nombre}
          </h3>
          <div className="flex">
            {destacado && (
              <span className="mr-1 text-[#F4821F]">
                <Star className="h-4 w-4 fill-[#F4821F]" />
              </span>
            )}
            <span className="text-sm font-bold px-2 py-1 rounded-full bg-white/80">
              {getIconoTipo()}
            </span>
          </div>
        </div>
        <p className="text-xs text-neutral-600 mt-1 line-clamp-2">
          {descripcion}
        </p>
      </div>

      <div className="p-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-[#F4821F]">
            ${precio.toLocaleString()}
          </span>
          {!disponible && (
            <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
              Agotado
            </span>
          )}
        </div>

        <button
          className={`w-full px-3 py-2 text-sm rounded-lg flex items-center justify-center gap-2 ${
            disponible
              ? 'bg-[#F4821F] text-white hover:bg-[#CC6A10]'
              : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
          } transition-colors`}
          disabled={!disponible}
          onClick={() => disponible && onAgregarCarrito(producto)}
        >
          <Plus className="w-4 h-4" />
          {esCombo ? 'Agregar combo' : 'Agregar'}
        </button>
      </div>
    </motion.div>
  );
};

// Componente principal
export default function RegistroVentas() {
  const { productos, loading, error, registrarVenta } = useMenuVentas();
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [filtroActivo, setFiltroActivo] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const { toast } = useToast();
  
  // Función para filtrar productos
  const productosFiltrados = productos.filter(producto => {
    // Filtro por tipo/categoría
    const coincideFiltro = 
      filtroActivo === 'todos' || 
      (filtroActivo === 'combos' && producto.esCombo) ||
      (filtroActivo === 'destacados' && producto.destacado) ||
      producto.tipo === filtroActivo;
    
    // Filtro por búsqueda
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                           producto.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    
    return coincideFiltro && coincideBusqueda;
  });
  
  // Función para agregar al carrito
  const agregarAlCarrito = (producto: ItemMenu) => {
    setCarrito(prevCarrito => {
      const itemExistente = prevCarrito.find(item => item.producto.id === producto.id);
      
      if (itemExistente) {
        // El producto ya está en el carrito, incrementar cantidad
        return prevCarrito.map(item => 
          item.producto.id === producto.id 
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        // Agregar nuevo producto al carrito
        return [...prevCarrito, { producto, cantidad: 1 }];
      }
    });
    
    toast({
      title: "Producto agregado",
      description: `${producto.nombre} agregado al carrito`,
      variant: "success"
    });
  };
  
  // Función para eliminar del carrito
  const eliminarDelCarrito = (productoId: string) => {
    setCarrito(prev => prev.filter(item => item.producto.id !== productoId));
  };
  
  // Función para cambiar cantidad
  const cambiarCantidad = (productoId: string, cantidad: number) => {
    if (cantidad <= 0) {
      eliminarDelCarrito(productoId);
      return;
    }
    
    setCarrito(prev => prev.map(item => 
      item.producto.id === productoId 
        ? { ...item, cantidad: cantidad }
        : item
    ));
  };
  
  // Función para calcular total
  const calcularTotal = () => {
    return carrito.reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0);
  };
  
  // Función para completar el registro de venta
  const completarVenta = async () => {
    const resultado = await registrarVenta(carrito);
    if (resultado) {
      setCarrito([]);
      setMostrarCarrito(false);
      toast({
        title: "Venta registrada",
        description: `Venta por ${calcularTotal().toLocaleString()} registrada correctamente`,
        variant: "success"
      });
    }
  };
  
  // Filtros para tipos de productos
  const tiposFiltro = [
    { id: 'todos', nombre: 'Todos', icono: <Clock className="h-4 w-4" /> },
    { id: 'combos', nombre: 'Combos', icono: <ShoppingCart className="h-4 w-4" /> },
    { id: 'destacados', nombre: 'Destacados', icono: <Star className="h-4 w-4" /> },
    { id: 'proteina', nombre: 'Proteínas', icono: null },
    { id: 'principio', nombre: 'Principios', icono: null },
    { id: 'entrada', nombre: 'Entradas', icono: null },
    { id: 'bebida', nombre: 'Bebidas', icono: null },
    { id: 'utensilio', nombre: 'Utensilios', icono: null },
    { id: 'acompanamiento', nombre: 'Acompañamientos', icono: null }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <ShoppingCart className="h-12 w-12 text-[#F4821F]" />
          </motion.div>
          <p className="mt-4 text-neutral-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-6 max-w-md bg-red-50 border-red-200">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error al cargar productos</h2>
          <p className="text-neutral-700">{error}</p>
          <p className="mt-4 text-neutral-600">
            Asegúrate de que se han generado las combinaciones en el módulo de carta.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#F4821F] to-[#CC6A10] bg-clip-text text-transparent">
                Registro de Ventas
              </h1>
              <p className="text-neutral-500 mt-1">
                Registra y gestiona las ventas diarias de todos los productos
              </p>
            </div>
            
            <button
              onClick={() => setMostrarCarrito(!mostrarCarrito)}
              className="flex items-center gap-2 px-4 py-2 bg-[#F4821F] text-white rounded-lg hover:bg-[#CC6A10] relative shadow-md"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Carrito</span>
              {carrito.length > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-white text-[#F4821F] rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-sm"
                >
                  {carrito.reduce((sum, item) => sum + item.cantidad, 0)}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filtros y búsqueda */}
        <Card className="mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Buscador */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar productos..."
                className="pl-10 pr-4 py-2.5 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F4821F] focus:border-transparent"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            
            {/* Filtros de categoría */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {tiposFiltro.map((tipo) => (
                <button
                  key={tipo.id}
                  onClick={() => setFiltroActivo(tipo.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
                    filtroActivo === tipo.id
                      ? 'bg-[#F4821F] text-white shadow-md'
                      : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  {tipo.nombre}
                </button>
              ))}
            </div>
          </div>
        </Card>
        
        {/* Conteo de resultados */}
        <div className="mb-4">
          <p className="text-sm text-neutral-500">
            Mostrando {productosFiltrados.length} productos
          </p>
        </div>
        
        {/* Lista de productos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
          {productosFiltrados.map(producto => (
            <TarjetaProducto
              key={producto.id}
              producto={producto}
              onAgregarCarrito={agregarAlCarrito}
            />
          ))}
          
          {productosFiltrados.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <div className="mx-auto w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-medium text-neutral-700 mb-2">No se encontraron productos</h3>
              <p className="text-neutral-500 max-w-md mx-auto">
                Intenta con otros términos de búsqueda o cambia los filtros
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Carrito de compras */}
      <AnimatePresence>
        {mostrarCarrito && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
            onClick={() => setMostrarCarrito(false)}
          >
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white h-full overflow-auto shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-neutral-200 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Carrito de Ventas
                </h2>
                <button 
                  className="text-neutral-500 hover:text-neutral-800"
                  onClick={() => setMostrarCarrito(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {carrito.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingCart className="w-8 h-8 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-medium text-neutral-700 mb-2">Tu carrito está vacío</h3>
                  <p className="text-neutral-500 mb-4">
                    Agrega productos para registrar una venta
                  </p>
                  <button
                    className="px-4 py-2 bg-[#F4821F] text-white rounded-lg hover:bg-[#CC6A10]"
                    onClick={() => setMostrarCarrito(false)}
                  >
                    Ver productos
                  </button>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-neutral-100">
                    {carrito.map((item) => (
                      <div key={item.producto.id} className="p-4 flex items-center">
                        <div className="flex-grow">
                          <h3 className="font-medium">{item.producto.nombre}</h3>
                          <p className="text-sm text-neutral-500 mb-1">{item.producto.descripcion}</p>
                          <p className="text-[#F4821F] font-bold">
                            ${item.producto.precio.toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center">
                            <button
                              className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded-full"
                              onClick={() => cambiarCantidad(item.producto.id, item.cantidad - 1)}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center">{item.cantidad}</span>
                            <button
                              className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded-full"
                              onClick={() => cambiarCantidad(item.producto.id, item.cantidad + 1)}
                              disabled={!item.producto.disponible || (item.producto.cantidad !== undefined && item.cantidad >= item.producto.cantidad)}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => eliminarDelCarrito(item.producto.id)}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 border-t border-neutral-200 bg-neutral-50 sticky bottom-0">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium">Total</span>
                      <span className="text-xl font-bold text-[#F4821F]">
                        ${calcularTotal().toLocaleString()}
                      </span>
                    </div>
                    
                    <button
                      className="w-full py-3 bg-[#F4821F] text-white rounded-lg hover:bg-[#CC6A10] flex items-center justify-center gap-2"
                      onClick={() => completarVenta()}
                    >
                      <Receipt className="w-5 h-5" />
                      Registrar Venta
                    </button>
                    
                    <button
                      className="w-full py-2 mt-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
                      onClick={() => setCarrito([])}
                    >
                      Vaciar carrito
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
