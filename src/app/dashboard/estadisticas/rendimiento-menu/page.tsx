'use client';

import React, { useState } from 'react';

// Tipos TypeScript
type StatusType = 'estrella' | 'excelente' | 'bueno' | 'bajo';
type PeriodoType = 'hoy' | 'ayer' | 'semana' | 'mes';

interface PlatoRendimiento {
  nombre: string;
  categoria: string;
  vendidos: number;
  ingresos: number;
  margen: number;
  status: StatusType;
}

interface KPI {
  titulo: string;
  valor: string;
  subtitulo: string;
}

interface Categoria {
  nombre: string;
  platos: number;
  ingresos: number;
  margen: number;
}

const RendimientoMenuPage = () => {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<PeriodoType>('hoy');

  // KPIs del rendimiento del menú
  const kpisMenu: KPI[] = [
    {
      titulo: "Plato Estrella",
      valor: "Bandeja Paisa",
      subtitulo: "28 vendidos"
    },
    {
      titulo: "Mayor Ingreso",
      valor: "$336k",
      subtitulo: "Bandeja Paisa"
    },
    {
      titulo: "Mejor Margen",
      valor: "78%",
      subtitulo: "Arepa con Queso"
    },
    {
      titulo: "Platos Activos",
      valor: "8/12",
      subtitulo: "del menú total"
    },
    {
      titulo: "Ingresos Totales",
      valor: "$1.122k",
      subtitulo: "todos los platos"
    },
    {
      titulo: "Margen Promedio",
      valor: "68%",
      subtitulo: "rentabilidad general"
    },
    {
      titulo: "Platos Vendidos",
      valor: "163",
      subtitulo: "total de órdenes"
    },
    {
      titulo: "Ticket Promedio",
      valor: "$6.9k",
      subtitulo: "por plato"
    }
  ];

  // Rendimiento de platos del día
  const platosRendimiento: PlatoRendimiento[] = [
    {
      nombre: "Bandeja Paisa",
      categoria: "Platos Fuertes", 
      vendidos: 28,
      ingresos: 336000,
      margen: 65,
      status: "estrella"
    },
    {
      nombre: "Arepa con Queso",
      categoria: "Desayunos",
      vendidos: 25,
      ingresos: 75000,
      margen: 78,
      status: "excelente"
    },
    {
      nombre: "Sancocho Trifásico", 
      categoria: "Sopas",
      vendidos: 22,
      ingresos: 176000,
      margen: 56,
      status: "bueno"
    },
    {
      nombre: "Almuerzo Ejecutivo",
      categoria: "Combos",
      vendidos: 18,
      ingresos: 180000,
      margen: 55,
      status: "bueno"
    },
    {
      nombre: "Empanadas",
      categoria: "Aperitivos",
      vendidos: 12,
      ingresos: 36000,
      margen: 80,
      status: "excelente"
    },
    {
      nombre: "Pescado Frito",
      categoria: "Platos Fuertes",
      vendidos: 8,
      ingresos: 144000,
      margen: 68,
      status: "bajo"
    },
    {
      nombre: "Ensalada César",
      categoria: "Ensaladas", 
      vendidos: 5,
      ingresos: 40000,
      margen: 75,
      status: "bajo"
    },
    {
      nombre: "Jugo Natural",
      categoria: "Bebidas",
      vendidos: 45,
      ingresos: 135000,
      margen: 85,
      status: "excelente"
    }
  ];

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: StatusType): string => {
    const colors: Record<StatusType, string> = {
      estrella: '#fbbf24',
      excelente: '#22c55e',
      bueno: '#3b82f6',
      bajo: '#ef4444'
    };
    return colors[status] || colors.bueno;
  };

  // Análisis por categorías
  const categorias: Categoria[] = [
    { nombre: "Platos Fuertes", platos: 3, ingresos: 660000, margen: 63 },
    { nombre: "Desayunos", platos: 1, ingresos: 75000, margen: 78 },
    { nombre: "Sopas", platos: 1, ingresos: 176000, margen: 56 },
    { nombre: "Bebidas", platos: 1, ingresos: 135000, margen: 85 },
    { nombre: "Aperitivos", platos: 1, ingresos: 36000, margen: 80 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      {/* KPIs Horizontales - Parte Superior */}
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {kpisMenu.map((kpi, index) => (
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

      {/* Filtros simples */}
      <div className="flex gap-2 mb-4">
        {(['hoy', 'ayer', 'semana', 'mes'] as PeriodoType[]).map((periodo) => (
          <button
            key={periodo}
            onClick={() => setPeriodoSeleccionado(periodo)}
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

      {/* Línea divisoria principal */}
      <div className="mb-4">
        <hr className="border-gray-200" />
      </div>

      <div className="grid grid-cols-12 gap-3">

        {/* Análisis por Categorías */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-4">Rendimiento por categoría</h3>
            
            <div className="space-y-3">
              {categorias.map((categoria, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-20 text-xs text-gray-600 text-right">{categoria.nombre}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gray-600" 
                      style={{ width: `${(categoria.ingresos / 660000) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-12 text-xs text-gray-500">{categoria.margen}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gráfico de Ventas por Plato */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-4">Ventas por plato (cantidad)</h3>
            
            <div className="relative h-40">
              <svg width="100%" height="100%" viewBox="0 0 300 150">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line 
                    key={i} 
                    x1="0" 
                    y1={25 + i * 25} 
                    x2="300" 
                    y2={25 + i * 25} 
                    stroke="#f3f4f6" 
                    strokeWidth="1"
                  />
                ))}
                
                {/* Barras */}
                {platosRendimiento.slice(0, 6).map((plato, i) => {
                  const height = (plato.vendidos / 45) * 100;
                  const x = 40 + i * 35;
                  return (
                    <rect
                      key={i}
                      x={x}
                      y={125 - height}
                      width="20"
                      height={height}
                      fill={getStatusColor(plato.status)}
                    />
                  );
                })}
                
                {/* Labels */}
                {platosRendimiento.slice(0, 6).map((plato, i) => (
                  <text 
                    key={i} 
                    x={50 + i * 35} 
                    y="140" 
                    textAnchor="middle" 
                    className="text-xs fill-gray-500"
                  >
                    {plato.nombre.split(' ')[0]}
                  </text>
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Top Platos por Ingreso */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-4">Top platos por ingresos</h3>
            
            <div className="h-40 overflow-y-auto">
              <div className="space-y-3">
                <div className="grid grid-cols-3 text-xs text-gray-500 font-medium border-b pb-2 sticky top-0 bg-white">
                  <div>Plato</div>
                  <div className="text-center">Vendidos</div>
                  <div className="text-right">Ingresos</div>
                </div>
                
                {platosRendimiento
                  .sort((a, b) => b.ingresos - a.ingresos)
                  .map((plato, index) => (
                    <div key={index} className="grid grid-cols-3 text-sm py-1">
                      <div className="text-gray-900 text-xs">{plato.nombre}</div>
                      <div className="text-center text-gray-600">{plato.vendidos}</div>
                      <div className="text-right text-gray-900 font-medium">
                        ${Math.round(plato.ingresos / 1000)}k
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="col-span-12 my-2">
          <hr className="border-gray-200" />
        </div>

        {/* Rendimiento por Margen */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-4">Margen de ganancia por plato</h3>
            
            <div className="relative h-32">
              <svg width="100%" height="100%" viewBox="0 0 500 120">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line 
                    key={i} 
                    x1="50" 
                    y1={15 + i * 20} 
                    x2="450" 
                    y2={15 + i * 20} 
                    stroke="#f3f4f6" 
                    strokeWidth="1"
                  />
                ))}
                
                {/* Línea de margen */}
                <polyline
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3"
                  points={platosRendimiento.map((plato, i) => 
                    `${70 + i * 45},${100 - (plato.margen * 0.8)}`
                  ).join(' ')}
                />
                
                {/* Puntos */}
                {platosRendimiento.map((plato, i) => (
                  <circle 
                    key={i} 
                    cx={70 + i * 45} 
                    cy={100 - (plato.margen * 0.8)} 
                    r="4" 
                    fill="#22c55e"
                  />
                ))}
                
                {/* Labels */}
                {platosRendimiento.map((plato, i) => (
                  <text 
                    key={i} 
                    x={70 + i * 45} 
                    y="115" 
                    textAnchor="middle" 
                    className="text-xs fill-gray-500"
                  >
                    {plato.nombre.split(' ')[0]}
                  </text>
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Comparativo Ventas vs Margen */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-4">Ventas vs margen por plato</h3>
            
            <div className="flex items-end gap-2 h-32 mb-3">
              {platosRendimiento.slice(0, 7).map((plato, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="flex gap-1 items-end">
                    <div 
                      className="w-3 bg-blue-500 rounded-t"
                      style={{ height: `${(plato.vendidos / 45) * 80}px` }}
                    ></div>
                    <div 
                      className="w-3 bg-green-500 rounded-t"
                      style={{ height: `${(plato.margen / 85) * 80}px` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-center">
                    {plato.nombre.split(' ')[0]}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Vendidos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Margen %</span>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="col-span-12 my-2">
          <hr className="border-gray-200" />
        </div>

        {/* Tabla de Rendimiento Completo */}
        <div className="col-span-12">
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-4">Rendimiento detallado por plato</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-bold text-gray-500">Plato</th>
                    <th className="text-center py-3 px-2 text-sm font-bold text-gray-500">Estado</th>
                    <th className="text-center py-3 px-2 text-sm font-bold text-gray-500">Vendidos</th>
                    <th className="text-right py-3 px-2 text-sm font-bold text-gray-500">Ingresos</th>
                    <th className="text-center py-3 px-2 text-sm font-bold text-gray-500">Margen</th>
                  </tr>
                </thead>
                <tbody>
                  {platosRendimiento.map((plato, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div>
                          <div className="font-medium text-gray-900">{plato.nombre}</div>
                          <div className="text-xs text-gray-500">{plato.categoria}</div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span 
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ backgroundColor: getStatusColor(plato.status) }}
                        ></span>
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-gray-900">
                        {plato.vendidos}
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-gray-900">
                        {formatCurrency(plato.ingresos)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          plato.margen > 70 ? 'bg-green-100 text-green-700' :
                          plato.margen > 60 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {plato.margen}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RendimientoMenuPage;