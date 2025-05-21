'use client';

import { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Trophy, TrendingUp, Pizza, DollarSign } from 'lucide-react';

// Datos de ejemplo - Esto vendría de Firebase
const datosPlatos = {
  hamburguesas: [
    { nombre: "Hamburguesa Clásica", vendidos: 150, ingresos: 2250000 },
    { nombre: "Hamburguesa BBQ", vendidos: 120, ingresos: 2040000 },
    { nombre: "Hamburguesa Vegana", vendidos: 80, ingresos: 1440000 },
  ],
  pizzas: [
    { nombre: "Pizza Margherita", vendidos: 200, ingresos: 3000000 },
    { nombre: "Pizza Pepperoni", vendidos: 180, ingresos: 2880000 },
    { nombre: "Pizza Hawaiana", vendidos: 130, ingresos: 1950000 },
  ],
  postres: [
    { nombre: "Tiramisú", vendidos: 90, ingresos: 900000 },
    { nombre: "Cheesecake", vendidos: 85, ingresos: 850000 },
    { nombre: "Brownie", vendidos: 75, ingresos: 600000 },
  ]
};

const TarjetaPlatoPopular = ({ 
  plato, 
  posicion 
}: { 
  plato: { nombre: string; vendidos: number; ingresos: number }; 
  posicion: number 
}) => {
  return (
    <Card className="p-6 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`
            p-2 rounded-full 
            ${posicion === 1 ? 'bg-yellow-100' : 
              posicion === 2 ? 'bg-gray-100' : 
              'bg-orange-100'}
          `}>
            <Trophy className={`h-5 w-5 
              ${posicion === 1 ? 'text-yellow-600' : 
                posicion === 2 ? 'text-gray-600' : 
                'text-orange-600'}
            `} />
          </div>
          <p className="font-semibold">{plato.nombre}</p>
        </div>
        <span className="text-sm text-neutral-500">#{posicion}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-neutral-500">Vendidos</p>
          <p className="text-xl font-bold">{plato.vendidos}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-neutral-500">Ingresos</p>
          <p className="text-xl font-bold text-green-600">
            {new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0
            }).format(plato.ingresos)}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default function PlatosVendidosPage() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<'hamburguesas' | 'pizzas' | 'postres'>('hamburguesas');
  
  // Preparar datos para el gráfico
  const datosGrafico = datosPlatos[categoriaSeleccionada].map(plato => ({
    name: plato.nombre,
    vendidos: plato.vendidos,
    ingresos: plato.ingresos
  }));

  return (
    <div className="space-y-6 p-6">
      {/* Título y descripción */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Platos Más Vendidos</h1>
        <p className="text-neutral-600 mt-2">
          Análisis detallado de los platos más populares por categoría
        </p>
      </div>

      {/* Selector de categoría */}
      <div className="flex gap-4">
        {(['hamburguesas', 'pizzas', 'postres'] as const).map((categoria) => (
          <button
            key={categoria}
            onClick={() => setCategoriaSeleccionada(categoria)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${categoriaSeleccionada === categoria
                ? 'bg-[#F4821F] text-white'
                : 'bg-white text-neutral-600 hover:bg-[#FFF9F2]'}
            `}
          >
            {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
          </button>
        ))}
      </div>

      {/* Tarjetas de platos populares */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {datosPlatos[categoriaSeleccionada].map((plato, index) => (
          <TarjetaPlatoPopular
            key={plato.nombre}
            plato={plato}
            posicion={index + 1}
          />
        ))}
      </div>

      {/* Gráfico de barras */}
      <Card className="p-6 bg-white">
        <h3 className="text-lg font-semibold mb-4">Comparativa de Ventas</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datosGrafico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#F4821F" />
              <YAxis yAxisId="right" orientation="right" stroke="#22C55E" />
              <Tooltip />
              <Bar 
                yAxisId="left"
                dataKey="vendidos" 
                fill="#F4821F" 
                name="Unidades Vendidas"
              />
              <Bar 
                yAxisId="right"
                dataKey="ingresos" 
                fill="#22C55E" 
                name="Ingresos"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Total Vendidos</p>
              <p className="text-2xl font-bold">
                {datosPlatos[categoriaSeleccionada]
                  .reduce((sum, plato) => sum + plato.vendidos, 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Total Ingresos</p>
              <p className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0
                }).format(
                  datosPlatos[categoriaSeleccionada]
                    .reduce((sum, plato) => sum + plato.ingresos, 0)
                )}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Pizza className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Promedio por Plato</p>
              <p className="text-2xl font-bold">
                {Math.round(datosPlatos[categoriaSeleccionada]
                  .reduce((sum, plato) => sum + plato.vendidos, 0) / 
                  datosPlatos[categoriaSeleccionada].length
                )}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}