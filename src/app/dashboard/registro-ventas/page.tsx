'use client';

import React, { useState, useEffect } from 'react';
import { useSetPageTitle } from '@/shared/Context/page-title-context';

// Tipos TypeScript
type EstadoMesa = 'libre' | 'ocupada' | 'reservada' | 'limpieza';
type CategoriaTipo = 'platos' | 'bebidas' | 'postres' | 'entradas';
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
  // Estados
  const [mesaSeleccionada, setMesaSeleccionada] = useState<string | null>(null);
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaTipo>('platos');
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');
  const [configRestaurante, setConfigRestaurante] = useState<ConfigRestaurante | null>(null);

  // KPIs de operación diaria
  const kpisOperacion = [
    { titulo: "Mesas Libres", valor: "12/20", subtitulo: "disponibles" },
    { titulo: "Órdenes Activas", valor: "8", subtitulo: "en proceso" },
    { titulo: "Ventas Hoy", valor: "$847k", subtitulo: "vs objetivo" },
    { titulo: "Tiempo Promedio", valor: "45 min", subtitulo: "por mesa" },
    { titulo: "Plato Top", valor: "Bandeja Paisa", subtitulo: "28 vendidos" },
    { titulo: "Pago Preferido", valor: "Tarjeta", subtitulo: "60% de órdenes" },
    { titulo: "Ticket Promedio", valor: "$24.5k", subtitulo: "por orden" },
    { titulo: "Eficiencia", valor: "92%", subtitulo: "servicio" }
  ];

  // Configuración dinámica de mesas (simulada)
  useEffect(() => {
    // Simular carga de configuración del restaurante
    const mesas: Mesa[] = [];
    const totalMesas = 20; // Esto vendría de la configuración del restaurante
    
    for (let i = 1; i <= totalMesas; i++) {
      mesas.push({
        id: `mesa-${i}`,
        numero: i,
        capacidad: i <= 12 ? 4 : i <= 16 ? 6 : 8,
        estado: Math.random() > 0.6 ? 'libre' : Math.random() > 0.5 ? 'ocupada' : 'reservada'
      });
    }

    setConfigRestaurante({
      totalMesas,
      layoutMesas: mesas
    });
  }, []);

  // Productos por categoría (simulados)
  const productosPorCategoria: Record<CategoriaTipo, Producto[]> = {
    platos: [
      { id: '1', nombre: 'Bandeja Paisa', categoria: 'platos', precio: 28000, disponible: true },
      { id: '2', nombre: 'Sancocho', categoria: 'platos', precio: 22000, disponible: true },
      { id: '3', nombre: 'Pescado Frito', categoria: 'platos', precio: 32000, disponible: true },
      { id: '4', nombre: 'Pollo Asado', categoria: 'platos', precio: 25000, disponible: false }
    ],
    bebidas: [
      { id: '5', nombre: 'Jugo Natural', categoria: 'bebidas', precio: 8000, disponible: true },
      { id: '6', nombre: 'Gaseosa', categoria: 'bebidas', precio: 5000, disponible: true },
      { id: '7', nombre: 'Cerveza', categoria: 'bebidas', precio: 6000, disponible: true }
    ],
    entradas: [
      { id: '8', nombre: 'Empanadas', categoria: 'entradas', precio: 3000, disponible: true },
      { id: '9', nombre: 'Arepa con Queso', categoria: 'entradas', precio: 4000, disponible: true }
    ],
    postres: [
      { id: '10', nombre: 'Flan', categoria: 'postres', precio: 8000, disponible: true },
      { id: '11', nombre: 'Tres Leches', categoria: 'postres', precio: 10000, disponible: true }
    ]
  };

  const getEstadoColor = (estado: EstadoMesa): string => {
    const colors = {
      libre: '#22c55e',
      ocupada: '#ef4444', 
      reservada: '#f59e0b',
      limpieza: '#6b7280'
    };
    return colors[estado];
  };

  const getEstadoTexto = (estado: EstadoMesa): string => {
    const textos = {
      libre: 'Libre',
      ocupada: 'Ocupada',
      reservada: 'Reservada', 
      limpieza: 'Limpieza'
    };
    return textos[estado];
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const agregarAlCarrito = (producto: Producto) => {

  // ✅ TÍTULO DINÁMICO DE LA PÁGINA
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
            
            {/* Filtros de categoría */}
            <div className="flex gap-1 mb-4">
              {(['platos', 'bebidas', 'entradas', 'postres'] as CategoriaTipo[]).map((categoria) => (
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

            {/* Lista de productos */}
            <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
              {productosPorCategoria[categoriaActiva].map((producto) => (
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
                    </div>
                    <button
                      onClick={() => agregarAlCarrito(producto)}
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
              ))}
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
