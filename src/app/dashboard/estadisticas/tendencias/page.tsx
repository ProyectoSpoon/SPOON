'use client';

import React, { useState } from 'react';
import { useSetPageTitle } from '@/shared/Context/page-title-context';

// Tipos TypeScript
type PeriodoType = 'hoy' | 'ayer' | 'semana' | 'mes';
type ImpactoType = 'alto' | 'medio' | 'bajo';

interface KPI {
  titulo: string;
  valor: string;
  subtitulo: string;
}

interface HoraPico {
  hora: string;
  ventas: number;
  porcentaje: number;
}

interface PatronIdentificado {
  descripcion: string;
  impacto: ImpactoType;
  recomendacion: string;
}

interface TendenciaHoraria {
  hora: string;
  ventas: number;
  promedio: number;
}

const TendenciasPage = () => {

  // ✅ TÍTULO DINÁMICO DE LA PÁGINA
  useSetPageTitle('Tendencias', 'Tendencias de ventas y comportamiento');
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<PeriodoType>('mes');

  // KPIs de tendencias
  const kpisTendencias: KPI[] = [
    {
      titulo: "Hora Pico",
      valor: "12:30 PM",
      subtitulo: "mayor demanda"
    },
    {
      titulo: "Día Estrella",
      valor: "Viernes",
      subtitulo: "mejor rendimiento"
    },
    {
      titulo: "Crecimiento",
      valor: "+15%",
      subtitulo: "vs mes anterior"
    },
    {
      titulo: "Patrón Principal",
      valor: "Almuerzo",
      subtitulo: "60% de ventas"
    },
    {
      titulo: "Tendencia",
      valor: "Ascendente",
      subtitulo: "últimos 7 días"
    },
    {
      titulo: "Mejor Margen",
      valor: "14:00-16:00",
      subtitulo: "horario óptimo"
    },
    {
      titulo: "Variabilidad",
      valor: "Baja",
      subtitulo: "patrón estable"
    },
    {
      titulo: "Proyección",
      valor: "+8%",
      subtitulo: "próxima semana"
    }
  ];

  // Datos de tendencias horarias (simulados)
  const tendenciasHorarias: TendenciaHoraria[] = [
    { hora: "7:00", ventas: 15, promedio: 12 },
    { hora: "8:00", ventas: 28, promedio: 25 },
    { hora: "9:00", ventas: 35, promedio: 32 },
    { hora: "10:00", ventas: 42, promedio: 38 },
    { hora: "11:00", ventas: 58, promedio: 55 },
    { hora: "12:00", ventas: 85, promedio: 80 },
    { hora: "13:00", ventas: 92, promedio: 88 },
    { hora: "14:00", ventas: 75, promedio: 72 },
    { hora: "15:00", ventas: 65, promedio: 62 },
    { hora: "16:00", ventas: 48, promedio: 45 },
    { hora: "17:00", ventas: 35, promedio: 32 },
    { hora: "18:00", ventas: 72, promedio: 68 },
    { hora: "19:00", ventas: 88, promedio: 85 },
    { hora: "20:00", ventas: 95, promedio: 92 },
    { hora: "21:00", ventas: 68, promedio: 65 }
  ];

  // Horas pico
  const horasPico: HoraPico[] = [
    { hora: "12:30 PM", ventas: 92, porcentaje: 35 },
    { hora: "8:00 PM", ventas: 95, porcentaje: 38 },
    { hora: "7:30 PM", ventas: 88, porcentaje: 32 },
    { hora: "1:00 PM", ventas: 85, porcentaje: 30 }
  ];

  // Patrones identificados
  const patronesIdentificados: PatronIdentificado[] = [
    {
      descripcion: "Pico de almuerzo muy marcado entre 12:00-14:00",
      impacto: "alto",
      recomendacion: "Aumentar personal y stock en horario de almuerzo"
    },
    {
      descripcion: "Declive en ventas entre 15:00-17:00",
      impacto: "medio",
      recomendacion: "Considerar promociones para horario de tarde"
    },
    {
      descripcion: "Segundo pico en cenas de 19:00-21:00",
      impacto: "alto",
      recomendacion: "Optimizar menú de cenas y tiempo de preparación"
    },
    {
      descripcion: "Baja demanda en mañanas antes de 9:00",
      impacto: "bajo",
      recomendacion: "Evaluar horario de apertura y menú de desayunos"
    }
  ];

  // Datos semanales (simulados)
  const tendenciasSemanales = [
    { dia: "Lun", ventas: 420, objetivo: 450 },
    { dia: "Mar", ventas: 380, objetivo: 400 },
    { dia: "Mié", ventas: 465, objetivo: 450 },
    { dia: "Jue", ventas: 520, objetivo: 500 },
    { dia: "Vie", ventas: 685, objetivo: 650 },
    { dia: "Sáb", ventas: 720, objetivo: 700 },
    { dia: "Dom", ventas: 580, objetivo: 600 }
  ];

  const getImpactoColor = (impacto: ImpactoType): string => {
    const colors = {
      alto: '#ef4444',
      medio: '#f59e0b',
      bajo: '#3b82f6'
    };
    return colors[impacto];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      {/* KPIs Horizontales - Parte Superior */}
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {kpisTendencias.map((kpi, index) => (
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

        {/* Tendencias Horarias */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-4">Tendencias de ventas por hora</h3>
            
            <div className="relative h-40">
              <svg width="100%" height="100%" viewBox="0 0 600 150">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <line 
                    key={i} 
                    x1="50" 
                    y1={20 + i * 20} 
                    x2="550" 
                    y2={20 + i * 20} 
                    stroke="#f3f4f6" 
                    strokeWidth="1"
                  />
                ))}
                
                {/* Línea de ventas reales */}
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  points={tendenciasHorarias.slice(0, 10).map((item, i) => 
                    `${60 + i * 45},${130 - (item.ventas * 0.8)}`
                  ).join(' ')}
                />
                
                {/* Línea de promedio */}
                <polyline
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  points={tendenciasHorarias.slice(0, 10).map((item, i) => 
                    `${60 + i * 45},${130 - (item.promedio * 0.8)}`
                  ).join(' ')}
                />
                
                {/* Puntos de ventas */}
                {tendenciasHorarias.slice(0, 10).map((item, i) => (
                  <circle 
                    key={`v-${i}`} 
                    cx={60 + i * 45} 
                    cy={130 - (item.ventas * 0.8)} 
                    r="3" 
                    fill="#3b82f6"
                  />
                ))}
                
                {/* Labels */}
                {tendenciasHorarias.slice(0, 10).map((item, i) => (
                  <text 
                    key={i} 
                    x={60 + i * 45} 
                    y="145" 
                    textAnchor="middle" 
                    className="text-xs fill-gray-500"
                  >
                    {item.hora}
                  </text>
                ))}
              </svg>
            </div>
            
            <div className="flex items-center gap-4 text-sm mt-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Ventas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-green-500 rounded border-dashed border border-green-500"></div>
                <span className="text-gray-600">Promedio</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tendencias Semanales */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-4">Ventas vs objetivo semanal</h3>
            
            <div className="flex items-end gap-2 h-40 mb-3">
              {tendenciasSemanales.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="flex gap-1 items-end">
                    <div 
                      className="w-4 bg-blue-500 rounded-t"
                      style={{ height: `${(data.ventas / 800) * 120}px` }}
                    ></div>
                    <div 
                      className="w-4 bg-gray-300 rounded-t"
                      style={{ height: `${(data.objetivo / 800) * 120}px` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">{data.dia}</div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Ventas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span className="text-gray-600">Objetivo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="col-span-12 my-2">
          <hr className="border-gray-200" />
        </div>

        {/* Horas Pico */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-4">Horas pico identificadas</h3>
            
            <div className="space-y-3">
              {horasPico.map((hora, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-16 text-xs text-gray-600 text-right">{hora.hora}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-500" 
                      style={{ width: `${hora.porcentaje * 2.5}%` }}
                    ></div>
                  </div>
                  <div className="w-8 text-xs text-gray-500">{hora.ventas}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Patrones por Categoría */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-4">Distribución de demanda diaria</h3>
            
            <div className="space-y-2">
              {[
                { name: "Desayuno", value: 15, color: "#1f2937" },
                { name: "Media Mañana", value: 8, color: "#374151" },
                { name: "Almuerzo", value: 45, color: "#4b5563" },
                { name: "Tarde", value: 12, color: "#6b7280" },
                { name: "Cena", value: 20, color: "#9ca3af" }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-16 text-xs text-gray-600 text-right">{item.name}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${item.value * 2}%`, 
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

        {/* Comparativo Mes Anterior */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-4">Comparativo vs mes anterior</h3>
            
            <div className="h-40 overflow-y-auto">
              <div className="space-y-3">
                <div className="grid grid-cols-3 text-xs text-gray-500 font-medium border-b pb-2 sticky top-0 bg-white">
                  <div>Período</div>
                  <div className="text-center">Actual</div>
                  <div className="text-right">Anterior</div>
                </div>
                
                {[
                  { periodo: "Semana 1", actual: 2850, anterior: 2420 },
                  { periodo: "Semana 2", actual: 3120, anterior: 2890 },
                  { periodo: "Semana 3", actual: 3350, anterior: 3100 },
                  { periodo: "Semana 4", actual: 3680, anterior: 3200 }
                ].map((item, index) => (
                  <div key={index} className="grid grid-cols-3 text-sm py-1">
                    <div className="text-gray-900 text-xs">{item.periodo}</div>
                    <div className="text-center text-gray-600">{item.actual.toLocaleString()}</div>
                    <div className="text-right text-gray-900 font-medium">
                      {item.anterior.toLocaleString()}
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

        {/* Patrones Identificados */}
        <div className="col-span-12">
          <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-sm text-gray-500 mb-4">Patrones identificados y recomendaciones</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {patronesIdentificados.map((patron, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: getImpactoColor(patron.impacto) }}
                    ></div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">{patron.descripcion}</div>
                      <div className="text-sm text-gray-600">{patron.recomendacion}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TendenciasPage;
