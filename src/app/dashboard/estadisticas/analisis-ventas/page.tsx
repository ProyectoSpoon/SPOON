'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';

interface VentaHora {
  hora: string;
  ventas: number;
  clientes: number;
}

interface TopPlato {
  nombre: string;
  cantidad: number;
  ingresos: number;
  porcentaje: number;
}

interface VentaDia {
  dia: string;
  ventas: number;
  clientes: number;
}

const AnalisisVentasPage = () => {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('hoy');
  const [loading, setLoading] = useState(true);

  // KPIs específicos para corrientazos
  const kpisOperativos = [
    {
      titulo: "Ventas Hoy",
      valor: 847500,
      cambio: 12.5,
      descripcion: "vs ayer"
    },
    {
      titulo: "Clientes Servidos", 
      valor: 127,
      cambio: 8.3,
      descripcion: "personas"
    },
    {
      titulo: "Ticket Promedio",
      valor: 6674,
      cambio: 5.2,
      descripcion: "por cliente"
    },
    {
      titulo: "Plato Estrella",
      valor: "Bandeja Paisa",
      cantidad: 28,
      descripcion: "más vendido"
    }
  ];

  // Datos para gráfico simple de ventas por hora
  const ventasPorHora: VentaHora[] = [
    { hora: '11:00', ventas: 45000, clientes: 8 },
    { hora: '12:00', ventas: 125000, clientes: 22 },
    { hora: '13:00', ventas: 248000, clientes: 35 },
    { hora: '14:00', ventas: 186000, clientes: 28 },
    { hora: '15:00', ventas: 124000, clientes: 18 },
    { hora: '16:00', ventas: 89000, clientes: 12 },
    { hora: '17:00', ventas: 30500, clientes: 4 }
  ];

  // Top platos del día
  const topPlatos: TopPlato[] = [
    { nombre: "Bandeja Paisa", cantidad: 28, ingresos: 336000, porcentaje: 35 },
    { nombre: "Sancocho Trifásico", cantidad: 22, ingresos: 176000, porcentaje: 25 },
    { nombre: "Almuerzo Ejecutivo", cantidad: 18, ingresos: 180000, porcentaje: 20 },
    { nombre: "Arepa con Queso", cantidad: 25, ingresos: 75000, porcentaje: 12 },
    { nombre: "Empanadas", cantidad: 12, ingresos: 36000, porcentaje: 8 }
  ];

  // Comparativa semanal simple
  const ventasSemana: VentaDia[] = [
    { dia: "Lun", ventas: 650000, clientes: 98 },
    { dia: "Mar", ventas: 720000, clientes: 108 },
    { dia: "Mié", ventas: 780000, clientes: 118 },
    { dia: "Jue", ventas: 810000, clientes: 125 },
    { dia: "Vie", ventas: 847500, clientes: 127 },
    { dia: "Sáb", ventas: 920000, clientes: 142 },
    { dia: "Dom", ventas: 580000, clientes: 89 }
  ];

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const maxVentasHora = Math.max(...ventasPorHora.map(v => v.ventas));
  const maxVentasSemana = Math.max(...ventasSemana.map(v => v.ventas));

  // Simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [periodoSeleccionado]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white p-6 border border-gray-100 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-3 text-gray-600">Cargando análisis...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Análisis de Ventas</h1>
            <p className="text-sm text-gray-500">Rendimiento operativo del corrientazo</p>
          </div>
          <div className="text-sm text-gray-500">
            Última actualización: {new Date().toLocaleTimeString('es-CO', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>

        {/* Filtros simples */}
        <div className="flex gap-2 mb-4">
          {['hoy', 'ayer', 'semana', 'mes'].map((periodo) => (
            <button
              key={periodo}
              onClick={() => {
                setPeriodoSeleccionado(periodo);
                setLoading(true);
              }}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                periodoSeleccionado === periodo
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
            </button>
          ))}
        </div>

        {/* Línea divisoria */}
        <hr className="border-gray-200" />

        {/* KPIs principales */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {kpisOperativos.map((kpi, index) => (
            <div key={index} className="text-center p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
              <div className="text-sm text-gray-500 font-bold mb-1">{kpi.titulo}</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {typeof kpi.valor === 'string' ? kpi.valor : formatCurrency(kpi.valor)}
              </div>
              <div className="text-xs text-gray-400">
                {kpi.cantidad && `${kpi.cantidad} vendidos`}
                {kpi.cambio && (
                  <span className={`ml-1 ${kpi.cambio > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.cambio > 0 ? '+' : ''}{kpi.cambio}%
                  </span>
                )}
                <div>{kpi.descripcion}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-3">

          {/* Ventas por Hora */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
              <h3 className="text-sm text-gray-500 mb-4">Ventas por hora del día</h3>
              
              <div className="relative h-40">
                <svg width="100%" height="100%" viewBox="0 0 500 150">
                  {/* Grid */}
                  {[0, 1, 2, 3, 4].map(i => (
                    <line 
                      key={i} 
                      x1="40" 
                      y1={20 + i * 25} 
                      x2="480" 
                      y2={20 + i * 25} 
                      stroke="#f3f4f6" 
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Barras */}
                  {ventasPorHora.map((data, index) => {
                    const x = 60 + index * 60;
                    const height = (data.ventas / maxVentasHora) * 80;
                    const y = 120 - height;
                    
                    return (
                      <g key={index}>
                        <rect
                          x={x - 15}
                          y={y}
                          width="30"
                          height={height}
                          fill="#3b82f6"
                          rx="2"
                        />
                        <text x={x} y="140" textAnchor="middle" className="text-xs fill-gray-500">
                          {data.hora}
                        </text>
                        <text x={x} y={y - 5} textAnchor="middle" className="text-xs fill-gray-700">
                          {data.clientes}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                📊 Números arriba = clientes servidos por hora
              </div>
            </div>
          </div>

          {/* Top Platos */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm h-64">
              <h3 className="text-sm text-gray-500 mb-4">Top platos del día</h3>
              
              <div className="space-y-3 h-48 overflow-y-auto">
                {topPlatos.map((plato, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                        <span className="text-amber-600 font-bold text-xs">{index + 1}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{plato.nombre}</div>
                        <div className="text-xs text-gray-500">{plato.cantidad} vendidos</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">{formatCurrency(plato.ingresos)}</div>
                      <div className="text-xs text-gray-500">{plato.porcentaje}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Línea divisoria */}
          <div className="col-span-12 my-2">
            <hr className="border-gray-200" />
          </div>

          {/* Comparativa Semanal */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
              <h3 className="text-sm text-gray-500 mb-4">Ventas de la semana</h3>
              
              <div className="space-y-3">
                {ventasSemana.map((dia, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 text-xs text-gray-600 font-medium">{dia.dia}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-3 relative">
                      <div 
                        className="bg-green-500 h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${(dia.ventas / maxVentasSemana) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 w-20 text-right">
                      {formatCurrency(dia.ventas)}
                    </div>
                    <div className="text-xs text-gray-500 w-12 text-right">
                      {dia.clientes}p
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                p = personas servidas
              </div>
            </div>
          </div>

          {/* Resumen Operativo */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
              <h3 className="text-sm text-gray-500 mb-4">Resumen operativo</h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm font-bold text-green-800">Mejor hora del día</div>
                  <div className="text-green-700">1:00 PM - 2:00 PM</div>
                  <div className="text-xs text-green-600">35 clientes, {formatCurrency(248000)}</div>
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm font-bold text-blue-800">Plato estrella</div>
                  <div className="text-blue-700">Bandeja Paisa</div>
                  <div className="text-xs text-blue-600">28 vendidas (35% del total)</div>
                </div>
                
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="text-sm font-bold text-amber-800">Oportunidad</div>
                  <div className="text-amber-700">Hora 11:00 AM</div>
                  <div className="text-xs text-amber-600">Solo 8 clientes, promocionar desayunos</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Insight del día */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-bold text-blue-800">Insight del día</h3>
              <p className="text-sm text-blue-700">
                Tus ventas están <strong>12.5% por encima de ayer</strong>. La hora pico (1-2 PM) genera el 29% de tus ingresos diarios. 
                Considera promocionar más en la mañana para aumentar el flujo temprano.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalisisVentasPage;