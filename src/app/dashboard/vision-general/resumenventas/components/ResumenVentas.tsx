'use client';

import { DollarSign, TrendingUp, Utensils, Calendar, ChevronDown, ChevronUp, Activity, Award } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Datos de ejemplo - Esto vendría de tu backend
const datosVentas = {
  hoy: {
    total: 850000,
    incremento: 12.5,
    totalPedidos: 45,
    platoMasVendido: "Hamburguesa Clásica",
    ticketPromedio: 18900,
    horasPico: "12:00 - 14:00",
    detallesVentas: [
      { categoria: "Platos Principales", valor: 450000, porcentaje: 53 },
      { categoria: "Entradas", valor: 125000, porcentaje: 15 },
      { categoria: "Bebidas", valor: 175000, porcentaje: 20 },
      { categoria: "Postres", valor: 100000, porcentaje: 12 }
    ]
  },
  semana: {
    total: 5250000,
    incremento: 8.3,
    totalPedidos: 280,
    platoMasVendido: "Pizza Margherita",
    ticketPromedio: 18750,
    horasPico: "19:00 - 21:00",
    detallesVentas: [
      { categoria: "Platos Principales", valor: 2625000, porcentaje: 50 },
      { categoria: "Entradas", valor: 840000, porcentaje: 16 },
      { categoria: "Bebidas", valor: 1050000, porcentaje: 20 },
      { categoria: "Postres", valor: 735000, porcentaje: 14 }
    ]
  },
  mes: {
    total: 22500000,
    incremento: 15.2,
    totalPedidos: 1200,
    platoMasVendido: "Pizza Margherita",
    ticketPromedio: 18750,
    horasPico: "19:00 - 21:00",
    detallesVentas: [
      { categoria: "Platos Principales", valor: 11250000, porcentaje: 50 },
      { categoria: "Entradas", valor: 3600000, porcentaje: 16 },
      { categoria: "Bebidas", valor: 4500000, porcentaje: 20 },
      { categoria: "Postres", valor: 3150000, porcentaje: 14 }
    ]
  }
};

// Datos para el gráfico de ventas diarias
const datosGrafico = [
  { name: 'Lun', ventas: 850000 },
  { name: 'Mar', ventas: 920000 },
  { name: 'Mie', ventas: 880000 },
  { name: 'Jue', ventas: 950000 },
  { name: 'Vie', ventas: 1100000 },
  { name: 'Sab', ventas: 1250000 },
  { name: 'Dom', ventas: 1300000 },
];

// Datos para el gráfico de ventas por hora
const datosHora = [
  { hora: '8-10', ventas: 120000 },
  { hora: '10-12', ventas: 180000 },
  { hora: '12-14', ventas: 350000 },
  { hora: '14-16', ventas: 200000 },
  { hora: '16-18', ventas: 150000 },
  { hora: '18-20', ventas: 280000 },
  { hora: '20-22', ventas: 320000 },
];

// Colores para el gráfico de sectores
const COLORES_CATEGORIAS = ['#F4821F', '#36A2EB', '#4BC0C0', '#9966FF', '#FF9F40'];

const formatearMoneda = (valor: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
};

export const ResumenVentas = () => {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<'hoy' | 'semana' | 'mes'>('hoy');
  const datos = datosVentas[periodoSeleccionado];
  const [mostrarDetallesVentas, setMostrarDetallesVentas] = useState(false);
  const [verMasEstadisticas, setVerMasEstadisticas] = useState(false);

  const toggleDetallesVentas = () => {
    setMostrarDetallesVentas(!mostrarDetallesVentas);
  };

  return (
    <motion.div 
      className="space-y-6"
      layout
    >
      {/* Selector de período con diseño mejorado */}
      <Card className="p-4 bg-white border-none shadow-sm">
        <div className="flex flex-wrap gap-4 mb-2">
          <div className="flex-grow">
            <h3 className="text-lg font-medium text-gray-700">Filtros</h3>
            <p className="text-sm text-gray-500">Selecciona un período para visualizar tus datos</p>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => setVerMasEstadisticas(!verMasEstadisticas)}
              className="flex items-center gap-1 text-sm font-medium text-[#F4821F] hover:text-[#CC6A10]"
            >
              {verMasEstadisticas ? 'Menos estadísticas' : 'Más estadísticas'}
              {verMasEstadisticas ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          {(['hoy', 'semana', 'mes'] as const).map((periodo) => (
            <motion.button
              key={periodo}
              onClick={() => setPeriodoSeleccionado(periodo)}
              className={`
                px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2
                ${periodoSeleccionado === periodo
                  ? 'bg-[#F4821F] text-white shadow-lg shadow-[#F4821F]/30'
                  : 'bg-white text-neutral-600 hover:bg-[#FFF9F2] border border-gray-200'}
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {periodo === 'hoy' && <Calendar size={16} />}
              {periodo === 'semana' && <Calendar size={16} />}
              {periodo === 'mes' && <Calendar size={16} />}
              {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
            </motion.button>
          ))}
        </div>
      </Card>

      {/* Tarjetas de estadísticas principales con animación y diseño mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Ventas Totales */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="p-6 bg-white border-none shadow-md hover:shadow-lg transition-all rounded-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#F4821F]/10 to-transparent rounded-bl-full" />
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-100 to-green-50 rounded-full shadow-sm">
                <DollarSign className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 font-medium">Ventas Totales</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-neutral-900">
                    {formatearMoneda(datos.total)}
                  </p>
                  <span className="text-xs font-medium text-green-600 flex items-center">
                    <ChevronUp size={12} />
                    {datos.incremento}%
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={toggleDetallesVentas}
              className="mt-4 text-sm text-[#F4821F] hover:text-[#CC6A10] font-medium flex items-center gap-1"
            >
              {mostrarDetallesVentas ? 'Ocultar detalles' : 'Ver detalles'}
              {mostrarDetallesVentas ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </Card>
        </motion.div>

        {/* Total Pedidos */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="p-6 bg-white border-none shadow-md hover:shadow-lg transition-all rounded-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-bl-full" />
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full shadow-sm">
                <TrendingUp className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 font-medium">Total Pedidos</p>
                <p className="text-2xl font-bold text-neutral-900 flex items-baseline gap-2">
                  {datos.totalPedidos}
                  <span className="text-sm font-medium text-neutral-600">pedidos</span>
                </p>
              </div>
            </div>
            <div className="mt-4 text-sm text-neutral-600">
              <div className="flex justify-between">
                <span>Ticket promedio:</span>
                <span className="font-semibold">{formatearMoneda(datos.ticketPromedio)}</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Plato Más Vendido */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="p-6 bg-white border-none shadow-md hover:shadow-lg transition-all rounded-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-100/50 to-transparent rounded-bl-full" />
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 rounded-full shadow-sm">
                <Award className="h-7 w-7 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 font-medium">Plato Más Vendido</p>
                <p className="text-xl font-bold text-neutral-900">
                  {datos.platoMasVendido}
                </p>
              </div>
            </div>
            <div className="mt-4 text-sm text-neutral-600">
              <div className="flex justify-between">
                <span>Hora pico:</span>
                <span className="font-semibold">{datos.horasPico}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Detalles de ventas expandibles */}
      <AnimatePresence>
        {mostrarDetallesVentas && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 bg-white border-none shadow-md">
              <h3 className="text-lg font-semibold mb-4">Detalles de Ventas por Categoría</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de categorías */}
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={datos.detallesVentas}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="valor"
                        label={({ name, percent }) => `${percent * 100}%`}
                      >
                        {datos.detallesVentas.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORES_CATEGORIAS[index % COLORES_CATEGORIAS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatearMoneda(Number(value)), 'Ventas']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Tabla de detalles */}
                <div className="flex flex-col justify-center">
                  <div className="space-y-2">
                    {datos.detallesVentas.map((categoria, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div 
                          className="w-3 h-3 rounded-full mr-3" 
                          style={{ backgroundColor: COLORES_CATEGORIAS[index % COLORES_CATEGORIAS.length] }}
                        />
                        <div className="flex-grow">
                          <div className="text-sm font-medium">{categoria.categoria}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatearMoneda(categoria.valor)}</div>
                          <div className="text-xs text-gray-500">{categoria.porcentaje}% del total</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gráfico de ventas mejorado */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="p-6 bg-white border-none shadow-md hover:shadow-lg transition-all">
          <h3 className="text-lg font-semibold mb-1">Tendencia de Ventas</h3>
          <p className="text-sm text-gray-500 mb-4">Análisis de ventas durante la última semana</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={datosGrafico}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F4821F" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F4821F" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis 
                  tickFormatter={(value) => `$${value/1000}k`} 
                  axisLine={false} 
                  tickLine={false}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  formatter={(value: number) => [formatearMoneda(value), "Ventas"]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                />
                <Line
                  type="monotone"
                  dataKey="ventas"
                  stroke="#F4821F"
                  strokeWidth={3}
                  dot={{ fill: "#F4821F", r: 4, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6, stroke: "#F4821F", strokeWidth: 2 }}
                  fill="url(#colorVentas)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Estadísticas adicionales */}
      <AnimatePresence>
        {verMasEstadisticas && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 bg-white border-none shadow-md hover:shadow-lg transition-all">
              <h3 className="text-lg font-semibold mb-1">Ventas por Hora</h3>
              <p className="text-sm text-gray-500 mb-4">Distribución de ventas durante el día</p>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datosHora}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                    <XAxis dataKey="hora" axisLine={false} tickLine={false} />
                    <YAxis 
                      tickFormatter={(value) => `$${value/1000}k`} 
                      axisLine={false} 
                      tickLine={false}
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatearMoneda(value), "Ventas"]} 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                    />
                    <Bar 
                      dataKey="ventas" 
                      fill="#4BC0C0" 
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
