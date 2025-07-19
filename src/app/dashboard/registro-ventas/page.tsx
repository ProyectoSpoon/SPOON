'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSetPageTitle } from '@/shared/Context/page-title-context';
import { useSalesAnalytics } from '@/hooks/useSalesAnalytics';
import { useAuthContext } from '@/hooks/useAuthContext';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';

// Tipos TypeScript
type EstadoMesa = 'libre' | 'ocupada' | 'reservada' | 'limpieza';
type CategoriaTipo = 'entrada' | 'principio' | 'proteina' | 'acompanamiento' | 'bebida' | 'especial';
type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia';

interface Mesa {
  id: string;
  numero: number;
  capacidad: number;
  estado: EstadoMesa;
  tiempoOcupada?: number;
}

interface Producto {
  id: string;
  nombre: string;
  categoria: CategoriaTipo;
  precio: number;
  disponible: boolean;
  destacado?: boolean;
}

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  notas?: string;
}

interface ConfigRestaurante {
  totalMesas: number;
  layoutMesas: Mesa[];
}

const RegistroVentasPage = () => {

  // ✅ TÍTULO DINÁMICO DE LA PÁGINA
  useSetPageTitle('Registro de Ventas', 'Control y registro de ventas diarias');
  
  // ✅ OBTENER DATOS DE AUTENTICACIÓN
  const { restaurantId, loading: authLoading } = useAuthContext();
  
  // ✅ OBTENER DATOS DINÁMICOS DE SALES ANALYTICS
  const { 
    data: salesData, 
    loading: salesLoading, 
    error: salesError,
    formatCurrency,
    getEstadoColor,
    getEstadoTexto,
    refetch
  } = useSalesAnalytics(restaurantId);
  
  // Estados
  const [mesaSeleccionada, setMesaSeleccionada] = useState<string | null>(null);
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaTipo>('entrada');
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');

  // ✅ KPIs DINÁMICOS DE OPERACIÓN
  const kpisOperacion = useMemo(() => {
    if (!salesData) return [];
    
    const { kpisOperacion: kpisData } = salesData;
    
    return [
      { titulo: "Mesas Libres", valor: kpisData.mesasLibres, subtitulo: "disponibles" },
      { titulo: "Órdenes Activas", valor: kpisData.ordenesActivas.toString(), subtitulo: "en proceso" },
      { titulo: "Ventas Hoy", valor: formatCurrency(kpisData.ventasHoy), subtitulo: "vs objetivo" },
      { titulo: "Tiempo Promedio", valor: kpisData.tiempoPromedio, subtitulo: "por mesa" },
      { titulo: "Plato Top", valor: kpisData.platoTop.nombre, subtitulo: `${kpisData.platoTop.cantidad} vendidos` },
      { titulo: "Pago Preferido", valor: kpisData.pagoPreferido.metodo, subtitulo: `${kpisData.pagoPreferido.porcentaje}% de órdenes` },
      { titulo: "Ticket Promedio", valor: formatCurrency(kpisData.ticketPromedio), subtitulo: "por orden" },
      { titulo: "Eficiencia", valor: kpisData.eficiencia, subtitulo: "servicio" }
    ];
  }, [salesData, formatCurrency]);

  // ✅ CONFIGURACIÓN DINÁMICA DE MESAS
  const configRestaurante = useMemo(() => {
    return salesData?.configRestaurante || null;
  }, [salesData]);

  // ✅ PRODUCTOS DINÁMICOS POR CATEGORÍA
  const productosPorCategoria = useMemo(() => {
    return salesData?.productosPorCategoria || {};
  }, [salesData]);

  // ✅ CATEGORÍAS DISPONIBLES DINÁMICAS
  const categoriasDisponibles = useMemo(() => {
    const categorias = Object.keys(productosPorCategoria) as CategoriaTipo[];
    return categorias.length > 0 ? categorias : ['entrada', 'principio', 'proteina', 'bebida'] as CategoriaTipo[];
  }, [productosPorCategoria]);

  // ✅ AJUSTAR CATEGORÍA ACTIVA SI NO EXISTE
  useEffect(() => {
    if (categoriasDisponibles.length > 0 && !categoriasDisponibles.includes(categoriaActiva)) {
      setCategoriaActiva(categoriasDisponibles[0]);
    }
  }, [categoriasDisponibles, categoriaActiva]);

  // ✅ MOSTRAR LOADING MIENTRAS SE CARGAN LOS DATOS
  if (authLoading || salesLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando datos de ventas...</p>
        </div>
      </div>
    );
  }

  // ✅ MOSTRAR ERROR SI HAY PROBLEMAS
  if (salesError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Error cargando datos</h3>
                <p className="text-red-600 mt-1">{salesError}</p>
              </div>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ MOSTRAR MENSAJE PARA SERVICIO NUEVO SIN DATOS
  const tieneVentas = salesData?.metadata?.tieneVentas || false;
  const productosDisponibles = salesData?.metadata?.productosDisponibles || 0;

  const getEstadoColorLocal = (estado: EstadoMesa): string => {
    return getEstadoColor(estado); 
  };

  const getEstadoTextoLocal = (estado: EstadoMesa): string => {
    return getEstadoTexto(estado);
  };

  const agregarAlCarrito = (producto: Producto) => {
    // ✅ TÍTULO DINÁMICO DE LA PÁGINA
    useSetPageTitle('Registro de Ventas', 'Control y registro de ventas diarias');
  useSetPageTitle('Registro de Ventas', 'Control y registro de ventas diarias');
    setCarrito(carritoActual => {
      const existente = carritoActual.find(item => item.producto.id === producto.id);
      if (existente) {
        return carritoActual.map(item =>
          item.producto.id === producto.id 
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...carritoActual, { producto, cantidad: 1 }];
    });
  };

  const actualizarCantidad = (productId: string, cantidad: number) => {

  // ✅ TÍTULO DINÁMICO DE LA PÁGINA
  useSetPageTitle('Registro de Ventas', 'Control y registro de ventas diarias');
    if (cantidad <= 0) {
      setCarrito(carritoActual => 
        carritoActual.filter(item => item.producto.id !== productId)
      );
    } else {
      setCarrito(carritoActual =>
        carritoActual.map(item =>
          item.producto.id === productId 
            ? { ...item, cantidad }
            : item
        )
      );
    }
  };

  const calcularTotal = (): number => {
    return carrito.reduce((total, item) => 
      total + (item.producto.precio * item.cantidad), 0
    );
  };

  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      {/* KPIs Horizontales - Parte Superior */}
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {kpisOperacion.map((kpi, index) => (
          <div key={index} className="text-center p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
            <div className="text-sm text-gray-500 font-bold mb-1">
              {kpi.titulo}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {kpi.valor}
            </div>
            {kpi.subtitulo && (
              <div className="text-xs text-gray-400">
                {kpi.subtitulo}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Indicador de Mesa Seleccionada y Total */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div className="text-lg font-medium text-gray-900">
            {mesaSeleccionada ? `Mesa ${configRestaurante?.layoutMesas.find(m => m.id === mesaSeleccionada)?.numero}` : 'Selecciona una mesa'}
          </div>
          {mesaSeleccionada && (
            <button
              onClick={() => setMesaSeleccionada(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cambiar mesa
            </button>
          )}
        </div>
        <div className="text-xl font-bold text-green-600">
          Total: {formatCurrency(calcularTotal())} ({totalItems} items)
        </div>
      </div>

      {/* Línea divisoria principal */}
      <div className="mb-4">
        <hr className="border-gray-200" />
      </div>

      <div className="grid grid-cols-12 gap-3">

        {/* Vista de Mesas - Layout dinámico */}
        <div className="col-span-12 lg:col-span-5">
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-4">Seleccionar mesa ({configRestaurante?.totalMesas} mesas)</h3>
            
            <div className="grid grid-cols-4 md:grid-cols-5 gap-2 max-h-64 overflow-y-auto">
              {configRestaurante?.layoutMesas.map((mesa) => (
                <button
                  key={mesa.id}
                  onClick={() => mesa.estado === 'libre' && setMesaSeleccionada(mesa.id)}
                  disabled={mesa.estado !== 'libre'}
                  className={`
                    relative p-3 rounded-lg border-2 text-center transition-all
                    ${mesaSeleccionada === mesa.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : mesa.estado === 'libre'
                        ? 'border-green-200 bg-green-50 hover:border-green-300'
                        : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                    }
                  `}
                >
                  <div className="text-sm font-bold text-gray-900">{mesa.numero}</div>
                  <div className="text-xs text-gray-500">{mesa.capacidad}p</div>
                  <div 
                    className="absolute top-1 right-1 w-2 h-2 rounded-full"
                    style={{ backgroundColor: getEstadoColor(mesa.estado) }}
                  ></div>
                  <div className="text-xs mt-1" style={{ color: getEstadoColor(mesa.estado) }}>
                    {getEstadoTexto(mesa.estado)}
                  </div>
                </button>
              ))}
            </div>

            {/* Leyenda de estados */}
            <div className="flex gap-4 mt-4 text-xs">
              {(['libre', 'ocupada', 'reservada', 'limpieza'] as EstadoMesa[]).map(estado => (
                <div key={estado} className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getEstadoColor(estado) }}
                  ></div>
                  <span className="text-gray-600">{getEstadoTexto(estado)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Productos por Categoría */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-4">Productos disponibles</h3>
            
            {/* ✅ FILTROS DE CATEGORÍA DINÁMICOS */}
            <div className="flex gap-1 mb-4 flex-wrap">
              {categoriasDisponibles.map((categoria) => (
                <button
                  key={categoria}
                  onClick={() => setCategoriaActiva(categoria)}
                  className={`px-3 py-1 text-sm rounded border transition-colors ${
                    categoriaActiva === categoria
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                </button>
              ))}
            </div>

            {/* ✅ LISTA DE PRODUCTOS DINÁMICOS */}
            <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
              {!tieneVentas && productosDisponibles === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No hay productos configurados</p>
                  <p className="text-xs mt-1">Ve a Dashboard → Carta para agregar productos</p>
                </div>
              ) : (
                (productosPorCategoria[categoriaActiva] || []).map((producto: any) => (
                  <div 
                    key={producto.id} 
                    className={`p-3 border rounded-lg ${
                      producto.disponible 
                        ? 'border-gray-200 hover:border-gray-300 bg-white' 
                        : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className={`font-medium text-sm ${!producto.disponible ? 'text-gray-400' : 'text-gray-900'}`}>
                          {producto.nombre}
                        </div>
                        <div className={`text-sm ${!producto.disponible ? 'text-gray-400' : 'text-green-600'}`}>
                          {formatCurrency(producto.precio)}
                        </div>
                        {producto.destacado && (
                          <div className="text-xs text-orange-600 font-medium">★ Destacado</div>
                        )}
                      </div>
                      <button
                        onClick={() => agregarAlCarrito({
                          ...producto,
                          categoria: producto.categoria as CategoriaTipo
                        })}
                        disabled={!producto.disponible || !mesaSeleccionada}
                        className={`px-3 py-1 text-sm rounded ${
                          producto.disponible && mesaSeleccionada
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Carrito de Compras */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm sticky top-6">
            <h3 className="text-sm text-gray-500 mb-4">Orden actual ({totalItems} items)</h3>
            
            {carrito.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-sm">Carrito vacío</div>
                <div className="text-xs mt-1">Selecciona una mesa y agrega productos</div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Items del carrito */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {carrito.map((item) => (
                    <div key={item.producto.id} className="flex items-center gap-2 text-sm">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.producto.nombre}</div>
                        <div className="text-green-600">{formatCurrency(item.producto.precio)}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}
                          className="w-6 h-6 border border-gray-200 rounded text-gray-600 hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.cantidad}</span>
                        <button
                          onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}
                          className="w-6 h-6 border border-gray-200 rounded text-gray-600 hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Método de pago */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Método de pago:</div>
                  <select 
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                    className="w-full p-2 text-sm border border-gray-200 rounded"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </div>

                {/* Total y acción */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-green-600">{formatCurrency(calcularTotal())}</span>
                  </div>
                  
                  <button
                    disabled={!mesaSeleccionada || carrito.length === 0}
                    className={`w-full py-3 rounded-lg font-medium ${
                      mesaSeleccionada && carrito.length > 0
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {!mesaSeleccionada ? 'Selecciona Mesa' : 'Crear Orden'}
                  </button>
                  
                  {carrito.length > 0 && (
                    <button
                      onClick={() => setCarrito([])}
                      className="w-full py-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Limpiar carrito
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegistroVentasPage;
