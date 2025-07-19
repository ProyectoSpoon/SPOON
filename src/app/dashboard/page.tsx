// app/dashboard/page.tsx - Dashboard Minimalista SPOON
'use client';

import React from 'react';
import { useSetPageTitle } from '@/shared/Context/page-title-context';

export default function DashboardPage() {

  // ✅ TÍTULO DINÁMICO DE LA PÁGINA
  useSetPageTitle('Dashboard', 'Panel principal de control');
  
  // Nota: La verificación de restaurante se hace en el login
  // Si llegamos aquí, es porque el usuario ya tiene restaurante configurado
  // Datos de KPIs para restaurantes (adaptados a SPOON)
  const kpis = [
    { titulo: "Órdenes Hoy", valor: "127", subtitulo: "Clientes atendidos" },
    { titulo: "Clientes Únicos", valor: "98", subtitulo: "" },
    { titulo: "Ingresos", valor: "$847k", subtitulo: "" },
    { titulo: "Ganancia", valor: "$124k", subtitulo: "" },
    { titulo: "Plato Popular", valor: "Bandeja Paisa", subtitulo: "35% de ventas" },
    { titulo: "Gastos", valor: "$89k", subtitulo: "Desglose por tipo" },
    { titulo: "Devoluciones", valor: "$12k", subtitulo: "" },
    { titulo: "Nómina", valor: "$156k", subtitulo: "" }
  ];

  // Datos de platos populares (colombianos)
  const platosPopulares = [
    { nombre: "Bandeja Paisa", cantidad: 28, revenue: "$658k" },
    { nombre: "Sancocho Trifásico", cantidad: 15, revenue: "$285k" },
    { nombre: "Arepa con Queso", cantidad: 42, revenue: "$210k" },
    { nombre: "Pollo Asado", cantidad: 18, revenue: "$324k" },
    { nombre: "Pescado Frito", cantidad: 8, revenue: "$144k" },
    { nombre: "Empanadas", cantidad: 35, revenue: "$175k" },
    { nombre: "Ensalada César", cantidad: 12, revenue: "$96k" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      {/* KPIs Horizontales - Parte Superior */}
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {kpis.map((kpi, index) => (
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

      {/* Línea divisoria principal */}
      <div className="mb-4">
        <hr className="border-gray-200" />
      </div>

      <div className="grid grid-cols-12 gap-3">
        
        {/* Gráfico de Clientes Diarios */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm h-64">
            <h3 className="text-sm text-gray-500 mb-4">Clientes atendidos por día</h3>
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
                
                {/* Línea de clientes */}
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  points="50,110 100,75 150,80 200,55 250,65"
                />
                
                {/* Puntos */}
                {[{x: 50, y: 110}, {x: 100, y: 75}, {x: 150, y: 80}, {x: 200, y: 55}, {x: 250, y: 65}].map((point, i) => (
                  <circle 
                    key={i} 
                    cx={point.x} 
                    cy={point.y} 
                    r="4" 
                    fill="#3b82f6"
                  />
                ))}
                
                {/* Labels */}
                <text x="50" y="140" textAnchor="middle" className="text-xs fill-gray-500">Lun</text>
                <text x="100" y="140" textAnchor="middle" className="text-xs fill-gray-500">Mar</text>
                <text x="150" y="140" textAnchor="middle" className="text-xs fill-gray-500">Mié</text>
                <text x="200" y="140" textAnchor="middle" className="text-xs fill-gray-500">Jue</text>
                <text x="250" y="140" textAnchor="middle" className="text-xs fill-gray-500">Vie</text>
              </svg>
            </div>
          </div>
        </div>

        {/* Distribución de Ventas por Categoría */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm h-64">
            <h3 className="text-sm text-gray-500 mb-4">Distribución de ventas por categoría</h3>
            
            {/* Gráfico de barras horizontales */}
            <div className="space-y-2">
              {[
                { name: "Platos Fuertes", value: 35, color: "#1f2937" },
                { name: "Sopas", value: 20, color: "#374151" },
                { name: "Desayunos", value: 18, color: "#4b5563" },
                { name: "Bebidas", value: 12, color: "#6b7280" },
                { name: "Postres", value: 8, color: "#9ca3af" },
                { name: "Ensaladas", value: 4, color: "#d1d5db" },
                { name: "Otros", value: 3, color: "#e5e7eb" }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-20 text-xs text-gray-600 text-right">{item.name}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${item.value * 2.5}%`, 
                        backgroundColor: item.color 
                      }}
                    ></div>
                  </div>
                  <div className="w-8 text-xs text-gray-500">{item.value}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Platos Más Populares */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm h-64">
            <h3 className="text-sm text-gray-500 mb-4">Platos más populares</h3>
            
            <div className="h-48 overflow-y-auto">
              <div className="space-y-3">
                <div className="grid grid-cols-3 text-xs text-gray-500 font-medium border-b pb-2 sticky top-0 bg-white">
                  <div>Plato</div>
                  <div className="text-center">Cantidad</div>
                  <div className="text-right">Ingresos</div>
                </div>
                
                {platosPopulares.map((plato, index) => (
                  <div key={index} className="grid grid-cols-3 text-sm py-1">
                    <div className="text-gray-900">{plato.nombre}</div>
                    <div className="text-center text-gray-600">{plato.cantidad}</div>
                    <div className="text-right text-gray-900 font-medium">{plato.revenue}</div>
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

        {/* Tendencia de Ventas Semanales */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-4">Ventas y devoluciones semanales</h3>
            
            {/* Gráfico de líneas dual */}
            <div className="relative h-28">
              <svg width="100%" height="100%" viewBox="0 0 350 110">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line 
                    key={i} 
                    x1="30" 
                    y1={15 + i * 20} 
                    x2="320" 
                    y2={15 + i * 20} 
                    stroke="#f3f4f6" 
                    strokeWidth="1"
                  />
                ))}
                
                {/* Línea de ventas */}
                <polyline
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeDasharray="none"
                  points="50,70 90,50 130,75 170,35 210,25 250,30 290,55"
                />
                
                {/* Línea de devoluciones */}
                <polyline
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  points="50,85 90,90 130,75 170,85 210,80 250,95 290,85"
                />
                
                {/* Puntos de ventas */}
                {[
                  {x: 50, y: 70}, {x: 90, y: 50}, {x: 130, y: 75}, 
                  {x: 170, y: 35}, {x: 210, y: 25}, {x: 250, y: 30}, {x: 290, y: 55}
                ].map((point, i) => (
                  <circle 
                    key={`v-${i}`} 
                    cx={point.x} 
                    cy={point.y} 
                    r="3" 
                    fill="#22c55e"
                    stroke="white"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Puntos de devoluciones */}
                {[
                  {x: 50, y: 85}, {x: 90, y: 90}, {x: 130, y: 75}, 
                  {x: 170, y: 85}, {x: 210, y: 80}, {x: 250, y: 95}, {x: 290, y: 85}
                ].map((point, i) => (
                  <circle 
                    key={`d-${i}`} 
                    cx={point.x} 
                    cy={point.y} 
                    r="3" 
                    fill="#ef4444"
                    stroke="white"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Labels */}
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((label, i) => (
                  <text key={label} x={50 + i * 40} y="105" textAnchor="middle" className="text-xs fill-gray-500">
                    {label}
                  </text>
                ))}
              </svg>
            </div>
            
            <div className="flex items-center gap-4 text-sm mt-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-green-500 rounded"></div>
                <span className="text-gray-600">Ventas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-red-500 rounded border-dashed border border-red-500"></div>
                <span className="text-gray-600">Devoluciones</span>
              </div>
            </div>
          </div>
        </div>

        {/* Capacidad vs Demanda */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-4">Clientes atendidos vs capacidad</h3>
            
            {/* Gráfico de barras agrupadas */}
            <div className="flex items-end gap-2 h-28 mb-3">
              {[
                { clientes: 45, capacidad: 60, day: "Lun" },
                { clientes: 52, capacidad: 60, day: "Mar" },
                { clientes: 38, capacidad: 60, day: "Mié" },
                { clientes: 48, capacidad: 60, day: "Jue" },
                { clientes: 58, capacidad: 60, day: "Vie" },
                { clientes: 60, capacidad: 60, day: "Sáb" },
                { clientes: 55, capacidad: 60, day: "Dom" }
              ].map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="flex gap-1 items-end">
                    <div 
                      className="w-4 bg-blue-500 rounded-t"
                      style={{ height: `${data.clientes * 1.5}px` }}
                    ></div>
                    <div 
                      className="w-4 bg-gray-300 rounded-t"
                      style={{ height: `${data.capacidad * 1.5}px` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">{data.day}</div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Clientes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span className="text-gray-600">Capacidad</span>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="col-span-12 my-2">
          <hr className="border-gray-200" />
        </div>

        {/* Ingresos vs Gastos Mensuales */}
        <div className="col-span-12">
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-4">Ingresos vs gastos operativos mensuales</h3>
            
            {/* Gráfico de líneas doble */}
            <div className="relative h-40">
              <svg width="100%" height="100%" viewBox="0 0 600 150">
                {/* Grid */}
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <line 
                    key={i} 
                    x1="0" 
                    y1={20 + i * 20} 
                    x2="600" 
                    y2={20 + i * 20} 
                    stroke="#f3f4f6" 
                    strokeWidth="1"
                  />
                ))}
                
                {/* Línea de ingresos */}
                <polyline
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3"
                  points="50,100 100,85 150,75 200,65 250,55 300,50 350,45 400,50 450,55 500,60 550,65"
                />
                
                {/* Línea de gastos */}
                <polyline
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  points="50,120 100,115 150,110 200,105 250,100 300,95 350,90 400,95 450,100 500,105 550,110"
                />
                
                {/* Puntos de ingresos */}
                {[50,100,150,200,250,300,350,400,450,500,550].map((x, i) => {
                  const y = [100,85,75,65,55,50,45,50,55,60,65][i];
                  return <circle key={`ing-${i}`} cx={x} cy={y} r="3" fill="#22c55e" />
                })}
                
                {/* Puntos de gastos */}
                {[50,100,150,200,250,300,350,400,450,500,550].map((x, i) => {
                  const y = [120,115,110,105,100,95,90,95,100,105,110][i];
                  return <circle key={`gas-${i}`} cx={x} cy={y} r="3" fill="#ef4444" />
                })}
                
                {/* Labels de meses */}
                {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov'].map((mes, i) => (
                  <text key={mes} x={50 + i * 45} y="140" textAnchor="middle" className="text-xs fill-gray-500">{mes}</text>
                ))}
              </svg>
            </div>
            
            <div className="flex items-center gap-6 text-sm mt-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Ingresos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">Gastos Operativos</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
