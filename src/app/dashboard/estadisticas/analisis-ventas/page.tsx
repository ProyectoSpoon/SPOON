'use client';

import React, { useState } from 'react';
import { useSetPageTitle } from '@/shared/Context/page-title-context';
import { Card } from '@/shared/components/ui/Card';
import { useSalesAnalysis } from '@/hooks/useSalesAnalysis';
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

const AnalisisVentasPage = () => {
  // ✅ TÍTULO DINÁMICO DE LA PÁGINA
  useSetPageTitle('Análisis de Ventas', 'Reportes detallados de ventas');
  
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('hoy');
  
  // ✅ DATOS DINÁMICOS DE LA API
  const {
    data,
    loading,
    error,
    formattedKPIs,
    formatCurrency,
    maxVentasHora,
    maxVentasSemana,
    insights,
    refetch
  } = useSalesAnalysis(periodoSeleccionado);

  // ✅ ESTADOS DE CARGA Y ERROR MEJORADOS
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white p-6 border border-gray-100 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-3 text-gray-600">Cargando análisis de ventas...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white p-6 border border-red-200 rounded-lg shadow-sm max-w-md">
          <div className="flex items-center text-red-600 mb-4">
            <AlertCircle className="h-6 w-6 mr-2" />
            <span className="font-semibold">Error al cargar datos</span>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!data || !insights?.tiene_datos) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-blue-800 mb-2">🚀 Servicio Nuevo</h2>
              <p className="text-blue-700 mb-4">
                Aún no tienes ventas registradas. Los análisis aparecerán cuando comiences a vender.
              </p>
              <button
                onClick={() => window.location.href = '/dashboard/registro-ventas'}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Ir a Registro de Ventas
              </button>
            </div>
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

        {/* ✅ KPIs DINÁMICOS */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {formattedKPIs.map((kpi: any, index: number) => (
            <div key={index} className="text-center p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
              <div className="text-sm text-gray-500 font-bold mb-1">{kpi.titulo}</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {typeof kpi.valor === 'string' ? kpi.valor : formatCurrency(Number(kpi.valor))}
              </div>
              <div className="text-xs text-gray-400">
                {kpi.cantidad && `${kpi.cantidad} vendidos`}
                {kpi.cambio !== undefined && (
                  <span className={`ml-1 flex items-center justify-center gap-1 ${
                    kpi.cambio > 0 ? 'text-green-600' : kpi.cambio < 0 ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {kpi.cambio > 0 && <TrendingUp className="h-3 w-3" />}
                    {kpi.cambio < 0 && <TrendingDown className="h-3 w-3" />}
                    {kpi.cambio > 0 ? '+' : ''}{kpi.cambio.toFixed(1)}%
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
                  
                  {/* ✅ BARRAS DINÁMICAS */}
                  {data?.ventas_por_hora?.map((ventaData: any, index: number) => {
                    const x = 60 + index * 60;
                    const height = maxVentasHora > 0 ? (ventaData.ventas / maxVentasHora) * 80 : 0;
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
                          {ventaData.hora}
                        </text>
                        <text x={x} y={y - 5} textAnchor="middle" className="text-xs fill-gray-700">
                          {ventaData.clientes}
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
                {data?.top_platos?.length > 0 ? (
                  data.top_platos.map((plato: any, index: number) => (
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
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No hay datos de platos</p>
                  </div>
                )}
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
                {data?.ventas_semana?.length > 0 ? (
                  data.ventas_semana.map((dia: any, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 text-xs text-gray-600 font-medium">{dia.dia}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 relative">
                        <div 
                          className="bg-green-500 h-3 rounded-full transition-all duration-500" 
                          style={{ width: `${maxVentasSemana > 0 ? (dia.ventas / maxVentasSemana) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <div className="text-sm font-medium text-gray-900 w-20 text-right">
                        {formatCurrency(dia.ventas)}
                      </div>
                      <div className="text-xs text-gray-500 w-12 text-right">
                        {dia.clientes}p
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No hay datos de la semana</p>
                  </div>
                )}
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
                {insights?.mejor_hora && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-sm font-bold text-green-800">Mejor hora del día</div>
                    <div className="text-green-700">{insights.mejor_hora.hora}</div>
                    <div className="text-xs text-green-600">
                      {insights.mejor_hora.clientes} clientes, {formatCurrency(insights.mejor_hora.ventas)}
                    </div>
                  </div>
                )}
                
                {insights?.plato_estrella && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm font-bold text-blue-800">Plato estrella</div>
                    <div className="text-blue-700">{insights.plato_estrella.nombre}</div>
                    <div className="text-xs text-blue-600">
                      {insights.plato_estrella.cantidad} vendidas ({insights.plato_estrella.porcentaje}% del total)
                    </div>
                  </div>
                )}
                
                {insights?.oportunidad && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="text-sm font-bold text-amber-800">Oportunidad</div>
                    <div className="text-amber-700">Hora {insights.oportunidad.hora}</div>
                    <div className="text-xs text-amber-600">
                      Solo {insights.oportunidad.clientes} clientes, promocionar en esta hora
                    </div>
                  </div>
                )}
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
